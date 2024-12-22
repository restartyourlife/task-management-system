<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import type { Comment } from '@/types/comment'

const props = defineProps<{
  comment: Comment
  canEdit: boolean
}>()

const emit = defineEmits<{
  update: [id: string, content: string]
  delete: [id: string]
}>()

const isEditing = ref(false)
const editedContent = ref(props.comment.content)
const editTextarea = ref<HTMLTextAreaElement>()

watch(isEditing, (newValue) => {
  if (newValue && editTextarea.value) {
    nextTick(() => {
      editTextarea.value?.focus()
    })
  }
})

function handleUpdate() {
  if (editedContent.value.trim()) {
    emit('update', props.comment.id, editedContent.value)
    isEditing.value = false
  }
}

function handleDelete() {
  if (confirm('Are you sure you want to delete this comment?')) {
    emit('delete', props.comment.id)
  }
}

function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return new Date(date).toLocaleDateString()
}

console.log('Comment data:', props.comment)

const formattedDate = computed(() => {
  try {
    return formatDate(new Date(props.comment.created_at))
  } catch (e) {
    console.error('Error formatting date:', e)
    return ''
  }
})
</script>

<template>
  <div class="comment" :class="{ 'is-editing': isEditing }">
    <div class="comment-header">
      <div class="user-info">
        <img
          :src="comment.userMetadata?.avatarUrl || ''"
          :alt="comment.userMetadata?.fullName || 'User'"
          class="avatar"
        />
        <div class="user-details">
          <span class="username">{{ comment.userMetadata?.fullName || 'Anonymous' }}</span>
          <time :datetime="comment.created_at">{{ formattedDate }}</time>
        </div>
      </div>
      <div class="comment-actions" v-if="canEdit">
        <button v-if="!isEditing" @click="isEditing = true" class="action-btn edit-btn">
          <i class="fas fa-edit"></i>
        </button>
        <button @click="handleDelete" class="action-btn delete-btn">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>

    <div v-if="!isEditing" class="comment-content">
      {{ comment.content }}
    </div>
    <div v-else class="comment-edit">
      <textarea
        v-model="editedContent"
        @keyup.ctrl.enter="handleUpdate"
        @keyup.esc="isEditing = false"
        ref="editTextarea"
      ></textarea>
      <div class="edit-actions">
        <button @click="handleUpdate" class="save-btn">
          <i class="fas fa-check"></i> Save
        </button>
        <button @click="isEditing = false" class="cancel-btn">
          <i class="fas fa-times"></i> Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment {
  background: var(--bg-color);
  border-radius: var(--radius);
  transition: all var(--transition-normal);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.comment:hover {
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.comment-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--border-color);
  background: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--primary-color);
}

.username {
  font-weight: 500;
  color: var(--text-color);
}

time {
  font-size: 0.8rem;
  color: #666;
}

.comment-content {
  padding: 1rem;
  line-height: 1.6;
  color: var(--text-color);
  white-space: pre-wrap;
}

.comment-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.comment:hover .comment-actions {
  opacity: 1;
}

.action-btn {
  padding: 0.4rem;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition-normal);
  background: transparent;
}

.edit-btn {
  color: var(--primary-color);
}

.delete-btn {
  color: var(--danger-color);
}

.action-btn:hover {
  transform: translateY(-1px);
  background: var(--bg-color);
}

.comment-edit {
  padding: 1rem;
  width: 100%;
  box-sizing: border-box;
}

textarea {
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  resize: vertical;
  font-size: 0.95rem;
  line-height: 1.5;
  transition: all var(--transition-normal);
  box-sizing: border-box;
}

textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  justify-content: flex-end;
}

.save-btn,
.cancel-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.save-btn {
  background: var(--primary-color);
  color: white;
  border: none;
}

.cancel-btn {
  background: transparent;
  border: 1px solid var(--border-color);
}

.save-btn:hover,
.cancel-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .comment-header {
    padding: 0.75rem;
  }

  .comment-content {
    padding: 0.75rem;
    font-size: 0.9rem;
  }

  .comment-actions {
    opacity: 1;
  }

  .action-btn {
    padding: 0.3rem;
  }
}
</style>
