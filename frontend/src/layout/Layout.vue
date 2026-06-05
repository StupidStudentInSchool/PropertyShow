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
          <h2>{{ pageTitle }}</h2>
        </div>
        <div class="header-right">
          <div class="user-section">
            <span class="user-name">{{ user?.name || user?.username }}</span>
            <span class="user-role">{{ user?.role === 'ADMIN' ? '管理员' : user?.role === 'PROPERTY_MANAGER' ? '物业人员' : '业主' }}</span>
          </div>
          <button class="logout-btn" @click="handleLogout">
            <LogOut :size="16" />
            <span>退出登录</span>
          </button>
        </div>
      </header>

      <div class="content-wrapper">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
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
  LogOut
} from 'lucide-vue-next'
import { authApi } from '../api'
import type { User } from '../stores/user'

const route = useRoute()

const savedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true'
const isCollapsed = ref(savedCollapsed)
const user = ref<User | null>(null)

const menuItems = [
  { path: '/', name: 'dashboard', label: '首页', icon: Home },
  { path: '/ledger', name: 'ledger', label: '财务台账', icon: FileText },
  { path: '/vote', name: 'vote', label: '业主投票', icon: Vote },
  { path: '/inquiry', name: 'inquiry', label: '业主质询', icon: MessageSquare },
  { path: '/community', name: 'community', label: '小区管理', icon: Building2 },
  { path: '/bill', name: 'bill', label: '账单管理', icon: Receipt },
  { path: '/audit', name: 'audit', label: '审计日志', icon: Shield }
]

const pageTitleMap: Record<string, string> = {
  dashboard: '管理控制台',
  ledger: '财务台账',
  vote: '业主投票',
  inquiry: '业主质询',
  community: '小区管理',
  bill: '账单管理',
  audit: '审计日志'
}

const activeMenu = computed(() => {
  return route.name as string || 'dashboard'
})

const pageTitle = computed(() => {
  return pageTitleMap[route.name as string] || '管理控制台'
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebarCollapsed', String(isCollapsed.value))
}

const handleMenuClick = (path: string, name: string) => {
  window.location.href = path
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

const loadUserData = async () => {
  try {
    const response = await authApi.me()
    if (response.code === 0) {
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(response.data))
    }
  } catch (error) {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      user.value = JSON.parse(savedUser)
    }
  }
}

onMounted(async () => {
  await loadUserData()
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
</style>
