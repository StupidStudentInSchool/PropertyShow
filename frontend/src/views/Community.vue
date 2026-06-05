<script setup lang="ts">import { ref } from 'vue';
import { ElMessage, ElMessageBox, ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElSwitch } from 'element-plus';
const communities = ref([
 { id: 1, name: '阳光花园示范小区', address: '北京市朝阳区示范路1号', contactPhone: '010-12345678', totalHouseholds: 500, registeredHouseholds: 485, status: 'ACTIVE', createdAt: '2026-01-15' },
 { id: 2, name: '幸福家园小区', address: '北京市海淀区幸福路88号', contactPhone: '010-87654321', totalHouseholds: 800, registeredHouseholds: 720, status: 'ACTIVE', createdAt: '2026-02-20' },
 { id: 3, name: '和谐小区', address: '北京市西城区和谐街16号', contactPhone: '010-24681357', totalHouseholds: 300, registeredHouseholds: 280, status: 'INACTIVE', createdAt: '2026-03-10' },
 { id: 4, name: '绿洲花园', address: '北京市东城区绿洲路99号', contactPhone: '010-13579246', totalHouseholds: 650, registeredHouseholds: 600, status: 'ACTIVE', createdAt: '2026-04-05' }
]);
const showModal = ref(false);
const isEdit = ref(false);
const formData = ref({
 id: 0,
 name: '',
 address: '',
 contactPhone: '',
 totalHouseholds: '',
 status: 'ACTIVE'
});
const openModal = (edit = false, data?: any) => {
 isEdit.value = edit;
 if (edit && data) {
 formData.value = { ...data, totalHouseholds: data.totalHouseholds.toString() };
 }
 else {
 formData.value = {
 id: 0,
 name: '',
 address: '',
 contactPhone: '',
 totalHouseholds: '',
 status: 'ACTIVE'
 };
 }
 showModal.value = true;
};
const closeModal = () => {
 showModal.value = false;
};
const saveCommunity = () => {
 if (!formData.value.name || !formData.value.address || !formData.value.contactPhone) {
 ElMessage.warning('请填写完整信息');
 return;
 }
 if (isEdit.value) {
 const index = communities.value.findIndex(c => c.id === formData.value.id);
 if (index !== -1) {
 communities.value[index] = { 
 ...communities.value[index],
 ...formData.value, 
 totalHouseholds: Number(formData.value.totalHouseholds) 
 };
 }
 ElMessage.success('修改成功');
 }
 else {
 const newId = Math.max(...communities.value.map(c => c.id)) + 1;
 const { id: _, ...rest } = formData.value;
 communities.value.unshift({
 id: newId,
 ...rest,
 totalHouseholds: Number(formData.value.totalHouseholds),
 registeredHouseholds: 0,
 createdAt: new Date().toLocaleDateString('zh-CN')
 });
 ElMessage.success('新增小区成功');
 }
 closeModal();
};
const deleteCommunity = (id: number) => {
 ElMessageBox.confirm('确定要删除这个小区吗？', '提示', {
 confirmButtonText: '确定',
 cancelButtonText: '取消',
 type: 'warning'
 }).then(() => {
 communities.value = communities.value.filter(c => c.id !== id);
 ElMessage.success('删除成功');
 }).catch(() => {});
};
const toggleStatus = (row: any) => {
 row.status = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
 ElMessage.success(`小区已${row.status === 'ACTIVE' ? '启用' : '停用'}`);
};
const getRegistrationRate = (registered: number, total: number) => {
 return Math.round((registered / total) * 100);
};
</script>

<template>
  <div class="community-container">
    <div class="page-header">
      <h2>小区管理</h2>
      <el-button type="primary" icon="Plus" @click="openModal()">
        新增小区
      </el-button>
    </div>

    <el-card class="data-card">
      <el-table :data="communities" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="小区名称" min-width="180" />
        <el-table-column prop="address" label="地址" min-width="200" />
        <el-table-column prop="contactPhone" label="联系电话" width="140" />
        <el-table-column label="总户数" width="100" prop="totalHouseholds" />
        <el-table-column label="已注册" width="100" prop="registeredHouseholds" />
        <el-table-column label="注册率" width="100">
          <template #default="scope">
            {{ getRegistrationRate(scope.row.registeredHouseholds, scope.row.totalHouseholds) }}%
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-switch 
              :value="scope.row.status === 'ACTIVE'" 
              @change="toggleStatus(scope.row)"
              active-text="正常"
              inactive-text="停用"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="120" />
        <el-table-column label="操作" width="140">
          <template #default="scope">
            <el-button type="text" icon="Edit" size="small" @click="openModal(true, scope.row)">编辑</el-button>
            <el-button type="text" icon="Trash2" size="small" class="delete-btn" @click="deleteCommunity(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="isEdit ? '编辑小区' : '新增小区'" :visible="showModal" @close="closeModal" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="小区名称" required>
          <el-input v-model="formData.name" placeholder="请输入小区名称" />
        </el-form-item>
        
        <el-form-item label="地址" required>
          <el-input v-model="formData.address" placeholder="请输入小区地址" />
        </el-form-item>
        
        <el-form-item label="联系电话" required>
          <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        
        <el-form-item label="总户数">
          <el-input v-model="formData.totalHouseholds" type="number" placeholder="请输入总户数" />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="formData.status">
            <el-option label="正常" value="ACTIVE" />
            <el-option label="停用" value="INACTIVE" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="closeModal">取消</el-button>
        <el-button type="primary" @click="saveCommunity">{{ isEdit ? '保存修改' : '确认新增' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.community-container {
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

.data-card {
  min-height: 400px;
}

.address-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.address-icon {
  font-size: 14px;
  color: #1890ff;
}

.household-info {
  display: flex;
  gap: 16px;
}

.household-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.household-icon {
  font-size: 14px;
  color: #666;
}

.status-active {
  color: #52c41a;
}

.status-inactive {
  color: #999;
}

.delete-btn {
  color: #f5222d;
}
</style>