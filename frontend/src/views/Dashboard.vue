<template>
  <div class="dashboard-content">
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.title" class="stat-card">
        <div class="stat-icon-wrapper" :style="{ background: stat.bgColor }">
          <component :is="stat.icon" :size="24" :style="{ color: stat.iconColor }" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-title">{{ stat.title }}</div>
          <div class="stat-change" :class="stat.changeType">
            <TrendingUp v-if="stat.changeType === 'positive'" :size="14" />
            <TrendingDown v-else :size="14" />
            {{ stat.change }}
          </div>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <div class="data-card">
        <div class="card-header">
          <h3 class="card-title">
            <FileText :size="18" />
            最近财务记录
          </h3>
          <button class="view-all-btn" @click="handleNavigate('/ledger')">
            查看全部
            <ChevronRight :size="14" />
          </button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>类型</th>
                <th>类别</th>
                <th>金额</th>
                <th>日期</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in recentEntries" :key="entry.id">
                <td class="text-muted">#{{ entry.id }}</td>
                <td>
                  <span :class="['type-badge', entry.type.toLowerCase()]">
                    {{ entry.type === 'INCOME' ? '收入' : '支出' }}
                  </span>
                </td>
                <td>{{ getCategoryLabel(entry.category) }}</td>
                <td :class="entry.type === 'INCOME' ? 'text-success' : 'text-danger'">
                  {{ entry.type === 'INCOME' ? '+' : '-' }}¥{{ formatAmount(entry.amount) }}
                </td>
                <td class="text-muted">{{ formatDate(entry.occurredAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="side-panel">
        <div class="data-card">
          <div class="card-header">
            <h3 class="card-title">
              <MessageSquare :size="18" />
              待处理质询
            </h3>
            <span class="badge badge-primary">{{ pendingCount }}</span>
          </div>
          <div class="inquiry-list">
            <div 
              v-for="item in pendingInquiries" 
              :key="item.id" 
              class="inquiry-item"
              @click="handleNavigate('/inquiry')"
            >
              <div class="inquiry-header">
                <span class="inquiry-title">{{ item.title }}</span>
              </div>
              <div class="inquiry-meta">
                <span class="inquiry-author">{{ item.authorName }}</span>
                <span :class="['inquiry-status', item.status.toLowerCase()]">
                  {{ getStatusLabel(item.status) }}
                </span>
              </div>
              <div class="inquiry-date">{{ formatDate(item.createdAt) }}</div>
            </div>
          </div>
        </div>

        <div class="data-card quick-actions-card">
          <div class="card-header">
            <h3 class="card-title">
              <Zap :size="18" />
              快捷操作
            </h3>
          </div>
          <div class="quick-actions">
            <button class="action-btn action-primary" @click="handleNavigate('/ledger')">
              <Plus :size="18" />
              <span>新增收支</span>
            </button>
            <button class="action-btn action-success" @click="handleNavigate('/inquiry')">
              <MessageCircle :size="18" />
              <span>回复质询</span>
            </button>
            <button class="action-btn action-warning" @click="handleNavigate('/vote')">
              <Vote :size="18" />
              <span>发起投票</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  FileText,
  Vote,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Plus,
  Zap,
  ChevronRight,
  AlertCircle,
  Building2
} from 'lucide-vue-next'
import { ledgerApi, governanceApi, authApi } from '../api'

const stats = ref([
  { 
    title: '本月收入', 
    value: '¥0', 
    change: '+0%', 
    changeType: 'positive',
    icon: TrendingUp, 
    iconColor: '#fff', 
    bgColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
  },
  { 
    title: '本月支出', 
    value: '¥0', 
    change: '-0%', 
    changeType: 'negative',
    icon: TrendingDown, 
    iconColor: '#fff', 
    bgColor: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
  },
  { 
    title: '小区数量', 
    value: '0', 
    change: '+0', 
    changeType: 'positive',
    icon: Building2, 
    iconColor: '#fff', 
    bgColor: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
  },
  { 
    title: '待处理质询', 
    value: '0', 
    change: '+0', 
    changeType: 'positive',
    icon: AlertCircle, 
    iconColor: '#fff', 
    bgColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
  }
])

const recentEntries = ref<any[]>([])
const pendingInquiries = ref<any[]>([])

const pendingCount = computed(() => {
  return pendingInquiries.value.filter(item => item.status === 'PENDING').length
})

const categoryMap: Record<string, string> = {
  PROPERTY_FEE: '物业费',
  PARKING_FEE: '停车费',
  ADVERTISING: '广告费',
  OTHER_INCOME: '其他收入',
  STAFF_SALARY: '人员工资',
  CLEANING: '保洁服务',
  MAINTENANCE: '设备维保',
  UTILITIES: '水电费用',
  OTHER_EXPENSE: '其他支出',
}

const getCategoryLabel = (category: string) => {
  return categoryMap[category] || category
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: '待回复',
    REPLIED: '已回复',
    CLOSED: '已关闭'
  }
  return statusMap[status] || status
}

const formatAmount = (amount: number) => {
  return amount.toLocaleString()
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const handleNavigate = (path: string) => {
  window.location.href = path
}

const loadStatistics = async () => {
  try {
    const response = await ledgerApi.getStatistics()
    if (response.code === 0) {
      const data = response.data
      stats.value[0].value = `¥${data.totalIncome?.toLocaleString() || '0'}`
      stats.value[1].value = `¥${data.totalExpense?.toLocaleString() || '0'}`
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const loadRecentEntries = async () => {
  try {
    const response = await ledgerApi.getRecent(5)
    if (response.code === 0) {
      recentEntries.value = response.data
    }
  } catch (error) {
    console.error('加载财务记录失败:', error)
  }
}

const loadPendingInquiries = async () => {
  try {
    const response = await governanceApi.getAllInquiries(undefined, 'PENDING')
    if (response.code === 0) {
      pendingInquiries.value = response.data.slice(0, 3)
    }
  } catch (error) {
    console.error('加载质询列表失败:', error)
  }
}

onMounted(async () => {
  await loadStatistics()
  await loadRecentEntries()
  await loadPendingInquiries()
})
</script>

<style scoped>
.dashboard-content {
  width: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.stat-title {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.negative {
  color: #ef4444;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
}

.data-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(59, 130, 246, 0.1);
  border: none;
  border-radius: 6px;
  color: #3b82f6;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  background: rgba(59, 130, 246, 0.15);
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th,
.data-table td {
  padding: 14px 12px;
  text-align: left;
}

.data-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
}

.data-table td {
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.data-table tr:hover td {
  background: #f8fafc;
}

.text-muted {
  color: #94a3b8;
}

.text-success {
  color: #10b981;
  font-weight: 600;
}

.text-danger {
  color: #ef4444;
  font-weight: 600;
}

.type-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.type-badge.income {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.type-badge.expense {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.inquiry-list {
  padding: 8px 0;
}

.inquiry-item {
  padding: 16px;
  margin-bottom: 12px;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.inquiry-item:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.inquiry-item:last-child {
  margin-bottom: 0;
}

.inquiry-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.inquiry-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.inquiry-author {
  font-size: 12px;
  color: #64748b;
}

.inquiry-status {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.inquiry-status.pending {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.inquiry-status.replied {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.inquiry-date {
  font-size: 11px;
  color: #94a3b8;
}

.quick-actions-card {
  flex: 1;
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.action-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
}

.action-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
}

.action-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #fff;
}
</style>
