<template>
  <q-page padding>
    <div v-if="userStore.isLoading" class="row justify-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <div v-else-if="userProfile" class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <q-card bordered flat>
          <q-card-section class="text-center">
            <q-avatar size="100px" class="q-mb-md">
              <img v-if="userProfile.user.avatar_url" :src="userProfile.user.avatar_url" />
              <q-icon v-else name="account_circle" size="100px" color="grey-4" />
            </q-avatar>

            <div class="text-h5 text-weight-bold">{{ userProfile.user.full_name }}</div>
            <div class="text-subtitle2 text-grey-7">@{{ userProfile.user.username }}</div>

            <q-chip
              :color="userProfile.user.is_admin ? 'negative' : 'primary'"
              text-color="white"
              size="sm"
              class="q-mt-sm"
            >
              {{ userProfile.user.is_admin ? 'Administrator' : 'User' }}
            </q-chip>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-list padding>
              <q-item>
                <q-item-section avatar><q-icon name="email" color="primary" /></q-item-section>
                <q-item-section>
                  <q-item-label caption>Email</q-item-label>
                  <q-item-label>{{ userProfile.user.email }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar><q-icon name="phone" color="primary" /></q-item-section>
                <q-item-section>
                  <q-item-label caption>Phone</q-item-label>
                  <q-item-label>{{ userProfile.user.phone || 'Not set' }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Edit Profile" color="primary" @click="openEditDialog" />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-md-8">
        <q-card bordered flat class="q-mb-md">
          <q-card-section>
            <div class="text-h6">My Teams</div>
          </q-card-section>
          <q-separator />
          <q-card-section v-if="userProfile.teams.length > 0">
            <div class="row q-col-gutter-sm">
              <div v-for="team in userProfile.teams" :key="team.id" class="col-12 col-sm-6">
                <q-item
                  clickable
                  v-ripple
                  :to="`/teams/${team.id}`"
                  class="bg-grey-1 rounded-borders"
                >
                  <q-item-section avatar>
                    <q-avatar rounded size="md" color="secondary" text-color="white">
                      <img v-if="team.avatar_url" :src="team.avatar_url" />
                      <span v-else>{{ team.name.charAt(0) }}</span>
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ team.name }}</q-item-label>
                    <q-item-label caption lines="1">{{ team.description }}</q-item-label>
                  </q-item-section>
                </q-item>
              </div>
            </div>
          </q-card-section>
          <q-card-section v-else>
            <div class="text-grey-7 text-center q-pa-md">No teams joined yet.</div>
          </q-card-section>
        </q-card>

        <q-card bordered flat>
          <q-card-section>
            <div class="text-h6">My Projects</div>
          </q-card-section>
          <q-separator />
          <q-card-section v-if="userProfile.projects.length > 0">
            <q-list separator>
              <q-item
                v-for="project in userProfile.projects"
                :key="project.id"
                clickable
                v-ripple
                :to="`/projects/${project.id}`"
              >
                <q-item-section avatar>
                  <q-icon name="folder" color="warning" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ project.name }}</q-item-label>
                  <q-item-label caption>{{ project.key }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :color="getProjectStatusColor(project.status)">
                    {{ project.status }}
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-section v-else>
            <div class="text-grey-7 text-center q-pa-md">No active projects.</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="showEditDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Edit Profile</div>
        </q-card-section>
        <q-card-section>
          <UserForm
            v-if="userProfile"
            :user="userProfile.user"
            :loading="userStore.isLoading"
            @submit="handleEditSubmit"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from 'src/stores/user.store';
import { useNotify } from 'src/composables/useNotify';
import type { UserUpdate } from 'src/types/models.types';
import UserForm from 'src/components/users/UserForm.vue';

const userStore = useUserStore();
const { notifySuccess, notifyError } = useNotify();

const showEditDialog = ref(false);

const userProfile = computed(() => userStore.userProfile);

function getProjectStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'positive';
    case 'planning':
      return 'info';
    case 'completed':
      return 'grey';
    case 'on_hold':
      return 'warning';
    default:
      return 'primary';
  }
}

function openEditDialog() {
  showEditDialog.value = true;
}

// [수정] 타입 명시 및 에러 처리 개선
async function handleEditSubmit(data: UserUpdate) {
  // any -> UserUpdate
  if (!userProfile.value) return;

  try {
    await userStore.updateUser(userProfile.value.user.id, data);
    notifySuccess('Profile updated successfully');
    showEditDialog.value = false;
    await userStore.fetchUserProfile();
  } catch {
    // [수정] unused error 변수 제거
    notifyError('Failed to update profile');
  }
}

onMounted(() => {
  void userStore.fetchUserProfile();
});
</script>
