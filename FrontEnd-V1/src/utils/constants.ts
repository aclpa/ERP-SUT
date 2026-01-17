// ============================================
// Constants - Application-wide constants
// ============================================

import type {
  IssueStatus,
  IssuePriority,
  IssueType,
  SprintStatus,
  ProjectStatus,
  ServerEnvironment,
  ServerType,
  ServerStatus,
  ServiceType,
  ServiceStatus,
  DeploymentStatus,
  DeploymentType,
  TeamRole,
} from 'src/types/models.types';
import type { SelectOption } from 'src/types/api.types';

// ============================================
// Issue Constants
// ============================================

export const ISSUE_STATUS_OPTIONS: SelectOption<IssueStatus>[] = [
  { label: 'To Do', value: 'todo', icon: 'radio_button_unchecked' },
  { label: 'In Progress', value: 'in_progress', icon: 'pending' },
  { label: 'In Review', value: 'in_review', icon: 'rate_review' },
  { label: 'Testing', value: 'testing', icon: 'science' },
  { label: 'Done', value: 'done', icon: 'check_circle' },
  { label: 'Closed', value: 'closed', icon: 'cancel' },
];

export const ISSUE_PRIORITY_OPTIONS: SelectOption<IssuePriority>[] = [
  { label: '낮음', value: 'low', icon: 'arrow_downward' },
  { label: '보통', value: 'medium', icon: 'remove' },
  { label: '높음', value: 'high', icon: 'arrow_upward' },
  { label: '긴급', value: 'urgent', icon: 'warning' },
];

export const ISSUE_TYPE_OPTIONS: SelectOption<IssueType>[] = [
  { label: '에픽', value: 'epic', icon: 'folder_special' },
  { label: '스토리', value: 'story', icon: 'menu_book' },
  { label: '작업', value: 'task', icon: 'task_alt' },
  { label: '버그', value: 'bug', icon: 'bug_report' },
  { label: '개선', value: 'improvement', icon: 'trending_up' },
];

// ============================================
// Status Colors
// ============================================

export const ISSUE_STATUS_COLORS: Record<IssueStatus, string> = {
  todo: 'grey',
  in_progress: 'blue',
  in_review: 'orange',
  testing: 'purple',
  done: 'green',
  closed: 'grey-7',
};

export const ISSUE_PRIORITY_COLORS: Record<IssuePriority, string> = {
  low: 'blue-grey',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};

export const ISSUE_TYPE_COLORS: Record<IssueType, string> = {
  epic: 'purple',
  story: 'blue',
  task: 'green',
  bug: 'red',
  improvement: 'orange',
};

export const ISSUE_TYPE_ICONS: Record<IssueType, string> = {
  epic: 'folder_special',
  story: 'menu_book',
  task: 'task_alt',
  bug: 'bug_report',
  improvement: 'trending_up',
};

// ============================================
// Sprint Constants
// ============================================

export const SPRINT_STATUS_OPTIONS: SelectOption<SprintStatus>[] = [
  { label: '계획 중', value: 'planning', icon: 'event' },
  { label: '진행 중', value: 'active', icon: 'play_circle' },
  { label: '완료', value: 'completed', icon: 'check_circle' },
  { label: '취소', value: 'cancelled', icon: 'cancel' },
];

export const SPRINT_STATUS_COLORS: Record<SprintStatus, string> = {
  planning: 'grey',
  active: 'blue',
  completed: 'green',
  cancelled: 'red',
};

// ============================================
// Project Constants
// ============================================

export const PROJECT_STATUS_OPTIONS: SelectOption<ProjectStatus>[] = [
  { label: '계획 중', value: 'planning', icon: 'event' },
  { label: '진행 중', value: 'active', icon: 'play_circle' },
  { label: '보류', value: 'on_hold', icon: 'pause_circle' },
  { label: '완료', value: 'completed', icon: 'check_circle' },
  { label: '보관', value: 'archived', icon: 'archive' },
];

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  planning: 'grey',
  active: 'blue',
  on_hold: 'orange',
  completed: 'green',
  archived: 'grey-7',
};

// ============================================
// Server Constants
// ============================================

export const SERVER_ENVIRONMENT_OPTIONS: SelectOption<ServerEnvironment>[] = [
  { label: '개발', value: 'development', icon: 'code' },
  { label: '스테이징', value: 'staging', icon: 'science' },
  { label: '프로덕션', value: 'production', icon: 'public' },
];

export const SERVER_TYPE_OPTIONS: SelectOption<ServerType>[] = [
  { label: 'Web', value: 'web', icon: 'language' },
  { label: 'API', value: 'api', icon: 'api' },
  { label: 'Database', value: 'database', icon: 'storage' },
  { label: 'Cache', value: 'cache', icon: 'memory' },
  { label: 'Message Queue', value: 'message_queue', icon: 'queue' },
  { label: '기타', value: 'other', icon: 'devices_other' },
];

export const SERVER_STATUS_OPTIONS: SelectOption<ServerStatus>[] = [
  { label: '실행 중', value: 'running', icon: 'check_circle' },
  { label: '중지됨', value: 'stopped', icon: 'cancel' },
  { label: '유지보수', value: 'maintenance', icon: 'build' },
  { label: '오류', value: 'error', icon: 'error' },
];

