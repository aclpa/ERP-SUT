-- ============================================
-- DevFlow ERP - Database Schema
-- PostgreSQL 15+
-- Based on actual SQLAlchemy models in BE/app/models/
-- ============================================

-- Drop existing tables if they exist (for clean initialization)
DROP TABLE IF EXISTS deployments CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS servers CASCADE;
DROP TABLE IF EXISTS issues CASCADE;
DROP TABLE IF EXISTS sprints CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing ENUM types if they exist
DROP TYPE IF EXISTS team_role CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS sprint_status CASCADE;
DROP TYPE IF EXISTS issue_type CASCADE;
DROP TYPE IF EXISTS issue_priority CASCADE;
DROP TYPE IF EXISTS issue_status CASCADE;
DROP TYPE IF EXISTS server_type CASCADE;
DROP TYPE IF EXISTS server_status CASCADE;
DROP TYPE IF EXISTS service_type CASCADE;
DROP TYPE IF EXISTS service_status CASCADE;
DROP TYPE IF EXISTS deployment_type CASCADE;
DROP TYPE IF EXISTS deployment_status CASCADE;

-- ============================================
-- ENUM Type Definitions
-- ============================================

-- Team
CREATE TYPE team_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Project
CREATE TYPE project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'archived');

-- Sprint
CREATE TYPE sprint_status AS ENUM ('planned', 'active', 'completed', 'cancelled');

-- Issue
CREATE TYPE issue_type AS ENUM ('task', 'bug', 'feature', 'improvement', 'epic');
CREATE TYPE issue_priority AS ENUM ('lowest', 'low', 'medium', 'high', 'highest');
CREATE TYPE issue_status AS ENUM ('todo', 'in_progress', 'in_review', 'testing', 'done', 'closed');

-- Server
CREATE TYPE server_type AS ENUM ('physical', 'virtual', 'cloud', 'container');
CREATE TYPE server_status AS ENUM ('active', 'inactive', 'maintenance', 'decommissioned');

-- Service
CREATE TYPE service_type AS ENUM ('web', 'api', 'database', 'cache', 'queue', 'worker', 'cron', 'other');
CREATE TYPE service_status AS ENUM ('running', 'stopped', 'degraded', 'maintenance', 'failed');

-- Deployment
CREATE TYPE deployment_type AS ENUM ('manual', 'automatic', 'rollback');
CREATE TYPE deployment_status AS ENUM ('pending', 'in_progress', 'success', 'failed', 'rolled_back');

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    -- Authentik integration
    authentik_id VARCHAR(255) UNIQUE NOT NULL,

    -- Basic information
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(200),

    -- Profile
    avatar_url VARCHAR(500),
    phone VARCHAR(20),

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS '사용자 테이블 - Authentik과 연동되는 사용자 정보';
COMMENT ON COLUMN users.id IS '사용자 ID';
COMMENT ON COLUMN users.authentik_id IS 'Authentik SSO 사용자 ID';
COMMENT ON COLUMN users.email IS '이메일 주소';
COMMENT ON COLUMN users.username IS '사용자명';
COMMENT ON COLUMN users.full_name IS '전체 이름';
COMMENT ON COLUMN users.avatar_url IS '프로필 이미지 URL';
COMMENT ON COLUMN users.phone IS '전화번호';
COMMENT ON COLUMN users.is_active IS '활성 상태';
COMMENT ON COLUMN users.is_admin IS '관리자 여부';

-- ============================================
-- Table: teams
-- ============================================
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,

    -- Basic information
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(500),

    -- Metadata
    avatar_url VARCHAR(500),

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE teams IS '팀 테이블 - 프로젝트를 관리하는 팀';
COMMENT ON COLUMN teams.id IS '팀 ID';
COMMENT ON COLUMN teams.name IS '팀 이름';
COMMENT ON COLUMN teams.slug IS '팀 슬러그 (URL용)';
COMMENT ON COLUMN teams.description IS '팀 설명';
COMMENT ON COLUMN teams.avatar_url IS '팀 로고 이미지 URL';

-- ============================================
-- Table: team_members
-- ============================================
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,

    -- Foreign keys
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Role
    role team_role NOT NULL DEFAULT 'member',

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Unique constraint
    UNIQUE(team_id, user_id)
);

