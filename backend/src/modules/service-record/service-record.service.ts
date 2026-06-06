import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { ServiceRecord, ServiceStatus, ServiceCategory } from '../../entities/service-record.entity';

export interface CreateServiceRecordDto {
  title: string;
  description?: string;
  category: ServiceCategory;
  communityId: number;
  staffName: string;
  staffPhone?: string;
  startTime?: Date;
  location?: string;
  createdBy: string;
  imageUrl?: string;
}

export interface UpdateServiceRecordDto {
  title?: string;
  description?: string;
  status?: ServiceStatus;
  endTime?: Date;
  notes?: string;
  imageUrl?: string;
}

@Injectable()
export class ServiceRecordService {
  constructor(
    @InjectRepository(ServiceRecord)
    private serviceRecordRepository: Repository<ServiceRecord>,
  ) {}

  async create(dto: CreateServiceRecordDto): Promise<ServiceRecord> {
    const record = this.serviceRecordRepository.create({
      ...dto,
      status: ServiceStatus.PENDING,
    });
    return this.serviceRecordRepository.save(record);
  }

  async findAll(
    communityId?: number,
    category?: ServiceCategory,
    status?: ServiceStatus,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: ServiceRecord[]; total: number }> {
    const query = this.serviceRecordRepository
      .createQueryBuilder('record')
      .orderBy('record.createdAt DESC');

    if (communityId) {
      query.where('record.communityId = :communityId', { communityId });
    }
    if (category) {
      query.andWhere('record.category = :category', { category });
    }
    if (status) {
      query.andWhere('record.status = :status', { status });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findTodayRecords(communityId: number): Promise<ServiceRecord[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.serviceRecordRepository.find({
      where: {
        communityId,
        createdAt: MoreThan(today),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ServiceRecord> {
    const record = await this.serviceRecordRepository.findOneBy({ id });
    if (!record) {
      throw new NotFoundException(`服务记录 ${id} 不存在`);
    }
    return record;
  }

  async update(id: number, dto: UpdateServiceRecordDto): Promise<ServiceRecord> {
    const record = await this.findOne(id);
    Object.assign(record, dto);
    return this.serviceRecordRepository.save(record);
  }

  async delete(id: number): Promise<void> {
    const result = await this.serviceRecordRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`服务记录 ${id} 不存在`);
    }
  }

  async complete(id: number, notes?: string): Promise<ServiceRecord> {
    const record = await this.findOne(id);
    record.status = ServiceStatus.COMPLETED;
    record.endTime = new Date();
    if (notes) {
      record.notes = notes;
    }
    return this.serviceRecordRepository.save(record);
  }

  async getStats(communityId: number): Promise<{
    completed: number;
    inProgress: number;
    total: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [completed, inProgress, total] = await Promise.all([
      this.serviceRecordRepository.count({
        where: {
          communityId,
          status: ServiceStatus.COMPLETED,
          createdAt: MoreThan(today),
        },
      }),
      this.serviceRecordRepository.count({
        where: {
          communityId,
          status: ServiceStatus.IN_PROGRESS,
          createdAt: MoreThan(today),
        },
      }),
      this.serviceRecordRepository.count({
        where: {
          communityId,
          createdAt: MoreThan(today),
        },
      }),
    ]);

    return { completed, inProgress, total };
  }
}
