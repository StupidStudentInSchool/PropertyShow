<template>
  <div class="admin-page">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>管理后台</h2>
      </div>
      <nav class="sidebar-nav">
        <button 
          v-for="item in menuItems" 
          :key="item.key"
          :class="['nav-item', { active: activeMenu === item.key }]"
          @click="activeMenu = item.key"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-text">{{ item.label }}</span>
        </button>
      </nav>
      <div class="sidebar-footer">
        <button class="logout-btn" @click="handleLogout">
          <span>退出登录</span>
        </button>
      </div>
    </aside>
    
    <main class="main-content">
      <header class="content-header">
        <h1>{{ currentMenuTitle }}</h1>
        <div class="header-right">
          <span class="user-info">{{ user?.name }} ({{ user?.role }})</span>
        </div>
      </header>
      
      <!-- 公告通知管理 -->
      <div v-if="activeMenu === 'notices'" class="content-body">
        <div class="action-bar">
          <button class="btn btn-primary" @click="showNoticeModal = true">+ 添加公告</button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>标题</th>
              <th>类型</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="notice in notices" :key="notice.id">
              <td>{{ notice.title }}</td>
              <td>{{ getNoticeTypeLabel(notice.type) }}</td>
              <td :class="['status-badge', notice.status.toLowerCase()]">{{ getNoticeStatusLabel(notice.status) }}</td>
              <td>{{ formatDate(notice.createdAt) }}</td>
              <td>
                <button class="btn btn-sm btn-edit" @click="editNotice(notice)">编辑</button>
                <button class="btn btn-sm btn-delete" @click="deleteNotice(notice.id)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 日常服务记录管理 -->
      <div v-if="activeMenu === 'services'" class="content-body">
        <div class="action-bar">
          <button class="btn btn-primary" @click="showServiceModal = true">+ 添加服务记录</button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>标题</th>
              <th>类别</th>
              <th>状态</th>
              <th>工作人员</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="service in services" :key="service.id">
              <td>{{ service.title }}</td>
              <td>{{ getServiceCategoryLabel(service.category) }}</td>
              <td :class="['status-badge', service.status.toLowerCase()]">{{ getServiceStatusLabel(service.status) }}</td>
              <td>{{ service.staffName }}</td>
              <td>{{ formatDate(service.createdAt) }}</td>
              <td>
                <button class="btn btn-sm btn-edit" @click="editService(service)">编辑</button>
                <button class="btn btn-sm btn-complete" @click="completeService(service.id)">完成</button>
                <button class="btn btn-sm btn-delete" @click="deleteService(service.id)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 收支明细管理 -->
      <div v-if="activeMenu === 'finance'" class="content-body">
        <div class="action-bar">
          <button class="btn btn-primary" @click="showFinanceModal = true">+ 添加收支记录</button>
        </div>
        <div class="tabs">
          <button :class="['tab', { active: financeTab === 'income' }]" @click="financeTab = 'income'">收入明细</button>
          <button :class="['tab', { active: financeTab === 'expense' }]" @click="financeTab = 'expense'">支出明细</button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>类别</th>
              <th>金额</th>
              <th>对方单位</th>
              <th>凭证状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in filteredFinanceEntries" :key="entry.id">
              <td>{{ formatDate(entry.occurredAt) }}</td>
              <td>{{ entry.category }}</td>
              <td :class="entry.type === 'INCOME' ? 'income' : 'expense'">
                {{ entry.type === 'INCOME' ? '+' : '-' }}¥{{ formatNumber(entry.amount) }}
              </td>
              <td>{{ entry.counterparty || '-' }}</td>
              <td>
                <span v-if="entry.hasEvidence" class="evidence-badge">已审</span>
                <span v-else class="evidence-badge missing">待审</span>
              </td>
              <td>
                <button class="btn btn-sm btn-edit" @click="editFinance(entry)">编辑</button>
                <button class="btn btn-sm btn-delete" @click="deleteFinance(entry.id)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 质询管理 -->
      <div v-if="activeMenu === 'inquiries'" class="content-body">
        <div class="tabs">
          <button :class="['tab', { active: inquiryTab === 'all' }]" @click="inquiryTab = 'all'">全部</button>
          <button :class="['tab', { active: inquiryTab === 'pending' }]" @click="inquiryTab = 'pending'">待处理</button>
          <button :class="['tab', { active: inquiryTab === 'replied' }]" @click="inquiryTab = 'replied'">已回复</button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>标题</th>
              <th>内容</th>
              <th>提交人</th>
              <th>状态</th>
              <th>提交时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inquiry in filteredInquiries" :key="inquiry.id">
              <td>{{ inquiry.title }}</td>
              <td class="text-truncate">{{ inquiry.content }}</td>
              <td>{{ inquiry.authorName }}</td>
              <td :class="['status-badge', inquiry.status.toLowerCase()]">{{ getInquiryStatusLabel(inquiry.status) }}</td>
              <td>{{ formatDate(inquiry.createdAt) }}</td>
              <td>
                <button v-if="inquiry.status === 'PENDING'" class="btn btn-sm btn-reply" @click="replyInquiry(inquiry)">回复</button>
                <button class="btn btn-sm btn-close" @click="closeInquiry(inquiry.id)">关闭</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
    
    <!-- 公告弹窗 -->
    <div v-if="showNoticeModal" class="modal-overlay" @click.self="closeNoticeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingNotice ? '编辑公告' : '添加公告' }}</h3>
          <button class="modal-close" @click="closeNoticeModal">×</button>
        </div>
        <form @submit.prevent="saveNotice">
          <div class="form-group">
            <label>标题</label>
            <input v-model="noticeForm.title" type="text" class="form-input" required />
          </div>
          <div class="form-group">
            <label>内容</label>
            <textarea v-model="noticeForm.content" class="form-textarea" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>类型</label>
            <select v-model="noticeForm.type" class="form-select">
              <option value="ANNOUNCEMENT">公告</option>
              <option value="WARNING">重要提醒</option>
              <option value="SUCCESS">活动通知</option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeNoticeModal">取消</button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 服务记录弹窗 -->
    <div v-if="showServiceModal" class="modal-overlay" @click.self="closeServiceModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingService ? '编辑服务记录' : '添加服务记录' }}</h3>
          <button class="modal-close" @click="closeServiceModal">×</button>
        </div>
        <form @submit.prevent="saveService">
          <div class="form-group">
            <label>标题</label>
            <input v-model="serviceForm.title" type="text" class="form-input" required />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="serviceForm.description" class="form-textarea" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>类别</label>
            <select v-model="serviceForm.category" class="form-select">
              <option value="CLEANING">清洁服务</option>
              <option value="REPAIR">维修服务</option>
              <option value="PATROL">巡检服务</option>
              <option value="MAINTENANCE">设备维护</option>
              <option value="OTHER">其他</option>
            </select>
          </div>
          <div class="form-group">
            <label>工作人员</label>
            <input v-model="serviceForm.staffName" type="text" class="form-input" required />
          </div>
          <div class="form-group">
            <label>联系电话</label>
            <input v-model="serviceForm.staffPhone" type="tel" class="form-input" />
          </div>
          <div class="form-group">
            <label>位置</label>
            <input v-model="serviceForm.location" type="text" class="form-input" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeServiceModal">取消</button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 收支记录弹窗 -->
    <div v-if="showFinanceModal" class="modal-overlay" @click.self="closeFinanceModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingFinance ? '编辑收支记录' : '添加收支记录' }}</h3>
          <button class="modal-close" @click="closeFinanceModal">×</button>
        </div>
        <form @submit.prevent="saveFinance">
          <div class="form-group">
            <label>类型</label>
            <select v-model="financeForm.type" class="form-select">
              <option value="INCOME">收入</option>
              <option value="EXPENSE">支出</option>
            </select>
          </div>
          <div class="form-group">
            <label>类别</label>
            <input v-model="financeForm.category" type="text" class="form-input" required />
          </div>
          <div class="form-group">
            <label>金额</label>
            <input v-model.number="financeForm.amount" type="number" class="form-input" required />
          </div>
          <div class="form-group">
            <label>对方单位</label>
            <input v-model="financeForm.counterparty" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="financeForm.description" class="form-textarea" rows="2"></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeFinanceModal">取消</button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 回复质询弹窗 -->
    <div v-if="showReplyModal" class="modal-overlay" @click.self="closeReplyModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>回复质询</h3>
          <button class="modal-close" @click="closeReplyModal">×</button>
        </div>
        <div class="inquiry-preview">
          <h4>质询内容</h4>
          <p>{{ replyingInquiry?.content }}</p>
        </div>
        <form @submit.prevent="submitReply">
          <div class="form-group">
            <label>回复内容</label>
            <textarea v-model="replyContent" class="form-textarea" rows="4" required></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeReplyModal">取消</button>
            <button type="submit" class="btn btn-primary">提交回复</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">import { ref, computed, onMounted } from 'vue';
