<script setup lang="ts">
import { onMounted, watch, computed } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import CustomSelect from './CustomSelect.vue'

const taskStore = useTaskStore()

const workspaceOptions = computed(() => [
  { value: null, label: 'All Workspaces' },
  ...taskStore.workspaces.map(workspace => ({
    value: workspace,
    label: workspace.name
  }))
])

watch(() => taskStore.currentWorkspace, async () => {
  await taskStore.fetchTasks()
})

onMounted(() => {
  taskStore.fetchWorkspaces()
})
</script>

<template>
  <div class="workspace-selector">
    <div class="select-wrapper">
      <i class="fas fa-folder"></i>
      <CustomSelect
        v-model="taskStore.currentWorkspace"
        :options="workspaceOptions"
        :disabled="taskStore.loading"
      />
    </div>
  </div>
</template>

<style scoped>
.workspace-selector {
  margin-bottom: 1rem;
  flex: 1;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.select-wrapper i {
  position: absolute;
  left: 1rem;
  color: #64748b;
  z-index: 1;
}

:deep(.custom-select) {
  width: 100%;
}

:deep(.custom-select select) {
  padding-left: 2.5rem;
}

/* Специфичные стили для селекта в workspace-selector */
:deep(.select-header) {
  padding-left: 2.5rem;
}

:deep(.options-list .option) {
  padding-left: 2.5rem;
}
</style>
