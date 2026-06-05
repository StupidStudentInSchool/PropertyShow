<template>
  <div class="community-container">
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
          <h2>小区管理</h2>
        </div>
        <div class="header-right">
          <button class="add-btn" @click="openAddModal">
            <Plus :size="18" />
            <span>添加小区</span>
          </button>
        </div>
      </header>

      <div class="content-wrapper">
        <div class="search-bar">
          <div class="search-input-wrapper">
            <Search :size="16" />
            <input 
              v-model="searchKeyword"
              type="text" 
              placeholder="搜索小区名称..."
              @keyup.enter="handleSearch"
            />
          </div>
          <div class="filter-select">
            <select v-model="statusFilter" @change="handleFilter">
              <option value="">全部状态</option>
              <option value="ACTIVE">正常运行</option>
              <option value="INACTIVE">已停用</option>
            </select>
          </div>
        </div>

        <div class="data-card">
          <div class="card-header">
            <h3 class="card-title">
              <Building2 :size="18" />
              小区列表
            </h3>
            <span class="result-count">共 {{ communities.length }} 个小区</span>
          </div>
          
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>小区名称</th>
                  <th>地址</th>
                  <th>总户数</th>
                  <th>已登记</th>
                  <th>联系电话</th>
                  <th>状态</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="community in communities" :key="community.id">
                  <td>
                    <div class="community-info">
                      <div class="community-icon">
                        <Building2 :size="18" />
                      </div>
                      <span>{{ community.name }}</span>
                    </div>
                  </td>
                  <td class="text-muted">{{ community.address }}</td>
                  <td>{{ community.totalHouseholds }}</td>
                  <td>{{ community.registeredHouseholds }}</td>
                  <td class="text-muted">{{ community.contactPhone || '-' }}</td>
                  <td>
                    <span :class="['status-badge', community.status.toLowerCase()]">
                      {{ community.status === 'ACTIVE' ? '正常' : '停用' }}
                    </span>
                  </td>
                  <td class="text-muted">{{ formatDate(community.createdAt) }}</td>
                  <td class="actions">
                    <button class="action-btn action-edit" @click="openEditModal(community)">
                      <Edit :size="14" />
                    </button>
                    <button 
                      class="action-btn action-toggle" 
                      :class="community.status === 'ACTIVE' ? 'action-deactivate' : 'action-activate'"
                      @click="toggleCommunityStatus(community.id)"
                    >
                      <Power :size="14" />
                    </button>
                    <button class="action-btn action-delete" @click="confirmDelete(community.id, community.name)">
                      <Trash2 :size="14" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditing ? '编辑小区' : '添加小区' }}</h3>
          <button class="close-btn" @click="closeModal">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>小区名称 *</label>
            <input 
              v-model="formData.name"
              type="text" 
              placeholder="请输入小区名称"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>地址 *</label>
            <input 
              v-model="formData.address"
              type="text" 
              placeholder="请输入小区地址"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>联系电话</label>
            <input 
              v-model="formData.contactPhone"
              type="text" 
              placeholder="请输入联系电话"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>总户数</label>
            <input 
              v-model.number="formData.totalHouseholds"
              type="number" 
              placeholder="请输入总户数"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea 
              v-model="formData.description"
              placeholder="请输入小区描述"
              class="form-textarea"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="handleSubmit" :disabled="!formData.name || !formData.address">
            {{ isEditing ? '保存修改' : '确认添加' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showConfirm" class="modal-overlay" @click.self="showConfirm = false">
      <div class="confirm-modal">
        <div class="confirm-icon">
          <AlertTriangle :size="48" />
        </div>
        <h3>确认删除</h3>
        <p>确定要删除小区「{{ deleteName }}」吗？此操作不可恢复。</p>
        <div class="confirm-actions">
          <button class="btn btn-secondary" @click="showConfirm = false">取消</button>
          <button class="btn btn-danger" @click="handleDelete">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
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
  Plus,
  Search,
  Edit,
  Trash2,
  Power,
  X,
  AlertTriangle
} from 'lucide-vue-next'
import { communityApi } from '../api'

const isCollapsed = ref(localStorage.getItem('sidebarCollapsed') === 'true')
const activeMenu = ref('community')
const communities = ref<any[]>([])
const searchKeyword = ref('')
const statusFilter = ref('')

const showModal = ref(false)
const isEditing = ref(false)
const editId = ref<number | null>(null)

const showConfirm = ref(false)
const deleteId = ref<number | null>(null)
const deleteName = ref('')

const formData = reactive({
  name: '',
  address: '',
  contactPhone: '',
  totalHouseholds: 0,
  description: ''
})

const menuItems = [
  { path: '/', name: 'dashboard', label: '首页', icon: Home },
  { path: '/ledger', name: 'ledger', label: '财务台账', icon: FileText },
  { path: '/vote', name: 'vote', label: '业主投票', icon: Vote },
  { path: '/inquiry', name: 'inquiry', label: '业主质询', icon: MessageSquare },
  { path: '/community', name: 'community', label: '小区管理', icon: Building2 },
  { path: '/bill', name: 'bill', label: '账单管理', icon: Receipt },
  { path: '/audit', name: 'audit', label: '审计日志', icon: Shield }
]

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
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const loadCommunities = async () => {
  try {
    const response = await communityApi.getAll()
    if (response.code === 0) {
      communities.value = response.data
    }
  } catch (error) {
    console.error('加载小区列表失败:', error)
  }
}

const handleSearch = () => {
  loadCommunities()
}

const handleFilter = () => {
  loadCommunities()
}

const openAddModal = () => {
  isEditing.value = false
  editId.value = null
  formData.name = ''
  formData.address = ''
  formData.contactPhone = ''
  formData.totalHouseholds = 0
  formData.description = ''
  showModal.value = true
}

const openEditModal = (community: any) => {
  isEditing.value = true
  editId.value = community.id
  formData.name = community.name
  formData.address = community.address
  formData.contactPhone = community.contactPhone || ''
  formData.totalHouseholds = community.totalHouseholds || 0
  formData.description = community.description || ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  try {
    if (isEditing.value && editId.value) {
      await communityApi.update(editId.value, {
        name: formData.name,
        address: formData.address,
        contactPhone: formData.contactPhone,
        totalHouseholds: formData.totalHouseholds,
        description: formData.description
      })
    } else {
      await communityApi.create({
        name: formData.name,
        address: formData.address,
        contactPhone: formData.contactPhone,
        totalHouseholds: formData.totalHouseholds,
        description: formData.description
      })
    }
    showModal.value = false
    await loadCommunities()
    alert(isEditing.value ? '修改成功' : '添加成功')
  } catch (error) {
    console.error('操作失败:', error)
    alert('操作失败，请重试')
  }
}

const confirmDelete = (id: number, name: string) => {
  deleteId.value = id
  deleteName.value = name
  showConfirm.value = true
}

const handleDelete = async () => {
  if (deleteId.value) {
    try {
      await communityApi.delete(deleteId.value)
      showConfirm.value = false
      await loadCommunities()
      alert('删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败，请重试')
    }
  }
}

const toggleCommunityStatus = async (id: number) => {
  try {
    await communityApi.toggleStatus(id)
    await loadCommunities()
    alert('状态已切换')
  } catch (error) {
    console.error('切换状态失败:', error)
    alert('操作失败，请重试')
  }
}

onMounted(() => {
  loadCommunities()
})
</script>

<style scoped>
.community-container {
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
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

.content-wrapper {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 10px;
  padding: 0 16px;
  border: 1px solid #e2e8f0;
}

.search-input-wrapper input {
  flex: 1;
  padding: 12px;
  border: none;
  outline: none;
  font-size: 14px;
}

.search-input-wrapper svg {
  color: #94a3b8;
}

.filter-select select {
  padding: 12px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #ffffff;
  cursor: pointer;
  outline: none;
}

.data-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
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

.result-count {
  font-size: 13px;
  color: #64748b;
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

.community-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.community-icon {
  width: 32px;
  height: 32px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
}

.text-muted {
  color: #94a3b8;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.inactive {
  background: rgba(148, 163, 184, 0.1);
  color: #64748b;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-edit {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.action-edit:hover {
  background: rgba(59, 130, 246, 0.15);
}

.action-toggle {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.action-toggle:hover {
  background: rgba(245, 158, 11, 0.15);
}

.action-deactivate {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.action-activate {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.action-delete {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.action-delete:hover {
  background: rgba(239, 68, 68, 0.15);
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
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
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
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #64748b;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: #3b82f6;
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 80px;
}

.form-textarea:focus {
  border-color: #3b82f6;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f1f5f9;
  justify-content: flex-end;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
}

.confirm-modal {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.confirm-icon {
  width: 80px;
  height: 80px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #f59e0b;
}

.confirm-modal h3 {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.confirm-modal p {
  margin: 0 0 24px;
  color: #64748b;
  font-size: 14px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
