<template>
  <div class="ledger-container">
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
          <h2>财务台账</h2>
          <p class="page-subtitle">记录和管理所有收支明细</p>
        </div>
        <button class="primary-btn" @click="openModal()">
          <Plus :size="18" />
          <span>新增收支</span>
        </button>
      </header>

      <div class="content-wrapper">
        <div class="stats-summary">
          <div class="summary-item">
            <div class="summary-icon income-icon">
              <TrendingUp :size="20" />
            </div>
            <div class="summary-content">
              <div class="summary-label">总收入</div>
              <div class="summary-value income">¥{{ formatAmount(totalIncome) }}</div>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-icon expense-icon">
              <TrendingDown :size="20" />
            </div>
            <div class="summary-content">
              <div class="summary-label">总支出</div>
              <div class="summary-value expense">¥{{ formatAmount(totalExpense) }}</div>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-icon balance-icon">
              <Wallet :size="20" />
            </div>
            <div class="summary-content">
              <div class="summary-label">净余额</div>
              <div class="summary-value" :class="balance >= 0 ? 'income' : 'expense'">
                {{ balance >= 0 ? '+' : '' }}¥{{ formatAmount(Math.abs(balance)) }}
              </div>
            </div>
          </div>
        </div>

        <div class="data-card">
          <div class="card-toolbar">
            <div class="filter-group">
              <select class="filter-select" v-model="filterType" @change="loadEntries">
                <option value="">全部类型</option>
                <option value="INCOME">收入</option>
                <option value="EXPENSE">支出</option>
              </select>
              <input 
                type="text" 
                class="search-input" 
                v-model="searchKeyword" 
                placeholder="搜索对方单位..."
                @keyup.enter="loadEntries"
              />
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>类型</th>
                  <th>类别</th>
                  <th>金额</th>
                  <th>对方单位</th>
                  <th>发生日期</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in filteredEntries" :key="entry.id">
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
                  <td>{{ entry.counterparty }}</td>
                  <td class="text-muted">{{ formatDate(entry.occurredAt) }}</td>
                  <td>
                    <button class="action-btn edit-btn" @click="openModal(true, entry)">
                      <Edit3 :size="14" />
                      <span>编辑</span>
                    </button>
                    <button class="action-btn delete-btn" @click="deleteEntry(entry.id)">
                      <Trash2 :size="14" />
                      <span>删除</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="empty-state" v-if="filteredEntries.length === 0">
            <FileText :size="48" />
            <p>暂无数据</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 新增/编辑弹窗 -->
    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEdit ? '编辑收支' : '新增收支' }}</h3>
          <button class="close-btn" @click="closeModal">
            <X :size="18" />
          </button>
        </div>
        
        <form class="modal-form" @submit.prevent="saveEntry">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">类型</label>
              <div class="radio-group">
                <label :class="['radio-item', { active: formData.type === 'INCOME' }]">
                  <input type="radio" v-model="formData.type" value="INCOME" />
                  <span>收入</span>
                </label>
                <label :class="['radio-item', { active: formData.type === 'EXPENSE' }]">
                  <input type="radio" v-model="formData.type" value="EXPENSE" />
                  <span>支出</span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">类别 <span class="required">*</span></label>
              <select v-model="formData.category" class="form-select" required>
                <option value="" disabled>请选择类别</option>
                <option v-for="cat in categories" :key="cat.value" :label="cat.label" :value="cat.value" />
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">金额 <span class="required">*</span></label>
              <div class="input-group">
                <span class="input-prefix">¥</span>
                <input 
                  v-model.number="formData.amount" 
                  type="number" 
                  class="form-input" 
                  placeholder="请输入金额" 
                  required
                />
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">对方单位 <span class="required">*</span></label>
              <input 
                v-model="formData.counterparty" 
                type="text" 
                class="form-input" 
                placeholder="请输入对方单位" 
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">发生日期 <span class="required">*</span></label>
              <input 
                v-model="formData.occurredAt" 
                type="date" 
                class="form-input" 
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">描述</label>
              <textarea 
                v-model="formData.description" 
                class="form-textarea" 
                placeholder="请输入描述"
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">取消</button>
            <button type="submit" class="btn btn-primary">
              {{ isEdit ? '保存修改' : '确认新增' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div class="modal-overlay" v-if="showDeleteConfirm" @click.self="cancelDelete">
      <div class="modal-content confirm-modal">
        <div class="confirm-icon">
          <AlertTriangle :size="40" />
        </div>
        <h3>确认删除</h3>
        <p>确定要删除这条记录吗？此操作不可撤销。</p>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancelDelete">取消</button>
          <button class="btn btn-danger" @click="confirmDelete">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import {
  Plus, TrendingUp, TrendingDown, Wallet, Eye, Edit3, Trash2, X, FileText, Upload, AlertTriangle,
  LayoutDashboard, Home, Vote, MessageSquare, Building2, Receipt, Shield, ChevronLeft, ChevronRight
} from 'lucide-vue-next'
import { ledgerApi } from '../api'

const isCollapsed = ref(localStorage.getItem('sidebarCollapsed') === 'true')
const activeMenu = ref('ledger')

const menuItems = [
  { path: '/', name: 'dashboard', label: '首页', icon: Home },
  { path: '/ledger', name: 'ledger', label: '财务台账', icon: FileText },
  { path: '/vote', name: 'vote', label: '业主投票', icon: Vote },
  { path: '/inquiry', name: 'inquiry', label: '业主质询', icon: MessageSquare },
  { path: '/community', name: 'community', label: '小区管理', icon: Building2 },
  { path: '/bill', name: 'bill', label: '账单管理', icon: Receipt },
  { path: '/audit', name: 'audit', label: '审计日志', icon: Shield }
]

const categories = [
  { value: 'PROPERTY_FEE', label: '物业费' },
  { value: 'PARKING_FEE', label: '停车费' },
  { value: 'ADVERTISING', label: '广告收入' },
  { value: 'OTHER_INCOME', label: '其他收入' },
  { value: 'STAFF_SALARY', label: '人员工资' },
  { value: 'CLEANING', label: '保洁服务' },
  { value: 'MAINTENANCE', label: '设备维保' },
  { value: 'UTILITIES', label: '水电费用' },
  { value: 'OTHER_EXPENSE', label: '其他支出' }
]

const entries = ref<any[]>([])
const showModal = ref(false)
const isEdit = ref(false)
const showDeleteConfirm = ref(false)
const deleteId = ref<number | null>(null)
const filterType = ref('')
const searchKeyword = ref('')

const formData = reactive({
  id: 0 as number,
  type: 'INCOME' as string,
  category: '',
  amount: 0 as number,
  counterparty: '',
  occurredAt: '',
  description: ''
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

const totalIncome = computed(() => {
  return entries.value
    .filter(e => e.type === 'INCOME')
    .reduce((sum, e) => sum + e.amount, 0)
})

const totalExpense = computed(() => {
  return entries.value
    .filter(e => e.type === 'EXPENSE')
    .reduce((sum, e) => sum + e.amount, 0)
})

const balance = computed(() => totalIncome.value - totalExpense.value)

const filteredEntries = computed(() => {
  return entries.value.filter(entry => {
    const typeMatch = !filterType.value || entry.type === filterType.value
    const keywordMatch = !searchKeyword.value || 
      entry.counterparty.toLowerCase().includes(searchKeyword.value.toLowerCase())
    return typeMatch && keywordMatch
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

const getCategoryLabel = (category: string) => {
  return categoryMap[category] || category
}

const formatAmount = (amount: number) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const loadEntries = async () => {
  try {
    const response = await ledgerApi.getAll()
    if (response.code === 0) {
      entries.value = response.data
    }
  } catch (error) {
    console.error('加载财务记录失败:', error)
  }
}

const loadStatistics = async () => {
  try {
    const response = await ledgerApi.getStatistics()
    if (response.code === 0) {
      const data = response.data
      totalIncome.value = data.totalIncome || 0
      totalExpense.value = data.totalExpense || 0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const openModal = (edit = false, data?: any) => {
  isEdit.value = edit
  if (edit && data) {
    formData.id = data.id
    formData.type = data.type
    formData.category = data.category
    formData.amount = data.amount
    formData.counterparty = data.counterparty
    formData.occurredAt = formatDate(data.occurredAt)
    formData.description = data.description || ''
  } else {
    formData.id = 0
    formData.type = 'INCOME'
    formData.category = ''
    formData.amount = 0
    formData.counterparty = ''
    formData.occurredAt = ''
    formData.description = ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveEntry = async () => {
  if (!formData.category || !formData.amount || !formData.counterparty || !formData.occurredAt) {
    alert('请填写完整信息')
    return
  }

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = user.id || 'admin'

    if (isEdit.value && formData.id) {
      await ledgerApi.update(formData.id, {
        type: formData.type,
        category: formData.category,
        amount: formData.amount,
        counterparty: formData.counterparty,
        occurredAt: formData.occurredAt,
        description: formData.description
      })
      alert('修改成功')
    } else {
      await ledgerApi.create({
        type: formData.type,
        category: formData.category,
        amount: formData.amount,
        counterparty: formData.counterparty,
        occurredAt: formData.occurredAt,
        description: formData.description,
        communityId: 1,
        createdBy: userId
      })
      alert('新增成功')
    }
    
    closeModal()
    await loadEntries()
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败，请重试')
  }
}

const deleteEntry = (id: number) => {
  deleteId.value = id
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  deleteId.value = null
}

const confirmDelete = async () => {
  if (deleteId.value) {
    try {
      await ledgerApi.delete(deleteId.value)
      entries.value = entries.value.filter(e => e.id !== deleteId.value)
      alert('删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败，请重试')
    }
  }
  cancelDelete()
}

onMounted(async () => {
  await loadEntries()
})
</script>

<style scoped>
.ledger-container {
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

.income-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.expense-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.balance-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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

.summary-value.income {
  color: #10b981;
}

.summary-value.expense {
  color: #ef4444;
}

.data-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.card-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.filter-group {
  display: flex;
  gap: 12px;
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

.text-success {
  color: #10b981;
  font-weight: 600;
}

.text-danger {
  color: #ef4444;
  font-weight: 600;
}

.type-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
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
  margin-right: 8px;
}

.action-btn:last-child {
  margin-right: 0;
}

.edit-btn {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.edit-btn:hover {
  background: rgba(245, 158, 11, 0.15);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.15);
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #475569;
}

.radio-item.active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
  color: #3b82f6;
}

.radio-item input {
  display: none;
}

.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  background: #fff;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.form-select:focus {
  border-color: #3b82f6;
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

.input-group {
  display: flex;
  align-items: center;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.input-group:focus-within {
  border-color: #3b82f6;
}

.input-prefix {
  padding: 12px 12px 12px 16px;
  color: #64748b;
  font-weight: 500;
  background: #f8fafc;
}

.input-group .form-input {
  border: none;
  border-radius: 0;
  padding: 12px 16px;
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

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff;
}

.btn-danger:hover {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.confirm-modal {
  max-width: 400px;
  text-align: center;
}

.confirm-icon {
  width: 80px;
  height: 80px;
  margin: 24px auto 16px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
}

.confirm-modal h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.confirm-modal p {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px 0;
}
</style>