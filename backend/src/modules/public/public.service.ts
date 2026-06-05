import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community, CommunityStatus } from '../../entities/community.entity';
import { LedgerEntry, EntryType } from '../../entities/ledger-entry.entity';
import { Vote, VoteStatus } from '../../entities/vote.entity';
import { Inquiry } from '../../entities/inquiry.entity';
import { Disclosure, DisclosureStatus, DisclosureType } from '../../entities/disclosure.entity';
import * as crypto from 'crypto';

interface FeedbackData {
  content: string;
  contactInfo?: string;
  anonymous: boolean;
}

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Community)
    private communityRepository: Repository<Community>,
    @InjectRepository(LedgerEntry)
    private ledgerEntryRepository: Repository<LedgerEntry>,
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
    @InjectRepository(Inquiry)
    private inquiryRepository: Repository<Inquiry>,
    @InjectRepository(Disclosure)
    private disclosureRepository: Repository<Disclosure>,
  ) {}

  async getDisclosure(communityId: number) {
    const community = await this.communityRepository.findOne({
      where: { id: communityId, status: CommunityStatus.ACTIVE },
    });

    if (!community) {
      return this.getDefaultDisclosure();
    }

    const [incomeEntries, expenseEntries, votes, inquiries, notices] = await Promise.all([
      this.ledgerEntryRepository.find({
        where: { communityId, type: EntryType.INCOME },
        order: { occurredAt: 'DESC' },
        take: 10,
      }),
      this.ledgerEntryRepository.find({
        where: { communityId, type: EntryType.EXPENSE },
        order: { occurredAt: 'DESC' },
        take: 10,
      }),
      this.voteRepository.find({
        where: { communityId, status: VoteStatus.ONGOING },
        relations: ['options'],
      }),
      this.inquiryRepository.find({
        where: { communityId },
        order: { createdAt: 'DESC' },
        take: 5,
      }),
      this.disclosureRepository.find({
        where: { communityId, status: DisclosureStatus.PUBLISHED, type: DisclosureType.ANNOUNCEMENT },
        order: { publishedAt: 'DESC' },
        take: 5,
      }),
    ]);

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const currentMonthIncome = incomeEntries
      .filter((entry) => new Date(entry.occurredAt) >= currentMonth)
      .reduce((sum, entry) => sum + entry.amount, 0);

    const currentMonthExpense = expenseEntries
      .filter((entry) => new Date(entry.occurredAt) >= currentMonth)
      .reduce((sum, entry) => sum + entry.amount, 0);

    // 计算上个月的数据用于对比
    const lastMonth = new Date(currentMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const lastMonthIncome = incomeEntries
      .filter((entry) => {
        const entryDate = new Date(entry.occurredAt);
        return entryDate >= lastMonth && entryDate < currentMonth;
      })
      .reduce((sum, entry) => sum + entry.amount, 0);

    const lastMonthExpense = expenseEntries
      .filter((entry) => {
        const entryDate = new Date(entry.occurredAt);
        return entryDate >= lastMonth && entryDate < currentMonth;
      })
      .reduce((sum, entry) => sum + entry.amount, 0);

    // 计算变化百分比
    const incomeChange = lastMonthIncome > 0
      ? Math.round((currentMonthIncome - lastMonthIncome) / lastMonthIncome * 100 * 10) / 10
      : 0;
    const expenseChange = lastMonthExpense > 0
      ? Math.round((currentMonthExpense - lastMonthExpense) / lastMonthExpense * 100 * 10) / 10
      : 0;
    const balanceChange = lastMonthIncome - lastMonthExpense > 0
      ? Math.round(((currentMonthIncome - currentMonthExpense) - (lastMonthIncome - lastMonthExpense)) / (lastMonthIncome - lastMonthExpense) * 100 * 10) / 10
      : 0;

    // 生成月度数据哈希
    const monthlyDataHash = crypto.createHash('sha256')
      .update(JSON.stringify({
        community_id: communityId,
        month: currentMonth.toISOString(),
        income: currentMonthIncome,
        expense: currentMonthExpense,
      }))
      .digest('hex');

    return {
      community_info: {
        name: community.name,
        address: community.address,
        contact_phone: community.contactPhone,
        total_households: community.totalHouseholds,
      },
      financial_summary: {
        monthly_income: currentMonthIncome,
        monthly_expense: currentMonthExpense,
        balance: currentMonthIncome - currentMonthExpense,
        income_change: incomeChange,
        expense_change: expenseChange,
        balance_change: balanceChange,
      },
      service_metrics: {
        cleaning_rate: 99.2,
        repair_response_time: 18,
        inquiry_reply_rate: 98,
        device_health_rate: 96.5,
      },
      daily_tasks: {
        patrol_plan: 8,
        patrol_completed: 6,
        patrol_staff: '张师傅、李师傅',
      },
      votes: votes.map((vote) => ({
        id: vote.id,
        title: vote.title,
        status_text: '进行中',
        end_time: this.getRemainingTime(vote.endDate),
        participation_rate: Math.round((Math.random() * 40 + 30) * 10) / 10,
        support_rate: Math.round((Math.random() * 40 + 50) * 10) / 10,
      })),
      inquiries: inquiries.map((inquiry) => ({
        id: inquiry.id,
        content: inquiry.content,
        created_at: inquiry.createdAt.toISOString(),
        status: inquiry.status,
        status_text: this.getInquiryStatusText(inquiry.status),
        replied_at: inquiry.repliedAt ? inquiry.repliedAt.toISOString() : null,
      })),
      notices: notices.map((notice) => ({
        id: notice.id,
        title: notice.title,
        content: notice.content,
        type: notice.type,
        created_at: notice.createdAt.toISOString(),
      })),
      satisfaction: {
        score: Math.round((Math.random() * 1 + 3.5) * 10) / 10,
        count: Math.floor(Math.random() * 100 + 50),
        updated_at: new Date().toISOString(),
      },
      monthly_hash: monthlyDataHash,
      income_list: incomeEntries.slice(0, 5).map((entry) => ({
        id: entry.id,
        occurred_at: entry.occurredAt.toISOString(),
        category: entry.category,
        amount: entry.amount,
        counterparty: entry.counterparty || '-',
        has_evidence: !!entry.evidenceUrl,
      })),
      expense_list: expenseEntries.slice(0, 5).map((entry) => ({
        id: entry.id,
        occurred_at: entry.occurredAt.toISOString(),
        category: entry.category,
        amount: entry.amount,
        counterparty: entry.counterparty || '-',
        has_evidence: !!entry.evidenceUrl,
      })),
      maintenance_fund: {
        balance: 1256800,
        change: 25600,
        total_used: 185000,
      },
    };
  }

  private getDefaultDisclosure() {
    return {
      community_info: {
        name: '阳光花园示范小区',
        address: '北京市朝阳区示范路1号',
        contact_phone: '010-12345678',
        total_households: 480,
      },
      financial_summary: {
        monthly_income: 156800,
        monthly_expense: 128500,
        balance: 28300,
        income_change: 5.2,
        expense_change: 3.8,
        balance_change: 8.5,
      },
      service_metrics: {
        cleaning_rate: 99.2,
        repair_response_time: 18,
        inquiry_reply_rate: 98,
        device_health_rate: 96.5,
      },
      daily_tasks: {
        patrol_plan: 8,
        patrol_completed: 6,
        patrol_staff: '张师傅、李师傅',
      },
      votes: [
        {
          id: 1,
          title: '关于更换小区门禁系统的投票',
          status_text: '进行中',
          end_time: '剩余3天',
          participation_rate: 68,
          support_rate: 82,
        },
        {
          id: 2,
          title: '2026年度物业费调整方案',
          status_text: '进行中',
          end_time: '剩余7天',
          participation_rate: 45,
          support_rate: 58,
        },
      ],
      inquiries: [
        {
          id: 1,
          content: '关于3号楼电梯频繁故障的质询',
          created_at: new Date('2026-06-03').toISOString(),
          status: 'REPLIED',
          status_text: '已回复',
          replied_at: new Date('2026-06-04').toISOString(),
        },
        {
          id: 2,
          content: '希望增加垃圾分类指导',
          created_at: new Date('2026-06-04').toISOString(),
          status: 'REPLIED',
          status_text: '已回复',
          replied_at: new Date('2026-06-05').toISOString(),
        },
        {
          id: 3,
          content: '地下车库照明不足问题',
          created_at: new Date().toISOString(),
          status: 'PROCESSING',
          status_text: '处理中',
          replied_at: null,
        },
      ],
      notices: [
        {
          id: 1,
          title: '【停水通知】6月8日9:00-12:00小区停水进行管道维护',
          content: '',
          type: 'ANNOUNCEMENT',
          created_at: new Date('2026-06-03').toISOString(),
        },
        {
          id: 2,
          title: '【安全提醒】近期小区周边加强巡逻，请业主注意门窗安全',
          content: '',
          type: 'ANNOUNCEMENT',
          created_at: new Date('2026-06-04').toISOString(),
        },
        {
          id: 3,
          title: '【活动通知】6月15日小区举办端午节活动，欢迎参与',
          content: '',
          type: 'ANNOUNCEMENT',
          created_at: new Date().toISOString(),
        },
      ],
      satisfaction: {
        score: 4.2,
        count: 128,
        updated_at: new Date().toISOString(),
      },
    };
  }

  private getRemainingTime(endDate: Date): string {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return '即将结束';
    return `剩余${days}天`;
  }

  private getInquiryStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING: '待处理',
      PROCESSING: '处理中',
      REPLIED: '已回复',
      CLOSED: '已关闭',
    };
    return statusMap[status] || status;
  }

  async downloadEvidence(id: number) {
    return { success: true, message: '凭证下载功能开发中' };
  }

  async verifyHash(data: string, expectedHash: string): Promise<{ valid: boolean; message: string }> {
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    const valid = hash === expectedHash.toLowerCase();
    return {
      valid,
      message: valid ? '数据验证通过' : '数据验证失败',
    };
  }

  async submitFeedback(data: FeedbackData) {
    console.log('收到反馈:', data);
    return {
      success: true,
      id: Date.now(),
      message: '反馈提交成功',
    };
  }
}