COMMENT ON TABLE team_members IS '팀 멤버 테이블 - 팀과 사용자의 다대다 관계';
COMMENT ON COLUMN team_members.id IS '팀 멤버 ID';
COMMENT ON COLUMN team_members.team_id IS '팀 ID';
COMMENT ON COLUMN team_members.user_id IS '사용자 ID';
COMMENT ON COLUMN team_members.role IS '팀 내 역할 (owner, admin, member, viewer)';

-- ============================================
-- Table: projects
-- ============================================
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,

    -- Foreign keys
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

    -- Basic information
    name VARCHAR(200) NOT NULL,
    key VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,

    -- Status
    status project_status NOT NULL DEFAULT 'planning',

    -- Repository
    repository_url VARCHAR(500),
    documentation_url VARCHAR(500),

    -- Metadata
    icon_url VARCHAR(500),
    color VARCHAR(7),

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE projects IS '프로젝트 테이블 - 개발 프로젝트 정보';
COMMENT ON COLUMN projects.id IS '프로젝트 ID';
COMMENT ON COLUMN projects.team_id IS '팀 ID';
COMMENT ON COLUMN projects.name IS '프로젝트 이름';
COMMENT ON COLUMN projects.key IS '프로젝트 키 (예: PROJ, DEV)';
COMMENT ON COLUMN projects.description IS '프로젝트 설명';
COMMENT ON COLUMN projects.status IS '프로젝트 상태';
COMMENT ON COLUMN projects.repository_url IS 'Git 리포지토리 URL';
COMMENT ON COLUMN projects.documentation_url IS '문서 URL';
COMMENT ON COLUMN projects.icon_url IS '프로젝트 아이콘 URL';
COMMENT ON COLUMN projects.color IS '프로젝트 색상 (HEX)';

