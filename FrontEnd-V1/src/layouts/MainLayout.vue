<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <!-- Menu Toggle Button (Mobile) -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="q-mr-sm"
        />

        <!-- Logo and Title -->
        <q-toolbar-title class="cursor-pointer" @click="$router.push('/dashboard')">
          <div class="row items-center no-wrap">
            <div class="text-h6 text-weight-bold">DevFlow ERP</div>
          </div>
        </q-toolbar-title>

        <!-- Spacer -->
        <q-space />

        <!-- Global Search -->
        <q-btn flat dense round icon="search" @click="showSearch = true" class="q-mr-sm">
          <q-tooltip>검색 (Ctrl+K)</q-tooltip>
        </q-btn>

        <!-- Dark Mode Toggle -->
        <!-- <q-btn
          flat
          dense
          round
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          @click="toggleDarkMode"
          class="q-mr-sm"
        >
          <q-tooltip>{{ $q.dark.isActive ? '라이트 모드' : '다크 모드' }}</q-tooltip>
        </q-btn> -->

        <!-- Notifications (Placeholder) -->
        <q-btn flat dense round icon="notifications" class="q-mr-sm">
          <q-badge color="red" floating>3</q-badge>
          <q-tooltip>알림</q-tooltip>
        </q-btn>

        <!-- User Menu -->
        <q-btn flat round dense>
          <q-avatar size="32px" color="secondary" text-color="white">
            {{ userInitials }}
          </q-avatar>
          <q-tooltip>{{ userFullName }}</q-tooltip>

          <q-menu>
            <q-list style="min-width: 200px">
              <!-- User Info -->
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="secondary" text-color="white">
                    {{ userInitials }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ userFullName }}</q-item-label>
                  <q-item-label caption>{{ user?.email }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <!-- Profile -->
              <q-item clickable v-close-popup @click="$router.push('/profile')">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>Profile</q-item-section>
              </q-item>

              <!-- Settings -->
              <q-item clickable v-close-popup @click="$router.push('/settings')">
                <q-item-section avatar>
                  <q-icon name="settings" />
                </q-item-section>
                <q-item-section>Settings</q-item-section>
              </q-item>

              <q-separator />

              <!-- Logout -->
              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Left Drawer (Sidebar) -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="250" :breakpoint="1024">
      <q-scroll-area class="fit">
        <q-list padding>
          <!-- Dashboard -->
          <q-item
            clickable
            v-ripple
            :active="isActiveRoute('/dashboard')"
            active-class="bg-primary text-white"
            @click="$router.push('/dashboard')"
          >
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>Dash board</q-item-section>
          </q-item>

          <q-separator class="q-my-sm" />

          <!-- Projects -->
          <q-item
            clickable
            v-ripple
            :active="isActiveRoute('/projects')"
            active-class="bg-primary text-white"
            @click="$router.push('/projects')"
          >
            <q-item-section avatar>
              <q-icon name="folder" />
            </q-item-section>
            <q-item-section>Projects</q-item-section>
          </q-item>

          <!-- Sprints -->
          <q-item
            clickable
            v-ripple
            :active="isActiveRoute('/sprints')"
            active-class="bg-primary text-white"
            @click="$router.push('/sprints')"
          >
            <q-item-section avatar>
              <q-icon name="sprint" />
            </q-item-section>
            <q-item-section>Sprints</q-item-section>
          </q-item>

          <!-- Issues -->
          <q-item
            clickable
            v-ripple
            :active="isActiveRoute('/issues')"
            active-class="bg-primary text-white"
            @click="$router.push('/issues')"
          >
            <q-item-section avatar>
              <q-icon name="bug_report" />
            </q-item-section>
            <q-item-section>Issues</q-item-section>
          </q-item>

          <!-- Kanban Board -->
          <q-item
            clickable
            v-ripple
            :active="isActiveRoute('/kanban')"
            active-class="bg-primary text-white"
            @click="$router.push('/kanban')"
          >
            <q-item-section avatar>
              <q-icon name="view_column" />
            </q-item-section>
            <q-item-section>Kanban Board</q-item-section>
          </q-item>

          <q-separator class="q-my-sm" />

          <!-- Teams -->
          <q-item
            clickable
            v-ripple
            :active="isActiveRoute('/teams')"
            active-class="bg-primary text-white"
            @click="$router.push('/teams')"
          >
            <q-item-section avatar>
              <q-icon name="groups" />
            </q-item-section>
            <q-item-section>Teams</q-item-section>
          </q-item>

          <q-separator class="q-my-sm" />

          <!-- Resources -->
          <q-expansion-item
            icon="dns"
            label="resources"
            :default-opened="isActiveRoute('/resources')"
          >
            <!-- Servers -->
            <q-item
              clickable
              v-ripple
              :active="isActiveRoute('/resources/servers')"
              active-class="bg-primary text-white"
              @click="$router.push('/resources/servers')"
              class="q-pl-lg"
            >
              <q-item-section avatar>
                <q-icon name="storage" />
              </q-item-section>
              <q-item-section>Servers</q-item-section>
            </q-item>

            <!-- Services -->
            <q-item
              clickable
              v-ripple
              :active="isActiveRoute('/resources/services')"
              active-class="bg-primary text-white"
              @click="$router.push('/resources/services')"
              class="q-pl-lg"
            >
              <q-item-section avatar>
                <q-icon name="api" />
              </q-item-section>
              <q-item-section>Services</q-item-section>
            </q-item>
          </q-expansion-item>

          <!-- Deployments -->
          <q-item
            clickable
            v-ripple
            :active="isActiveRoute('/deployments')"
            active-class="bg-primary text-white"
            @click="$router.push('/deployments')"
          >
            <q-item-section avatar>
              <q-icon name="rocket_launch" />
            </q-item-section>
            <q-item-section>Deployments</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- Page Container -->
    <q-page-container>
      <!-- Breadcrumbs -->
      <div class="q-px-md q-pt-md q-pb-sm">
        <page-breadcrumbs />
      </div>

      <router-view />
    </q-page-container>

    <!-- Global Search -->
    <global-search v-model="showSearch" />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
// import { useQuasar } from 'quasar';
import { useAuth } from 'src/composables/useAuth';
import PageBreadcrumbs from 'src/components/common/PageBreadcrumbs.vue';
import GlobalSearch from 'src/components/common/GlobalSearch.vue';

// ============================================
// Composables
// ============================================

const route = useRoute();
// const $q = useQuasar();
const { user, userFullName, userInitials, logout } = useAuth();

// ============================================
// State
// ============================================

const leftDrawerOpen = ref(false);
const showSearch = ref(false);

// ============================================
// Methods
// ============================================

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

// function toggleDarkMode() {
//   $q.dark.toggle();
//   // Save preference to localStorage
//   localStorage.setItem('darkMode', String($q.dark.isActive));
// }

function isActiveRoute(path: string): boolean {
  return route.path.startsWith(path);
}

async function handleLogout() {
  try {
    await logout();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// ============================================
// Initialize dark mode from localStorage
// ============================================

// const savedDarkMode = localStorage.getItem('darkMode');
// if (savedDarkMode === 'true') {
//   $q.dark.set(true);
// } else if (savedDarkMode === 'false') {
//   $q.dark.set(false);
// } else {
//   // Auto detect based on system preference
//   $q.dark.set('auto');
// }
</script>

<style scoped lang="scss">
.q-toolbar {
  min-height: 64px;
}

.q-drawer {
  .q-item {
    border-radius: 8px;
    margin: 4px 8px;

    &.q-router-link--active {
      font-weight: 600;
    }
  }

  .q-expansion-item {
    .q-item {
      margin-left: 0;
    }
  }
}

.cursor-pointer {
  cursor: pointer;
}
</style>
