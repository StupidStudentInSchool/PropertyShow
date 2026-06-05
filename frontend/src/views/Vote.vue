<template>
  <div class="vote-container">
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="logo-area">
        <div class="logo">
          <LayoutDashboard :size="28" />
        </div>
        <span v-if="!isCollapsed" class="logo-text">物业透明化系统</span>
      </div>
      
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li 
            v-for="item in menuItems" 
            :key="item.path"
            :class="{ active: activeMenu === item.name }"
            @click="handleMenuClick(item.path, item.name)"
          >
            <component :is="item.icon" :size="18" />
            <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <button class="collapse-btn" @click="toggleSidebar">
          <ChevronLeft v-if="!isCollapsed" :size="18" />
          <ChevronRight v-else :size="18" />
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-header">
        <div class="header-left">
          <h2>业主投票</h2>
          <p class="page-subtitle">管理和参与业主投票活动</p>
        </div>
        <button class="primary-btn" @click="openCreateModal()">
          <Plus :size="18" />
          <span>发起投票</span>
        </button>
      </header>

      <div class="content-wrapper">
        <div class="tabs">
          <button 
            :class="['tab-btn', { active: activeTab === 'active' }]" 
            @click="activeTab = 'active'; loadVotes()"
          >
            <Vote :size="16" />
            <span>进行中</span>
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'ended' }]" 
            @click="activeTab = 'ended'; loadVotes()"
          >
            <CheckCircle :size="16" />
            <span>已结束</span>
          </button>
        </div>

        <div class="vote-list">
          <div 
            v-for="vote in filteredVotes" 
            :key="vote.id" 
            class="vote-card"
          >
            <div class="card-header">
              <span :class="['status-badge', vote.status.toLowerCase()]">
                {{ vote.status === 'ACTIVE' ? '进行中' : '已结束' }}
              </span>
              <span class="vote-id">#{{ vote.id }}</span>
            </div>
            
            <h3 class="vote-title">{{ vote.title }}</h3>
            <p class="vote-description">{{ vote.description }}</p>
            
            <div class="vote-meta">
              <div class="meta-item">
                <User :size="14" />
                <span>{{ vote.createdBy }}</span>
              </div>
              <div class="meta-item">
                <Calendar :size="14" />
                <span>{{ formatDate(vote.startTime) }} - {{ formatDate(vote.endTime) }}</span>
              </div>
              <div class="meta-item">
                <Users :size="14" />
                <span>{{ vote.totalVotes }} 人已投票</span>
              </div>
            </div>

            <div class="progress-section">
              <div 
                v-for="option in vote.options" 
                :key="option.id" 
                class="option-row"
              >
                <div class="option-info">
                  <span class="option-text">{{ option.text }}</span>
                  <span class="option-count">{{ option.votes }} 票 ({{ getPercentage(vote, option) }}%)</span>
                </div>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: getPercentage(vote, option) + '%' }"
                    :class="{ winning: isWinning(vote, option) }"
                  ></div>
                </div>
              </div>
            </div>

            <div class="card-actions">
              <button 
                v-if="vote.status === 'ACTIVE' && !hasVoted(vote)"
                class="btn btn-primary"
                @click="openVoteModal(vote)"
              >
                <CheckCircle :size="16" />
                <span>立即投票</span>
              </button>
              <button 
                v-else-if="hasVoted(vote)"
                class="btn btn-secondary"
                disabled
              >
                <CheckCircle :size="16" />
                <span>已投票</span>
              </button>
              <button 
                v-if="vote.status === 'ACTIVE'"
                class="btn btn-outline"
                @click="endVote(vote.id)"
              >
                <XCircle :size="16" />
                <span>结束投票</span>
              </button>
              <button 
                class="btn btn-outline"
                @click="openDetail(vote)"
              >
                <Eye :size="16" />
                <span>查看详情</span>
              </button>
            </div>
          </div>

          <div class="empty-state" v-if="filteredVotes.length === 0">
            <Vote :size="48" />
            <p>暂无投票记录</p>
          </div>
        </div>
      </div>
    </main>

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
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">标题 <span class="required">*</span></label>
              <input 
                v-model="createForm.title" 
                type="text" 
                class="form-input" 
                placeholder="请输入投票标题" 
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">描述</label>
              <textarea 
                v-model="createForm.description" 
                class="form-textarea" 
                placeholder="请输入投票描述..."
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">开始时间 <span class="required">*</span></label>
              <input 
                v-model="createForm.startTime" 
                type="datetime-local" 
                class="form-input" 
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">结束时间 <span class="required">*</span></label>
              <input 
                v-model="createForm.endTime" 
                type="datetime-local" 
                class="form-input" 
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">投票选项 <span class="required">*</span></label>
              <div class="options-list">
                <div 
                  v-for="(option, index) in createForm.options" 
                  :key="index" 
                  class="option-input-row"
                >
                  <input 
                    v-model="createForm.options[index]" 
                    type="text" 
                    class="form-input" 
                    :placeholder="'选项 ' + (index + 1)"
                    required
                  />
                  <button 
                    v-if="createForm.options.length > 2"
                    type="button" 
                    class="remove-option-btn"
                    @click="removeOption(index)"
                  >
                    <X :size="16" />
                  </button>
                </div>
              </div>
              <button 
                v-if="createForm.options.length < 6"
                type="button" 
                class="add-option-btn"
                @click="addOption"
              >
                <Plus :size="16" />
                <span>添加选项</span>
              </button>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeCreateModal">取消</button>
            <button type="submit" class="btn btn-primary">发起投票</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 投票弹窗 -->
    <div class="modal-overlay" v-if="showVoteModal" @click.self="closeVoteModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ currentVote?.title }}</h3>
          <button class="close-btn" @click="closeVoteModal">
            <X :size="18" />
          </button>
        </div>
        
        <div class="vote-options" v-if="currentVote">
          <div 
            v-for="option in currentVote.options" 
            :key="option.id"
            :class="['vote-option', { selected: selectedOption === option.id }]"
            @click="selectedOption = option.id"
          >
            <div class="option-radio">
              <div :class="['radio-inner', { checked: selectedOption === option.id }]"></div>
            </div>
            <span>{{ option.text }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeVoteModal">取消</button>
          <button type="button" class="btn btn-primary" @click="submitVote">确认投票</button>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div class="modal-overlay" v-if="showDetailModal" @click.self="closeDetailModal">
      <div class="modal-content detail-modal">
        <div class="modal-header">
          <h3>投票详情</h3>
          <button class="close-btn" @click="closeDetailModal">
            <X :size="18" />
          </button>
        </div>
        
        <div class="detail-body" v-if="selectedVote">
          <div class="detail-section">
            <h2>{{ selectedVote.title }}</h2>
            <span :class="['status-badge', selectedVote.status.toLowerCase()]">
              {{ selectedVote.status === 'ACTIVE' ? '进行中' : '已结束' }}
            </span>
          </div>

          <div class="detail-section">
            <p>{{ selectedVote.description }}</p>
          </div>

          <div class="detail-section">
            <h4>投票信息</h4>
            <div class="detail-meta">
              <div class="meta-item">
                <User :size="14" />
                <span>创建者：{{ selectedVote.createdBy }}</span>
              </div>
              <div class="meta-item">
                <Calendar :size="14" />
                <span>时间：{{ formatDate(selectedVote.startTime) }} - {{ formatDate(selectedVote.endTime) }}</span>
              </div>
              <div class="meta-item">
                <Users :size="14" />
                <span>参与人数：{{ selectedVote.totalVotes }} 人</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>投票结果</h4>
            <div 
              v-for="option in selectedVote.options" 
              :key="option.id" 
              class="option-row"
            >
              <div class="option-info">
                <span class="option-text">{{ option.text }}</span>
                <span class="option-count">{{ option.votes }} 票 ({{ getPercentage(selectedVote, option) }}%)</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: getPercentage(selectedVote, option) + '%' }"
                  :class="{ winning: isWinning(selectedVote, option) }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import {
  Plus, Vote, Users, Calendar, CheckCircle, XCircle, Eye, X, User,
  LayoutDashboard, Home, MessageSquare, Building2, Receipt, Shield, ChevronLeft, ChevronRight
} from 'lucide-vue-next'
import { governanceApi } from '../api'

