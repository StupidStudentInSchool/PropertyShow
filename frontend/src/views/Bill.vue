<script setup lang="ts">import { ref } from 'vue';
import { ElMessage, ElMessageBox, ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElDatePicker } from 'element-plus';
const bills = ref([
 { id: 1, type: 'PROPERTY_FEE', typeText: '物业费', period: '2026-06', houseNumber: '1号楼1单元101室', ownerName: '张业主', amount: 158000, status: 'UNPAID', dueDate: '2026-06-30', createdAt: '2026-06-01' },
 { id: 2, type: 'PARKING_FEE', typeText: '停车费', period: '2026-06', houseNumber: '地下车库B1-023', ownerName: '张业主', amount: 100000, status: 'UNPAID', dueDate: '2026-06-30', createdAt: '2026-06-01' },
 { id: 3, type: 'PROPERTY_FEE', typeText: '物业费', period: '2026-05', houseNumber: '1号楼1单元101室', ownerName: '张业主', amount: 158000, status: 'PAID', dueDate: '2026-05-31', paidAt: '2026-05-15', createdAt: '2026-05-01' },
 { id: 4, type: 'PROPERTY_FEE', typeText: '物业费', period: '2026-04', houseNumber: '2号楼2单元302室', ownerName: '李业主', amount: 180000, status: 'PAID', dueDate: '2026-04-30', paidAt: '2026-04-12', createdAt: '2026-04-01' },
 { id: 5, type: 'WATER', typeText: '水费', period: '2026-06', houseNumber: '1号楼1单元101室', ownerName: '张业主', amount: 8500, status: 'UNPAID', dueDate: '2026-06-25', createdAt: '2026-06-10' },
 { id: 6, type: 'ELECTRIC', typeText: '电费', period: '2026-06', houseNumber: '1号楼1单元101室', ownerName: '张业主', amount: 12000, status: 'UNPAID', dueDate: '2026-06-25', createdAt: '2026-06-10' }
]);
const billTypes = [
 { value: 'PROPERTY_FEE', label: '物业费' },
 { value: 'PARKING_FEE', label: '停车费' },
 { value: 'WATER', label: '水费' },
 { value: 'ELECTRIC', label: '电费' },
 { value: 'GAS', label: '燃气费' },
 { value: 'OTHER', label: '其他费用' }
];
const showModal = ref(false);
const isEdit = ref(false);
const formData = ref({
 id: 0,
 type: 'PROPERTY_FEE',
 period: '',
 houseNumber: '',
 ownerName: '',
 amount: '',
 dueDate: ''
});
const openModal = (edit = false, data?: any) => {
 isEdit.value = edit;
 if (edit && data) {
 formData.value = { ...data, amount: data.amount.toString() };
 }
 else {
 formData.value = {
 id: 0,
 type: 'PROPERTY_FEE',
 period: '',
 houseNumber: '',
 ownerName: '',
 amount: '',
 dueDate: ''
 };
 }
 showModal.value = true;
};
const closeModal = () => {
 showModal.value = false;
};
const saveBill = () => {
 if (!formData.value.type || !formData.value.period || !formData.value.houseNumber || !formData.value.ownerName || !formData.value.amount || !formData.value.dueDate) {
 ElMessage.warning('请填写完整信息');
 return;
 }
 if (isEdit.value) {
 const index = bills.value.findIndex(b => b.id === formData.value.id);
 if (index !== -1) {
 bills.value[index] = { ...bills.value[index], ...formData.value, amount: Number(formData.value.amount), typeText: billTypes.find(t => t.value === formData.value.type)?.label || '' };
 }
 ElMessage.success('修改成功');
 }
 else {
 const newId = Math.max(...bills.value.map(b => b.id)) + 1;
 const { id: _, ...rest } = formData.value;
 bills.value.unshift({
 id: newId,
 ...rest,
 amount: Number(formData.value.amount),
 typeText: billTypes.find(t => t.value === formData.value.type)?.label || '',
 status: 'UNPAID',
 createdAt: new Date().toLocaleDateString('zh-CN')
 });
 ElMessage.success('新增账单成功');
 }
 closeModal();
};
const deleteBill = (id: number) => {
 ElMessageBox.confirm('确定要删除这个账单吗？', '提示', {
 confirmButtonText: '确定',
 cancelButtonText: '取消',
 type: 'warning'
 }).then(() => {
 bills.value = bills.value.filter(b => b.id !== id);
 ElMessage.success('删除成功');
 }).catch(() => {});
};
const statusFilter = ref('');
const markAsPaid = (id: number) => {
 const index = bills.value.findIndex(b => b.id === id);
 if (index !== -1) {
 bills.value[index].status = 'PAID';
 bills.value[index].paidAt = new Date().toLocaleString('zh-CN');
 ElMessage.success('已标记为已支付');
 }
};
const formatAmount = (cents: number) => {
 return (cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2 });
};
const getStatusText = (status: string) => {
 return status === 'PAID' ? '已支付' : '待支付';
};
const getStatusClass = (status: string) => {
 return status === 'PAID' ? 'status-paid' : 'status-unpaid';
};
</script>

