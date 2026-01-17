// ============================================
// Router Routes - Application routes configuration
// ============================================

import type { RouteRecordRaw } from 'vue-router';
import { authGuard, guestGuard } from './guards';

const routes: RouteRecordRaw[] = [
  // ============================================
  // Authentication Routes (Public)
  // ============================================
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    beforeEnter: guestGuard,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/auth/LoginPage.vue'),
        meta: { title: '로그인' },
      },
      {
        path: 'callback',
        name: 'callback',
        component: () => import('pages/auth/CallbackPage.vue'),
        meta: { title: 'SSO 인증 처리' },
      },
    ],
  },

  {
    path: '/auth/unauthorized',
    // name: 'unauthorized', // [삭제] 부모 라우트에서 이름 제거
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'unauthorized', // [이동] 자식 라우트에 이름 부여
        component: () => import('pages/auth/UnauthorizedPage.vue'),
        meta: { title: '접근 권한 없음' },
      },
    ],
  },

  // ============================================
  // Main Application Routes (Protected)
  // ============================================
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: authGuard,
    children: [
      // Redirect root to dashboard
      {
        path: '',
        redirect: '/dashboard',
      },

      // Dashboard
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('pages/dashboard/DashboardPage.vue'),
        meta: { title: '대시보드' },
      },

      // Projects
      {
        path: 'projects',
        name: 'projects',
        component: () => import('pages/projects/ProjectListPage.vue'),
        meta: { title: '프로젝트' },
      },
      {
        path: 'projects/:id',
        name: 'project-detail',
        component: () => import('pages/projects/ProjectDetailPage.vue'),
        meta: { title: '프로젝트 상세' },
      },

      // Sprints
      {
        path: 'sprints',
        name: 'sprints',
        component: () => import('pages/sprints/SprintListPage.vue'),
        meta: { title: '스프린트' },
      },
      {
        path: 'sprints/:id',
        name: 'sprint-detail',
        component: () => import('pages/sprints/SprintDetailPage.vue'), // TODO: Create SprintDetailPage
        meta: { title: '스프린트 상세' },
      },

      // Issues
      {
        path: 'issues',
        name: 'issues',
        component: () => import('pages/issues/IssueListPage.vue'),
        meta: { title: '이슈' },
      },
      {
        path: 'issues/:id',
        name: 'issue-detail',
        component: () => import('pages/issues/IssueDetailPage.vue'), // TODO: Create IssueDetailPage
        meta: { title: '이슈 상세' },
      },

      // Kanban Board (Placeholder route)
      {
        path: 'kanban',
        name: 'kanban',
        component: () => import('pages/KanbanPage.vue'),
        meta: { title: '칸반 보드' },
      },

      // Teams
      {
        path: 'teams',
        name: 'teams',
        component: () => import('pages/teams/TeamListPage.vue'),
        meta: { title: '팀' },
      },
      {
        path: 'teams/:id',
        name: 'team-detail',
        // 1. 실제 생성할 페이지 경로로 변경
        component: () => import('pages/teams/TeamDetailPage.vue'),
        meta: { title: '팀 상세' },
        // 2. :id 파라미터를 teamId prop으로 전달 (숫자형으로)
        props: (route) => ({ teamId: Number(route.params.id) }),
      },

      // Resources - Servers
      {
        path: 'resources/servers',
        name: 'servers',
        component: () => import('pages/servers/ServerListPage.vue'),
        meta: { title: '서버' },
      },
      {
        path: 'resources/servers/:id',
        name: 'server-detail',
        component: () => import('pages/IndexPage.vue'), // TODO: Create ServerDetailPage
        meta: { title: '서버 상세' },
      },

      // Resources - Services
      {
        path: 'resources/services',
        name: 'services',
        component: () => import('pages/services/ServiceListPage.vue'),
        meta: { title: '서비스' },
      },
      {
        path: 'resources/services/:id',
        name: 'service-detail',
        component: () => import('pages/IndexPage.vue'), // TODO: Create ServiceDetailPage
        meta: { title: '서비스 상세' },
      },

      // Deployments
      {
        path: 'deployments',
        name: 'deployments',
        component: () => import('pages/deployments/DeploymentListPage.vue'),
        meta: { title: '배포' },
      },
      {
        path: 'deployments/:id',
        name: 'deployment-detail',
        component: () => import('pages/IndexPage.vue'), // TODO: Create DeploymentDetailPage
        meta: { title: '배포 상세' },
      },

      {
        path: 'profile',
        name: 'profile',
        component: () => import('pages/profile/ProfilePage.vue'),
        meta: { title: '프로필' },
      },

      // Settings (Placeholder)
      {
        path: 'settings',
        name: 'settings',
        component: () => import('pages/IndexPage.vue'),
        meta: { title: '설정' },
      },

      {
        path: 'profile',
        component: () => import('pages/profile/ProfilePage.vue'),
      },
    ],
  },

  // ============================================
  // Error Routes
  // ============================================
  {
    path: '/:catchAll(.*)*',
    name: 'not-found',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { title: '페이지를 찾을 수 없습니다' },
  },
];

export default routes;
