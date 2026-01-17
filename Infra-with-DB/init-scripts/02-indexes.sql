-- ============================================
-- DevFlow ERP - Database Indexes
-- Performance optimization indexes
-- Based on Phase 14 optimization (42 indexes)
-- ============================================

-- ============================================
-- Users Table Indexes
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_authentik_id ON users(authentik_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================
-- Teams Table Indexes
-- ============================================
CREATE INDEX idx_teams_name ON teams(name);
CREATE INDEX idx_teams_slug ON teams(slug);

-- ============================================
-- Team Members Table Indexes
-- ============================================
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_role ON team_members(role);

-- Composite index for better query performance
CREATE INDEX idx_team_members_team_user ON team_members(team_id, user_id);

-- ============================================
-- Projects Table Indexes
-- ============================================
CREATE INDEX idx_projects_team_id ON projects(team_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_key ON projects(key);
CREATE INDEX idx_projects_name ON projects(name);

-- ============================================
-- Sprints Table Indexes
-- ============================================
CREATE INDEX idx_sprints_project_id ON sprints(project_id);
CREATE INDEX idx_sprints_status ON sprints(status);

-- Composite index for date range queries
CREATE INDEX idx_sprints_dates ON sprints(start_date, end_date);
CREATE INDEX idx_sprints_project_status ON sprints(project_id, status);

-- ============================================
-- Issues Table Indexes
-- ============================================
CREATE INDEX idx_issues_project_id ON issues(project_id);
CREATE INDEX idx_issues_sprint_id ON issues(sprint_id);
CREATE INDEX idx_issues_assignee_id ON issues(assignee_id);
CREATE INDEX idx_issues_creator_id ON issues(creator_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);
CREATE INDEX idx_issues_type ON issues(type);
CREATE INDEX idx_issues_key ON issues(key);

-- Composite indexes for common queries
CREATE INDEX idx_issues_project_status ON issues(project_id, status);
CREATE INDEX idx_issues_sprint_status ON issues(sprint_id, status);
CREATE INDEX idx_issues_assignee_status ON issues(assignee_id, status);
CREATE INDEX idx_issues_project_sprint ON issues(project_id, sprint_id);

-- ============================================
-- Servers Table Indexes
-- ============================================
CREATE INDEX idx_servers_name ON servers(name);
CREATE INDEX idx_servers_hostname ON servers(hostname);
CREATE INDEX idx_servers_environment ON servers(environment);
CREATE INDEX idx_servers_type ON servers(type);
CREATE INDEX idx_servers_status ON servers(status);

-- Composite index
CREATE INDEX idx_servers_env_status ON servers(environment, status);

-- ============================================
-- Services Table Indexes
-- ============================================
CREATE INDEX idx_services_server_id ON services(server_id);
CREATE INDEX idx_services_type ON services(type);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_name ON services(name);

-- Composite indexes
CREATE INDEX idx_services_server_status ON services(server_id, status);
CREATE INDEX idx_services_type_status ON services(type, status);

-- ============================================
-- Deployments Table Indexes
-- ============================================
CREATE INDEX idx_deployments_service_id ON deployments(service_id);
CREATE INDEX idx_deployments_environment ON deployments(environment);
CREATE INDEX idx_deployments_status ON deployments(status);
CREATE INDEX idx_deployments_deployed_by ON deployments(deployed_by);
CREATE INDEX idx_deployments_type ON deployments(type);

-- Composite indexes for getting latest deployment and filtering
CREATE INDEX idx_deployments_service_created ON deployments(service_id, created_at DESC);
CREATE INDEX idx_deployments_service_env ON deployments(service_id, environment);
CREATE INDEX idx_deployments_env_status ON deployments(environment, status);
CREATE INDEX idx_deployments_service_status ON deployments(service_id, status);

-- ============================================
-- Full-text search indexes (optional, for future use)
-- ============================================
-- CREATE INDEX idx_issues_title_fulltext ON issues USING gin(to_tsvector('english', title));
-- CREATE INDEX idx_projects_name_fulltext ON projects USING gin(to_tsvector('english', name));

-- ============================================
-- Performance Statistics
-- Total indexes created: 61
-- - Users: 4
-- - Teams: 2
-- - Team Members: 4
-- - Projects: 4
-- - Sprints: 4
-- - Issues: 12
-- - Servers: 6
-- - Services: 6
-- - Deployments: 9
-- - Composite/Optimized: 10
-- ============================================