import { disclosureApi, serviceRecordApi, ledgerApi, inquiryApi } from '../api/public';
const activeMenu = ref('notices');
const user = ref<any>(null);
const showNoticeModal = ref(false);
const showServiceModal = ref(false);
const showFinanceModal = ref(false);
const showReplyModal = ref(false);
const editingNotice = ref<any>(null);
const editingService = ref<any>(null);
const editingFinance = ref<any>(null);
const replyingInquiry = ref<any>(null);
const replyContent = ref('');
const financeTab = ref('income');
const inquiryTab = ref('all');
const notices = ref<any[]>([]);
const services = ref<any[]>([]);
const financeEntries = ref<any[]>([]);
const inquiries = ref<any[]>([]);
const noticeForm = ref({
 title: '',
 content: '',
 type: 'ANNOUNCEMENT',
});
const serviceForm = ref({
 title: '',
 description: '',
 category: 'CLEANING',
 staffName: '',
 staffPhone: '',
 location: '',
});
const financeForm = ref({
 type: 'INCOME',
 category: '',
 amount: 0,
 counterparty: '',
 description: '',
});
const menuItems = [
 { key: 'notices', label: '公告通知', icon: '📢' },
 { key: 'services', label: '日常服务', icon: '🛠️' },
 { key: 'finance', label: '收支明细', icon: '💰' },
 { key: 'inquiries', label: '质询管理', icon: '❓' },
];
const currentMenuTitle = computed(() => {
 const item = menuItems.find(i => i.key === activeMenu.value);
 return item?.label || '';
});
const filteredFinanceEntries = computed(() => {
 return financeEntries.value.filter(e => e.type === (financeTab.value === 'income' ? 'INCOME' : 'EXPENSE'));
});
const filteredInquiries = computed(() => {
 if (inquiryTab.value === 'all')
 return inquiries.value;
 if (inquiryTab.value === 'pending')
 return inquiries.value.filter(i => i.status === 'PENDING');
 if (inquiryTab.value === 'replied')
 return inquiries.value.filter(i => i.status === 'REPLIED');
 return inquiries.value;
});
const getNoticeTypeLabel = (type: string) => {
 const map: Record<string, string> = {
 ANNOUNCEMENT: '公告',
 WARNING: '重要提醒',
 SUCCESS: '活动通知',
 };
 return map[type] || type;
};
const getNoticeStatusLabel = (status: string) => {
 const map: Record<string, string> = {
 DRAFT: '草稿',
 PUBLISHED: '已发布',
 ARCHIVED: '已归档',
 };
 return map[status] || status;
};
const getServiceCategoryLabel = (category: string) => {
 const map: Record<string, string> = {
 CLEANING: '清洁服务',
 REPAIR: '维修服务',
 PATROL: '巡检服务',
 MAINTENANCE: '设备维护',
 OTHER: '其他',
 };
 return map[category] || category;
};
const getServiceStatusLabel = (status: string) => {
 const map: Record<string, string> = {
 PENDING: '待处理',
 IN_PROGRESS: '进行中',
 COMPLETED: '已完成',
 CANCELLED: '已取消',
 };
 return map[status] || status;
};
const getInquiryStatusLabel = (status: string) => {
 const map: Record<string, string> = {
 PENDING: '待处理',
 REPLIED: '已回复',
 CLOSED: '已关闭',
 };
 return map[status] || status;
};
const formatDate = (dateStr: string) => {
 if (!dateStr)
 return '';
 const date = new Date(dateStr);
 return date.toLocaleDateString('zh-CN', {
 year: 'numeric',
 month: '2-digit',
 day: '2-digit',
 });
};
const formatNumber = (num: number) => {
 return num.toLocaleString('zh-CN');
};
const handleLogout = () => {
 localStorage.removeItem('token');
 localStorage.removeItem('user');
 window.location.href = '/login';
};
const loadNotices = async () => {
 try {
 const result = await disclosureApi.getAll({ communityId: 1 });
 notices.value = result.data || result;
 }
 catch (error) {
 console.error('加载公告失败:', error);
 }
};
const loadServices = async () => {
 try {
 const result = await serviceRecordApi.getAll({ communityId: 1 });
 services.value = result.data || result;
 }
 catch (error) {
 console.error('加载服务记录失败:', error);
 }
};
const loadFinance = async () => {
 try {
 const result = await ledgerApi.getAll({ communityId: 1 });
 financeEntries.value = result.data || result;
 }
 catch (error) {
 console.error('加载收支记录失败:', error);
 }
};
const loadInquiries = async () => {
 try {
 const result = await inquiryApi.getAll({ communityId: 1 });
 inquiries.value = result.data || result;
 }
 catch (error) {
 console.error('加载质询失败:', error);
 }
};
const closeNoticeModal = () => {
 showNoticeModal.value = false;
 editingNotice.value = null;
 noticeForm.value = { title: '', content: '', type: 'ANNOUNCEMENT' };
};
const editNotice = (notice: any) => {
 editingNotice.value = notice;
 noticeForm.value = {
 title: notice.title,
 content: notice.content || '',
 type: notice.type,
 };
 showNoticeModal.value = true;
};
const saveNotice = async () => {
 try {
 if (editingNotice.value) {
 await disclosureApi.update(editingNotice.value.id, noticeForm.value);
 }
 else {
 await disclosureApi.create({
 ...noticeForm.value,
 communityId: 1,
 createdBy: user.value?.name || 'admin',
 });
 }
 closeNoticeModal();
 loadNotices();
 }
 catch (error) {
 console.error('保存公告失败:', error);
 alert('保存失败');
 }
};
const deleteNotice = async (id: number) => {
 if (!confirm('确定删除此公告？'))
 return;
 try {
 await disclosureApi.delete(id);
 loadNotices();
 }
 catch (error) {
 console.error('删除公告失败:', error);
 alert('删除失败');
 }
};
const closeServiceModal = () => {
 showServiceModal.value = false;
 editingService.value = null;
 serviceForm.value = {
 title: '',
 description: '',
 category: 'CLEANING',
 staffName: '',
 staffPhone: '',
 location: '',
 };
};
const editService = (service: any) => {
 editingService.value = service;
 serviceForm.value = {
 title: service.title,
 description: service.description || '',
 category: service.category,
 staffName: service.staffName,
 staffPhone: service.staffPhone || '',
 location: service.location || '',
 };
 showServiceModal.value = true;
};
const saveService = async () => {
 try {
 if (editingService.value) {
 await serviceRecordApi.update(editingService.value.id, serviceForm.value);
 }
 else {
 await serviceRecordApi.create({
 ...serviceForm.value,
 communityId: 1,
 createdBy: user.value?.name || 'admin',
 });
 }
 closeServiceModal();
 loadServices();
 }
 catch (error) {
 console.error('保存服务记录失败:', error);
 alert('保存失败');
 }
};
const completeService = async (id: number) => {
 try {
 await serviceRecordApi.complete(id);
 loadServices();
 }
 catch (error) {
 console.error('完成服务记录失败:', error);
 alert('操作失败');
 }
};
const deleteService = async (id: number) => {
 if (!confirm('确定删除此服务记录？'))
 return;
 try {
 await serviceRecordApi.delete(id);
 loadServices();
 }
 catch (error) {
 console.error('删除服务记录失败:', error);
 alert('删除失败');
 }
};
const closeFinanceModal = () => {
 showFinanceModal.value = false;
 editingFinance.value = null;
 financeForm.value = {
 type: 'INCOME',
 category: '',
 amount: 0,
 counterparty: '',
 description: '',
 };
};
const editFinance = (entry: any) => {
 editingFinance.value = entry;
 financeForm.value = {
 type: entry.type,
 category: entry.category,
 amount: entry.amount,
 counterparty: entry.counterparty || '',
 description: entry.description || '',
 };
 showFinanceModal.value = true;
};
const saveFinance = async () => {
 try {
 if (editingFinance.value) {
 await ledgerApi.update(editingFinance.value.id, financeForm.value);
 }
 else {
 await ledgerApi.create({
 ...financeForm.value,
 occurredAt: new Date(),
 communityId: 1,
 createdBy: user.value?.name || 'admin',
 });
 }
 closeFinanceModal();
 loadFinance();
 }
 catch (error) {
 console.error('保存收支记录失败:', error);
 alert('保存失败');
 }
};
const deleteFinance = async (id: number) => {
 if (!confirm('确定删除此收支记录？'))
 return;
 try {
 await ledgerApi.delete(id);
 loadFinance();
 }
 catch (error) {
 console.error('删除收支记录失败:', error);
 alert('删除失败');
 }
};
const replyInquiry = (inquiry: any) => {
 replyingInquiry.value = inquiry;
 replyContent.value = '';
 showReplyModal.value = true;
};
const closeReplyModal = () => {
 showReplyModal.value = false;
 replyingInquiry.value = null;
 replyContent.value = '';
};
const submitReply = async () => {
 if (!replyContent.value.trim())
 return;
 try {
 await inquiryApi.reply(replyingInquiry.value.id, {
 replyContent: replyContent.value,
 repliedBy: user.value?.name || 'admin',
 });
 closeReplyModal();
 loadInquiries();
 }
 catch (error) {
 console.error('回复失败:', error);
 alert('回复失败');
 }
};
const closeInquiry = async (id: number) => {
 if (!confirm('确定关闭此质询？'))
 return;
 try {
 await inquiryApi.close(id);
 loadInquiries();
 }
 catch (error) {
 console.error('关闭质询失败:', error);
 alert('操作失败');
 }
};
onMounted(() => {
 const userStr = localStorage.getItem('user');
 if (userStr) {
 user.value = JSON.parse(userStr);
 }
 else {
 window.location.href = '/login';
 return;
 }
 loadNotices();
 loadServices();
 loadFinance();
 loadInquiries();
});
</script>

