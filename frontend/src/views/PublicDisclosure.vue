<template>
  <div class="public-disclosure">
    <header class="header">
      <div class="header-content">
        <div class="community-info">
          <h1>{{ communityInfo.name }}</h1>
          <p class="address">{{ communityInfo.address }}</p>
        </div>
        <div class="header-right">
          <div class="date-weather">
            <span class="date">{{ currentDate }}</span>
            <span class="weather">{{ weather }}</span>
          </div>
          <div class="notice-carousel">
            <div class="carousel-content">
              <transition name="fade">
                <div :key="currentNoticeIndex" class="notice-item">
                  <span class="notice-icon">{{ importantNotices[currentNoticeIndex]?.icon }}</span>
                  <span class="notice-text">{{ importantNotices[currentNoticeIndex]?.title }}</span>
                </div>
              </transition>
            </div>
          </div>
          <button class="feedback-btn" @click="showFeedbackModal = true">
            意见反馈
          </button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <!-- 月份选择器 - 突出显示 -->
      <div class="month-highlight">
        <div class="month-display">
          <span class="month-label">当前公示月份</span>
          <span class="month-value">{{ currentMonthLabel }}</span>
        </div>
        <div class="month-selector-wrapper">
          <select v-model="selectedMonth" @change="changeMonth" class="month-select">
            <option v-for="month in availableMonths" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
        </div>
        <div class="refresh-action">
          <button class="refresh-btn" @click="refreshData" :disabled="isRefreshing">
            {{ isRefreshing ? '刷新中...' : '刷新数据' }}
          </button>
        </div>
      </div>

      <!-- 公告通知与日常服务记录同行布局 -->
      <div class="finance-service-row">
        <!-- 公告通知 -->
        <section class="notice-section section-wrapper">
          <div class="section-header">
            <h2>公告通知</h2>
            <span class="notice-count">{{ importantNotices.length }}条公告</span>
          </div>

          <div class="notice-cards">
            <div v-for="notice in importantNotices" :key="notice.id" :class="['notice-card', notice.type]">
              <div class="notice-header">
                <span :class="['notice-tag', notice.type]">{{ notice.icon }}</span>
                <span class="notice-date">{{ formatDate(notice.createdAt) }}</span>
              </div>
              <h3 class="notice-title">{{ notice.title }}</h3>
              <p class="notice-content">{{ notice.content }}</p>
              <div class="notice-footer">
                <span :class="['notice-type-badge', notice.type]">
                  {{ notice.type === 'warning' ? '重要' : notice.type === 'success' ? '活动' : '通知' }}
                </span>
              </div>
            </div>
          </div>

          <div class="tips-section">
            <h3>温馨提示</h3>
            <div class="tips-grid">
              <div v-for="(tip, index) in tips" :key="index" class="tip-card">
                <span class="tip-icon">提示</span>
                <span class="tip-text">{{ tip }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 日常服务记录 - 带图片展示 -->
        <section class="daily-service-section section-wrapper">
          <div class="section-header">
            <h2>日常服务记录</h2>
            <span class="service-date">{{ currentDate }}</span>
          </div>
          <div class="service-gallery-scroll">
            <div class="service-gallery">
              <div v-for="service in dailyServices" :key="service.id" class="service-card">
                <div class="service-image-wrapper">
                  <img :src="service.image" :alt="service.title" class="service-image" />
                </div>
                <div class="service-info">
                  <h3>{{ service.title }}</h3>
                  <p class="service-description">{{ service.description }}</p>
                  <div class="service-meta">
                    <span class="service-time">{{ service.time }}</span>
                    <span class="service-staff">{{ service.staff }}</span>
                  </div>
                  <div :class="['service-status', service.status]">
                    {{ service.statusText }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="service-stats">
            <div class="stat-card">
              <span class="stat-number">{{ dailyServiceStats.completed }}</span>
              <span class="stat-label">今日已完成</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{ dailyServiceStats.inProgress }}</span>
              <span class="stat-label">进行中</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{ dailyServiceStats.total }}</span>
              <span class="stat-label">今日计划</span>
            </div>
          </div>
        </section>
      </div>

      <!-- 本月收支明细 -->
      <div class="notice-inquiry-row">
        <section class="finance-highlight-section section-wrapper">
          <div class="section-header">
            <h2>本月收支明细</h2>
            <div class="income-expense-tabs">
              <button :class="['tab', { active: activeTab === 'income' }]" @click="activeTab = 'income'">收入明细</button>
              <button :class="['tab', { active: activeTab === 'expense' }]" @click="activeTab = 'expense'">支出明细</button>
            </div>
          </div>
          <div class="finance-summary-cards">
          <div class="summary-card income-summary">
            <div class="summary-header">
              <span class="summary-label">本月收入</span>
              <span class="summary-amount">¥{{ formatNumber(financialSummary.monthlyIncome) }}</span>
            </div>
            <div class="summary-trend" :class="financialSummary.incomeChange >= 0 ? 'up' : 'down'">
              {{ financialSummary.incomeChange >= 0 ? '↑' : '↓' }} {{ Math.abs(financialSummary.incomeChange) }}%
              <span class="trend-label">较上月</span>
            </div>
          </div>
          <div class="summary-card expense-summary">
            <div class="summary-header">
              <span class="summary-label">本月支出</span>
              <span class="summary-amount">¥{{ formatNumber(financialSummary.monthlyExpense) }}</span>
            </div>
            <div class="summary-trend" :class="financialSummary.expenseChange >= 0 ? 'up' : 'down'">
              {{ financialSummary.expenseChange >= 0 ? '↑' : '↓' }} {{ Math.abs(financialSummary.expenseChange) }}%
              <span class="trend-label">较上月</span>
            </div>
          </div>
          <div class="summary-card balance-summary">
            <div class="summary-header">
              <span class="summary-label">本月结余</span>
              <span class="summary-amount">¥{{ formatNumber(financialSummary.balance) }}</span>
            </div>
            <div class="summary-trend" :class="financialSummary.balanceChange >= 0 ? 'up' : 'down'">
              {{ financialSummary.balanceChange >= 0 ? '↑' : '↓' }} {{ Math.abs(financialSummary.balanceChange) }}%
              <span class="trend-label">较上月</span>
            </div>
          </div>
        </div>
        <table class="detail-table finance-detail-table">
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
            <tr v-for="item in activeTab === 'income' ? incomeList : expenseList" :key="item.id">
              <td>{{ formatDate(item.occurredAt) }}</td>
              <td>{{ item.category }}</td>
              <td :class="activeTab === 'income' ? 'income' : 'expense'">
                {{ activeTab === 'income' ? '+' : '-' }}¥{{ formatNumber(item.amount) }}
              </td>
              <td>{{ item.counterparty || '-' }}</td>
              <td>
                <span v-if="item.hasEvidence" class="evidence-badge">已审</span>
                <span v-else class="evidence-badge missing">待审</span>
              </td>
              <td>
                <button 
                  v-if="item.hasEvidence && item.evidenceUrl" 
                  class="view-evidence-btn" 
                  @click="openEvidence(item)"
                  title="查看凭证"
                >
                  查看凭证
                </button>
                <span v-else class="no-evidence">-</span>
              </td>
            </tr>
          </tbody>
        </table>
        </section>

        <!-- 快速质询模块 -->
        <section class="quick-inquiry-section section-wrapper">
          <div class="section-header">
            <h2>快速质询</h2>
            <div class="response-time">
              <span class="response-badge">承诺3个工作日内回复</span>
            </div>
          </div>
          <div class="inquiry-form-container">
            <textarea
              v-model="quickInquiryContent"
              placeholder="请输入您的质询内容，我们会在3个工作日内回复..."
              rows="3"
              class="inquiry-textarea"
            ></textarea>
            <div class="inquiry-options">
              <label class="checkbox-label">
                <input type="checkbox" v-model="quickInquiryAnonymous" />
                <span>匿名提交</span>
              </label>
              <input
                v-if="!quickInquiryAnonymous"
                v-model="quickInquiryContact"
                type="text"
                placeholder="联系方式（选填）"
                class="inquiry-contact"
              />
            </div>
            <button 
              type="button" 
              class="submit-inquiry-btn" 
              @click="submitQuickInquiry"
              :disabled="!quickInquiryContent.trim()"
            >
              提交质询
            </button>
            <div v-if="inquirySuccess" class="inquiry-success">
              质询已提交！我们会在3个工作日内回复您。
            </div>
          </div>
          <!-- 最近质询记录 -->
          <div class="recent-inquiries">
            <h3>近期质询</h3>
            <div class="inquiry-list">
              <div v-for="inquiry in recentInquiries" :key="inquiry.id" class="inquiry-item">
                <div class="inquiry-content">{{ inquiry.content }}</div>
                <div class="inquiry-meta">
                  <span class="inquiry-time">{{ formatDate(inquiry.createdAt) }}</span>
                  <span :class="['inquiry-status', inquiry.status]">{{ inquiry.statusText }}</span>
                </div>
                <div v-if="inquiry.reply" class="inquiry-reply">
                  <span class="reply-label">回复:</span>
                  <span class="reply-content">{{ inquiry.reply }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 核心数据概览 -->
      <section class="overview-section section-wrapper">
        <div class="section-header">
          <h2>核心数据概览</h2>
          <div class="header-actions">
            <button class="dark-mode-btn" @click="toggleDarkMode">
              {{ isDarkMode ? '日间模式' : '夜间模式' }}
            </button>
            <button class="speech-btn" @click="toggleSpeech" :class="{ active: isSpeechEnabled }">
              {{ isSpeechEnabled ? '语音开' : '语音关' }}
            </button>
          </div>
        </div>
        <div class="overview-cards">
          <div class="card satisfaction-card">
            <div class="card-icon">满意</div>
            <div class="card-content">
              <h3>业主满意度</h3>
              <p class="amount">{{ satisfaction.score }}分</p>
              <p class="sub-text">{{ satisfaction.count }}户参与评价</p>
            </div>
          </div>
          <div class="card participation-card">
            <div class="card-icon">参与</div>
            <div class="card-content">
              <h3>业主参与率</h3>
              <p class="amount">{{ participationRate }}%</p>
              <p class="sub-text">{{ participationData.voteParticipation }}户参与</p>
            </div>
          </div>
          <div class="card response-card">
            <div class="card-icon">响应</div>
            <div class="card-content">
              <h3>平均响应时间</h3>
              <p class="amount">{{ serviceStats.averageResponseTime }}分钟</p>
              <p class="sub-text">维修服务响应</p>
            </div>
          </div>
          <div class="card completion-card">
            <div class="card-icon">完成</div>
            <div class="card-content">
              <h3>任务完成率</h3>
              <p class="amount">{{ serviceStats.completionRate }}%</p>
              <p class="sub-text">本月服务任务</p>
            </div>
          </div>
        </div>

        </section>

      <section class="metrics-section">
        <div class="section-header">
          <h2>服务指标看板</h2>
        </div>
        <div class="metrics-grid">
          <div class="metric-item" v-for="metric in serviceMetrics" :key="metric.name">
            <div class="metric-header">
              <span class="metric-name">{{ metric.name }}</span>
              <span :class="['status-badge', metric.status]">{{ metric.statusText }}</span>
            </div>
            <div class="metric-bar-container">
              <div class="metric-bar" :style="{ width: metric.percentage + '%', backgroundColor: metric.color }"></div>
            </div>
            <div class="metric-footer">
              <span class="current-value">{{ metric.current }}</span>
              <span class="target-value">目标: {{ metric.target }}</span>
            </div>
          </div>
        </div>
      </section>

      <div class="two-columns">
        <section class="participation-section">
          <div class="section-header">
            <h2>业主参与</h2>
          </div>

          <div class="subsection">
            <h3>正在进行的投票</h3>
            <div v-if="votes.length > 0" class="vote-list">
              <div v-for="vote in votes" :key="vote.id" class="vote-card">
                <h4>{{ vote.title }}</h4>
                <div class="vote-meta">
                  <span class="vote-status">{{ vote.statusText }}</span>
                  <span class="vote-time">{{ vote.endTime }}</span>
                </div>
                <div class="vote-progress">
                  <div class="progress-item">
                    <span>参与率</span>
                    <div class="mini-progress">
                      <div class="mini-fill" :style="{ width: vote.participationRate + '%' }"></div>
                    </div>
                    <span>{{ vote.participationRate }}%</span>
                  </div>
                  <div class="progress-item">
                    <span>支持率</span>
                    <div class="mini-progress">
                      <div class="mini-fill support" :style="{ width: vote.supportRate + '%' }"></div>
                    </div>
                    <span>{{ vote.supportRate }}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>暂无进行中的投票</p>
            </div>
          </div>

          <div class="subsection">
            <h3>质询公示</h3>
            <table class="inquiry-table">
              <thead>
                <tr>
                  <th>质询内容</th>
                  <th>发起时间</th>
                  <th>状态</th>
                  <th>回复时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="inquiry in inquiries" :key="inquiry.id">
                  <td class="inquiry-content">{{ inquiry.content }}</td>
                  <td>{{ formatDate(inquiry.createdAt) }}</td>
                  <td>
                    <span :class="['inquiry-status', inquiry.status]">{{ inquiry.statusText }}</span>
                  </td>
                  <td>{{ inquiry.repliedAt ? formatDate(inquiry.repliedAt) : '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>

    <footer class="footer">
      <div class="footer-content">
          <div class="contact-info">
            <h4>物业联系方式</h4>
            <p>客服电话: {{ communityInfo.contactPhone || '400-XXX-XXXX' }}</p>
            <p>服务时间: 24小时</p>
            <p>办公地址: 小区会所1层</p>
          </div>
          <div class="service-promise">
            <h4>服务承诺</h4>
            <ul>
              <li>• 维修响应: 2小时内响应，24小时内完成</li>
              <li>• 保洁标准: 每日2次公共区域清洁</li>
              <li>• 安全巡逻: 每小时巡逻一次</li>
              <li>• 质询回复: 3个工作日内回复</li>
            </ul>
          </div>
          <div class="data-verification">
            <h4>数据校验</h4>
            <div class="verify-buttons">
              <button class="verify-btn" @click="showHashModal = true">验证数据完整性</button>
              <button class="verify-btn export-btn" @click="exportData">导出数据</button>
            </div>
            <p class="verify-hint">所有数据支持哈希校验</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>数据更新时间: {{ lastUpdateTime }}</p>
          <p>© 2026 {{ communityInfo.name }} 物业公示平台</p>
        </div>
      </footer>

      <!-- 刷新提示 -->
      <transition name="fade">
        <div v-if="showRefreshToast" class="refresh-toast">
          数据已更新
        </div>
      </transition>

      <!-- 哈希校验弹窗 -->
      <div v-if="showHashModal" class="modal-overlay" @click="showHashModal = false">
        <div class="modal-content hash-modal" @click.stop>
          <div class="modal-header">
            <h3>数据哈希校验</h3>
            <button class="close-btn" @click="showHashModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="hash-info">
              <p>通过哈希校验，您可以验证公示数据的完整性和真实性。</p>
              <p>本月数据哈希值: <code>{{ monthlyHash }}</code></p>
            </div>
            <div class="hash-form">
              <label>输入数据内容:</label>
              <textarea v-model="hashInputData" placeholder="粘贴需要校验的数据..." rows="4"></textarea>
              <label>预期哈希值:</label>
              <input v-model="hashExpected" type="text" placeholder="输入预期哈希值..." />
              <button class="verify-submit-btn" @click="verifyHash" :disabled="!hashInputData || !hashExpected">
                验证哈希
              </button>
            </div>
            <div v-if="hashResult !== null" :class="['hash-result', hashResult ? 'success' : 'error']">
              {{ hashResult ? '哈希验证通过！数据完整未被篡改。' : '哈希验证失败！数据可能已被篡改。' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 凭证查看弹窗 -->
      <div v-if="showEvidenceModal" class="modal-overlay" @click="showEvidenceModal = false">
        <div class="modal-content evidence-modal" @click.stop>
          <div class="modal-header">
            <h3>凭证详情</h3>
            <button class="close-btn" @click="showEvidenceModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="evidence-preview">
              <img v-if="selectedEvidence?.evidenceUrl" :src="selectedEvidence.evidenceUrl" alt="凭证图片" class="evidence-image" />
              <div v-else class="evidence-image-placeholder">
                <span>凭证</span>
                <p>凭证图片预览</p>
              </div>
            </div>
            <div class="evidence-details">
              <div class="evidence-field">
                <label>类别:</label>
                <span>{{ selectedEvidence?.category || '-' }}</span>
              </div>
              <div class="evidence-field">
                <label>金额:</label>
                <span :class="['amount', incomeList.find(i => i.id === selectedEvidence?.id) ? 'income' : 'expense']">
                  {{ incomeList.find(i => i.id === selectedEvidence?.id) ? '+' : '-' }}¥{{ formatNumber(selectedEvidence?.amount || 0) }}
                </span>
              </div>
              <div class="evidence-field">
                <label>日期:</label>
                <span>{{ formatDate(selectedEvidence?.occurredAt || new Date().toISOString()) }}</span>
              </div>
              <div class="evidence-field">
                <label>对方单位:</label>
                <span>{{ selectedEvidence?.counterparty || '-' }}</span>
              </div>
              <div class="evidence-field">
                <label>状态:</label>
                <span :class="['evidence-status', selectedEvidence?.hasEvidence ? 'verified' : 'pending']">
                  {{ selectedEvidence?.hasEvidence ? '已验证' : '待审核' }}
                </span>
              </div>
            </div>
            <div class="evidence-actions">
              <button class="download-btn">下载凭证</button>
              <button class="verify-evidence-btn" @click="showHashModal = true">验证凭证</button>
            </div>
          </div>
        </div>
      </div>

    <div v-if="showFeedbackModal" class="modal-overlay" @click="showFeedbackModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>意见反馈</h3>
          <button class="close-btn" @click="showFeedbackModal = false">×</button>
        </div>
        <form @submit.prevent="submitFeedback" class="feedback-form">
          <textarea
            v-model="feedbackContent"
            placeholder="请输入您的意见或建议..."
            rows="5"
            required
          ></textarea>
          <div class="feedback-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="feedbackAnonymous" />
              <span>匿名反馈</span>
            </label>
          </div>
          <input
            v-if="!feedbackAnonymous"
            v-model="feedbackContact"
            type="text"
            placeholder="请输入联系方式（选填）"
          />
          <button type="submit" class="submit-btn">提交反馈</button>
        </form>
        <div v-if="feedbackSuccess" class="success-message">
          感谢您的反馈！我们会尽快处理。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { publicDisclosureApi, serviceRecordApi, inquiryApi } from '@/api/public';
import { Line, Radar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

interface CommunityInfo {
  name: string;
  address: string;
  contactPhone?: string;
  totalHouseholds?: number;
}

interface FinancialSummary {
  monthlyIncome: number;
  monthlyExpense: number;
  balance: number;
  incomeChange: number;
  expenseChange: number;
  balanceChange: number;
}

interface ServiceMetric {
  name: string;
  current: string;
  target: string;
  percentage: number;
  status: string;
  statusText: string;
  color: string;
}

interface Transaction {
  id: number;
  occurredAt: string;
  category: string;
  amount: number;
  counterparty: string;
  hasEvidence: boolean;
  evidenceUrl?: string;
}

interface MaintenanceFund {
  balance: number;
  change: number;
  totalUsed: number;
}

interface DailyTasks {
  patrolPlan: number;
  patrolCompleted: number;
  patrolStaff: string;
}

interface Equipment {
  id: number;
  name: string;
  location: string;
  status: string;
  statusText: string;
  icon: string;
}

interface TodoStats {
  completed: number;
  progress: number;
  pending: number;
}

interface Vote {
  id: number;
  title: string;
  statusText: string;
  endTime: string;
  participationRate: number;
  supportRate: number;
}

interface Inquiry {
  id: number;
  content: string;
  createdAt: string;
  status: string;
  statusText: string;
  repliedAt?: string;
}

interface Notice {
  id: number;
  title: string;
  icon: string;
  createdAt: string;
  type: string;
  content: string;
}

interface Satisfaction {
  score: number;
  count: number;
  updatedAt: string;
}

interface ServiceRecord {
  id: number;
  title: string;
  description: string;
  image: string;
  time: string;
  staff: string;
  status: string;
  statusText: string;
}

interface RecentInquiry {
  id: number;
  content: string;
  createdAt: string;
  status: string;
  statusText: string;
  reply?: string;
}

interface ServiceStats {
  averageResponseTime: number;
  completionRate: number;
}

interface DailyServiceStats {
  completed: number;
  inProgress: number;
  total: number;
}

const communityInfo = ref<CommunityInfo>({
  name: '阳光花园示范小区',
  address: '北京市朝阳区示范路1号',
  contactPhone: '010-12345678',
  totalHouseholds: 480,
});

const financialSummary = ref<FinancialSummary>({
  monthlyIncome: 156800,
  monthlyExpense: 128500,
  balance: 28300,
  incomeChange: 5.2,
  expenseChange: 3.8,
  balanceChange: 8.5,
});

const serviceMetrics = ref<ServiceMetric[]>([
  { name: '保洁达标率', current: '99.2%', target: '98%', percentage: 99.2, status: 'success', statusText: '达标', color: '#52c41a' },
  { name: '维修响应时长', current: '18h', target: '<24h', percentage: 83, status: 'success', statusText: '达标', color: '#52c41a' },
  { name: '质询回复率', current: '98%', target: '100%', percentage: 98, status: 'warning', statusText: '待改进', color: '#faad14' },
  { name: '设备完好率', current: '96.5%', target: '95%', percentage: 96.5, status: 'success', statusText: '达标', color: '#52c41a' },
]);

const incomeList = ref<Transaction[]>([
  { id: 1, occurredAt: '2026-06-01', category: '物业费', amount: 125000, counterparty: '-', hasEvidence: true, evidenceUrl: 'https://images.unsplash.com/photo-1566041510340-2e05b7716027?w=600&h=400&fit=crop' },
  { id: 2, occurredAt: '2026-06-03', category: '停车费', amount: 28000, counterparty: '-', hasEvidence: true, evidenceUrl: 'https://images.unsplash.com/photo-1566041510340-2e05b7716027?w=600&h=400&fit=crop' },
  { id: 3, occurredAt: '2026-06-05', category: '其他收入', amount: 3800, counterparty: '快递柜收益', hasEvidence: true, evidenceUrl: 'https://images.unsplash.com/photo-1566041510340-2e05b7716027?w=600&h=400&fit=crop' },
]);

const expenseList = ref<Transaction[]>([
  { id: 1, occurredAt: '2026-06-02', category: '人员工资', amount: 68000, counterparty: '物业员工', hasEvidence: true, evidenceUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop' },
  { id: 2, occurredAt: '2026-06-02', category: '保洁服务', amount: 18500, counterparty: 'XX保洁公司', hasEvidence: true, evidenceUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop' },
  { id: 3, occurredAt: '2026-06-03', category: '绿化养护', amount: 12000, counterparty: 'XX园林公司', hasEvidence: true, evidenceUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop' },
  { id: 4, occurredAt: '2026-06-04', category: '设备维保', amount: 15000, counterparty: 'XX维保公司', hasEvidence: true, evidenceUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop' },
  { id: 5, occurredAt: '2026-06-05', category: '水电费用', amount: 15000, counterparty: '国家电网/自来水公司', hasEvidence: true, evidenceUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop' },
]);

const maintenanceFund = ref<MaintenanceFund>({
  balance: 1256800,
  change: 25600,
  totalUsed: 185000,
});

const fundUsageDetails = ref([
  { id: 1, item: '电梯维护保养', date: '2026-05-15', amount: 35000 },
  { id: 2, item: '消防系统检修', date: '2026-05-10', amount: 28000 },
  { id: 3, item: '外墙防水工程', date: '2026-04-20', amount: 65000 },
  { id: 4, item: '监控系统升级', date: '2026-03-25', amount: 42000 },
  { id: 5, item: '园林绿化改造', date: '2026-02-18', amount: 15000 },
]);

const dailyTasks = ref<DailyTasks>({
  patrolPlan: 8,
  patrolCompleted: 6,
  patrolStaff: '张师傅、李师傅',
});

const equipmentList = ref<Equipment[]>([
  { id: 1, name: '电梯1#', location: '1号楼', status: 'normal', statusText: '正常', icon: '🛗' },
  { id: 2, name: '电梯2#', location: '2号楼', status: 'maintenance', statusText: '维保中', icon: '🛠️' },
  { id: 3, name: '水泵房', location: '地下室', status: 'normal', statusText: '正常', icon: '💧' },
  { id: 4, name: '监控系统', location: '中控室', status: 'normal', statusText: '正常', icon: '📹' },
  { id: 5, name: '消防主机', location: '中控室', status: 'warning', statusText: '待检测', icon: '🚒' },
]);

const todoStats = ref<TodoStats>({
  completed: 23,
  progress: 5,
  pending: 2,
});

const votes = ref<Vote[]>([
  { id: 1, title: '关于更换小区门禁系统的投票', statusText: '进行中', endTime: '剩余3天', participationRate: 68, supportRate: 82 },
  { id: 2, title: '2026年度物业费调整方案', statusText: '进行中', endTime: '剩余7天', participationRate: 45, supportRate: 58 },
]);

const inquiries = ref<Inquiry[]>([
  { id: 1, content: '关于3号楼电梯频繁故障的质询', createdAt: '2026-06-03', status: 'REPLIED', statusText: '已回复', repliedAt: '2026-06-04' },
  { id: 2, content: '希望增加垃圾分类指导', createdAt: '2026-06-04', status: 'REPLIED', statusText: '已回复', repliedAt: '2026-06-05' },
  { id: 3, content: '地下车库照明不足问题', createdAt: '2026-06-05', status: 'PROCESSING', statusText: '处理中' },
]);

const importantNotices = ref<Notice[]>([
  { id: 1, title: '【停水通知】6月8日9:00-12:00小区停水进行管道维护', icon: '🔔', createdAt: '2026-06-03', type: 'warning', content: '因小区供水管道年度检修，6月8日上午9:00-12:00将暂停供水，请各位业主提前做好储水准备。' },
  { id: 2, title: '【安全提醒】近期加强小区安全巡逻', icon: '⚠️', createdAt: '2026-06-04', type: 'warning', content: '近期周边治安形势复杂，物业已加强夜间巡逻频次，请业主注意门窗安全，如有异常及时联系物业。' },
  { id: 3, title: '【活动通知】端午节社区活动报名开始', icon: '🎉', createdAt: '2026-06-05', type: 'success', content: '6月15日上午9:00在小区广场举办端午节活动，包粽子比赛、亲子游戏等精彩节目，欢迎报名参与！' },
  { id: 4, title: '【电梯维护】3号楼电梯定期保养', icon: '🛠️', createdAt: '2026-06-05', type: 'info', content: '6月6日-7日对3号楼两部电梯进行定期保养，期间可能短暂停运，请业主谅解。' },
  { id: 5, title: '【垃圾分类】新分类规则说明会', icon: '♻️', createdAt: '2026-06-02', type: 'info', content: '6月10日下午2:00在会所举办垃圾分类新规则说明会，欢迎业主参加学习。' },
]);

const tips = ref<string[]>([
  '垃圾分类投放时间: 7:00-9:00, 18:00-20:00',
  '物业客服电话: 010-12345678 (24小时)',
  '报修热线: 010-12345679',
]);

const satisfaction = ref<Satisfaction>({
  score: 4.2,
  count: 128,
  updatedAt: '2026-06-05',
});

const dailyServices = ref<ServiceRecord[]>([
  { id: 1, title: '公共区域清洁', description: '完成小区1-3号楼公共区域地面清洁、楼道清扫', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop', time: '08:30-10:30', staff: '王阿姨', status: 'COMPLETED', statusText: '已完成' },
  { id: 2, title: '绿化养护', description: '修剪小区绿化带、浇灌花草', image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop', time: '09:00-11:00', staff: '李师傅', status: 'COMPLETED', statusText: '已完成' },
  { id: 3, title: '垃圾清运', description: '清理各楼栋垃圾桶并转运至小区垃圾站', image: 'https://images.unsplash.com/photo-1553684924-3d93513310e4?w=400&h=300&fit=crop', time: '07:00-08:30', staff: '张师傅', status: 'COMPLETED', statusText: '已完成' },
  { id: 4, title: '电梯维护', description: '对1号楼电梯进行例行检查和保养', image: 'https://images.unsplash.com/photo-1502945015378-0e284ca1a5be?w=400&h=300&fit=crop', time: '14:00-16:00', staff: '维保团队', status: 'IN_PROGRESS', statusText: '进行中' },
]);

const dailyServiceStats = ref<DailyServiceStats>({
  completed: 23,
  inProgress: 5,
  total: 30,
});

const recentInquiries = ref<RecentInquiry[]>([
  { id: 1, content: '关于3号楼电梯频繁故障的质询', createdAt: '2026-06-03', status: 'REPLIED', statusText: '已回复', reply: '已安排维保人员进行全面检查，发现问题已修复。' },
  { id: 2, content: '希望增加垃圾分类指导', createdAt: '2026-06-04', status: 'REPLIED', statusText: '已回复', reply: '我们将在下周安排垃圾分类志愿者进行现场指导。' },
  { id: 3, content: '地下车库照明不足问题', createdAt: '2026-06-05', status: 'PROCESSING', statusText: '处理中' },
]);

const serviceStats = ref<ServiceStats>({
  averageResponseTime: 45,
  completionRate: 96,
});

const activeTab = ref('income');
const showFeedbackModal = ref(false);
const showHashModal = ref(false);
const showEvidenceModal = ref(false);
const selectedEvidence = ref<any>(null);
const feedbackContent = ref('');
const feedbackAnonymous = ref(true);
const feedbackContact = ref('');
const feedbackSuccess = ref(false);
const hashInputData = ref('');
const hashExpected = ref('');
const hashResult = ref<boolean | null>(null);
const monthlyHash = ref('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
const selectedMonth = ref('2026-06');
const availableMonths = ref([
  { label: '2026年6月', value: '2026-06' },
  { label: '2026年5月', value: '2026-05' },
  { label: '2026年4月', value: '2026-04' },
  { label: '2026年3月', value: '2026-03' },
  { label: '2026年2月', value: '2026-02' },
  { label: '2026年1月', value: '2026-01' },
]);
const quickInquiryContent = ref('');
const quickInquiryAnonymous = ref(true);
const quickInquiryContact = ref('');
const inquirySuccess = ref(false);
const currentNoticeIndex = ref(0);
const weather = ref('晴 26°C');
const refreshTime = ref(new Date());
const isRefreshing = ref(false);
const showRefreshToast = ref(false);
const isDarkMode = ref(false);
const isSpeechEnabled = ref(false);
const speechSynthesis = ref<SpeechSynthesis | null>(null);

const currentMonthLabel = computed(() => {
  const month = selectedMonth.value;
  const [year, m] = month.split('-');
  return `${year}年${parseInt(m)}月`;
});

const currentDate = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
});

const lastUpdateTime = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
});

const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN');
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const openEvidence = (item: Transaction) => {
  selectedEvidence.value = item;
  showEvidenceModal.value = true;
};

const submitQuickInquiry = async () => {
  try {
    console.log('提交质询:', quickInquiryContent.value);
    inquirySuccess.value = true;
    quickInquiryContent.value = '';
    quickInquiryContact.value = '';
    setTimeout(() => {
      inquirySuccess.value = false;
    }, 3000);
  } catch (error) {
    console.error('提交质询失败:', error);
  }
};

const changeMonth = () => {
  console.log('切换到月份:', selectedMonth.value);
};

const startCarousel = () => {
  const interval = window.setInterval(() => {
    currentNoticeIndex.value = (currentNoticeIndex.value + 1) % importantNotices.value.length;
  }, 5000);
  window.addEventListener('beforeunload', () => clearInterval(interval));
};

const submitFeedback = async () => {
  try {
    await publicDisclosureApi.submitFeedback({
      content: feedbackContent.value,
      contactInfo: feedbackAnonymous.value ? undefined : feedbackContact.value,
      anonymous: feedbackAnonymous.value,
    });
    feedbackSuccess.value = true;
    feedbackContent.value = '';
    feedbackContact.value = '';
    setTimeout(() => {
      showFeedbackModal.value = false;
      feedbackSuccess.value = false;
    }, 2000);
  } catch (error) {
    console.error('提交反馈失败:', error);
  }
};

const verifyHash = async () => {
  try {
    const result: any = await publicDisclosureApi.verifyHash(hashInputData.value, hashExpected.value);
    hashResult.value = result.valid;
  } catch (error) {
    console.error('哈希校验失败:', error);
    hashResult.value = false;
  }
};

const exportData = () => {
  const data = {
    community: communityInfo.value,
    financial: financialSummary.value,
    metrics: serviceMetrics.value,
    dailyTasks: dailyTasks.value,
    votes: votes.value,
    inquiries: inquiries.value,
    notices: importantNotices.value,
    satisfaction: satisfaction.value,
    maintenanceFund: maintenanceFund.value,
    exportTime: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `物业公示数据_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  window.URL.revokeObjectURL(url);
};

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark-mode', isDarkMode.value);
};

const refreshData = async () => {
  isRefreshing.value = true;
  showRefreshToast.value = true;

  try {
    await loadDisclosureData();
    refreshTime.value = new Date();
  } finally {
    isRefreshing.value = false;
    setTimeout(() => {
      showRefreshToast.value = false;
    }, 3000);
  }
};

const toggleSpeech = () => {
  if (!('speechSynthesis' in window)) {
    alert('抱歉，您的浏览器不支持语音播报功能');
    return;
  }

  isSpeechEnabled.value = !isSpeechEnabled.value;

  if (isSpeechEnabled.value) {
    speechSynthesis.value = window.speechSynthesis;
    announceImportantInfo();
  } else {
    stopSpeech();
  }
};

const stopSpeech = () => {
  if (speechSynthesis.value) {
    speechSynthesis.value.cancel();
  }
};

const announceImportantInfo = () => {
  if (!isSpeechEnabled.value || !speechSynthesis.value) return;

  const text = `欢迎访问${communityInfo.value.name}物业公示平台。本月收入${formatNumber(financialSummary.value.monthlyIncome)}元，支出${formatNumber(financialSummary.value.monthlyExpense)}元，当前满意度${satisfaction.value.score}分。`;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 1;
  utterance.pitch = 1;

  speechSynthesis.value.speak(utterance);
};

const loadDisclosureData = async () => {
  isRefreshing.value = true;
  try {
    const response: any = await publicDisclosureApi.getDisclosure(1);
    
    if (response) {
      if (response.community_info) {
        communityInfo.value = {
          name: response.community_info.name || communityInfo.value.name,
          address: response.community_info.address || communityInfo.value.address,
          contactPhone: response.community_info.contact_phone,
          totalHouseholds: response.community_info.total_households,
        };
      }
      
      if (response.financial_summary) {
        financialSummary.value = {
          monthlyIncome: response.financial_summary.monthly_income || 0,
          monthlyExpense: response.financial_summary.monthly_expense || 0,
          balance: response.financial_summary.balance || 0,
          incomeChange: response.financial_summary.income_change || 0,
          expenseChange: response.financial_summary.expense_change || 0,
          balanceChange: response.financial_summary.balance_change || 0,
        };
      }
      
      if (response.income_list && response.income_list.length > 0) {
        incomeList.value = response.income_list.map((item: any) => ({
          id: item.id,
          occurredAt: new Date(item.occurred_at).toISOString().split('T')[0],
          category: item.category,
          amount: item.amount,
          counterparty: item.counterparty,
          hasEvidence: item.has_evidence,
        }));
      }
      
      if (response.expense_list && response.expense_list.length > 0) {
        expenseList.value = response.expense_list.map((item: any) => ({
          id: item.id,
          occurredAt: new Date(item.occurred_at).toISOString().split('T')[0],
          category: item.category,
          amount: item.amount,
          counterparty: item.counterparty,
          hasEvidence: item.has_evidence,
        }));
      }
      
      if (response.satisfaction) {
        satisfaction.value = {
          score: response.satisfaction.score || 0,
          count: response.satisfaction.count || 0,
          updatedAt: response.satisfaction.updated_at || new Date().toISOString(),
        };
      }
      
      if (response.notices && response.notices.length > 0) {
        importantNotices.value = response.notices.map((notice: any) => ({
          id: notice.id,
          title: notice.title,
          icon: notice.type === 'WARNING' ? '⚠️' : notice.type === 'SUCCESS' ? '🎉' : '🔔',
          createdAt: notice.created_at,
          type: notice.type?.toLowerCase() || 'info',
          content: notice.content || '',
        }));
      }
      
      if (response.votes && response.votes.length > 0) {
        votes.value = response.votes.map((vote: any) => ({
          id: vote.id,
          title: vote.title,
          statusText: vote.status_text,
          endTime: vote.end_time,
          participationRate: vote.participation_rate,
          supportRate: vote.support_rate,
        }));
      }
      
      if (response.inquiries && response.inquiries.length > 0) {
        inquiries.value = response.inquiries.map((inquiry: any) => ({
          id: inquiry.id,
          content: inquiry.content,
          createdAt: inquiry.created_at,
          status: inquiry.status,
          statusText: inquiry.status_text,
          repliedAt: inquiry.replied_at,
        }));
      }
      
      if (response.monthly_hash) {
        monthlyHash.value = response.monthly_hash;
      }
      
      if (response.maintenance_fund) {
        maintenanceFund.value = {
          balance: response.maintenance_fund.balance,
          change: response.maintenance_fund.change,
          totalUsed: response.maintenance_fund.total_used,
        };
      }
      
      if (response.service_records && response.service_records.length > 0) {
        dailyServices.value = response.service_records.map((record: any) => ({
          id: record.id,
          title: record.title,
          description: record.description || '',
          image: record.image_url || `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop`,
          time: record.start_time ? new Date(record.start_time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + (record.end_time ? new Date(record.end_time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '--:--') : '--:--',
          staff: record.staff_name || '未知',
          status: record.status,
          statusText: record.status === 'COMPLETED' ? '已完成' : record.status === 'IN_PROGRESS' ? '进行中' : '待处理',
        }));
      }
      
      if (response.service_metrics) {
        serviceMetrics.value = [
          { name: '保洁达标率', current: `${response.service_metrics.cleaning_rate}%`, target: '98%', percentage: response.service_metrics.cleaning_rate, status: response.service_metrics.cleaning_rate >= 98 ? 'success' : 'warning', statusText: response.service_metrics.cleaning_rate >= 98 ? '达标' : '待改进', color: response.service_metrics.cleaning_rate >= 98 ? '#52c41a' : '#faad14' },
          { name: '维修响应时长', current: `${response.service_metrics.repair_response_time}分钟`, target: '<30分钟', percentage: Math.min(100, (30 / response.service_metrics.repair_response_time) * 100), status: response.service_metrics.repair_response_time <= 30 ? 'success' : 'warning', statusText: response.service_metrics.repair_response_time <= 30 ? '达标' : '待改进', color: response.service_metrics.repair_response_time <= 30 ? '#52c41a' : '#faad14' },
          { name: '质询回复率', current: `${response.service_metrics.inquiry_reply_rate}%`, target: '100%', percentage: response.service_metrics.inquiry_reply_rate, status: response.service_metrics.inquiry_reply_rate >= 98 ? 'success' : 'warning', statusText: response.service_metrics.inquiry_reply_rate >= 98 ? '达标' : '待改进', color: response.service_metrics.inquiry_reply_rate >= 98 ? '#52c41a' : '#faad14' },
          { name: '设备完好率', current: `${response.service_metrics.device_health_rate}%`, target: '95%', percentage: response.service_metrics.device_health_rate, status: response.service_metrics.device_health_rate >= 95 ? 'success' : 'warning', statusText: response.service_metrics.device_health_rate >= 95 ? '达标' : '待改进', color: response.service_metrics.device_health_rate >= 95 ? '#52c41a' : '#faad14' },
        ];
      }
    }
  } catch (error) {
    console.error('获取公示数据失败:', error);
  } finally {
    isRefreshing.value = false;
  }
};

// 图表数据
const incomeExpenseData = ref({
  labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
  datasets: [
    {
      label: '收入',
      data: [280000, 285000, 290000, 288000, 295000, 300000],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
    },
    {
      label: '支出',
      data: [220000, 225000, 230000, 228000, 235000, 240000],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: true,
      tension: 0.4,
    },
  ],
});

const incomeExpenseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: false,
      ticks: {
        callback: (value: string | number) => '¥' + (Number(value) / 1000) + 'k',
      },
    },
  },
};

const serviceMetricsData = ref({
  labels: ['清洁率', '维修响应', '投诉回复', '设备健康', '安保巡逻', '绿化养护'],
  datasets: [
    {
      label: '本月指标',
      data: [95, 92, 88, 90, 96, 94],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: '#3b82f6',
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#3b82f6',
    },
    {
      label: '目标指标',
      data: [90, 90, 90, 90, 90, 90],
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      borderColor: '#10b981',
      pointBackgroundColor: '#10b981',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#10b981',
    },
  ],
});

const serviceMetricsOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    r: {
      beginAtZero: true,
      max: 100,
      ticks: {
        stepSize: 20,
      },
    },
  },
};

const participationData = ref({
  totalHouseholds: 480,
  voteParticipation: 356,
  inquiryParticipation: 128,
  satisfactionVotes: 412,
});

const participationRate = computed(() => {
  return Math.round((participationData.value.voteParticipation / participationData.value.totalHouseholds) * 100);
});

onMounted(() => {
  startCarousel();
  loadDisclosureData();

  setInterval(() => {
    weather.value = `晴 ${Math.floor(Math.random() * 5) + 24}°C`;
  }, 300000);
});
</script>

<style scoped>
.public-disclosure {
  min-height: 100vh;
  background: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

a {
  text-decoration: none;
  color: #3b82f6;
}

a:hover {
  color: #2563eb;
}

.section-wrapper {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

/* 公告与快速质询3:2布局 */
.notice-inquiry-row {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.notice-inquiry-row .notice-section {
  flex: 3;
}

.notice-inquiry-row .quick-inquiry-section {
  flex: 2;
}

/* 收支明细与日常服务记录3:2布局 */
.finance-service-row {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.finance-service-row .finance-highlight-section {
  flex: 3;
}

.finance-service-row .daily-service-section {
  flex: 2;
}

.finance-service-row .section-wrapper {
  margin-bottom: 0;
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .notice-inquiry-row,
  .finance-service-row {
    flex-direction: column;
  }
  
  .notice-inquiry-row .notice-section,
  .notice-inquiry-row .quick-inquiry-section,
  .finance-service-row .finance-highlight-section,
  .finance-service-row .daily-service-section {
    flex: 1;
  }
}

/* 收支明细表格优化 */
.finance-service-row .detail-table {
  font-size: 12px;
}

.finance-service-row .detail-table th,
.finance-service-row .detail-table td {
  padding: 8px 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.finance-service-row .finance-detail-table {
  display: block;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  padding: 20px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.community-info h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.address {
  margin: 5px 0 0;
  opacity: 0.9;
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  justify-content: flex-end;
}

.notice-carousel {
  flex: 1;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 8px 16px;
  overflow: hidden;
}

.carousel-content {
  position: relative;
  min-height: 24px;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-icon {
  font-size: 16px;
}

.notice-text {
  font-size: 13px;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.date-weather {
  display: flex;
  gap: 15px;
  font-size: 14px;
}

.feedback-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.feedback-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1e3a8a;
  flex: 1;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* 月份高亮区域 */
.month-highlight {
  display: flex;
  align-items: center;
  gap: 20px;
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.month-display {
  display: flex;
  flex-direction: column;
}

.month-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.month-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.month-selector-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
}

.month-select {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  background: white;
  cursor: pointer;
  min-width: 150px;
}

.month-select:hover {
  border-color: #3b82f6;
}

.refresh-action {
  margin-left: auto;
}

.refresh-action .refresh-btn {
  margin: 0;
}

/* 财务汇总卡片 */
.finance-summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid transparent;
}

.summary-card.income-summary {
  border-left-color: #10b981;
}

.summary-card.expense-summary {
  border-left-color: #ef4444;
}

.summary-card.balance-summary {
  border-left-color: #3b82f6;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.summary-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.summary-amount {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.summary-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
}

.summary-trend.up {
  color: #10b981;
  background: #dcfce7;
}

.summary-trend.down {
  color: #ef4444;
  background: #fee2e2;
}

.trend-label {
  font-size: 11px;
  opacity: 0.8;
}

/* 快速质询样式 */
.response-time {
  margin-left: auto;
}

.response-badge {
  font-size: 12px;
  padding: 6px 14px;
  background: #dbeafe;
  color: #2563eb;
  border-radius: 20px;
  font-weight: 500;
}

.inquiry-form-container {
  margin-bottom: 24px;
}

.inquiry-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 12px;
  transition: border-color 0.3s;
}

.inquiry-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.inquiry-options {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #64748b;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.inquiry-contact {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  min-width: 200px;
}

.submit-inquiry-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-inquiry-btn:hover:not(:disabled) {
  background: #2563eb;
}

.submit-inquiry-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.inquiry-success {
  margin-top: 12px;
  padding: 12px 16px;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 8px;
  font-size: 13px;
}

.recent-inquiries {
  border-top: 1px solid #e2e8f0;
  padding-top: 20px;
}

.recent-inquiries h3 {
  margin: 0 0 15px;
  font-size: 15px;
  color: #334155;
}

.inquiry-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inquiry-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 15px;
}

.inquiry-content {
  font-size: 13px;
  color: #1e293b;
  margin-bottom: 10px;
  line-height: 1.5;
}

.inquiry-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.inquiry-time {
  font-size: 12px;
  color: #94a3b8;
}

.inquiry-reply {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #e2e8f0;
  font-size: 13px;
  color: #64748b;
}

.reply-label {
  font-weight: 500;
  color: #3b82f6;
  margin-right: 4px;
}

/* 日常服务记录样式 */
.service-date {
  font-size: 13px;
  color: #94a3b8;
  padding: 6px 12px;
  background: #f1f5f9;
  border-radius: 6px;
}

.service-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.service-card {
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.service-image-wrapper {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.service-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.service-card:hover .service-image {
  transform: scale(1.05);
}

.service-info {
  padding: 16px;
}

.service-info h3 {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.service-description {
  margin: 0 0 12px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.service-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 12px;
  color: #94a3b8;
}

.service-time,
.service-staff {
  padding: 3px 8px;
  background: white;
  border-radius: 4px;
}

.service-status {
  display: inline-block;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 500;
}

.service-status.completed {
  background: #dcfce7;
  color: #16a34a;
}

.service-status.in_progress {
  background: #dbeafe;
  color: #2563eb;
}

.service-gallery-scroll {
  max-height: 520px;
  overflow-y: auto;
  margin-bottom: 24px;
  border-radius: 12px;
  background: #f8fafc;
}

.service-gallery-scroll::-webkit-scrollbar {
  width: 6px;
}

.service-gallery-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.service-gallery-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.service-gallery-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.service-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.stat-card {
  background: #f1f5f9;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.refresh-btn,
.dark-mode-btn {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.refresh-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dark-mode-btn {
  font-size: 18px;
  padding: 8px 12px;
}

.dark-mode-btn:hover {
  background: #f8fafc;
}

.speech-btn {
  font-size: 18px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.speech-btn:hover {
  background: #f8fafc;
}

.speech-btn.active {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.month-selector select {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.month-selector select:hover {
  border-color: #3b82f6;
}

.month-selector select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.quick-actions {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  color: white;
}

.quick-actions-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.quick-action-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: white;
}

.quick-action-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.quick-action-icon {
  font-size: 24px;
}

.quick-action-title {
  font-size: 13px;
  font-weight: 500;
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-card h3 {
  margin: 0 0 15px;
  font-size: 16px;
  color: #334155;
}

.chart-container {
  height: 250px;
  position: relative;
}

.radar-chart {
  height: 300px;
}

.participation-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.participation-section h3 {
  margin: 0 0 20px;
  font-size: 16px;
  color: #334155;
}

.participation-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.participation-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
}

.participation-icon {
  font-size: 32px;
}

.participation-info {
  flex: 1;
}

.participation-value {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.participation-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.participation-rate {
  font-size: 20px;
  font-weight: 700;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
}

.overview-section {
  margin-bottom: 30px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 36px;
}

.card-content h3 {
  margin: 0 0 5px;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.card-content .amount {
  margin: 0 0 5px;
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
}

.card-content .sub-text {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}

.income-card .amount { color: #10b981; }
.expense-card .amount { color: #ef4444; }
.balance-card .amount { color: #3b82f6; }
.satisfaction-card .amount { 
  color: #f59e0b; 
  font-size: 28px;
}
.satisfaction-card .star {
  font-size: 20px;
}

.metrics-section {
  margin-bottom: 30px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.metric-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.metric-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.status-badge {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
}

.status-badge.success {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.warning {
  background: #fef3c7;
  color: #d97706;
}

.metric-bar-container {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.metric-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s;
}

.metric-footer {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.current-value {
  font-weight: 600;
  color: #1e293b;
}

.target-value {
  color: #94a3b8;
}

.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

@media (max-width: 1024px) {
  .two-columns {
    grid-template-columns: 1fr;
  }

  .header-right {
    flex-direction: column;
    gap: 10px;
  }

  .notice-carousel {
    max-width: 100%;
  }

  .community-info h1 {
    font-size: 22px;
  }

  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .header-right {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }

  .header-actions {
    flex-wrap: wrap;
    gap: 8px;
  }

  .refresh-btn,
  .dark-mode-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .date-weather {
    flex-direction: column;
    gap: 5px;
  }

  .notice-carousel {
    display: none;
  }

  .main-content {
    padding: 15px;
  }

  .overview-cards {
    grid-template-columns: 1fr;
  }

  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-section {
    grid-template-columns: 1fr;
  }

  .participation-cards {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .patrol-stats {
    flex-direction: column;
    gap: 15px;
  }

  .stat-divider {
    width: 100%;
    height: 1px;
  }

  .fund-info {
    flex-direction: column;
  }

  .fund-usage-list {
    font-size: 12px;
  }

  .todo-stats {
    flex-direction: column;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .modal-content {
    width: 95%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .verify-buttons {
    flex-direction: column;
  }

  .evidence-actions {
    flex-direction: column;
  }

  .chart-container {
    height: 200px;
  }

  .participation-card {
    padding: 15px;
  }

  .participation-icon {
    font-size: 24px;
  }

  .participation-value {
    font-size: 16px;
  }

  .participation-rate {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .community-info h1 {
    font-size: 18px;
  }

  .card {
    flex-direction: column;
    text-align: center;
  }

  .card-icon {
    font-size: 28px;
  }

  .detail-table {
    font-size: 12px;
  }

  .detail-table th,
  .detail-table td {
    padding: 8px 4px;
  }

  .inquiry-table {
    font-size: 12px;
  }

  .equipment-list {
    gap: 8px;
  }

  .equipment-item {
    padding: 10px;
  }

  .vote-card {
    padding: 15px;
  }

  .notice-item {
    font-size: 12px;
  }

  code {
    font-size: 10px;
  }
}

.section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.subsection {
  margin-bottom: 25px;
}

.subsection:last-child {
  margin-bottom: 0;
}

.subsection h3 {
  margin: 0 0 15px;
  font-size: 16px;
  color: #334155;
  font-weight: 600;
}

.no-evidence {
  color: #94a3b8;
  font-size: 12px;
}

/* 凭证弹窗 */
.evidence-modal-overlay {
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

.evidence-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.income-expense-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.tab {
  padding: 10px 24px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  transition: all 0.3s;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
}

.tab.active {
  background: #3b82f6;
  color: white;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.detail-table th,
.detail-table td {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.detail-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #64748b;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-table tbody tr:hover {
  background: #f8fafc;
}

.finance-detail-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.detail-table .income { color: #10b981; font-weight: 600; }
.detail-table .expense { color: #ef4444; font-weight: 600; }

.evidence-badge {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #dcfce7;
  color: #16a34a;
  text-align: center;
  line-height: 20px;
  font-size: 12px;
}

.evidence-badge.missing {
  background: #fee2e2;
  color: #dc2626;
}

.fund-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.fund-item {
  flex: 1;
  min-width: 120px;
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
}

.fund-item .label {
  display: block;
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 5px;
}

.fund-item .value {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.fund-item .value.positive { color: #10b981; }
.fund-item .value.negative { color: #ef4444; }

.fund-details {
  margin-top: 20px;
}

.fund-details h4 {
  margin: 0 0 15px;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.fund-usage-list {
  background: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
}

.fund-usage-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #e2e8f0;
}

.fund-usage-item:last-child {
  border-bottom: none;
}

.usage-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.usage-item-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.usage-date {
  font-size: 12px;
  color: #94a3b8;
}

.usage-amount {
  font-size: 14px;
  font-weight: 600;
  color: #ef4444;
}

.patrol-info {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
}

.patrol-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: #3b82f6;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

.stat-divider {
  width: 1px;
  background: #cbd5e1;
}

.patrol-progress {
  margin-top: 15px;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 4px;
}

.progress-text {
  font-size: 13px;
  color: #64748b;
}

.equipment-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.equipment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid transparent;
}

.equipment-item.normal {
  border-left-color: #52c41a;
}

.equipment-item.maintenance {
  border-left-color: #faad14;
}

.equipment-item.warning {
  border-left-color: #f59e0b;
}

.equipment-icon {
  font-size: 24px;
}

.equipment-info {
  flex: 1;
}

.equipment-name {
  display: block;
  font-weight: 500;
  color: #1e293b;
}

.equipment-location {
  font-size: 12px;
  color: #94a3b8;
}

.equipment-status {
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.normal { background: #52c41a; }
.status-dot.maintenance { background: #faad14; }
.status-dot.warning { background: #f59e0b; }

.status-text {
  font-size: 12px;
  color: #64748b;
}

.todo-stats {
  display: flex;
  gap: 15px;
}

.todo-item {
  flex: 1;
  text-align: center;
  padding: 15px;
  border-radius: 8px;
}

.todo-item.completed {
  background: #dcfce7;
}

.todo-item.progress {
  background: #dbeafe;
}

.todo-item.pending {
  background: #fef3c7;
}

.todo-count {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.todo-label {
  font-size: 12px;
  color: #64748b;
}

.vote-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.vote-card {
  background: #f8fafc;
  padding: 18px;
  border-radius: 8px;
}

.vote-card h4 {
  margin: 0 0 10px;
  font-size: 14px;
  color: #1e293b;
}

.vote-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 12px;
}

.vote-status {
  color: #3b82f6;
  font-weight: 500;
}

.vote-time {
  color: #94a3b8;
}

.vote-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-item span:first-child {
  font-size: 12px;
  color: #64748b;
  width: 50px;
}

.mini-progress {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.mini-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 3px;
}

.mini-fill.support {
  background: #10b981;
}

.progress-item span:last-child {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  width: 40px;
  text-align: right;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #94a3b8;
}

.inquiry-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.inquiry-table th,
.inquiry-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.inquiry-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #64748b;
}

.inquiry-content {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inquiry-status {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
}

.inquiry-status.replied {
  background: #dcfce7;
  color: #16a34a;
}

.inquiry-status.processing {
  background: #dbeafe;
  color: #2563eb;
}

.notice-count {
  font-size: 13px;
  color: #64748b;
  padding: 5px 12px;
  background: #f1f5f9;
  border-radius: 12px;
}

.notice-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.notice-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #3b82f6;
  transition: all 0.3s;
}

.notice-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.notice-card.warning {
  border-left-color: #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
}

.notice-card.success {
  border-left-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%);
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.notice-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.notice-tag.info {
  background: #dbeafe;
  color: #2563eb;
}

.notice-tag.warning {
  background: #fef3c7;
  color: #d97706;
}

.notice-tag.success {
  background: #dcfce7;
  color: #16a34a;
}

.notice-card .notice-date {
  font-size: 12px;
  color: #94a3b8;
}

.notice-card .notice-title {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}

.notice-card .notice-content {
  margin: 0 0 12px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
}

.notice-footer {
  display: flex;
  justify-content: flex-end;
}

.notice-type-badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 4px;
  font-weight: 500;
}

.notice-type-badge.info {
  background: #f1f5f9;
  color: #64748b;
}

.notice-type-badge.warning {
  background: #fef3c7;
  color: #d97706;
}

.notice-type-badge.success {
  background: #dcfce7;
  color: #16a34a;
}

.tips-section {
  margin-top: 20px;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.tip-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

.tip-card .tip-icon {
  font-size: 11px;
  padding: 4px 8px;
  background: #dbeafe;
  color: #2563eb;
  border-radius: 4px;
  font-weight: 500;
}

.tip-card .tip-text {
  font-size: 13px;
  color: #475569;
}

.footer {
  background: #1e293b;
  color: white;
  padding: 40px 0 20px;
  margin-top: 50px;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
}

.footer h4 {
  margin: 0 0 15px;
  font-size: 16px;
}

.footer p,
.footer li {
  margin: 5px 0;
  font-size: 13px;
  color: #94a3b8;
}

.footer ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.verify-btn {
  background: #3b82f6;
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.3s;
}

.verify-btn:hover {
  background: #2563eb;
}

.verify-hint {
  margin-top: 10px !important;
  font-size: 11px !important;
}

.footer-bottom {
  max-width: 1400px;
  margin: 30px auto 0;
  padding: 20px 30px;
  border-top: 1px solid #334155;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
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
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  padding: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #94a3b8;
  line-height: 1;
}

.feedback-form {
  padding: 20px;
}

.feedback-form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
}

.feedback-options {
  margin: 15px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
}

.feedback-form input[type="text"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  margin-bottom: 15px;
}

.submit-btn {
  width: 100%;
  background: #3b82f6;
  border: none;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-btn:hover {
  background: #2563eb;
}

.success-message {
  text-align: center;
  padding: 20px;
  color: #16a34a;
  font-weight: 500;
}

.hash-modal,
.evidence-modal {
  max-width: 600px;
}

.hash-modal .modal-body,
.evidence-modal .modal-body {
  padding: 20px;
}

.hash-info {
  background: #f0f9ff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.hash-info p {
  margin: 5px 0;
  font-size: 13px;
  color: #475569;
}

.hash-info code {
  display: block;
  background: #e2e8f0;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  word-break: break-all;
  margin-top: 8px;
}

.hash-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hash-form label {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.hash-form textarea,
.hash-form input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.hash-form textarea {
  resize: vertical;
  font-family: monospace;
}

.verify-submit-btn {
  background: #3b82f6;
  border: none;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 10px;
}

.verify-submit-btn:hover:not(:disabled) {
  background: #2563eb;
}

.verify-submit-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.hash-result {
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
  font-size: 14px;
  font-weight: 500;
}

.hash-result.success {
  background: #dcfce7;
  color: #16a34a;
}

.hash-result.error {
  background: #fee2e2;
  color: #dc2626;
}

.evidence-preview {
  margin-bottom: 20px;
}

.evidence-image-placeholder {
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
}

.evidence-image-placeholder span {
  font-size: 48px;
}

.evidence-image-placeholder p {
  margin: 10px 0 0;
  color: #64748b;
}

.evidence-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.evidence-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.evidence-field label {
  font-size: 13px;
  color: #64748b;
}

.evidence-field span {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.evidence-field code {
  font-size: 11px;
  background: #e2e8f0;
  padding: 4px 8px;
  border-radius: 4px;
}

.evidence-field .amount {
  color: #3b82f6;
  font-size: 16px;
}

.evidence-status.verified {
  color: #16a34a;
  background: #dcfce7;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.evidence-actions {
  display: flex;
  gap: 10px;
}

.download-btn,
.verify-evidence-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.download-btn {
  background: #10b981;
  color: white;
}

.download-btn:hover {
  background: #059669;
}

.verify-evidence-btn {
  background: #f59e0b;
  color: white;
}

.verify-evidence-btn:hover {
  background: #d97706;
}

.verify-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.export-btn {
  background: #10b981;
}

.export-btn:hover {
  background: #059669;
}

code {
  font-family: 'Courier New', monospace;
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

/* 夜间模式 */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
}

.dark-mode {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-color: #334155;
}

.dark-mode .page-wrapper {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.dark-mode .header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.dark-mode .community-info h1 {
  color: #f1f5f9;
}

.dark-mode .community-info .address {
  color: #94a3b8;
}

.dark-mode .date {
  color: #94a3b8;
}

.dark-mode .main-content {
  background: var(--bg-primary);
}

.dark-mode .card,
.dark-mode .section,
.dark-mode .chart-card,
.dark-mode .participation-section,
.dark-mode .modal-content {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

.dark-mode .card-content h3 {
  color: var(--text-primary);
}

.dark-mode .card-content .amount {
  color: var(--text-primary);
}

.dark-mode .card-content .sub-text {
  color: var(--text-secondary);
}

.dark-mode .subsection h3 {
  color: var(--text-primary);
}

.dark-mode .detail-table th {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.dark-mode .detail-table td {
  color: var(--text-secondary);
  border-color: var(--border-color);
}

.dark-mode .metrics-section,
.dark-mode .patrol-section,
.dark-mode .equipment-section,
.dark-mode .vote-section,
.dark-mode .inquiry-section,
.dark-mode .notice-section {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

.dark-mode .metric-item {
  background: var(--bg-secondary);
}

.dark-mode .metric-name {
  color: var(--text-primary);
}

.dark-mode .metric-value {
  color: var(--text-secondary);
}

.dark-mode .equipment-item {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

.dark-mode .equipment-name {
  color: var(--text-primary);
}

.dark-mode .equipment-status {
  color: var(--text-secondary);
}

.dark-mode .vote-card {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

.dark-mode .vote-title {
  color: var(--text-primary);
}

.dark-mode .vote-info {
  color: var(--text-secondary);
}

.dark-mode .inquiry-item {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

.dark-mode .inquiry-content {
  color: var(--text-primary);
}

.dark-mode .notice-item {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

.dark-mode .notice-title {
  color: var(--text-primary);
}

.dark-mode .notice-content {
  color: var(--text-secondary);
}

.dark-mode .footer {
  background: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-secondary);
}

.dark-mode .footer-title {
  color: var(--text-primary);
}

.dark-mode .footer-link {
  color: var(--text-secondary);
}

.dark-mode .footer-link:hover {
  color: #3b82f6;
}

.dark-mode .modal-overlay {
  background: rgba(0, 0, 0, 0.7);
}

.dark-mode .modal-content {
  background: var(--bg-secondary);
}

.dark-mode .modal-header h3 {
  color: var(--text-primary);
}

.dark-mode .close-btn {
  color: var(--text-secondary);
}

.dark-mode .form-group label {
  color: var(--text-primary);
}

.dark-mode textarea,
.dark-mode input[type="text"],
.dark-mode input[type="email"],
.dark-mode input[type="tel"] {
  background: var(--bg-primary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.dark-mode .hash-info {
  background: var(--bg-primary);
}

.dark-mode .hash-info p {
  color: var(--text-secondary);
}

.dark-mode .hash-form label {
  color: var(--text-primary);
}

.dark-mode .evidence-details {
  background: var(--bg-primary);
}

.dark-mode .evidence-field label {
  color: var(--text-secondary);
}

.dark-mode .evidence-field span {
  color: var(--text-primary);
}

.dark-mode .quick-actions {
  background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
}

.dark-mode .participation-value {
  color: var(--text-primary);
}

.dark-mode .participation-label {
  color: var(--text-secondary);
}

.dark-mode .participation-rate {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.dark-mode .refresh-btn,
.dark-mode .dark-mode-btn,
.dark-mode .speech-btn,
.dark-mode .month-selector select {
  background: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.dark-mode .participation-card {
  background: var(--bg-primary);
}

.dark-mode .speech-btn.active {
  background: #10b981;
  border-color: #10b981;
}

/* 刷新提示 */
.refresh-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 打印样式 */
@media print {
  .header-actions,
  .refresh-btn,
  .dark-mode-btn,
  .month-selector,
  .quick-actions,
  .footer,
  .modal-overlay,
  .feedback-btn,
  .verify-buttons,
  .export-btn {
    display: none !important;
  }

  .page-wrapper {
    background: white;
  }

  .main-content {
    background: white;
  }

  .card,
  .section,
  .chart-card,
  .participation-section {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid #e2e8f0;
  }

  .header {
    background: white;
    border-bottom: 2px solid #1e3a8a;
  }

  .community-info h1 {
    color: #1e3a8a;
  }

  .community-info .address {
    color: #64748b;
  }

  .date-weather {
    color: #64748b;
  }
}
</style>
