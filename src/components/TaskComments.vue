<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import TaskComment from './TaskComment.vue'
import type { Comment } from '@/types/comment'
import { supabase } from '@/config/supabase'

const props = defineProps<{
  taskId: string
}>()

const authStore = useAuthStore()
const comments = ref<Comment[]>([])
const newComment = ref('')
const loading = ref(false)
const isExpanded = ref(true)
const isSubmitting = ref(false)

async function loadComments() {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('task_id', props.taskId)
      .order('created_at', { ascending: false })

    if (error) throw error

    console.log('Raw comments data:', data)

    comments.value = data.map(comment => ({
      ...comment,
      userMetadata: {
        fullName: comment.author?.full_name || 'Anonymous',
        avatarUrl: comment.author?.avatar_url || ''
      }
    }))

    console.log('Processed comments:', comments.value)
  } catch (error) {
    console.error('Error loading comments:', error)
  } finally {
    loading.value = false
  }
}

async function addComment() {
  if (!newComment.value.trim() || isSubmitting.value) return

  try {
    isSubmitting.value = true

    // Сначала проверяем/создаем профиль
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authStore.user!.id,
        full_name: authStore.user!.user_metadata.full_name,
        avatar_url: authStore.user!.user_metadata.avatar_url
      })

    if (profileError) throw profileError

    // Затем добавляем комментарий
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          task_id: props.taskId,
          user_id: authStore.user!.id,
          content: newComment.value.trim()
        }
      ])
      .select(`
        *,
        author:user_id (
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error
    comments.value.unshift({
      ...data,
      userMetadata: {
        fullName: data.author?.full_name,
        avatarUrl: data.author?.avatar_url
      }
    })
    newComment.value = ''
  } catch (error) {
    console.error('Error adding comment:', error)
  } finally {
    isSubmitting.value = false
  }
}

async function updateComment(id: string, content: string) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', id)
      .select(`
        *,
        author:user_id (
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error
    const index = comments.value.findIndex(c => c.id === id)
    if (index !== -1) {
      comments.value[index] = {
        ...data,
        userMetadata: {
          fullName: data.author?.full_name,
          avatarUrl: data.author?.avatar_url
        }
      }
    }
  } catch (error) {
    console.error('Error updating comment:', error)
  }
}

async function deleteComment(id: string) {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)

    if (error) throw error
    comments.value = comments.value.filter(c => c.id !== id)
  } catch (error) {
    console.error('Error deleting comment:', error)
  }
}

onMounted(loadComments)
</script>

<template>
  <div class="comments-section">
    <div class="comments-header">
      <h3>
        Comments
        <span class="comments-count" v-if="comments.length">
          ({{ comments.length }})
        </span>
      </h3>
      <button
        class="toggle-comments"
        v-if="comments.length"
        @click="isExpanded = !isExpanded"
      >
        {{ isExpanded ? 'Hide' : 'Show' }}
        <i :class="['fas', isExpanded ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
      </button>
    </div>

    <div v-if="authStore.user" class="new-comment">
      <div class="comment-input-header">
        <img
          :src="authStore.user.user_metadata.avatar_url"
          :alt="authStore.user.user_metadata.full_name"
          class="user-avatar"
        />
        <span class="hint">Press Ctrl+Enter to submit</span>
      </div>
      <textarea
        v-model="newComment"
        placeholder="Write a comment..."
        @keyup.ctrl.enter="addComment"
        :disabled="isSubmitting"
      ></textarea>
      <div class="comment-actions">
        <button
          @click="addComment"
          :disabled="!newComment.trim() || isSubmitting"
          class="submit-button"
        >
          <i class="fas fa-paper-plane"></i>
          {{ isSubmitting ? 'Sending...' : 'Comment' }}
        </button>
      </div>
    </div>

    <TransitionGroup
      name="comment-list"
      tag="div"
      class="comments-list"
      v-show="isExpanded || !comments.length"
    >
      <div v-if="loading" class="loading" key="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Loading comments...
      </div>

      <div v-else-if="comments.length === 0" class="no-comments" key="no-comments">
        <i class="far fa-comments"></i>
        <p>No comments yet. Be the first to comment!</p>
      </div>

      <TaskComment
        v-else
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :can-edit="comment.userId === authStore.user?.id"
        @update="updateComment"
        @delete="deleteComment"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.comments-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  /* border-top: 1px solid var(--border-color); */
  width: 100%;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comments-count {
  color: #666;
  font-size: 0.9rem;
  font-weight: normal;
}

.toggle-comments {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: transparent;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.toggle-comments:hover {
  background: var(--bg-color);
  color: var(--text-color);
}

.new-comment {
  margin-bottom: 2rem;
  animation: slideDown 0.3s ease;
}

.comment-input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--primary-color);
}

.hint {
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
}

textarea {
  width: 100%;
  min-height: 80px;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  margin-bottom: 0.5rem;
  resize: vertical;
  transition: all var(--transition-normal);
  font-size: 0.95rem;
  line-height: 1.5;
}

textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.loading,
.no-comments {
  text-align: center;
  padding: 2rem;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading i,
.no-comments i {
  font-size: 2rem;
  color: var(--primary-color);
  opacity: 0.5;
}

/* Анимации */
.comment-list-enter-active,
.comment-list-leave-active {
  transition: all 0.3s ease;
}

.comment-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.comment-list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .comment-input-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .hint {
    font-size: 0.75rem;
  }

  textarea {
    font-size: 0.9rem;
    padding: 0.75rem;
  }
}
</style>
