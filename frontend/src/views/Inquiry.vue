<script setup lang="ts">import { ref } from 'vue';
import { ElMessage, ElMessageBox, ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput } from 'element-plus';
const statusFilter = ref('');
const inquiries = ref([
 { id: 1, title: '关于6月份物业费明细的质询', content: '我想了解6月份物业费的具体支出明细，特别是安保服务和设备维保的费用。', author: '张业主', authorId: 'U001', status: 'REPLIED', createdAt: '2026-06-03 10:30', repliedAt: '2026-06-04 14:20', replyContent: '您好，6月份安保服务费用为18万元，设备维保费用为13万元，具体明细已公示在财务公示页面。' },
 { id: 2, title: '关于小区电梯维保的质询', content: '请问电梯维保的具体时间安排是怎样的？', author: '李业主', authorId: 'U002', status: 'PENDING', createdAt: '2026-06-05 09:00' },
 { id: 3, title: '关于绿化养护费用的质询', content: '绿化养护费用是否包含在物业费中？', author: '王业主', authorId: 'U003', status: 'REPLIED', createdAt: '2026-06-02 15:00', repliedAt: '2026-06-03 10:00', replyContent: '是的，绿化养护费用包含在物业费中，每月预算5万元。' },
 { id: 4, title: '关于公共区域照明的质询', content: '建议增加公共区域的照明设施，特别是地下车库部分。', author: '赵业主', authorId: 'U004', status: 'CLOSED', createdAt: '2026-05-28 11:00', repliedAt: '2026-05-29 14:00', replyContent: '感谢您的建议，我们已安排在地下车库增加照明设施，预计本月底完成。', closedAt: '2026-06-01' }
]);
const showReplyModal = ref(false);
const currentInquiry = ref<any>(null);
const replyContent = ref('');
const openReplyModal = (inquiry: any) => {
 currentInquiry.value = inquiry;
 replyContent.value = '';
 showReplyModal.value = true;
};
const closeReplyModal = () => {
 showReplyModal.value = false;
 currentInquiry.value = null;
};
const submitReply = () => {
 if (!replyContent.value.trim()) {
 ElMessage.warning('请输入回复内容');
 return;
 }
 const index = inquiries.value.findIndex(i => i.id === currentInquiry.value.id);
 if (index !== -1) {
 inquiries.value[index] = {
 ...inquiries.value[index],
 status: 'REPLIED',
 replyContent: replyContent.value,
 repliedAt: new Date().toLocaleString('zh-CN')
 };
 }
 ElMessage.success('回复成功');
 closeReplyModal();
};
const filterForm = ref({ replyContent: '' });
const closeInquiry = (id: number) => {
 ElMessageBox.confirm('确定要关闭这个质询吗？', '提示', {
 confirmButtonText: '确定',
 cancelButtonText: '取消',
 type: 'warning'
 }).then(() => {
 const index = inquiries.value.findIndex(i => i.id === id);
 if (index !== -1) {
 inquiries.value[index].status = 'CLOSED';
 inquiries.value[index].closedAt = new Date().toLocaleString('zh-CN');
 }
 ElMessage.success('已关闭');
 }).catch(() => {});
};
const deleteInquiry = (id: number) => {
 ElMessageBox.confirm('确定要删除这个质询吗？', '提示', {
 confirmButtonText: '确定',
 cancelButtonText: '取消',
 type: 'warning'
 }).then(() => {
 inquiries.value = inquiries.value.filter(i => i.id !== id);
 ElMessage.success('删除成功');
 }).catch(() => {});
};
const getStatusText = (status: string) => {
 const statusMap: Record<string, string> = {
 PENDING: '待回复',
 REPLIED: '已回复',
 CLOSED: '已关闭',
 REJECTED: '已驳回'
 };
 return statusMap[status] || status;
};
const getStatusClass = (status: string) => {
 const classMap: Record<string, string> = {
 PENDING: 'status-pending',
 REPLIED: 'status-replied',
 CLOSED: 'status-closed',
 REJECTED: 'status-rejected'
 };
 return classMap[status] || '';
};
</script>

<template>
  <div class="inquiry-container">
    <div class="page-header">
      <h2>业主质询管理</h2>
      <div class="filter-bar">
        <el-select v-model="statusFilter" placeholder="全部状态">
          <el-option label="全部" value="" />
          <el-option label="待回复" value="PENDING" />
          <el-option label="已回复" value="REPLIED" />
          <el-option label="已关闭" value="CLOSED" />
        </el-select>
      </div>
    </div>

    <el-card class="data-card">
      <el-table :data="inquiries" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="质询标题" min-width="200" />
        <el-table-column prop="author" label="质询人" width="100" />
        <el-table-column 
          prop="status" 
          label="状态" 
          width="100"
        >
          <template #default="scope">
            <span :class="getStatusClass(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="质询时间" width="160" />
        <el-table-column label="回复内容" min-width="200">
          <template #default="scope">
            <div v-if="scope.row.replyContent" class="reply-preview">{{ scope.row.replyContent }}</div>
            <span v-else class="no-reply">暂无回复</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 'PENDING'"
              type="primary" 
              icon="Reply" 
              size="small" 
              @click="openReplyModal(scope.row)"
            >回复</el-button>
            <el-button 
              v-if="scope.row.status === 'REPLIED'"
              type="success" 
              icon="Check" 
              size="small"
            >已回复</el-button>
            <el-button 
              v-if="scope.row.status !== 'CLOSED'"
              type="warning" 
              icon="X" 
              size="small" 
              @click="closeInquiry(scope.row.id)"
            >关闭</el-button>
            <el-button type="text" icon="Trash2" size="small" class="delete-btn" @click="deleteInquiry(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 回复弹窗 -->
    <el-dialog title="回复质询" :visible="showReplyModal" @close="closeReplyModal" width="500px">
      <div v-if="currentInquiry" class="inquiry-detail">
        <h4>{{ currentInquiry.title }}</h4>
        <p class="inquiry-content">{{ currentInquiry.content }}</p>
        <p class="inquiry-meta">质询人：{{ currentInquiry.author }} | {{ currentInquiry.createdAt }}</p>
      </div>
      
      <el-form :model="filterForm" label-width="60px" style="margin-top: 20px;">
        <el-form-item label="回复">
          <el-input v-model="replyContent" type="textarea" :rows="4" placeholder="请输入回复内容" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="closeReplyModal">取消</el-button>
        <el-button type="primary" @click="submitReply">发送回复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.inquiry-container {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
}

.filter-bar {
  display: flex;
  gap: 12px;
}

.data-card {
  min-height: 400px;
}

.status-pending {
  background: #fff7e6;
  color: #fa8c16;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
}

.status-replied {
  background: #f6ffed;
  color: #52c41a;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
}

.status-closed {
  background: #f5f5f5;
  color: #999;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
}

.status-rejected {
  background: #fff2f0;
  color: #f5222d;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
}

.reply-preview {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.no-reply {
  color: #999;
  font-size: 13px;
}

.inquiry-detail {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.inquiry-detail h4 {
  margin: 0 0 12px;
}

.inquiry-content {
  margin: 0 0 12px;
  color: #666;
  line-height: 1.5;
}

.inquiry-meta {
  margin: 0;
  font-size: 13px;
  color: #999;
}

.delete-btn {
  color: #f5222d;
}
</style>