<template>
  <div class="vote-container">
    <div class="page-header">
      <div class="header-left">
        <h2>业主投票</h2>
        <p class="page-subtitle">管理和查看业主投票活动</p>
      </div>
      <button class="primary-btn" @click="openCreateModal()">
        <Plus :size="18" />
        <span>发起投票</span>
      </button>
    </div>

    <div class="filter-bar">
      <select class="filter-select" v-model="filterStatus">
        <option value="">全部状态</option>
        <option value="ONGOING">进行中</option>
        <option value="ENDED">已结束</option>
      </select>
    </div>

    <div class="vote-grid">
      <div 
        v-for="vote in filteredVotes" 
        :key="vote.id" 
        class="vote-card"
        :class="{ 'status-ended': vote.status === 'ENDED' }"
      >
        <div class="vote-header">
          <div class="vote-title">{{ vote.title }}</div>
          <span :class="['status-badge', vote.status.toLowerCase()]">
            {{ vote.status === 'ONGOING' ? '进行中' : '已结束' }}
          </span>
        </div>
        
        <p class="vote-description">{{ vote.description }}</p>
        
        <div class="vote-meta">
          <div class="meta-item">
            <Users :size="14" />
            <span>{{ vote.participants }} 人参与</span>
          </div>
          <div class="meta-item">
            <Calendar :size="14" />
            <span>{{ vote.endDate }}</span>
          </div>
        </div>

        <div class="vote-progress">
          <div 
            v-for="option in vote.options" 
            :key="option.id" 
            class="progress-item"
          >
            <div class="progress-header">
              <span class="option-text">{{ option.text }}</span>
              <span class="option-percent">{{ getPercentage(option.votes, vote.totalVotes) }}%</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: getPercentage(option.votes, vote.totalVotes) + '%' }"
              ></div>
            </div>
            <span class="option-count">{{ option.votes }} 票</span>
          </div>
        </div>

        <div class="vote-actions">
          <button class="action-btn" @click="viewVote(vote)">
            <Eye :size="14" />
            <span>查看详情</span>
          </button>
          <button 
            v-if="vote.status === 'ONGOING'" 
            class="action-btn primary" 
            @click="voteNow(vote)"
          >
            <CheckCircle :size="14" />
            <span>参与投票</span>
          </button>
        </div>
      </div>
    </div>

    <div class="empty-state" v-if="filteredVotes.length === 0">
      <Vote :size="48" />
      <p>暂无投票活动</p>
    </div>

    <!-- 创建投票弹窗 -->
    <div class="modal-overlay" v-if="showCreateModal" @click.self="closeCreateModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>发起投票</h3>
          <button class="close-btn" @click="closeCreateModal">
            <X :size="18" />
          </button>
        </div>
        
        <form class="modal-form" @submit.prevent="createVote">
          <div class="form-group">
            <label class="form-label">投票标题 <span class="required">*</span></label>
            <input 
              v-model="newVote.title" 
              type="text" 
              class="form-input" 
              placeholder="请输入投票标题" 
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">投票描述</label>
            <textarea 
              v-model="newVote.description" 
              class="form-textarea" 
              placeholder="请输入投票描述"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">投票选项 <span class="required">*</span></label>
            <div class="options-list">
              <div 
                v-for="(option, index) in newVote.options" 
                :key="index" 
                class="option-row"
              >
                <input 
                  v-model="option.text" 
                  type="text" 
                  class="form-input option-input" 
                  :placeholder="`选项 ${index + 1}`"
                  required
                />
                <button 
                  v-if="newVote.options.length > 2" 
                  type="button" 
                  class="remove-option-btn"
                  @click="removeOption(index)"
                >
                  <X :size="16" />
                </button>
              </div>
            </div>
            <button type="button" class="add-option-btn" @click="addOption">
              <Plus :size="16" />
              <span>添加选项</span>
            </button>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">开始日期 <span class="required">*</span></label>
              <input 
                v-model="newVote.startDate" 
                type="date" 
                class="form-input" 
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">结束日期 <span class="required">*</span></label>
              <input 
                v-model="newVote.endDate" 
                type="date" 
                class="form-input" 
                required
              />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeCreateModal">取消</button>
            <button type="submit" class="btn btn-primary">发起投票</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Users, Calendar, Eye, CheckCircle, Vote, X } from 'lucide-vue-next'

const filterStatus = ref('')

