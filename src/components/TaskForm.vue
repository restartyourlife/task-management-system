<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task } from '@/types/task'
import CustomSelect from './CustomSelect.vue'

const props = defineProps<{
  initialTask?: Partial<Task>
  disabled?: boolean
}>()

const emit = defineEmits<{
  submit: [task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>]
}>()

const title = ref(props.initialTask?.title ?? '')
const description = ref(props.initialTask?.description ?? '')
const status = ref(props.initialTask?.status ?? 'todo')
const priority = ref(props.initialTask?.priority ?? 'medium')
const tags = ref<string[]>(props.initialTask?.tags ?? [])
const newTag = ref('')

const MAX_DESCRIPTION_LENGTH = 1000

const isDescriptionTooLong = computed(() => description.value.length > MAX_DESCRIPTION_LENGTH)

function addTag() {
  const tag = newTag.value.trim()
  if (tag && !tags.value.includes(tag)) {
    tags.value.push(tag)
    newTag.value = ''
  }
}

function removeTag(tagToRemove: string) {
  tags.value = tags.value.filter(tag => tag !== tagToRemove)
}

function handleSubmit() {
  if (isDescriptionTooLong.value) return

  emit('submit', {
    title: title.value,
    description: description.value.slice(0, MAX_DESCRIPTION_LENGTH),
    status: status.value as Task['status'],
    priority: priority.value as Task['priority'],
    tags: tags.value
  })
}

const isSubmitDisabled = computed(() => {
  return !title.value.trim() || !description.value.trim()
})

function handleTagKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    addTag()
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="task-form">
    <div class="form-group">
      <label for="title">
        <i class="fas fa-heading"></i>
        Title
      </label>
      <input
        id="title"
        v-model="title"
        type="text"
        required
        placeholder="Enter task title"
        :disabled="disabled"
        class="form-control"
      />
    </div>

    <div class="form-group">
      <label for="description">
        <i class="fas fa-align-left"></i>
        Description
      </label>
      <textarea
        id="description"
        v-model="description"
        required
        placeholder="Enter task description"
        :disabled="disabled"
        :maxlength="MAX_DESCRIPTION_LENGTH"
        class="form-control"
      ></textarea>
      <div class="description-footer">
        <span class="hint">Supports markdown</span>
        <span class="char-count" :class="{ 'near-limit': description.length > 900 }">
          {{ description.length }}/{{ MAX_DESCRIPTION_LENGTH }}
        </span>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="status">
          <i class="fas fa-tasks"></i>
          Status
        </label>
        <CustomSelect
          v-model="status"
          :options="[
            { value: 'todo', label: 'To Do' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'done', label: 'Done' }
          ]"
        />
      </div>

      <div class="form-group">
        <label for="priority">
          <i class="fas fa-flag"></i>
          Priority
        </label>
        <CustomSelect
          v-model="priority"
          :options="[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' }
          ]"
        />
      </div>
    </div>

    <div class="form-group">
      <label>
        <i class="fas fa-tags"></i>
        Tags
      </label>
      <div class="tags-input">
        <div class="tags-list" :class="{ empty: !tags.length }">
          <span v-for="tag in tags" :key="tag" class="tag">
            {{ tag }}
            <button
              type="button"
              class="remove-tag"
              @click="removeTag(tag)"
              :disabled="disabled"
              title="Remove tag"
            >
              <i class="fas fa-times"></i>
            </button>
          </span>
          <input
            v-if="tags.length < 5"
            type="text"
            v-model="newTag"
            placeholder="Add tag..."
            @keydown="handleTagKeydown"
            :disabled="disabled"
            class="tag-input"
          />
        </div>
        <div class="tags-footer">
          <span class="hint">Press Enter to add tag</span>
          <span class="tag-count">{{ tags.length }}/5</span>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button type="submit" :disabled="disabled || isSubmitDisabled" class="submit-btn">
        <i class="fas fa-save"></i>
        {{ disabled ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.task-form {
  background: white;
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

/* Базовые стили для всех групп */
.form-group,
.form-row,
.form-actions {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
}

.form-group:last-of-type {
  border-bottom: none;
}

/* Стили для строки с двумя колонками */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-row .form-group {
  padding: 0;
  border: none;
}

/* Стили для лейблов */
label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: #475569;
  font-size: 0.9rem;
}

label i {
  color: #64748b;
  font-size: 0.85rem;
}

/* Общие стили для всех полей ввода */
.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 0.95rem;
  transition: all var(--transition-normal);
  background: var(--bg-color);
  margin-top: 0.75rem;
}

/* Специфичные стили для textarea */
textarea.form-control {
  min-height: 120px;
  resize: vertical;
  line-height: 1.6;
}

/* Специфичные стили для select */
select.form-control {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem;
}

/* Стили для нижней панели действий */
.form-actions {
  background: #f8fafc;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}

/* ... остальные стили ... */

@media (max-width: 768px) {
  .form-group,
  .form-row,
  .form-actions {
    padding: 1rem 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-control {
    font-size: 0.9rem;
    padding: 0.6rem 0.75rem;
  }
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  background: rgba(52, 152, 219, 0.1);
  color: var(--primary-color);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 500;
  transition: all var(--transition-normal);
}

.tag:hover {
  background: rgba(52, 152, 219, 0.15);
}

.remove-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  color: #64748b;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.remove-tag:hover:not(:disabled) {
  background: var(--danger-color);
  color: white;
  transform: scale(1.1);
}

.remove-tag:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.remove-tag i {
  font-size: 0.8rem;
  line-height: 1;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem;
  min-height: 48px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-color);
}

.char-count {
  font-size: 0.8rem;
  color: #666;
}

.char-count.near-limit {
  color: var(--danger-color);
  font-weight: 500;
}

.description-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #666;
}
</style>
