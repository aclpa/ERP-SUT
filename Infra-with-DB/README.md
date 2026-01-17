# DevFlow ERP Infrastructure

개발 환경용 인프라 설정 (PostgreSQL + Redis)

## 개요

이 디렉토리는 DevFlow ERP의 인프라 구성 요소를 포함합니다:
- PostgreSQL 데이터베이스
- Redis 캐시
- 데이터베이스 초기화 스크립트

## 디렉토리 구조

```
infra/
├── docker-compose.dev.yml      # DB만 실행하는 Docker Compose 설정
├── init-scripts/               # PostgreSQL 자동 초기화 스크립트
│   ├── 01-schema.sql          # 테이블 스키마 + ENUM 타입 정의
│   ├── 02-indexes.sql         # 성능 최적화 인덱스 (61개)
│   ├── 03-triggers.sql        # 자동화 트리거 (12개)
│   └── 04-sample-data.sql     # 개발/테스트용 샘플 데이터
└── README.md                   # 이 파일
```

## Init Scripts 상세

### 실행 순서

PostgreSQL 컨테이너가 시작되면 `/docker-entrypoint-initdb.d` 디렉토리의 스크립트가 알파벳 순서로 자동 실행됩니다:

1. **01-schema.sql** (~700 라인)
   - 9개 테이블 생성 (users, teams, projects, sprints, issues, servers, services, deployments)
   - 12개 ENUM 타입 정의
   - Foreign Key 제약조건 (CASCADE, SET NULL)
   - 테이블 및 컬럼 주석

2. **02-indexes.sql** (~120 라인)
   - 61개 성능 최적화 인덱스
   - 단일 컬럼 인덱스: 51개
   - 복합 인덱스: 10개
   - 자주 조회되는 패턴 최적화

3. **03-triggers.sql** (~140 라인)
   - 12개 자동화 트리거
   - `updated_at` 자동 업데이트 (9개 테이블)
   - Sprint 날짜 검증
   - Deployment 타임스탬프 자동 설정

4. **04-sample-data.sql** (~400 라인)
   - 개발/테스트용 샘플 데이터
   - 8 Users, 4 Teams, 12 Team Members
   - 5 Projects, 8 Sprints, 20 Issues
   - 8 Servers, 12 Services, 11 Deployments

### 스키마 버전 관리

**중요**: Init scripts는 개발 환경 빠른 초기화용입니다.

- **개발 환경**: Init scripts 사용 (빠른 설정)
- **프로덕션**: Alembic 마이그레이션 사용 (버전 관리)

스키마 변경 시:
1. SQLAlchemy 모델 수정 (`BE/app/models/`)
2. Init scripts 업데이트 (`infra/init-scripts/01-schema.sql`)
3. Alembic 마이그레이션 생성 (`BE/alembic/`)

## 사용법

### 방법 1: 통합 환경 사용 (권장)

프로젝트 루트의 통합 docker-compose.yml을 사용하세요:

```bash
cd /Users/jeonseonghyeon/Desktop/code/Devflow-ERP
docker compose up -d
```

이 방법은 PostgreSQL, Redis, Backend를 모두 시작합니다.

### 방법 2: DB만 실행

Backend 없이 DB만 실행하려면:

```bash
cd infra
docker compose -f docker-compose.dev.yml up -d
```

이 방법은 PostgreSQL과 Redis만 시작합니다.

## 데이터베이스 접속

### Docker를 통한 접속

```bash
# 통합 환경 사용 시
docker compose exec postgres psql -U devflow -d devflow_erp

# DB만 실행 시
docker compose -f infra/docker-compose.dev.yml exec postgres psql -U devflow -d devflow
```

### 로컬 클라이언트 사용

```bash
psql -h localhost -p 5432 -U devflow -d devflow_erp
# Password: devflow_password (기본값)
```

### GUI 클라이언트 (예: DBeaver, pgAdmin)