const votes = ref([
  {
    id: 1,
    title: '关于小区绿化改造方案的投票',
    description: '为提升小区居住环境，现对绿化改造方案进行投票，请各位业主积极参与。',
    status: 'ONGOING',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    participants: 156,
    totalVotes: 156,
    options: [
      { id: 1, text: '方案A：增加草坪面积', votes: 78 },
      { id: 2, text: '方案B：增加花卉种植', votes: 52 },
      { id: 3, text: '方案C：保持现状', votes: 26 }
    ]
  },
  {
    id: 2,
    title: '关于物业费调整的意见征集',
    description: '根据小区运营成本变化，拟对物业费进行调整，现征求业主意见。',
    status: 'ONGOING',
    startDate: '2026-06-10',
    endDate: '2026-07-10',
    participants: 89,
    totalVotes: 89,
    options: [
      { id: 1, text: '同意上调5%', votes: 45 },
      { id: 2, text: '同意上调3%', votes: 28 },
      { id: 3, text: '不同意调整', votes: 16 }
    ]
  },
  {
    id: 3,
    title: '关于新增充电桩的投票',
    description: '为满足业主电动车充电需求，拟在小区内增设充电桩设施。',
    status: 'ENDED',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    participants: 203,
    totalVotes: 203,
    options: [
      { id: 1, text: '支持增设充电桩', votes: 178 },
      { id: 2, text: '反对增设充电桩', votes: 25 }
    ]
  }
])

const newVote = ref({
  title: '',
  description: '',
  options: [
    { id: 1, text: '' },
    { id: 2, text: '' }
  ],
  startDate: '',
  endDate: ''
})

const showCreateModal = ref(false)

const filteredVotes = computed(() => {
  return votes.value.filter(vote => {
    if (!filterStatus.value) return true
    return vote.status === filterStatus.value
  })
})

const getPercentage = (votes: number, total: number) => {
  if (total === 0) return 0
  return Math.round((votes / total) * 100)
}

const openCreateModal = () => {
  newVote.value = {
    title: '',
    description: '',
    options: [
      { id: 1, text: '' },
      { id: 2, text: '' }
    ],
    startDate: '',
    endDate: ''
  }
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const addOption = () => {
  newVote.value.options.push({
    id: newVote.value.options.length + 1,
    text: ''
  })
}

const removeOption = (index: number) => {
  if (newVote.value.options.length > 2) {
    newVote.value.options.splice(index, 1)
  }
}

const createVote = () => {
  const validOptions = newVote.value.options.filter(o => o.text.trim())
  if (validOptions.length < 2) {
    alert('请至少添加两个投票选项')
    return
  }

  votes.value.unshift({
    id: Math.max(...votes.value.map(v => v.id)) + 1,
    title: newVote.value.title,
    description: newVote.value.description,
    status: 'ONGOING',
    startDate: newVote.value.startDate,
    endDate: newVote.value.endDate,
    participants: 0,
    totalVotes: 0,
    options: validOptions.map((o, i) => ({ id: i + 1, text: o.text, votes: 0 }))
  })

  alert('投票发起成功')
  closeCreateModal()
}

const viewVote = (vote: any) => {
  alert(`查看投票详情: ${vote.title}`)
}

const voteNow = (vote: any) => {
  alert(`参与投票: ${vote.title}`)
}
</script>

<style scoped>
.vote-container {
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left h2 {
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
}

.filter-bar {
  margin-bottom: 24px;
}

.filter-select {
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #334155;
  background: #fff;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.filter-select:focus {
  border-color: #3b82f6;
}

.vote-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.vote-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.vote-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.vote-card.status-ended {
  opacity: 0.75;
}

.vote-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.vote-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
  margin-right: 12px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.status-badge.ongoing {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.ended {
  background: rgba(148, 163, 184, 0.1);
  color: #64748b;
}

.vote-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 16px;
}

.vote-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
}

.vote-progress {
  margin-bottom: 20px;
}

.progress-item {
  margin-bottom: 16px;
}

.progress-item:last-child {
  margin-bottom: 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.option-text {
  font-size: 13px;
  color: #334155;
}

.option-percent {
  font-size: 13px;
  font-weight: 600;
  color: #3b82f6;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.option-count {
  display: block;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.vote-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #f8fafc;
  border: none;
  border-radius: 8px;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f1f5f9;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
}

.action-btn.primary:hover {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #94a3b8;
}

.empty-state p {
  margin-top: 12px;
  font-size: 14px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #64748b;
}

.modal-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

.required {
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #3b82f6;
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  border-color: #3b82f6;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-row {
  display: flex;
  gap: 12px;
}

.option-input {
  flex: 1;
}

.remove-option-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  background: rgba(239, 68, 68, 0.1);
  border: none;
  border-radius: 8px;
  color: #ef4444;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-option-btn:hover {
  background: rgba(239, 68, 68, 0.15);
}

.add-option-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-option-btn:hover {
  background: #f1f5f9;
  border-color: #3b82f6;
  color: #3b82f6;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f1f5f9;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f1f5f9;
  color: #64748b;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
}

.btn-primary:hover {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
</style>