const isCollapsed = ref(localStorage.getItem('sidebarCollapsed') === 'true')
const activeMenu = ref('vote')
const activeTab = ref('active')

const menuItems = [
  { path: '/', name: 'dashboard', label: '首页', icon: Home },
  { path: '/ledger', name: 'ledger', label: '财务台账', icon: MessageSquare },
  { path: '/vote', name: 'vote', label: '业主投票', icon: Vote },
  { path: '/inquiry', name: 'inquiry', label: '业主质询', icon: MessageSquare },
  { path: '/community', name: 'community', label: '小区管理', icon: Building2 },
  { path: '/bill', name: 'bill', label: '账单管理', icon: Receipt },
  { path: '/audit', name: 'audit', label: '审计日志', icon: Shield }
]

const votes = ref<any[]>([])
const showCreateModal = ref(false)
const showVoteModal = ref(false)
const showDetailModal = ref(false)
const currentVote = ref<any>(null)
const selectedVote = ref<any>(null)
const selectedOption = ref<number | null>(null)

const createForm = reactive({
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  options: ['', ''] as string[]
})

const filteredVotes = computed(() => {
  return votes.value.filter(vote => {
    if (activeTab.value === 'active') {
      return vote.status === 'ACTIVE'
    }
    return vote.status === 'ENDED'
  })
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebarCollapsed', String(isCollapsed.value))
}

const handleMenuClick = (path: string, name: string) => {
  activeMenu.value = name
  window.location.href = path
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const getPercentage = (vote: any, option: any) => {
  if (vote.totalVotes === 0) return 0
  return Math.round((option.votes / vote.totalVotes) * 100)
}

const isWinning = (vote: any, option: any) => {
  const maxVotes = Math.max(...vote.options.map((o: any) => o.votes))
  return option.votes === maxVotes && maxVotes > 0
}

const hasVoted = (vote: any) => {
  const votedIds = JSON.parse(localStorage.getItem('votedIds') || '[]')
  return votedIds.includes(vote.id)
}

const loadVotes = async () => {
  try {
    const response = await governanceApi.getAllVotes()
    if (response.code === 0) {
      votes.value = response.data
    }
  } catch (error) {
    console.error('加载投票列表失败:', error)
  }
}

const openCreateModal = () => {
  createForm.title = ''
  createForm.description = ''
  createForm.startTime = ''
  createForm.endTime = ''
  createForm.options = ['', '']
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const addOption = () => {
  if (createForm.options.length < 6) {
    createForm.options.push('')
  }
}

const removeOption = (index: number) => {
  if (createForm.options.length > 2) {
    createForm.options.splice(index, 1)
  }
}

const createVote = async () => {
  if (!createForm.title || createForm.options.filter(o => o.trim()).length < 2) {
    alert('请填写投票标题和至少两个选项')
    return
  }

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = user.id || 'admin'

    const options = createForm.options.filter(o => o.trim()).map(text => ({ text }))

    await governanceApi.createVote({
      title: createForm.title,
      description: createForm.description,
      startTime: createForm.startTime,
      endTime: createForm.endTime,
      options,
      createdBy: userId,
      communityId: 1
    })
    alert('创建成功')
    closeCreateModal()
    await loadVotes()
  } catch (error) {
    console.error('创建投票失败:', error)
    alert('创建失败，请重试')
  }
}

const openVoteModal = (vote: any) => {
  currentVote.value = vote
  selectedOption.value = null
  showVoteModal.value = true
}

const closeVoteModal = () => {
  showVoteModal.value = false
  currentVote.value = null
  selectedOption.value = null
}

const submitVote = async () => {
  if (!selectedOption.value || !currentVote.value) {
    alert('请选择一个选项')
    return
  }

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = user.id || 'admin'

    await governanceApi.vote(currentVote.value.id, {
      optionId: selectedOption.value,
      votedBy: userId
    })

    const votedIds = JSON.parse(localStorage.getItem('votedIds') || '[]')
    votedIds.push(currentVote.value.id)
    localStorage.setItem('votedIds', JSON.stringify(votedIds))

    alert('投票成功')
    closeVoteModal()
    await loadVotes()
  } catch (error) {
    console.error('投票失败:', error)
    alert('投票失败，请重试')
  }
}

const openDetail = (vote: any) => {
  selectedVote.value = vote
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedVote.value = null
}

const endVote = async (voteId: number) => {
  if (!confirm('确定要结束此投票吗？')) {
    return
  }

  try {
    await governanceApi.endVote(voteId)
    alert('投票已结束')
    await loadVotes()
  } catch (error) {
    console.error('结束投票失败:', error)
    alert('操作失败，请重试')
  }
}

onMounted(async () => {
  await loadVotes()
})
</script>

<style scoped>
.vote-container {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.sidebar {
  width: 220px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 64px;
}

.logo-area {
  display: flex;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #334155;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 10px;
  margin-right: 12px;
  color: #fff;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #f1f5f9;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
}

.nav-list {
  list-style: none;
  padding: 0 8px;
}

.nav-list li {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin: 4px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #94a3b8;
}

.nav-list li:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #f1f5f9;
}

.nav-list li.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.15) 100%);
  color: #60a5fa;
}

