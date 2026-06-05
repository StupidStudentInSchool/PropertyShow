<template>
  <div class="audit-container">
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
          <h2>审计日志</h2>
          <p class="page-subtitle">记录系统操作和数据变更历史</p>
        </div>
      </header>

      <div class="content-wrapper">
        <div class="filter-bar">
          <select class="filter-select" v-model="filterModule" @change="loadLogs">
            <option value="">全部模块</option>
            <option value="COMMUNITY">小区管理</option>
            <option value="LEDGER">财务台账</option>
            <option value="VOTE">业主投票</option>
            <option value="INQUIRY">业主质询</option>
            <option value="BILL">账单管理</option>
          </select>
          <select class="filter-select" v-model="filterAction" @change="loadLogs">
            <option value="">全部操作</option>
            <option value="CREATE">创建</option>
            <option value="UPDATE">更新</option>
            <option value="DELETE">删除</option>
            <option value="VIEW">查看</option>
            <option value="LOGIN">登录</option>
          </select>
          <input 
            type="text" 
            class="search-input" 
            v-model="searchKeyword" 
            placeholder="搜索操作人..."
            @keyup.enter="loadLogs"
          />
          <div class="date-range">
            <input 
              type="date" 
              v-model="startDate" 
              class="date-input"
              @change="loadLogs"
            />
            <span class="date-separator">至</span>
            <input 
              type="date" 
              v-model="endDate" 
              class="date-input"
              @change="loadLogs"
            />
          </div>
        </div>

        <div class="data-card">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>模块</th>
                  <th>操作</th>
                  <th>操作人</th>
                  <th>操作时间</th>
                  <th>详情</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in logs" :key="log.id">
                  <td class="text-muted">#{{ log.id }}</td>
                  <td>
                    <span :class="['module-badge', log.module.toLowerCase()]">
                      {{ getModuleLabel(log.module) }}
                    </span>
                  </td>
                  <td>
                    <span :class="['action-badge', log.action.toLowerCase()]">
                      {{ getActionLabel(log.action) }}
                    </span>
                  </td>
                  <td>{{ log.userId }}</td>
                  <td class="text-muted">{{ formatDateTime(log.createdAt) }}</td>
                  <td>
                    <button class="action-btn detail-btn" @click="viewDetail(log)">
                      <Eye :size="14" />
                      <span>详情</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="empty-state" v-if="logs.length === 0">
            <Shield :size="48" />
            <p>暂无审计日志</p>
          </div>

          <div class="pagination" v-if="total > pageSize">
            <button 
              class="page-btn" 
              :disabled="currentPage === 1"
              @click="currentPage--; loadLogs()"
            >
              <ChevronLeft :size="16" />
            </button>
            <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
            <button 
              class="page-btn" 
              :disabled="currentPage === totalPages"
              @click="currentPage++; loadLogs()"
            >
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- 详情弹窗 -->
    <div class="modal-overlay" v-if="showDetail" @click.self="closeDetail">
      <div class="modal-content detail-modal">
        <div class="modal-header">
          <h3>日志详情</h3>
          <button class="close-btn" @click="closeDetail">
            <X :size="18" />
          </button>
        </div>
        
        <div class="detail-body" v-if="selectedLog">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">日志ID</span>
              <span class="detail-value">#{{ selectedLog.id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">模块</span>
              <span :class="['detail-badge', selectedLog.module.toLowerCase()]">
                {{ getModuleLabel(selectedLog.module) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">操作</span>
              <span :class="['detail-badge', selectedLog.action.toLowerCase()]">
                {{ getActionLabel(selectedLog.action) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">操作人</span>
              <span class="detail-value">{{ selectedLog.userId }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">操作时间</span>
              <span class="detail-value">{{ formatDateTime(selectedLog.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">目标ID</span>
              <span class="detail-value">{{ selectedLog.targetId || '-' }}</span>
            </div>
          </div>

          <div class="detail-section" v-if="selectedLog.details">
            <h4>操作详情</h4>
            <pre class="detail-json">{{ formatJson(selectedLog.details) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Eye, X, Shield, LayoutDashboard, Home, Vote, MessageSquare, Building2, Receipt, 
  ChevronLeft, ChevronRight
} from 'lucide-vue-next'
import { auditApi } from '../api'

const isCollapsed = ref(localStorage.getItem('sidebarCollapsed') === 'true')
const activeMenu = ref('audit')

const menuItems = [
  { path: '/', name: 'dashboard', label: '首页', icon: Home },
  { path: '/ledger', name: 'ledger', label: '财务台账', icon: MessageSquare },
  { path: '/vote', name: 'vote', label: '业主投票', icon: Vote },
  { path: '/inquiry', name: 'inquiry', label: '业主质询', icon: MessageSquare },
  { path: '/community', name: 'community', label: '小区管理', icon: Building2 },
  { path: '/bill', name: 'bill', label: '账单管理', icon: Receipt },
  { path: '/audit', name: 'audit', label: '审计日志', icon: Shield }
]

const logs = ref<any[]>([])
const showDetail = ref(false)
const selectedLog = ref<any>(null)
const filterModule = ref('')
const filterAction = ref('')
const searchKeyword = ref('')
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebarCollapsed', String(isCollapsed.value))
}

const handleMenuClick = (path: string, name: string) => {
  activeMenu.value = name
  window.location.href = path
}

const getModuleLabel = (module: string) => {
  const moduleMap: Record<string, string> = {
    COMMUNITY: '小区管理',
    LEDGER: '财务台账',
    VOTE: '业主投票',
    INQUIRY: '业主质询',
    BILL: '账单管理',
    AUDIT: '审计日志',
    AUTH: '用户认证'
  }
  return moduleMap[module] || module
}

const getActionLabel = (action: string) => {
  const actionMap: Record<string, string> = {
    CREATE: '创建',
    UPDATE: '更新',
    DELETE: '删除',
    VIEW: '查看',
    LOGIN: '登录',
    LOGOUT: '登出'
  }
  return actionMap[action] || action
}

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
}

const formatJson = (details: string) => {
  try {
    return JSON.stringify(JSON.parse(details), null, 2)
  } catch {
    return details
  }
}

const loadLogs = async () => {
  try {
    const response = await auditApi.findAll({
      module: filterModule.value || undefined,
      action: filterAction.value || undefined,
      userId: searchKeyword.value || undefined,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined,
      page: currentPage.value,
      limit: pageSize.value
    })
    if (response.code === 0) {
      logs.value = response.data.data
      total.value = response.data.total
    }
  } catch (error) {
    console.error('加载审计日志失败:', error)
  }
}

const viewDetail = (log: any) => {
  selectedLog.value = log
  showDetail.value = true
}

const closeDetail = () => {
  showDetail.value = false
  selectedLog.value = null
}

onMounted(async () => {
  await loadLogs()
})
</script>

<style scoped>
.audit-container {
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

.content-wrapper {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
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
  min-width: 150px;
}

.search-input:focus {
  border-color: #3b82f6;
}

.search-input::placeholder {
  color: #94a3b8;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input {
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #334155;
  outline: none;
  transition: border-color 0.2s;
}

.date-input:focus {
  border-color: #3b82f6;
}

.date-separator {
  color: #94a3b8;
}

.data-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  background: #f8fafc;
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.data-table tr:hover td {
  background: #f8fafc;
}

.text-muted {
  color: #94a3b8;
}

.module-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.module-badge.community {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.module-badge.ledger {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.module-badge.vote {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.module-badge.inquiry {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.module-badge.bill {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.module-badge.audit {
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4;
}

.module-badge.auth {
  background: rgba(236, 72, 153, 0.1);
  color: #ec4899;
}

.action-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.action-badge.create {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.action-badge.update {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.action-badge.delete {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.action-badge.view {
  background: rgba(148, 163, 184, 0.1);
  color: #64748b;
}

.action-badge.login {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.action-badge.logout {
  background: rgba(148, 163, 184, 0.1);
  color: #64748b;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.detail-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.detail-btn:hover {
  background: rgba(59, 130, 246, 0.15);
}

.empty-state {
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.page-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #e2e8f0;
  color: #334155;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #64748b;
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

.detail-body {
  padding: 24px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 14px;
  color: #334155;
}

.detail-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.detail-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.detail-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin: 0 0 12px 0;
}

.detail-json {
  background: #f8fafc;
  padding: 16px;
  border-radius: 10px;
  font-size: 12px;
  color: #475569;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>