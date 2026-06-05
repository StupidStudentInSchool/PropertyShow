<template>
  <div class="dashboard-container">
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
          <h2>管理控制台</h2>
        </div>
        <div class="header-right">
          <div class="user-section">
            <span class="user-name">{{ username }}</span>
            <span class="user-role">管理员</span>
          </div>
          <button class="logout-btn" @click="handleLogout">
            <LogOut :size="16" />
            <span>退出登录</span>
          </button>
        </div>
      </header>

      <div class="content-wrapper">
        <!-- 统计卡片 -->
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
          <!-- 最近财务记录 -->
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
                    <td>{{ entry.category }}</td>
                    <td :class="entry.type === 'INCOME' ? 'text-success' : 'text-danger'">
                      {{ entry.type === 'INCOME' ? '+' : '-' }}{{ entry.amount }}
                    </td>
                    <td class="text-muted">{{ entry.date }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="side-panel">
            <!-- 待处理质询 -->
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
                    <span class="inquiry-author">{{ item.author }}</span>
                    <span :class="['inquiry-status', item.status.toLowerCase()]">
                      {{ item.status === 'PENDING' ? '待回复' : '已回复' }}
                    </span>
                  </div>
                  <div class="inquiry-date">{{ item.date }}</div>
                </div>
              </div>
            </div>

            <!-- 快捷操作 -->
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
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import {
  LayoutDashboard,
  Home,
  FileText,
  Vote,
  MessageSquare,
  Building2,
  Receipt,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Plus,
  Zap
} from 'lucide-vue-next'

const savedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true'
const isCollapsed = ref(savedCollapsed)
const activeMenu = ref('dashboard')
const username = ref('')

const menuItems = [
  { path: '/', name: 'dashboard', label: '首页', icon: Home },
  { path: '/ledger', name: 'ledger', label: '财务台账', icon: FileText },
  { path: '/vote', name: 'vote', label: '业主投票', icon: Vote },
  { path: '/inquiry', name: 'inquiry', label: '业主质询', icon: MessageSquare },
  { path: '/community', name: 'community', label: '小区管理', icon: Building2 },
  { path: '/bill', name: 'bill', label: '账单管理', icon: Receipt },
  { path: '/audit', name: 'audit', label: '审计日志', icon: Shield }
]

const stats = ref([
  { 
    title: '本月收入', 
    value: '¥1,250,000', 
    change: '+12.5%', 
    changeType: 'positive',
    icon: TrendingUp, 
    iconColor: '#fff', 
    bgColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
  },
  { 
    title: '本月支出', 
    value: '¥980,000', 
    change: '-5.2%', 
    changeType: 'negative',
    icon: TrendingDown, 
    iconColor: '#fff', 
    bgColor: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
  },
  { 
    title: '小区数量', 
    value: '12', 
    change: '+2', 
    changeType: 'positive',
    icon: Building2, 
    iconColor: '#fff', 
    bgColor: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
  },
  { 
    title: '待处理质询', 
    value: '5', 
    change: '+1', 
    changeType: 'positive',
    icon: AlertCircle, 
    iconColor: '#fff', 
    bgColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
  }
])

import { AlertCircle } from 'lucide-vue-next'

const recentEntries = ref([
  { id: 1, type: 'INCOME', category: '物业费收入', amount: '¥850,000', date: '2026-06-15' },
  { id: 2, type: 'EXPENSE', category: '人员工资', amount: '¥420,000', date: '2026-06-01' },
  { id: 3, type: 'INCOME', category: '停车费收入', amount: '¥280,000', date: '2026-06-20' },
  { id: 4, type: 'EXPENSE', category: '保洁服务', amount: '¥150,000', date: '2026-06-10' },
  { id: 5, type: 'EXPENSE', category: '设备维保', amount: '¥130,000', date: '2026-06-18' }
])

const pendingInquiries = ref([
  { id: 1, title: '关于物业费明细的质询', author: '张业主', date: '2026-06-05', status: 'PENDING' },
  { id: 2, title: '关于电梯维保时间的质询', author: '李业主', date: '2026-06-04', status: 'PENDING' },
  { id: 3, title: '关于绿化养护的质询', author: '王业主', date: '2026-06-03', status: 'REPLIED' }
])

const pendingCount = computed(() => {
  return pendingInquiries.value.filter(item => item.status === 'PENDING').length
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebarCollapsed', String(isCollapsed.value))
}

const handleMenuClick = (path: string, name: string) => {
  activeMenu.value = name
  window.location.href = path
}

const handleNavigate = (path: string) => {
  window.location.href = path
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('role')
  window.location.href = '/login'
}

onMounted(() => {
  const savedUsername = localStorage.getItem('username')
  if (savedUsername) {
    username.value = savedUsername
  }
  
  axios.get('/api/v1/auth/me', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }).then(response => {
    if (response.data.code === 0) {
      username.value = response.data.data.username
    }
  }).catch(() => {
    console.log('获取用户信息失败')
  })
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard-container {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.sidebar {
  width: 220px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
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
  border-bottom: 1px solid #e2e8f0;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.user-role {
  font-size: 12px;
  color: #64748b;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: none;
  border-radius: 8px;
  color: #ef4444;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.15);
}

.content-wrapper {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
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