.nav-label {
  margin-left: 12px;
  font-size: 14px;
  font-weight: 500;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #334155;
}

.collapse-btn {
  width: 100%;
  background: transparent;
  border: 1px solid #475569;
  border-radius: 8px;
  color: #94a3b8;
  cursor: pointer;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f1f5f9;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-header {
  background: #ffffff;
  padding: 16px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-left h2 {
  font-size: 20px;
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

.content-wrapper {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  border-color: #cbd5e1;
}

.tab-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-color: #3b82f6;
  color: #fff;
}

.vote-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.vote-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.ended {
  background: rgba(148, 163, 184, 0.1);
  color: #64748b;
}

.vote-id {
  font-size: 12px;
  color: #94a3b8;
}

.vote-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.vote-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.vote-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
}

.progress-section {
  margin-bottom: 16px;
}

.option-row {
  margin-bottom: 12px;
}

.option-row:last-child {
  margin-bottom: 0;
}

.option-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.option-text {
  font-size: 13px;
  color: #475569;
}

.option-count {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #cbd5e1 0%, #94a3b8 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-fill.winning {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
}

.card-actions {
  display: flex;
  gap: 10px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: #f1f5f9;
  color: #64748b;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-outline {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.btn-outline:hover {
  border-color: #cbd5e1;
  color: #334155;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
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

.detail-modal {
  max-width: 600px;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-row .form-group:first-child:last-child {
  grid-column: 1 / -1;
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

.form-input::placeholder {
  color: #94a3b8;
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
  gap: 10px;
}

.option-input-row {
  display: flex;
  gap: 10px;
}

.option-input-row .form-input {
  flex: 1;
}

.remove-option-btn {
  padding: 0 12px;
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
  gap: 6px;
  margin-top: 12px;
  padding: 10px 16px;
  background: transparent;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.add-option-btn:hover {
  border-color: #cbd5e1;
  color: #334155;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f1f5f9;
}

.vote-options {
  padding: 24px;
}

.vote-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 10px;
}

.vote-option:last-child {
  margin-bottom: 0;
}

.vote-option:hover {
  border-color: #cbd5e1;
}

.vote-option.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.option-radio {
  width: 22px;
  height: 22px;
  border: 2px solid #cbd5e1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.vote-option.selected .option-radio {
  border-color: #3b82f6;
}

.radio-inner {
  width: 10px;
  height: 10px;
  background: transparent;
  border-radius: 50%;
  transition: all 0.2s;
}

.vote-option.selected .radio-inner {
  background: #3b82f6;
}

.detail-body {
  padding: 24px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.detail-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 12px 0;
}

.detail-section p {
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
</style>