- Host: `localhost`
- Port: `5432`
- Database: `devflow_erp`
- User: `devflow`
- Password: `devflow_password`

## 데이터베이스 초기화

### 자동 초기화 (처음 시작 시)

컨테이너를 처음 시작하면 init-scripts가 자동으로 실행됩니다:

```bash
docker compose up -d postgres
# → init-scripts 자동 실행 (01 → 02 → 03 → 04)
```

### 수동 초기화 (리셋)

데이터베이스를 완전히 초기화하려면:

```bash
# 방법 1: 루트 스크립트 사용 (권장)
cd /Users/jeonseonghyeon/Desktop/code/Devflow-ERP
./scripts/reset-db.sh

# 방법 2: 수동 리셋
docker compose down -v           # 볼륨 삭제
docker compose up -d postgres    # 재시작 (init-scripts 재실행)
```

**주의**: 볼륨을 삭제하면 모든 데이터가 사라집니다!

### Init Scripts 수동 실행

이미 실행 중인 데이터베이스에 스크립트를 재실행하려면:

```bash
# 단일 스크립트 실행
docker compose exec -T postgres psql -U devflow -d devflow_erp < infra/init-scripts/01-schema.sql

# 모든 스크립트 순차 실행
for script in infra/init-scripts/*.sql; do
    docker compose exec -T postgres psql -U devflow -d devflow_erp < "$script"
done
```

## 샘플 데이터

`04-sample-data.sql`은 개발 및 테스트를 위한 샘플 데이터를 제공합니다:

| 데이터 | 개수 | 설명 |
|--------|------|------|
| Users | 8 | admin@devflow.com (관리자), 개발자, PM, 비활성 사용자 |
| Teams | 4 | Backend, Frontend, DevOps, Design |
| Team Members | 12 | Owner, Admin, Member, Viewer 역할 |
| Projects | 5 | 다양한 상태의 프로젝트 |
| Sprints | 8 | 완료, 진행중, 계획 상태 |
| Issues | 20 | Task, Bug, Feature 등 |
| Servers | 8 | Dev, Staging, Production 환경 |
| Services | 12 | Web, API, Database, Cache 등 |
| Deployments | 11 | 성공, 실패, 롤백 이력 |

**프로덕션 환경에서는 04-sample-data.sql을 제외하세요!**

## 스키마 정보

### 테이블 목록

**프로젝트 관리**:
- `users`: 사용자 (Authentik 통합)
- `teams`: 팀
- `team_members`: 팀 멤버십
- `projects`: 프로젝트
- `sprints`: 스프린트
- `issues`: 이슈/태스크

**인프라 관리**:
- `servers`: 서버
- `services`: 서비스
- `deployments`: 배포 이력

### ENUM 타입 (12개)

PostgreSQL 네이티브 ENUM 타입 사용:

```sql
team_role: owner, admin, member, viewer
project_status: planning, active, on_hold, completed, archived
sprint_status: planned, active, completed, cancelled
issue_type: task, bug, feature, improvement, epic
issue_priority: lowest, low, medium, high, highest
issue_status: todo, in_progress, in_review, testing, done, closed
server_type: physical, virtual, cloud, container
server_status: active, inactive, maintenance, decommissioned
service_type: web, api, database, cache, queue, worker, cron, other
service_status: running, stopped, degraded, maintenance, failed
deployment_type: manual, automatic, rollback
deployment_status: pending, in_progress, success, failed, rolled_back
```

### 성능 최적화

**인덱스 (61개)**:
- 외래 키 컬럼 (team_id, user_id, project_id 등)
- 자주 검색되는 컬럼 (email, username, status 등)
- 복합 인덱스 (team_id + user_id, project_id + status 등)

**트리거 (12개)**:
- `updated_at` 자동 업데이트 (모든 테이블)
- 비즈니스 로직 검증 (Sprint 날짜, Deployment 타임스탬프)

## 환경 변수

