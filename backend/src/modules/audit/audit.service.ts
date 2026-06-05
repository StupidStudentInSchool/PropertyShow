import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditModule } from '../../entities/audit-log.entity';

export interface CreateAuditLogDto {
  action: AuditAction;
  module: AuditModule;
  userId: string;
  userName: string;
  targetId?: number;
  targetName?: string;
  detail?: string;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(dto: CreateAuditLogDto): Promise<AuditLog> {
    const log = this.auditLogRepository.create(dto);
    return this.auditLogRepository.save(log);
  }

  async findAll(
    module?: AuditModule,
    action?: AuditAction,
    userId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: AuditLog[]; total: number }> {
    const query = this.auditLogRepository.createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC');

    if (module) {
      query.where('log.module = :module', { module });
    }

    if (action) {
      query.andWhere('log.action = :action', { action });
    }

    if (userId) {
      query.andWhere('log.userId = :userId', { userId });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async getStatistics(): Promise<any> {
    const total = await this.auditLogRepository.count();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = await this.auditLogRepository
      .createQueryBuilder('log')
      .where('log.createdAt >= CURDATE()')
      .getCount();

    const byModule = await this.auditLogRepository
      .createQueryBuilder('log')
      .select('log.module', 'module')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.module')
      .getRawMany();

    const byAction = await this.auditLogRepository
      .createQueryBuilder('log')
      .select('log.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.action')
      .getRawMany();

    return {
      total,
      todayCount,
      byModule,
      byAction,
    };
  }
}