-- ============================================
-- Table: sprints
-- ============================================
CREATE TABLE sprints (
    id SERIAL PRIMARY KEY,

    -- Foreign keys
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Basic information
    name VARCHAR(200) NOT NULL,
    goal TEXT,

    -- Period
    start_date DATE,
    end_date DATE,

    -- Status
    status sprint_status NOT NULL DEFAULT 'planned',

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE sprints IS '스프린트 테이블 - 애자일 스프린트 정보';
COMMENT ON COLUMN sprints.id IS '스프린트 ID';
COMMENT ON COLUMN sprints.project_id IS '프로젝트 ID';
COMMENT ON COLUMN sprints.name IS '스프린트 이름';
COMMENT ON COLUMN sprints.goal IS '스프린트 목표';
COMMENT ON COLUMN sprints.start_date IS '시작일';
COMMENT ON COLUMN sprints.end_date IS '종료일';
COMMENT ON COLUMN sprints.status IS '스프린트 상태';

-- ============================================
-- Table: issues
-- ============================================
CREATE TABLE issues (
    id SERIAL PRIMARY KEY,

    -- Foreign keys
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sprint_id INTEGER REFERENCES sprints(id) ON DELETE SET NULL,
    assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Basic information
    key VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,

    -- Classification
    type issue_type NOT NULL DEFAULT 'task',
    priority issue_priority NOT NULL DEFAULT 'medium',
    status issue_status NOT NULL DEFAULT 'todo',

    -- Time estimation
    estimate_hours INTEGER,
    actual_hours INTEGER,

    -- Order (priority within sprint)
    "order" INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE issues IS '이슈 테이블 - 작업, 버그, 기능 요청 등을 추적';
COMMENT ON COLUMN issues.id IS '이슈 ID';
COMMENT ON COLUMN issues.project_id IS '프로젝트 ID';
COMMENT ON COLUMN issues.sprint_id IS '스프린트 ID (백로그 이슈는 NULL)';
COMMENT ON COLUMN issues.assignee_id IS '담당자 ID';
COMMENT ON COLUMN issues.creator_id IS '생성자 ID';
COMMENT ON COLUMN issues.key IS '이슈 키 (예: PROJ-123)';
COMMENT ON COLUMN issues.title IS '이슈 제목';
COMMENT ON COLUMN issues.description IS '이슈 설명';
COMMENT ON COLUMN issues.type IS '이슈 타입';
COMMENT ON COLUMN issues.priority IS '우선순위';
COMMENT ON COLUMN issues.status IS '상태';
COMMENT ON COLUMN issues.estimate_hours IS '예상 소요 시간 (시간)';
COMMENT ON COLUMN issues.actual_hours IS '실제 소요 시간 (시간)';
COMMENT ON COLUMN issues."order" IS '정렬 순서';

-- ============================================
-- Table: servers
-- ============================================
CREATE TABLE servers (
    id SERIAL PRIMARY KEY,

    -- Basic information
    name VARCHAR(200) UNIQUE NOT NULL,
    hostname VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45) NOT NULL,

    -- Classification
    type server_type NOT NULL DEFAULT 'virtual',
    status server_status NOT NULL DEFAULT 'active',
    environment VARCHAR(50) NOT NULL,

    -- Specifications
    cpu_cores INTEGER,
    memory_gb INTEGER,
    disk_gb INTEGER,

    -- Operating System
    os_name VARCHAR(100),
    os_version VARCHAR(50),

    -- Cloud information
    provider VARCHAR(50),
    region VARCHAR(50),
    instance_id VARCHAR(100),

    -- Access information
    ssh_port INTEGER NOT NULL DEFAULT 22,
    ssh_user VARCHAR(50),

    -- Monitoring
    monitoring_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    monitoring_url VARCHAR(500),

    -- Notes
    description TEXT,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE servers IS '서버 테이블 - 물리/가상 서버, 클라우드 인스턴스 정보';
COMMENT ON COLUMN servers.id IS '서버 ID';
COMMENT ON COLUMN servers.name IS '서버 이름';
COMMENT ON COLUMN servers.hostname IS '호스트명';
COMMENT ON COLUMN servers.ip_address IS 'IP 주소 (IPv4/IPv6)';
COMMENT ON COLUMN servers.type IS '서버 타입';
COMMENT ON COLUMN servers.status IS '서버 상태';
COMMENT ON COLUMN servers.environment IS '환경 (dev, staging, production)';
COMMENT ON COLUMN servers.cpu_cores IS 'CPU 코어 수';
COMMENT ON COLUMN servers.memory_gb IS '메모리 (GB)';
COMMENT ON COLUMN servers.disk_gb IS '디스크 용량 (GB)';
COMMENT ON COLUMN servers.os_name IS '운영체제 이름';
COMMENT ON COLUMN servers.os_version IS '운영체제 버전';
COMMENT ON COLUMN servers.provider IS '클라우드 제공자 (AWS, GCP, Azure 등)';
COMMENT ON COLUMN servers.region IS '리전';
COMMENT ON COLUMN servers.instance_id IS '인스턴스 ID';
COMMENT ON COLUMN servers.ssh_port IS 'SSH 포트';
COMMENT ON COLUMN servers.ssh_user IS 'SSH 사용자명';
COMMENT ON COLUMN servers.monitoring_enabled IS '모니터링 활성화 여부';
COMMENT ON COLUMN servers.monitoring_url IS '모니터링 대시보드 URL';

-- ============================================
-- Table: services
-- ============================================
CREATE TABLE services (
    id SERIAL PRIMARY KEY,

    -- Foreign keys
    server_id INTEGER NOT NULL REFERENCES servers(id) ON DELETE CASCADE,

    -- Basic information
    name VARCHAR(200) NOT NULL,
    type service_type NOT NULL DEFAULT 'web',
    status service_status NOT NULL DEFAULT 'stopped',

    -- Version
    version VARCHAR(50),

    -- Network
    port INTEGER,
    url VARCHAR(500),

    -- Process information
    process_name VARCHAR(200),
    pid INTEGER,

    -- Container information
    container_id VARCHAR(100),
    image_name VARCHAR(200),

    -- Resources
    cpu_limit INTEGER,
    memory_limit_mb INTEGER,

    -- Health check
    health_check_url VARCHAR(500),
    health_check_enabled BOOLEAN NOT NULL DEFAULT FALSE,

    -- Environment variables (JSON)
    environment_variables JSONB,

    -- Configuration
    config_path VARCHAR(500),
    log_path VARCHAR(500),

    -- Auto start
    auto_start BOOLEAN NOT NULL DEFAULT FALSE,

    -- Notes
    description TEXT,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE services IS '서비스 테이블 - 서버에서 실행되는 애플리케이션 서비스';
COMMENT ON COLUMN services.id IS '서비스 ID';
COMMENT ON COLUMN services.server_id IS '서버 ID';
COMMENT ON COLUMN services.name IS '서비스 이름';
COMMENT ON COLUMN services.type IS '서비스 타입';
COMMENT ON COLUMN services.status IS '서비스 상태';
COMMENT ON COLUMN services.version IS '서비스 버전';
COMMENT ON COLUMN services.port IS '서비스 포트';
COMMENT ON COLUMN services.url IS '서비스 URL';
COMMENT ON COLUMN services.process_name IS '프로세스 이름';
COMMENT ON COLUMN services.pid IS '프로세스 ID';
COMMENT ON COLUMN services.container_id IS '컨테이너 ID (Docker 등)';
COMMENT ON COLUMN services.image_name IS '컨테이너 이미지 이름';
COMMENT ON COLUMN services.cpu_limit IS 'CPU 제한 (%)';
COMMENT ON COLUMN services.memory_limit_mb IS '메모리 제한 (MB)';
COMMENT ON COLUMN services.health_check_url IS '헬스체크 URL';
COMMENT ON COLUMN services.health_check_enabled IS '헬스체크 활성화 여부';
COMMENT ON COLUMN services.environment_variables IS '환경 변수 (JSON)';
COMMENT ON COLUMN services.config_path IS '설정 파일 경로';
COMMENT ON COLUMN services.log_path IS '로그 파일 경로';
COMMENT ON COLUMN services.auto_start IS '서버 부팅 시 자동 시작 여부';

-- ============================================
-- Table: deployments
-- ============================================
CREATE TABLE deployments (
    id SERIAL PRIMARY KEY,

    -- Foreign keys
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    deployed_by INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,

    -- Deployment information
    version VARCHAR(50) NOT NULL,
    commit_hash VARCHAR(40),
    branch VARCHAR(100),
    tag VARCHAR(100),

    -- Deployment type and status
    type deployment_type NOT NULL DEFAULT 'manual',
    status deployment_status NOT NULL DEFAULT 'pending',

    -- Time information
    started_at TIMESTAMP,
    completed_at TIMESTAMP,

    -- Environment
    environment VARCHAR(50) NOT NULL,

    -- Rollback information
    rollback_from_id INTEGER REFERENCES deployments(id) ON DELETE SET NULL,

    -- Notes
    notes TEXT,
    error_message TEXT,

    -- Deployment log
    log_url VARCHAR(500),

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE deployments IS '배포 테이블 - 서비스의 배포 이력 추적';
COMMENT ON COLUMN deployments.id IS '배포 ID';
COMMENT ON COLUMN deployments.service_id IS '서비스 ID';
COMMENT ON COLUMN deployments.deployed_by IS '배포 실행자 ID';
COMMENT ON COLUMN deployments.version IS '배포 버전';
COMMENT ON COLUMN deployments.commit_hash IS 'Git 커밋 해시';
COMMENT ON COLUMN deployments.branch IS 'Git 브랜치';
COMMENT ON COLUMN deployments.tag IS 'Git 태그';
COMMENT ON COLUMN deployments.type IS '배포 타입';
COMMENT ON COLUMN deployments.status IS '배포 상태';
COMMENT ON COLUMN deployments.started_at IS '배포 시작 시간';
COMMENT ON COLUMN deployments.completed_at IS '배포 완료 시간';
COMMENT ON COLUMN deployments.environment IS '배포 환경 (dev, staging, production)';
COMMENT ON COLUMN deployments.rollback_from_id IS '롤백 대상 배포 ID';
COMMENT ON COLUMN deployments.notes IS '배포 메모';
COMMENT ON COLUMN deployments.error_message IS '에러 메시지 (실패 시)';
COMMENT ON COLUMN deployments.log_url IS '배포 로그 URL';

-- ============================================
-- Indexes will be created in 02-indexes.sql
-- Sample data will be inserted in 03-sample-data.sql
-- ============================================