`.env` 파일 또는 docker-compose.yml에서 설정:

```env
# PostgreSQL
POSTGRES_DB=devflow_erp
POSTGRES_USER=devflow
POSTGRES_PASSWORD=devflow_password

# Redis (비밀번호 없음)
# 프로덕션에서는 비밀번호 설정 필요
```

## 서비스 정보

### docker-compose.dev.yml 사용 시

- **PostgreSQL**:
  - Host: `localhost`
  - Port: `5432`
  - Database: `devflow`
  - User: `devflow`
  - Container: `devflow-postgres-dev`

- **Redis**:
  - Host: `localhost`
  - Port: `6379`
  - Container: `devflow-redis-dev`

### 통합 docker-compose.yml 사용 시 (루트)

- **PostgreSQL**:
  - Database: `devflow_erp` (주의: 다름!)
  - Container: `devflow-postgres`

- **Redis**:
  - Container: `devflow-redis`

## 트러블슈팅

### init-scripts가 실행되지 않음

**증상**: 컨테이너는 시작되지만 테이블이 생성되지 않음

**원인**: 기존 볼륨이 존재하면 init-scripts가 실행되지 않습니다.

**해결**:
```bash
docker compose down -v  # 볼륨 삭제
docker compose up -d    # 재시작
```

### 스키마 오류

**증상**: `relation "users" does not exist`

**원인**: init-scripts 실행 실패 또는 순서 오류

**해결**:
```bash
# 로그 확인
docker compose logs postgres

# 수동으로 스크립트 실행
docker compose exec -T postgres psql -U devflow -d devflow_erp < infra/init-scripts/01-schema.sql
```

### ENUM 타입 오류

**증상**: `type "team_role" does not exist`

**원인**: ENUM 타입이 생성되지 않음

**해결**:
```bash
# ENUM 타입만 재생성
docker compose exec postgres psql -U devflow -d devflow_erp -c "
CREATE TYPE team_role AS ENUM ('owner', 'admin', 'member', 'viewer');
-- 나머지 ENUM 타입도 동일하게...
"
```

## BE와의 관계

### 통합 docker-compose.yml (루트)

루트의 `docker-compose.yml`은 Backend와 DB를 통합합니다:

```yaml
services:
  postgres:  # infra의 postgres 설정 + init-scripts
  redis:     # infra의 redis 설정
  backend:   # BE의 FastAPI 애플리케이션
```

Backend는 PostgreSQL과 Redis에 의존하며, health check를 기다립니다.

### 독립 실행

- **infra/docker-compose.dev.yml**: DB만 실행 (Backend 개발 시)
- **BE/docker-compose.yml**: Backend만 실행 (독립 테스트)
- **루트 docker-compose.yml**: 전체 통합 (실제 개발)

## 유용한 쿼리

### 테이블 확인

```sql
-- 테이블 목록
\dt

-- 테이블 구조
\d users
\d+ issues  -- 상세 정보 포함

-- ENUM 타입 확인
\dT
```

### 샘플 데이터 확인

```sql
-- 사용자 수
SELECT COUNT(*) FROM users;

-- 팀별 멤버 수
SELECT t.name, COUNT(tm.id) as member_count
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
GROUP BY t.name;

-- 프로젝트별 이슈 수
SELECT p.name, COUNT(i.id) as issue_count
FROM projects p
LEFT JOIN issues i ON p.id = i.project_id
GROUP BY p.name;

-- 환경별 서버 수
SELECT environment, COUNT(*) as server_count
FROM servers
GROUP BY environment;
```

### 성능 확인

```sql
-- 인덱스 목록
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 테이블 크기
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 참고 문서

- [프로젝트 루트 README](../README.md): 전체 프로젝트 가이드
- [DB 스키마 문서](../docs/db_table.md): 상세 스키마 설명
- [API 명세](../docs/api명세서.md): Backend API 문서
- [Backend README](../BE/README.md): Backend 개발 가이드