<style scoped>
.admin-page {
  display: flex;
  min-height: 100vh;
  background: #f1f5f9;
}

.sidebar {
  width: 240px;
  background: #1e293b;
  color: white;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #334155;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
}

.sidebar-nav {
  flex: 1;
  padding: 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  text-align: left;
}

.nav-item:hover {
  background: #334155;
}

.nav-item.active {
  background: #3b82f6;
  color: white;
}

.nav-icon {
  font-size: 18px;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #334155;
}

.logout-btn {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid #475569;
  color: #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #334155;
  color: white;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-header {
  padding: 20px 24px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-header h1 {
  margin: 0;
  font-size: 20px;
  color: #1e293b;
}

.user-info {
  color: #64748b;
  font-size: 14px;
}

.content-body {
  padding: 24px;
}

.action-bar {
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #e2e8f0;
  color: #334155;
}

.btn-secondary:hover {
  background: #cbd5e1;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-edit {
  background: #fbbf24;
  color: #854d0e;
}

.btn-edit:hover {
  background: #f59e0b;
}

.btn-delete {
  background: #fca5a5;
  color: #991b1b;
}

.btn-delete:hover {
  background: #ef4444;
}

.btn-complete {
  background: #86efac;
  color: #166534;
}

.btn-complete:hover {
  background: #22c55e;
}

.btn-reply {
  background: #60a5fa;
  color: #1e40af;
}

.btn-reply:hover {
  background: #3b82f6;
}

.btn-close {
  background: #d1d5db;
  color: #4b5563;
}

.btn-close:hover {
  background: #9ca3af;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.tab {
  padding: 8px 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.tab.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-table th,
.data-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.data-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #64748b;
  font-size: 14px;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.text-truncate {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.in_progress {
  background: #dbeafe;
  color: #2563eb;
}

.status-badge.completed {
  background: #dcfce7;
  color: #166534;
}

.status-badge.published {
  background: #dcfce7;
  color: #166534;
}

.status-badge.replied {
  background: #dcfce7;
  color: #166534;
}

.status-badge.closed {
  background: #f3f4f6;
  color: #6b7280;
}

.evidence-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #dcfce7;
  color: #166534;
  border-radius: 20px;
  font-size: 12px;
}

.evidence-badge.missing {
  background: #fef3c7;
  color: #d97706;
}

.income {
  color: #16a34a;
  font-weight: 600;
}

.expense {
  color: #dc2626;
  font-weight: 600;
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
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.modal-close {
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: #e2e8f0;
}

.modal-content form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
}

.inquiry-preview {
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.inquiry-preview h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #64748b;
}

.inquiry-preview p {
  margin: 0;
  color: #1e293b;
}
</style>
