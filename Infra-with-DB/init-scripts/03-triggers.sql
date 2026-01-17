-- ============================================
-- DevFlow ERP - Database Triggers
-- Automatic timestamp updates and other automation
-- ============================================

-- ============================================
-- Function: update_updated_at_column()
-- Purpose: Automatically update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- Apply updated_at trigger to all tables with updated_at column
-- ============================================

-- Users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Teams
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Team Members
CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Projects
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sprints
CREATE TRIGGER update_sprints_updated_at
    BEFORE UPDATE ON sprints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Issues
CREATE TRIGGER update_issues_updated_at
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Servers
CREATE TRIGGER update_servers_updated_at
    BEFORE UPDATE ON servers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Services
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Deployments
CREATE TRIGGER update_deployments_updated_at
    BEFORE UPDATE ON deployments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Function: validate_sprint_dates()
-- Purpose: Ensure start_date < end_date
-- ============================================
CREATE OR REPLACE FUNCTION validate_sprint_dates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.start_date IS NOT NULL AND NEW.end_date IS NOT NULL THEN
        IF NEW.start_date >= NEW.end_date THEN
            RAISE EXCEPTION 'Sprint start_date must be before end_date';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER check_sprint_dates
    BEFORE INSERT OR UPDATE ON sprints
    FOR EACH ROW
    EXECUTE FUNCTION validate_sprint_dates();

-- ============================================
-- Function: set_deployment_started_at()
-- Purpose: Automatically set started_at when status changes to 'in_progress'
-- ============================================
CREATE OR REPLACE FUNCTION set_deployment_started_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'in_progress' AND OLD.status != 'in_progress' THEN
        NEW.started_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auto_set_deployment_started_at
    BEFORE UPDATE ON deployments
    FOR EACH ROW
    EXECUTE FUNCTION set_deployment_started_at();

-- ============================================
-- Function: set_deployment_completed_at()
-- Purpose: Automatically set completed_at when status changes to final state
-- ============================================
CREATE OR REPLACE FUNCTION set_deployment_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('success', 'failed', 'rolled_back')
       AND OLD.status NOT IN ('success', 'failed', 'rolled_back') THEN
        NEW.completed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auto_set_deployment_completed_at
    BEFORE UPDATE ON deployments
    FOR EACH ROW
    EXECUTE FUNCTION set_deployment_completed_at();

-- ============================================
-- Summary
-- ============================================
-- Triggers created:
-- - 9 updated_at triggers (all tables with updated_at column)
-- - 1 sprint date validation trigger
-- - 2 deployment timestamp triggers
-- Total: 12 triggers
-- ============================================
