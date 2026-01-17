-- ============================================
-- DevFlow ERP - Sample Data
-- Test and development data for local environment
-- ============================================
-- This file should NOT be run in production!
-- ============================================

-- ============================================
-- 1. Users (Sample Users)
-- ============================================
INSERT INTO users (id, authentik_id, email, username, full_name, avatar_url, phone, is_active, is_admin, created_at, updated_at) VALUES
-- Admin user
(1, 'auth-admin-001', 'admin@devflow.com', 'admin', 'Admin User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', '010-1234-5678', TRUE, TRUE, NOW(), NOW()),

-- Regular developers
(2, 'auth-dev-001', 'john.doe@devflow.com', 'johndoe', 'John Doe', 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', '010-2345-6789', TRUE, FALSE, NOW(), NOW()),
(3, 'auth-dev-002', 'jane.smith@devflow.com', 'janesmith', 'Jane Smith', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane', '010-3456-7890', TRUE, FALSE, NOW(), NOW()),
(4, 'auth-dev-003', 'mike.johnson@devflow.com', 'mikej', 'Mike Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', '010-4567-8901', TRUE, FALSE, NOW(), NOW()),
(5, 'auth-dev-004', 'sarah.wilson@devflow.com', 'sarahw', 'Sarah Wilson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', '010-5678-9012', TRUE, FALSE, NOW(), NOW()),

-- Designer
(6, 'auth-design-001', 'alice.lee@devflow.com', 'alicelee', 'Alice Lee', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice', '010-6789-0123', TRUE, FALSE, NOW(), NOW()),

-- PM
(7, 'auth-pm-001', 'bob.kim@devflow.com', 'bobkim', 'Bob Kim', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob', '010-7890-1234', TRUE, FALSE, NOW(), NOW()),

-- Inactive user
(8, 'auth-inactive-001', 'inactive@devflow.com', 'inactive', 'Inactive User', NULL, NULL, FALSE, FALSE, NOW(), NOW());

-- Reset sequence for users
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- ============================================
-- 2. Teams
-- ============================================
INSERT INTO teams (id, name, slug, description, avatar_url, created_at, updated_at) VALUES
(1, 'Backend Team', 'backend-team', 'Backend development team focusing on API and microservices', 'https://api.dicebear.com/7.x/initials/svg?seed=BE', NOW(), NOW()),
(2, 'Frontend Team', 'frontend-team', 'Frontend development team building user interfaces', 'https://api.dicebear.com/7.x/initials/svg?seed=FE', NOW(), NOW()),
(3, 'DevOps Team', 'devops-team', 'Infrastructure and deployment automation team', 'https://api.dicebear.com/7.x/initials/svg?seed=DO', NOW(), NOW()),
(4, 'Design Team', 'design-team', 'UI/UX design team', 'https://api.dicebear.com/7.x/initials/svg?seed=DT', NOW(), NOW());

SELECT setval('teams_id_seq', (SELECT MAX(id) FROM teams));

-- ============================================
-- 3. Team Members
-- ============================================
INSERT INTO team_members (team_id, user_id, role, created_at, updated_at) VALUES
-- Backend Team
(1, 1, 'owner', NOW(), NOW()),   -- Admin is owner
(1, 2, 'admin', NOW(), NOW()),   -- John is admin
(1, 3, 'member', NOW(), NOW()),  -- Jane is member
(1, 4, 'member', NOW(), NOW()),  -- Mike is member

-- Frontend Team
(2, 1, 'owner', NOW(), NOW()),   -- Admin is owner
(2, 5, 'admin', NOW(), NOW()),   -- Sarah is admin
(2, 6, 'member', NOW(), NOW()),  -- Alice (designer) is member

-- DevOps Team
(3, 1, 'owner', NOW(), NOW()),   -- Admin is owner
(3, 4, 'admin', NOW(), NOW()),   -- Mike is admin
(3, 2, 'member', NOW(), NOW()),  -- John is member

-- Design Team
(4, 1, 'owner', NOW(), NOW()),   -- Admin is owner
(4, 6, 'admin', NOW(), NOW()),   -- Alice is admin
(4, 7, 'viewer', NOW(), NOW());  -- Bob (PM) is viewer

-- ============================================
-- 4. Projects
-- ============================================
INSERT INTO projects (id, team_id, name, key, description, status, repository_url, documentation_url, icon_url, color, created_at, updated_at) VALUES
(1, 1, 'DevFlow ERP', 'DFERP', 'IT startup development workflow management ERP system', 'active', 'https://github.com/devflow/erp', 'https://docs.devflow.com/erp', 'https://api.dicebear.com/7.x/shapes/svg?seed=DFERP', '#3B82F6', NOW(), NOW()),
(2, 2, 'Customer Portal', 'PORTAL', 'Customer self-service portal application', 'active', 'https://github.com/devflow/portal', 'https://docs.devflow.com/portal', 'https://api.dicebear.com/7.x/shapes/svg?seed=PORTAL', '#10B981', NOW(), NOW()),
(3, 3, 'Infrastructure Automation', 'INFRA', 'Infrastructure as Code and deployment automation', 'planning', 'https://github.com/devflow/infra', 'https://docs.devflow.com/infra', 'https://api.dicebear.com/7.x/shapes/svg?seed=INFRA', '#F59E0B', NOW(), NOW()),
(4, 1, 'API Gateway', 'APIGW', 'Microservices API Gateway', 'completed', 'https://github.com/devflow/api-gateway', NULL, 'https://api.dicebear.com/7.x/shapes/svg?seed=APIGW', '#8B5CF6', NOW(), NOW()),
(5, 4, 'Design System', 'DESIGN', 'Company-wide design system and component library', 'on_hold', NULL, 'https://design.devflow.com', 'https://api.dicebear.com/7.x/shapes/svg?seed=DESIGN', '#EC4899', NOW(), NOW());

SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));

-- ============================================
-- 5. Sprints
-- ============================================
INSERT INTO sprints (id, project_id, name, goal, start_date, end_date, status, created_at, updated_at) VALUES
-- DevFlow ERP sprints
(1, 1, 'Sprint 1 - Foundation', 'Setup project infrastructure and basic models', '2024-01-01', '2024-01-14', 'completed', NOW(), NOW()),
(2, 1, 'Sprint 2 - Core Features', 'Implement project and sprint management', '2024-01-15', '2024-01-28', 'completed', NOW(), NOW()),
(3, 1, 'Sprint 3 - Issue Tracking', 'Build issue tracking system', '2024-01-29', '2024-02-11', 'active', NOW(), NOW()),
(4, 1, 'Sprint 4 - Deployment', 'Add deployment management features', '2024-02-12', '2024-02-25', 'planned', NOW(), NOW()),

-- Customer Portal sprints
(5, 2, 'Portal Sprint 1', 'User authentication and profile', '2024-01-08', '2024-01-21', 'completed', NOW(), NOW()),
(6, 2, 'Portal Sprint 2', 'Dashboard and analytics', '2024-01-22', '2024-02-04', 'active', NOW(), NOW()),

-- API Gateway sprints
(7, 4, 'Gateway MVP', 'Basic routing and load balancing', '2023-11-01', '2023-11-30', 'completed', NOW(), NOW()),
(8, 4, 'Gateway v2', 'Add authentication and rate limiting', '2023-12-01', '2023-12-31', 'completed', NOW(), NOW());

SELECT setval('sprints_id_seq', (SELECT MAX(id) FROM sprints));

-- ============================================
-- 6. Issues
-- ============================================
INSERT INTO issues (id, project_id, sprint_id, assignee_id, creator_id, key, title, description, type, priority, status, estimate_hours, actual_hours, "order", created_at, updated_at) VALUES
-- DevFlow ERP - Sprint 3 (Active)
(1, 1, 3, 2, 1, 'DFERP-1', 'Implement issue creation API', 'Create REST API endpoint for creating new issues with validation', 'feature', 'high', 'in_progress', 8, 5, 1, NOW(), NOW()),
(2, 1, 3, 3, 1, 'DFERP-2', 'Add issue filtering', 'Allow filtering issues by status, priority, assignee', 'feature', 'medium', 'todo', 5, NULL, 2, NOW(), NOW()),
(3, 1, 3, 2, 7, 'DFERP-3', 'Fix issue update bug', 'Issue update endpoint returns 500 error when assignee is null', 'bug', 'high', 'in_review', 3, 3, 3, NOW(), NOW()),
(4, 1, 3, 4, 1, 'DFERP-4', 'Add issue comments', 'Users should be able to comment on issues', 'feature', 'medium', 'todo', 8, NULL, 4, NOW(), NOW()),
(5, 1, 3, 3, 2, 'DFERP-5', 'Improve issue search', 'Add full-text search for issue titles and descriptions', 'improvement', 'low', 'todo', 6, NULL, 5, NOW(), NOW()),

-- DevFlow ERP - Sprint 4 (Planned)
(6, 1, 4, NULL, 1, 'DFERP-6', 'Design deployment UI', 'Create mockups for deployment dashboard', 'task', 'medium', 'todo', 4, NULL, 1, NOW(), NOW()),
(7, 1, 4, 2, 1, 'DFERP-7', 'Implement deployment API', 'REST API for creating and managing deployments', 'feature', 'highest', 'todo', 10, NULL, 2, NOW(), NOW()),

-- DevFlow ERP - Backlog (no sprint)
(8, 1, NULL, NULL, 7, 'DFERP-8', 'Add notification system', 'Email and in-app notifications for important events', 'feature', 'medium', 'todo', 16, NULL, 1, NOW(), NOW()),
(9, 1, NULL, NULL, 1, 'DFERP-9', 'Performance optimization', 'Optimize database queries and add caching', 'improvement', 'low', 'todo', 12, NULL, 2, NOW(), NOW()),
(10, 1, NULL, 5, 1, 'DFERP-10', 'Add analytics dashboard', 'Team performance and project metrics dashboard', 'epic', 'medium', 'todo', 40, NULL, 3, NOW(), NOW()),

-- Customer Portal - Sprint 2 (Active)
(11, 2, 6, 5, 1, 'PORTAL-1', 'Create dashboard layout', 'Responsive dashboard layout with widgets', 'task', 'high', 'done', 6, 7, 1, NOW(), NOW()),
(12, 2, 6, 5, 7, 'PORTAL-2', 'Implement chart components', 'Reusable chart components using Chart.js', 'feature', 'high', 'in_progress', 8, 4, 2, NOW(), NOW()),
(13, 2, 6, 6, 7, 'PORTAL-3', 'Design data visualization', 'Visual design for analytics charts', 'task', 'medium', 'done', 4, 4, 3, NOW(), NOW()),

-- Customer Portal - Backlog
(14, 2, NULL, NULL, 7, 'PORTAL-4', 'Add user preferences', 'Allow users to customize dashboard', 'feature', 'low', 'todo', 10, NULL, 1, NOW(), NOW()),

-- Infrastructure Automation - Backlog
(15, 3, NULL, 4, 1, 'INFRA-1', 'Setup Terraform structure', 'Create base Terraform module structure', 'task', 'highest', 'todo', 8, NULL, 1, NOW(), NOW()),
(16, 3, NULL, 4, 1, 'INFRA-2', 'AWS infrastructure', 'Define AWS resources in Terraform', 'feature', 'high', 'todo', 20, NULL, 2, NOW(), NOW()),

-- API Gateway - Completed
(17, 4, 8, 2, 1, 'APIGW-1', 'Add JWT authentication', 'Implement JWT token validation', 'feature', 'highest', 'done', 12, 14, 1, NOW(), NOW()),
(18, 4, 8, 2, 1, 'APIGW-2', 'Implement rate limiting', 'Add Redis-based rate limiting', 'feature', 'high', 'done', 8, 10, 2, NOW(), NOW()),

-- Design System - Backlog
(19, 5, NULL, 6, 7, 'DESIGN-1', 'Define color palette', 'Create company color system', 'task', 'high', 'closed', 4, 5, 1, NOW(), NOW()),
(20, 5, NULL, 6, 7, 'DESIGN-2', 'Typography system', 'Define typography scale and font families', 'task', 'high', 'done', 6, 6, 2, NOW(), NOW());

SELECT setval('issues_id_seq', (SELECT MAX(id) FROM issues));

-- ============================================
-- 7. Servers
-- ============================================
INSERT INTO servers (id, name, hostname, ip_address, type, status, environment, cpu_cores, memory_gb, disk_gb, os_name, os_version, provider, region, instance_id, ssh_port, ssh_user, monitoring_enabled, monitoring_url, description, notes, created_at, updated_at) VALUES
-- Development servers
(1, 'dev-web-01', 'dev-web-01.devflow.local', '192.168.1.101', 'virtual', 'active', 'dev', 4, 8, 100, 'Ubuntu', '22.04 LTS', 'VMware', 'local', NULL, 22, 'ubuntu', TRUE, 'http://grafana.devflow.local/d/dev-web-01', 'Development web server', 'Primary dev environment', NOW(), NOW()),
(2, 'dev-db-01', 'dev-db-01.devflow.local', '192.168.1.102', 'virtual', 'active', 'dev', 4, 16, 200, 'Ubuntu', '22.04 LTS', 'VMware', 'local', NULL, 22, 'ubuntu', TRUE, 'http://grafana.devflow.local/d/dev-db-01', 'Development database server', 'PostgreSQL 15', NOW(), NOW()),

-- Staging servers
(3, 'staging-web-01', 'staging-web.devflow.com', '10.0.1.101', 'cloud', 'active', 'staging', 4, 16, 200, 'Ubuntu', '22.04 LTS', 'AWS', 'ap-northeast-2', 'i-0a1b2c3d4e5f6g7h8', 22, 'ec2-user', TRUE, 'https://monitor.devflow.com/d/staging-web', 'Staging web server', 't3.large instance', NOW(), NOW()),
(4, 'staging-db-01', 'staging-db.devflow.com', '10.0.1.102', 'cloud', 'active', 'staging', 4, 32, 500, 'Ubuntu', '22.04 LTS', 'AWS', 'ap-northeast-2', 'i-1b2c3d4e5f6g7h8i9', 22, 'ec2-user', TRUE, 'https://monitor.devflow.com/d/staging-db', 'Staging database server', 'RDS PostgreSQL 15', NOW(), NOW()),

-- Production servers
(5, 'prod-web-01', 'web-01.devflow.com', '52.78.123.45', 'cloud', 'active', 'production', 8, 32, 500, 'Ubuntu', '22.04 LTS', 'AWS', 'ap-northeast-2', 'i-2c3d4e5f6g7h8i9j0', 22, 'ec2-user', TRUE, 'https://monitor.devflow.com/d/prod-web-01', 'Production web server 1', 't3.2xlarge instance', NOW(), NOW()),
(6, 'prod-web-02', 'web-02.devflow.com', '52.78.123.46', 'cloud', 'active', 'production', 8, 32, 500, 'Ubuntu', '22.04 LTS', 'AWS', 'ap-northeast-2', 'i-3d4e5f6g7h8i9j0k1', 22, 'ec2-user', TRUE, 'https://monitor.devflow.com/d/prod-web-02', 'Production web server 2', 't3.2xlarge instance', NOW(), NOW()),
(7, 'prod-db-01', 'db.devflow.com', '10.0.2.101', 'cloud', 'active', 'production', 16, 128, 2000, 'Ubuntu', '22.04 LTS', 'AWS', 'ap-northeast-2', 'i-4e5f6g7h8i9j0k1l2', 5432, 'postgres', TRUE, 'https://monitor.devflow.com/d/prod-db', 'Production database master', 'RDS r6g.4xlarge', NOW(), NOW()),

-- Maintenance server
(8, 'backup-server', 'backup.devflow.local', '192.168.1.200', 'physical', 'maintenance', 'production', 8, 64, 4000, 'Ubuntu', '20.04 LTS', NULL, 'local', NULL, 22, 'backup', FALSE, NULL, 'Backup and archive server', 'Currently upgrading hardware', NOW(), NOW());

SELECT setval('servers_id_seq', (SELECT MAX(id) FROM servers));

-- ============================================
-- 8. Services
-- ============================================
INSERT INTO services (id, server_id, name, type, status, version, port, url, process_name, pid, container_id, image_name, cpu_limit, memory_limit_mb, health_check_url, health_check_enabled, environment_variables, config_path, log_path, auto_start, description, notes, created_at, updated_at) VALUES
-- Dev environment
(1, 1, 'devflow-erp-api', 'api', 'running', '1.0.0-dev', 8000, 'http://dev-web-01.devflow.local:8000', NULL, NULL, 'abc123', 'devflow/erp-api:dev', 50, 2048, 'http://dev-web-01.devflow.local:8000/health', TRUE, '{"ENVIRONMENT": "dev", "DEBUG": "true"}', '/app/config/dev.yaml', '/var/log/devflow-erp.log', TRUE, 'DevFlow ERP Backend API - Dev', NULL, NOW(), NOW()),
(2, 1, 'devflow-portal-web', 'web', 'running', '0.5.0-dev', 3000, 'http://dev-web-01.devflow.local:3000', NULL, NULL, 'def456', 'devflow/portal-web:dev', 30, 1024, 'http://dev-web-01.devflow.local:3000', TRUE, '{"NODE_ENV": "development"}', '/app/.env.dev', '/var/log/portal.log', TRUE, 'Customer Portal Frontend - Dev', NULL, NOW(), NOW()),
(3, 2, 'postgresql-dev', 'database', 'running', '15.5', 5432, NULL, 'postgres', 1234, NULL, NULL, NULL, NULL, NULL, FALSE, NULL, '/etc/postgresql/15/main/postgresql.conf', '/var/log/postgresql/postgresql-15-main.log', TRUE, 'PostgreSQL Development Database', NULL, NOW(), NOW()),
(4, 2, 'redis-dev', 'cache', 'running', '7.2', 6379, NULL, 'redis-server', 1235, NULL, NULL, NULL, NULL, NULL, FALSE, NULL, '/etc/redis/redis.conf', '/var/log/redis/redis-server.log', TRUE, 'Redis Cache - Dev', NULL, NOW(), NOW()),

-- Staging environment
(5, 3, 'devflow-erp-api', 'api', 'running', '1.0.0-rc1', 8000, 'https://api-staging.devflow.com', NULL, NULL, 'ghi789', 'devflow/erp-api:1.0.0-rc1', 70, 4096, 'https://api-staging.devflow.com/health', TRUE, '{"ENVIRONMENT": "staging", "DEBUG": "false"}', '/app/config/staging.yaml', '/var/log/devflow-erp.log', TRUE, 'DevFlow ERP Backend API - Staging', NULL, NOW(), NOW()),
(6, 3, 'nginx-staging', 'web', 'running', '1.25.3', 443, 'https://staging.devflow.com', 'nginx', 5678, NULL, NULL, NULL, NULL, 'https://staging.devflow.com/health', TRUE, NULL, '/etc/nginx/nginx.conf', '/var/log/nginx/access.log', TRUE, 'Nginx Reverse Proxy - Staging', NULL, NOW(), NOW()),
(7, 4, 'postgresql-staging', 'database', 'running', '15.5', 5432, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, NULL, NULL, NULL, FALSE, 'PostgreSQL Staging Database', 'AWS RDS managed', NOW(), NOW()),

-- Production environment
(8, 5, 'devflow-erp-api', 'api', 'running', '1.0.0', 8000, 'https://api.devflow.com', NULL, NULL, 'jkl012', 'devflow/erp-api:1.0.0', 80, 8192, 'https://api.devflow.com/health', TRUE, '{"ENVIRONMENT": "production", "DEBUG": "false"}', '/app/config/production.yaml', '/var/log/devflow-erp.log', TRUE, 'DevFlow ERP Backend API - Production (Primary)', 'Primary instance', NOW(), NOW()),
(9, 6, 'devflow-erp-api', 'api', 'running', '1.0.0', 8000, 'https://api.devflow.com', NULL, NULL, 'mno345', 'devflow/erp-api:1.0.0', 80, 8192, 'https://api.devflow.com/health', TRUE, '{"ENVIRONMENT": "production", "DEBUG": "false"}', '/app/config/production.yaml', '/var/log/devflow-erp.log', TRUE, 'DevFlow ERP Backend API - Production (Secondary)', 'Secondary instance', NOW(), NOW()),
(10, 5, 'nginx-prod', 'web', 'running', '1.25.3', 443, 'https://devflow.com', 'nginx', 9012, NULL, NULL, NULL, NULL, 'https://devflow.com/health', TRUE, NULL, '/etc/nginx/nginx.conf', '/var/log/nginx/access.log', TRUE, 'Nginx Load Balancer - Production', NULL, NOW(), NOW()),
(11, 7, 'postgresql-prod', 'database', 'running', '15.5', 5432, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, NULL, NULL, NULL, FALSE, 'PostgreSQL Production Database', 'AWS RDS Multi-AZ', NOW(), NOW()),

-- Stopped service
(12, 3, 'old-api-service', 'api', 'stopped', '0.9.0', 8001, NULL, NULL, NULL, NULL, 'devflow/old-api:0.9.0', NULL, NULL, NULL, FALSE, NULL, NULL, NULL, FALSE, 'Legacy API Service', 'Deprecated, scheduled for removal', NOW(), NOW());

SELECT setval('services_id_seq', (SELECT MAX(id) FROM services));

-- ============================================
-- 9. Deployments
-- ============================================
INSERT INTO deployments (id, service_id, deployed_by, version, commit_hash, branch, tag, type, status, started_at, completed_at, environment, rollback_from_id, notes, error_message, log_url, created_at, updated_at) VALUES
-- Dev environment deployments
(1, 1, 2, '1.0.0-dev', 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0', 'develop', NULL, 'automatic', 'success', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours' + INTERVAL '5 minutes', 'dev', NULL, 'Automatic deployment from develop branch', NULL, 'https://ci.devflow.com/logs/deploy-1', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
(2, 2, 5, '0.5.0-dev', 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1', 'develop', NULL, 'manual', 'success', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '3 minutes', 'dev', NULL, 'Manual deployment for testing', NULL, 'https://ci.devflow.com/logs/deploy-2', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- Staging environment deployments
(3, 5, 2, '1.0.0-rc1', 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2', 'release/1.0', 'v1.0.0-rc1', 'manual', 'success', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '8 minutes', 'staging', NULL, 'Release candidate 1 deployment', NULL, 'https://ci.devflow.com/logs/deploy-3', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(4, 5, 2, '1.0.0-rc1-hotfix', 'd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3', 'release/1.0', NULL, 'manual', 'failed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '2 minutes', 'staging', NULL, 'Hotfix deployment attempt', 'Database migration failed', 'https://ci.devflow.com/logs/deploy-4', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

-- Production environment deployments
(5, 8, 1, '0.9.5', 'e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4', 'main', 'v0.9.5', 'manual', 'success', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '10 minutes', 'production', NULL, 'Pre-1.0 production deployment', NULL, 'https://ci.devflow.com/logs/deploy-5', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
(6, 8, 1, '1.0.0', 'f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5', 'main', 'v1.0.0', 'manual', 'success', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '12 minutes', 'production', NULL, 'Version 1.0.0 production release', NULL, 'https://ci.devflow.com/logs/deploy-6', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(7, 9, 1, '1.0.0', 'f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5', 'main', 'v1.0.0', 'manual', 'success', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '12 minutes', 'production', NULL, 'Version 1.0.0 production release (secondary)', NULL, 'https://ci.devflow.com/logs/deploy-7', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

-- Failed deployment and rollback
(8, 8, 1, '1.0.1', 'g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6', 'main', 'v1.0.1', 'manual', 'failed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '5 minutes', 'production', NULL, 'Deployment failed due to memory leak', 'Service crashed after 5 minutes', 'https://ci.devflow.com/logs/deploy-8', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(9, 8, 1, '1.0.0', 'f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5', 'main', 'v1.0.0', 'rollback', 'success', NOW() - INTERVAL '2 days' + INTERVAL '10 minutes', NOW() - INTERVAL '2 days' + INTERVAL '13 minutes', 'production', 8, 'Rollback to previous stable version', NULL, 'https://ci.devflow.com/logs/deploy-9', NOW() - INTERVAL '2 days' + INTERVAL '10 minutes', NOW() - INTERVAL '2 days' + INTERVAL '10 minutes'),

-- Recent deployments
(10, 1, 2, '1.0.0-dev', 'h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7', 'develop', NULL, 'automatic', 'success', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '25 minutes', 'dev', NULL, 'Latest dev deployment', NULL, 'https://ci.devflow.com/logs/deploy-10', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
(11, 8, 2, '1.0.2', 'i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8', 'main', 'v1.0.2', 'manual', 'in_progress', NOW() - INTERVAL '5 minutes', NULL, 'production', NULL, 'Deploying hotfix for issue #123', NULL, 'https://ci.devflow.com/logs/deploy-11', NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '5 minutes');

SELECT setval('deployments_id_seq', (SELECT MAX(id) FROM deployments));

-- ============================================
-- Summary
-- ============================================
-- Sample data inserted:
-- - 8 Users (1 admin, 5 developers, 1 designer, 1 PM, 1 inactive)
-- - 4 Teams (Backend, Frontend, DevOps, Design)
-- - 12 Team memberships
-- - 5 Projects (various statuses)
-- - 8 Sprints (across multiple projects)
-- - 20 Issues (various types, priorities, statuses)
-- - 8 Servers (dev, staging, production)
-- - 12 Services (across different servers)
-- - 11 Deployments (including failed and rollback)
-- ============================================
