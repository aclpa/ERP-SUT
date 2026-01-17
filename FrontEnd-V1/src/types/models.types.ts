// ============================================
// Domain Model Types - Based on DB Schema
// ============================================

import type { BaseEntity } from './common.types';

// ============================================
// Enums (matching PostgreSQL ENUM types)
// ============================================

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export type IssueStatus = 'todo' | 'in_progress' | 'in_review' | 'testing' | 'done' | 'closed';

export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

export type IssueType = 'epic' | 'story' | 'task' | 'bug' | 'improvement';

export type SprintStatus = 'planning' | 'active' | 'completed' | 'cancelled';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';

export type ServerEnvironment = 'development' | 'staging' | 'production';

export type ServerType = 'web' | 'api' | 'database' | 'cache' | 'message_queue' | 'other';

export type ServerStatus = 'running' | 'stopped' | 'maintenance' | 'error';

export type ServiceType =
  | 'web'
  | 'api'
  | 'database'
  | 'cache'
  | 'queue'
  | 'worker'
  | 'cron'
  | 'other';

export type ServiceStatus = 'running' | 'stopped' | 'degraded' | 'maintenance' | 'failed';

export type DeploymentType = 'manual' | 'automatic' | 'rollback';

export type DeploymentStatus = 'pending' | 'in_progress' | 'success' | 'failed' | 'rolled_back';

// ============================================
// User
// ============================================

export interface User extends BaseEntity {
  authentik_id: string;
  email: string;
  username: string;
  full_name: string | null;
  phone: string | null;
  is_active: boolean;
  is_admin: boolean; // Backend uses is_admin instead of is_superuser
  is_superuser?: boolean; // Alias for compatibility
  avatar_url: string | null;
}

export interface UserCreate {
  email: string;
  username: string;
  full_name: string;
  phone: string;
  is_admin: boolean;
  // [수정] 명시적으로 undefined와 null 허용
  authentik_id?: string | null | undefined;
  avatar_url?: string | null | undefined;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  full_name?: string;
  phone?: string;
  // [수정] 명시적으로 undefined와 null 허용
  avatar_url?: string | null | undefined;
  is_active?: boolean;
}

// ============================================
// Team
// ============================================

export interface Team extends BaseEntity {
  name: string;
  description: string | null;
  owner_id: number;
  is_active: boolean;
  avatar_url?: string | null;
}

export interface TeamCreate {
  name: string;
  description?: string;
  is_active?: boolean;
  member_ids?: number[];
}

export interface TeamUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

// ============================================
// Team Member
// ============================================

export interface User extends BaseEntity {
  authentik_id: string;
  email: string;
  username: string;
  full_name: string | null;
  phone: string | null;
  is_active: boolean;
  is_admin: boolean;
  is_superuser?: boolean;
  avatar_url: string | null;
}

export interface TeamMemberCreate {
  team_id: number;
  user_id: number;
  role: TeamRole;
}

export interface TeamMemberUpdate {
  role?: TeamRole;
}

// ============================================
// Project
// ============================================

export interface Project extends BaseEntity {
  name: string;
  key: string;
  description: string | null;
  team_id: number;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  repository_url: string | null;
}

export interface ProjectCreate {
  name: string;
  key: string;
  description?: string;
  team_id: number;
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string;
  repository_url?: string;
}

export interface ProjectUpdate {
  name?: string;
  key?: string;
  description?: string;
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string;
  repository_url?: string;
}

// ============================================
// Sprint
// ============================================

export interface Sprint extends BaseEntity {
  name: string;
  project_id: number;
  goal: string | null;
  status: SprintStatus;
  start_date: string | null;
  end_date: string | null;
  total_issues?: number;
  completed_issues?: number;
}

export interface SprintCreate {
  name: string;
  project_id: number;
  goal?: string;
  status?: SprintStatus;
  start_date?: string;
  end_date?: string;
}

export interface SprintUpdate {
  name?: string;
  goal?: string;
  status?: SprintStatus;
  start_date?: string;
  end_date?: string;
}

// ============================================
// Issue
// ============================================

export interface Issue extends BaseEntity {
  title: string;
  description: string | null;
  project_id: number;
  sprint_id: number | null;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  assignee_id: number | null;
  reporter_id: number;
  story_points: number | null;
  due_date: string | null;
}

export interface IssueCreate {
  title: string;
  description?: string;
  project_id: number;
  sprint_id?: number;
  type: IssueType;
  status?: IssueStatus;
  priority?: IssuePriority;
  assignee_id?: number;
  reporter_id: number;
  story_points?: number;
  due_date?: string;
}

