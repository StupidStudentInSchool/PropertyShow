<template>
  <div class="inquiry-content">
    <header class="top-header">
      <div class="header-left">
        <h2>业主质询</h2>
        <p class="page-subtitle">处理和回复业主提出的质询问题</p>
      </div>
      <button class="primary-btn" @click="openModal()">
        <Plus :size="18" />
        <span>新建质询</span>
      </button>
    </header>

    <div class="content-wrapper">
        <div class="stats-summary">
          <div class="summary-item">
            <div class="summary-icon pending-icon">
              <Clock :size="20" />
            </div>
            <div class="summary-content">
              <div class="summary-label">待处理</div>
              <div class="summary-value">{{ pendingCount }}</div>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-icon processing-icon">
              <MessageSquare :size="20" />
            </div>
            <div class="summary-content">
              <div class="summary-label">处理中</div>
              <div class="summary-value">{{ processingCount }}</div>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-icon resolved-icon">
              <CheckCircle :size="20" />
            </div>
            <div class="summary-content">
              <div class="summary-label">已解决</div>
              <div class="summary-value">{{ resolvedCount }}</div>
            </div>
          </div>
        </div>

        <div class="filter-bar">
          <select class="filter-select" v-model="statusFilter" @change="loadInquiries">
            <option value="">全部状态</option>
            <option value="PENDING">待处理</option>
            <option value="PROCESSING">处理中</option>
            <option value="RESOLVED">已解决</option>
          </select>
          <input 
            type="text" 
            class="search-input" 
            v-model="searchKeyword" 
            placeholder="搜索质询标题..."
            @keyup.enter="loadInquiries"
          />
        </div>

        <div class="inquiry-list">
          <div 
            v-for="inquiry in filteredInquiries" 
            :key="inquiry.id" 
            class="inquiry-card"
            @click="openDetail(inquiry)"
          >
            <div class="card-header">
              <span :class="['status-badge', inquiry.status.toLowerCase()]">
                {{ getStatusLabel(inquiry.status) }}
              </span>
              <span class="inquiry-id">#{{ inquiry.id }}</span>
            </div>
            <h3 class="inquiry-title">{{ inquiry.title }}</h3>
            <p class="inquiry-content">{{ truncateContent(inquiry.content) }}</p>
            <div class="card-footer">
              <div class="meta-item">
                <User :size="14" />
                <span>{{ inquiry.createdBy }}</span>
              </div>
              <div class="meta-item">
                <Calendar :size="14" />
                <span>{{ formatDate(inquiry.createdAt) }}</span>
              </div>
              <div class="meta-item" v-if="inquiry.repliedAt">
                <MessageCircle :size="14" />
                <span>{{ formatDate(inquiry.repliedAt) }}</span>
              </div>
            </div>
          </div>

          <div class="empty-state" v-if="filteredInquiries.length === 0">
            <MessageSquare :size="48" />
            <p>暂无质询记录</p>
          </div>
        </div>
      </div>

    <!-- 新建质询弹窗 -->
    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>新建质询</h3>
          <button class="close-btn" @click="closeModal">
            <X :size="18" />
          </button>
        </div>
        
        <form class="modal-form" @submit.prevent="submitInquiry">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">标题 <span class="required">*</span></label>
              <input 
                v-model="formData.title" 
                type="text" 
                class="form-input" 
                placeholder="请输入质询标题" 
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">内容 <span class="required">*</span></label>
              <textarea 
                v-model="formData.content" 
                class="form-textarea" 
                placeholder="请详细描述您的问题..."
                rows="6"
                required
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">取消</button>
            <button type="submit" class="btn btn-primary">提交质询</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div class="modal-overlay" v-if="showDetail" @click.self="closeDetail">
      <div class="modal-content detail-modal">
        <div class="modal-header">
          <h3>质询详情</h3>
          <button class="close-btn" @click="closeDetail">
            <X :size="18" />
          </button>
        </div>
        
        <div class="detail-body" v-if="selectedInquiry">
          <div class="detail-section">
            <div class="detail-header">
              <h2>{{ selectedInquiry.title }}</h2>
              <span :class="['status-badge', selectedInquiry.status.toLowerCase()]">
                {{ getStatusLabel(selectedInquiry.status) }}
              </span>
            </div>
            <div class="detail-meta">
              <div class="meta-item">
                <User :size="14" />
                <span>发起者：{{ selectedInquiry.createdBy }}</span>
              </div>
              <div class="meta-item">
                <Calendar :size="14" />
                <span>创建时间：{{ formatDate(selectedInquiry.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>质询内容</h4>
            <p class="detail-content">{{ selectedInquiry.content }}</p>
          </div>

          <div class="detail-section" v-if="selectedInquiry.reply">
            <h4>回复内容</h4>
            <p class="detail-content reply-content">{{ selectedInquiry.reply }}</p>
            <div class="detail-meta">
              <div class="meta-item">
                <User :size="14" />
                <span>回复者：{{ selectedInquiry.repliedBy }}</span>
              </div>
              <div class="meta-item">
                <Calendar :size="14" />
                <span>回复时间：{{ formatDate(selectedInquiry.repliedAt) }}</span>
              </div>
            </div>
          </div>

          <div class="reply-section" v-if="selectedInquiry.status !== 'RESOLVED'">
            <h4>回复质询</h4>
            <textarea 
              v-model="replyContent" 
              class="form-textarea" 
              placeholder="请输入回复内容..."
              rows="4"
            ></textarea>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeDetail">关闭</button>
              <button type="button" class="btn btn-primary" @click="submitReply">提交回复</button>
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
  Plus, MessageSquare, MessageCircle, User, Calendar, Clock, CheckCircle, X
} from 'lucide-vue-next'
import { governanceApi } from '../api'

const inquiries = ref<any[]>([])
const showModal = ref(false)
const showDetail = ref(false)
const selectedInquiry = ref<any>(null)
const replyContent = ref('')
const statusFilter = ref('')
const searchKeyword = ref('')

const formData = reactive({
  title: '',
  content: ''
})

const pendingCount = computed(() => inquiries.value.filter(i => i.status === 'PENDING').length)
const processingCount = computed(() => inquiries.value.filter(i => i.status === 'PROCESSING').length)
const resolvedCount = computed(() => inquiries.value.filter(i => i.status === 'RESOLVED').length)

const filteredInquiries = computed(() => {
  return inquiries.value.filter(inquiry => {
    const statusMatch = !statusFilter.value || inquiry.status === statusFilter.value
    const keywordMatch = !searchKeyword.value || 
      inquiry.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      inquiry.content.toLowerCase().includes(searchKeyword.value.toLowerCase())
    return statusMatch && keywordMatch
  })
})

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: '待处理',
    PROCESSING: '处理中',
    RESOLVED: '已解决'
  }
  return statusMap[status] || status
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const truncateContent = (content: string) => {
  return content.length > 100 ? content.substring(0, 100) + '...' : content
}

const loadInquiries = async () => {
  try {
    const response = await governanceApi.getAllInquiries()
    if (response.code === 0) {
      inquiries.value = response.data
    }
  } catch (error) {
    console.error('加载质询列表失败:', error)
  }
}

const openModal = () => {
  formData.title = ''
  formData.content = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitInquiry = async () => {
  if (!formData.title || !formData.content) {
    alert('请填写完整信息')
    return
  }

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = user.id || 'admin'

    await governanceApi.createInquiry({
      title: formData.title,
      content: formData.content,
      createdBy: userId,
      communityId: 1
    })
    alert('提交成功')
    closeModal()
    await loadInquiries()
  } catch (error) {
    console.error('提交失败:', error)
    alert('提交失败，请重试')
  }
}

const openDetail = (inquiry: any) => {
  selectedInquiry.value = inquiry
  replyContent.value = ''
  showDetail.value = true
}

const closeDetail = () => {
  showDetail.value = false
  selectedInquiry.value = null
  replyContent.value = ''
}

const submitReply = async () => {
  if (!replyContent.value.trim()) {
    alert('请输入回复内容')
    return
  }

  if (!selectedInquiry.value) return

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = user.id || 'admin'

    await governanceApi.replyInquiry(selectedInquiry.value.id, {
      reply: replyContent.value,
      repliedBy: userId
    })
    alert('回复成功')
    closeDetail()
    await loadInquiries()
  } catch (error) {
    console.error('回复失败:', error)
    alert('回复失败，请重试')
  }
}

onMounted(async () => {
  await loadInquiries()
})
</script>

<style scoped>
.inquiry-content {
  min-height: 100%;
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

.stats-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  padding: 20px;
  border-radius: 14px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.pending-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.processing-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.resolved-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.summary-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
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

.search-input {
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #334155;
  outline: none;
  transition: border-color 0.2s;
  min-width: 200px;
}

.search-input:focus {
  border-color: #3b82f6;
}

.search-input::placeholder {
  color: #94a3b8;
}

.inquiry-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}

.inquiry-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.inquiry-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
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

.status-badge.pending {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.status-badge.processing {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-badge.resolved {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.inquiry-id {
  font-size: 12px;
  color: #94a3b8;
}

.inquiry-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.inquiry-content {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.card-footer {
  display: flex;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
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

.detail-body {
  padding: 24px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 12px 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.detail-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.detail-meta {
  display: flex;
  gap: 20px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.detail-content {
  font-size: 14px;
  color: #334155;
  line-height: 1.8;
  margin: 0;
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
}

.reply-content {
  background: rgba(16, 185, 129, 0.05);
  border-left: 4px solid #10b981;
}

.reply-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.reply-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin: 0 0 12px 0;
}
</style>