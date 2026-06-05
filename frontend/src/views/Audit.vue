<script setup lang="ts">import { ref } from 'vue';
import { ElTable, ElTableColumn, ElButton, ElSelect, ElDatePicker } from 'element-plus';
const auditLogs = ref([
 { id: 1, type: 'JOURNAL_CREATE', typeText: '新增收支', operator: '物业管理员', target: '财务台账', description: '新增收入记录：物业费收入 850000分', time: '2026-06-15 10:30:25', ip: '192.168.1.100' },
 { id: 2, type: 'JOURNAL_UPDATE', typeText: '修改收支', operator: '物业管理员', target: '财务台账', description: '修改支出记录：保洁服务费用调整为150000分', time: '2026-06-15 09:45:12', ip: '192.168.1.100' },
 { id: 3, type: 'VOTE_CREATE', typeText: '发起投票', operator: '业委会成员', target: '业主共治', description: '发起投票：小区绿化改造项目投票', time: '2026-06-14 16:20:33', ip: '192.168.1.105' },
 { id: 4, type: 'INQUIRY_REPLY', typeText: '回复质询', operator: '物业管理员', target: '业主质询', description: '回复张业主关于物业费明细的质询', time: '2026-06-14 14:20:08', ip: '192.168.1.100' },
 { id: 5, type: 'BILL_GENERATE', typeText: '生成账单', operator: '系统', target: '账单管理', description: '自动生成2026年6月物业费账单', time: '2026-06-14 00:00:00', ip: '127.0.0.1' },
 { id: 6, type: 'USER_LOGIN', typeText: '用户登录', operator: '张业主', target: '认证系统', description: '业主登录系统', time: '2026-06-14 08:30:15', ip: '192.168.1.101' },
 { id: 7, type: 'HASH_VERIFY', typeText: '哈希校验', operator: '系统', target: '审计系统', description: '校验财务数据哈希链，结果：正常', time: '2026-06-14 02:00:00', ip: '127.0.0.1' },
 { id: 8, type: 'ANOMALY_DETECT', typeText: '异常检测', operator: '系统', target: '审计系统', description: '检测到异常支出：单次支出超过月度预算10%', time: '2026-06-13 15:45:32', ip: '127.0.0.1' },
 { id: 9, type: 'COMMUNITY_CREATE', typeText: '新增小区', operator: '平台管理员', target: '小区管理', description: '新增小区：绿洲花园', time: '2026-06-13 10:00:00', ip: '192.168.1.102' },
 { id: 10, type: 'EVIDENCE_UPLOAD', typeText: '上传凭证', operator: '物业管理员', target: '财务台账', description: '上传凭证文件：凭证1.pdf', time: '2026-06-12 11:30:45', ip: '192.168.1.100' }
]);
const filterType = ref('');
const filterOperator = ref('');
const startTime = ref('');
const endTime = ref('');
const logTypes = [
 { value: 'JOURNAL_CREATE', label: '新增收支' },
 { value: 'JOURNAL_UPDATE', label: '修改收支' },
 { value: 'JOURNAL_DELETE', label: '删除收支' },
 { value: 'VOTE_CREATE', label: '发起投票' },
 { value: 'INQUIRY_REPLY', label: '回复质询' },
 { value: 'BILL_GENERATE', label: '生成账单' },
 { value: 'USER_LOGIN', label: '用户登录' },
 { value: 'HASH_VERIFY', label: '哈希校验' },
 { value: 'ANOMALY_DETECT', label: '异常检测' },
 { value: 'COMMUNITY_CREATE', label: '新增小区' },
 { value: 'EVIDENCE_UPLOAD', label: '上传凭证' }
];
const operators = ['物业管理员', '业委会成员', '平台管理员', '系统', '张业主', '李业主'];
const getTypeColor = (type: string) => {
 const colorMap: Record<string, string> = {
 JOURNAL_CREATE: '#52c41a',
 JOURNAL_UPDATE: '#1890ff',
 JOURNAL_DELETE: '#f5222d',
 VOTE_CREATE: '#722ed1',
 INQUIRY_REPLY: '#fa8c16',
 BILL_GENERATE: '#52c41a',
 USER_LOGIN: '#1890ff',
 HASH_VERIFY: '#52c41a',
 ANOMALY_DETECT: '#f5222d',
 COMMUNITY_CREATE: '#1890ff',
 EVIDENCE_UPLOAD: '#fa8c16'
 };
 return colorMap[type] || '#666';
};
const exportLogs = () => {
 alert('导出审计日志功能');
};
</script>

<template>
  <div class="audit-container">
    <div class="page-header">
      <h2>审计日志</h2>
      <el-button type="primary" icon="Download" @click="exportLogs()">
        导出日志
      </el-button>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card">
      <div class="filter-row">
        <el-select v-model="filterType" placeholder="操作类型" style="width: 160px;">
          <el-option label="全部" value="" />
          <el-option v-for="type in logTypes" :key="type.value" :label="type.label" :value="type.value" />
        </el-select>
        
        <el-select v-model="filterOperator" placeholder="操作人" style="width: 140px;">
          <el-option label="全部" value="" />
          <el-option v-for="op in operators" :key="op" :label="op" :value="op" />
        </el-select>
        
        <el-date-picker v-model="startTime" type="date" placeholder="开始时间" style="width: 160px;" />
        
        <el-date-picker v-model="endTime" type="date" placeholder="结束时间" style="width: 160px;" />
        
        <el-button type="primary" icon="Filter">
          筛选
        </el-button>
      </div>
    </el-card>

    <el-card class="data-card">
      <el-table :data="auditLogs" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column 
          prop="typeText" 
          label="操作类型" 
          width="140"
        >
          <template #default="scope">
            <span class="type-item" :style="{ color: getTypeColor(scope.row.type) }">
              {{ scope.row.typeText }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="target" label="操作对象" width="120" />
        <el-table-column prop="description" label="操作描述" min-width="250" />
        <el-table-column prop="time" label="操作时间" width="180" />
        <el-table-column prop="ip" label="IP地址" width="140" />
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.audit-container {
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

.filter-card {
  margin-bottom: 24px;
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.data-card {
  min-height: 400px;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-icon {
  font-size: 16px;
}

.operator-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.operator-icon {
  font-size: 14px;
  color: #666;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-icon {
  font-size: 14px;
  color: #1890ff;
}
</style>