export const SERVER_ENVIRONMENT_COLORS: Record<ServerEnvironment, string> = {
  development: 'blue',
  staging: 'orange',
  production: 'green',
};

export const SERVER_TYPE_COLORS: Record<ServerType, string> = {
  web: 'blue',
  api: 'purple',
  database: 'green',
  cache: 'orange',
  message_queue: 'teal',
  other: 'grey',
};

export const SERVER_STATUS_COLORS: Record<ServerStatus, string> = {
  running: 'green',
  stopped: 'grey',
  maintenance: 'orange',
  error: 'red',
};

// ============================================
// Service Constants
// ============================================

export const SERVICE_TYPE_OPTIONS: SelectOption<ServiceType>[] = [
  { label: 'Web', value: 'web', icon: 'language' },
  { label: 'API', value: 'api', icon: 'api' },
  { label: 'Database', value: 'database', icon: 'storage' },
  { label: 'Cache', value: 'cache', icon: 'memory' },
  { label: 'Queue', value: 'queue', icon: 'queue' },
  { label: 'Worker', value: 'worker', icon: 'work' },
  { label: 'Cron', value: 'cron', icon: 'schedule' },
  { label: '기타', value: 'other', icon: 'devices_other' },
];

export const SERVICE_STATUS_OPTIONS: SelectOption<ServiceStatus>[] = [
  { label: '실행 중', value: 'running', icon: 'check_circle' },
  { label: '중지됨', value: 'stopped', icon: 'cancel' },
  { label: '저하됨', value: 'degraded', icon: 'warning' },
  { label: '유지보수', value: 'maintenance', icon: 'build' },
  { label: '실패', value: 'failed', icon: 'error' },
];

export const SERVICE_TYPE_COLORS: Record<ServiceType, string> = {
  web: 'blue',
  api: 'purple',
  database: 'green',
  cache: 'orange',
  queue: 'teal',
  worker: 'indigo',
  cron: 'amber',
  other: 'grey',
};

export const SERVICE_STATUS_COLORS: Record<ServiceStatus, string> = {
  running: 'green',
  stopped: 'grey',
  degraded: 'orange',
  maintenance: 'blue',
  failed: 'red',
};

// ============================================
// Deployment Constants
// ============================================

export const DEPLOYMENT_TYPE_OPTIONS: SelectOption<DeploymentType>[] = [
  { label: '수동 배포', value: 'manual', icon: 'touch_app' },
  { label: '자동 배포', value: 'automatic', icon: 'autorenew' },
  { label: '롤백', value: 'rollback', icon: 'undo' },
];

export const DEPLOYMENT_STATUS_OPTIONS: SelectOption<DeploymentStatus>[] = [
  { label: '대기 중', value: 'pending', icon: 'hourglass_empty' },
  { label: '진행 중', value: 'in_progress', icon: 'cloud_upload' },
  { label: '성공', value: 'success', icon: 'check_circle' },
  { label: '실패', value: 'failed', icon: 'error' },
  { label: '롤백됨', value: 'rolled_back', icon: 'undo' },
];

export const DEPLOYMENT_TYPE_COLORS: Record<DeploymentType, string> = {
  manual: 'blue',
  automatic: 'green',
  rollback: 'orange',
};

export const DEPLOYMENT_STATUS_COLORS: Record<DeploymentStatus, string> = {
  pending: 'grey',
  in_progress: 'blue',
  success: 'green',
  failed: 'red',
  rolled_back: 'orange',
};

// ============================================
// Team Constants
// ============================================

export const TEAM_ROLE_OPTIONS: SelectOption<TeamRole>[] = [
  { label: '소유자', value: 'owner', icon: 'star' },
  { label: '관리자', value: 'admin', icon: 'shield' },
  { label: '멤버', value: 'member', icon: 'person' },
  { label: '뷰어', value: 'viewer', icon: 'visibility' },
];

export const TEAM_ROLE_COLORS: Record<TeamRole, string> = {
  owner: 'purple',
  admin: 'orange',
  member: 'blue',
  viewer: 'grey',
};

// ============================================
// Pagination
// ============================================

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ============================================
// API Endpoints (for reference)
// ============================================

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_ME: '/auth/me',
  AUTH_AUTHORIZE: '/auth/authorize',
  AUTH_CALLBACK: '/auth/callback',

  // Users
  USERS: '/users',
  USER_BY_ID: (id: number) => `/users/${id}`,

  // Teams
  TEAMS: '/teams',
  TEAM_BY_ID: (id: number) => `/teams/${id}`,
  TEAM_MEMBERS: (teamId: number) => `/teams/${teamId}/members`,

  // Projects
  PROJECTS: '/projects',
  PROJECT_BY_ID: (id: number) => `/projects/${id}`,

  // Sprints
  SPRINTS: '/sprints',
  SPRINT_BY_ID: (id: number) => `/sprints/${id}`,

  // Issues
  ISSUES: '/issues',
  ISSUE_BY_ID: (id: number) => `/issues/${id}`,

  // Servers
  SERVERS: '/servers',
  SERVER_BY_ID: (id: number) => `/servers/${id}`,

  // Services
  SERVICES: '/services',
  SERVICE_BY_ID: (id: number) => `/services/${id}`,

  // Deployments
  DEPLOYMENTS: '/deployments',
  DEPLOYMENT_BY_ID: (id: number) => `/deployments/${id}`,
} as const;