export interface IssueUpdate {
  title?: string;
  description?: string;
  sprint_id?: number;
  type?: IssueType;
  status?: IssueStatus;
  priority?: IssuePriority;
  assignee_id?: number;
  story_points?: number;
  due_date?: string;
}

// ============================================
// Server
// ============================================

export interface Server extends BaseEntity {
  name: string;
  description: string | null;
  hostname: string;
  ip_address: string;
  environment: ServerEnvironment;
  type: ServerType;
  status: ServerStatus;
  os_type: string | null;
  os_version: string | null;
  cpu_cores: number | null;
  memory_gb: number | null;
  disk_gb: number | null;
}

export interface ServerCreate {
  name: string;
  description?: string;
  hostname: string;
  ip_address: string;
  environment: ServerEnvironment;
  type: ServerType;
  status?: ServerStatus;
  os_type?: string;
  os_version?: string;
  cpu_cores?: number;
  memory_gb?: number;
  disk_gb?: number;
}

export interface ServerUpdate {
  name?: string;
  description?: string;
  hostname?: string;
  ip_address?: string;
  environment?: ServerEnvironment;
  type?: ServerType;
  status?: ServerStatus;
  os_type?: string;
  os_version?: string;
  cpu_cores?: number;
  memory_gb?: number;
  disk_gb?: number;
}

// ============================================
// Service
// ============================================

export interface Service extends BaseEntity {
  name: string;
  description: string | null;
  server_id: number;
  type: ServiceType;
  status: ServiceStatus;
  version: string | null;
  port: number | null;
  url: string | null;
  process_name: string | null;
  pid: number | null;
  container_id: string | null;
  image_name: string | null;
  cpu_limit: number | null;
  memory_limit_mb: number | null;
  health_check_url: string | null;
  health_check_enabled: boolean;
  environment_variables: Record<string, unknown> | null;
  config_path: string | null;
  log_path: string | null;
  auto_start: boolean;
  notes: string | null;
}

export interface ServiceCreate {
  name: string;
  server_id: number;
  type: ServiceType;
  status?: ServiceStatus;
  version?: string;
  port?: number;
  url?: string;
  process_name?: string;
  pid?: number;
  container_id?: string;
  image_name?: string;
  cpu_limit?: number;
  memory_limit_mb?: number;
  health_check_url?: string;
  health_check_enabled?: boolean;
  environment_variables?: Record<string, unknown>;
  config_path?: string;
  log_path?: string;
  auto_start?: boolean;
  description?: string;
  notes?: string;
}

export interface ServiceUpdate {
  name?: string;
  type?: ServiceType;
  status?: ServiceStatus;
  version?: string;
  port?: number;
  url?: string;
  process_name?: string;
  pid?: number;
  container_id?: string;
  image_name?: string;
  cpu_limit?: number;
  memory_limit_mb?: number;
  health_check_url?: string;
  health_check_enabled?: boolean;
  environment_variables?: Record<string, unknown>;
  config_path?: string;
  log_path?: string;
  auto_start?: boolean;
  description?: string;
  notes?: string;
}

// ============================================
// Deployment
// ============================================

export interface Deployment extends BaseEntity {
  service_id: number;
  deployed_by: number;
  version: string;
  commit_hash: string | null;
  branch: string | null;
  tag: string | null;
  type: DeploymentType;
  status: DeploymentStatus;
  started_at: string | null;
  completed_at: string | null;
  environment: string;
  rollback_from_id: number | null;
  notes: string | null;
  error_message: string | null;
  log_url: string | null;
}

export interface DeploymentCreate {
  service_id: number;
  version: string;
  environment: string;
  commit_hash?: string;
  branch?: string;
  tag?: string;
  type?: DeploymentType;
  status?: DeploymentStatus;
  notes?: string;
}

export interface DeploymentUpdate {
  status?: DeploymentStatus;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  error_message?: string;
  log_url?: string;
}

export interface ProjectStats {
  total_sprints: number;
  active_sprints: number;
  total_issues: number;
  open_issues: number;
  completed_issues: number;
  team_members: number;
}

export interface TeamMember extends BaseEntity {
  team_id: number;
  user_id: number;
  user?: User; // Optional로 설정하거나, 백엔드 응답에 항상 포함된다면 필수 값으로 설정
  role: TeamRole;
  joined_at?: string; // 백엔드 스키마에 따라 Optional일 수 있음 (created_at으로 매핑될 수도 있음)
}

export interface UserProfile {
  user: User;
  teams: Team[]; // TeamListResponse에 대응
  projects: Project[]; // ProjectListResponse에 대응
}