<template>
  <div class="bill-container">
    <div class="page-header">
      <h2>账单管理</h2>
      <div class="header-right">
        <el-select v-model="statusFilter" placeholder="全部状态" style="width: 120px;">
          <el-option label="全部" value="" />
          <el-option label="待支付" value="UNPAID" />
          <el-option label="已支付" value="PAID" />
        </el-select>
        <el-button type="primary" icon="Plus" @click="openModal()">
          新增账单
        </el-button>
      </div>
    </div>

    <el-card class="data-card">
      <el-table :data="bills" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column 
          prop="typeText" 
          label="账单类型" 
          width="120"
        />
        <el-table-column 
          prop="period" 
          label="账期" 
          width="100"
        >
          <template #default="scope">
            <span class="period-item">
              <Calendar class="period-icon" />
              {{ scope.row.period }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="houseNumber" label="房号" width="140" />
        <el-table-column 
          prop="ownerName" 
          label="业主" 
          width="100"
        >
          <template #default="scope">
            <span class="owner-item">
              <User class="owner-icon" />
              {{ scope.row.ownerName }}
            </span>
          </template>
        </el-table-column>
        <el-table-column 
          prop="amount" 
          label="金额" 
          width="140"
        >
          <template #default="scope">
            <span :class="scope.row.status === 'PAID' ? 'amount-paid' : 'amount-unpaid'">
              ¥{{ formatAmount(scope.row.amount) }}
            </span>
          </template>
        </el-table-column>
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
        <el-table-column prop="dueDate" label="截止日期" width="120" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button type="text" icon="Edit" size="small" @click="openModal(true, scope.row)">编辑</el-button>
            <el-button 
              v-if="scope.row.status === 'UNPAID'"
              type="success" 
              icon="Check" 
              size="small" 
              @click="markAsPaid(scope.row.id)"
            >标记支付</el-button>
            <el-button type="text" icon="Trash2" size="small" class="delete-btn" @click="deleteBill(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="isEdit ? '编辑账单' : '新增账单'" :visible="showModal" @close="closeModal" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="账单类型" required>
          <el-select v-model="formData.type" placeholder="请选择类型">
            <el-option v-for="type in billTypes" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="账期" required>
          <el-input v-model="formData.period" placeholder="格式: YYYY-MM" />
        </el-form-item>
        
        <el-form-item label="房号" required>
          <el-input v-model="formData.houseNumber" placeholder="请输入房号" />
        </el-form-item>
        
        <el-form-item label="业主姓名" required>
          <el-input v-model="formData.ownerName" placeholder="请输入业主姓名" />
        </el-form-item>
        
        <el-form-item label="金额" required>
          <el-input v-model="formData.amount" placeholder="请输入金额（分）" />
        </el-form-item>
        
        <el-form-item label="截止日期" required>
          <el-date-picker v-model="formData.dueDate" type="date" placeholder="请选择截止日期" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="closeModal">取消</el-button>
        <el-button type="primary" @click="saveBill">{{ isEdit ? '保存修改' : '确认新增' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.bill-container {
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

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.data-card {
  min-height: 400px;
}

.period-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.period-icon {
  font-size: 14px;
  color: #1890ff;
}

.owner-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.owner-icon {
  font-size: 14px;
  color: #666;
}

.amount-paid {
  color: #52c41a;
  font-weight: 600;
}

.amount-unpaid {
  color: #f5222d;
  font-weight: 600;
}

.status-paid {
  background: #f6ffed;
  color: #52c41a;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
}

.status-unpaid {
  background: #fff2f0;
  color: #f5222d;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
}

.delete-btn {
  color: #f5222d;
}
</style>