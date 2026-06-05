import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disclosure, DisclosureType, DisclosureStatus } from '../../entities/disclosure.entity';

export interface CreateDisclosureDto {
  title: string;
  content?: string;
  type: DisclosureType;
  communityId: number;
  createdBy: string;
  scheduledAt?: Date;
  attachmentUrls?: string[];
}

export interface UpdateDisclosureDto {
  title?: string;
  content?: string;
  type?: DisclosureType;
  scheduledAt?: Date;
  isPinned?: boolean;
  attachmentUrls?: string[];
}

@Injectable()
export class DisclosureService {
  constructor(
    @InjectRepository(Disclosure)
    private disclosureRepository: Repository<Disclosure>,
  ) {}

  async create(dto: CreateDisclosureDto): Promise<Disclosure> {
    const disclosure = this.disclosureRepository.create({
      ...dto,
      status: dto.scheduledAt ? DisclosureStatus.DRAFT : DisclosureStatus.PUBLISHED,
      publishedAt: dto.scheduledAt ? null : new Date(),
    });
    return this.disclosureRepository.save(disclosure);
  }

  async findAll(
    communityId?: number,
    type?: DisclosureType,
    status?: DisclosureStatus,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Disclosure[]; total: number }> {
    const query = this.disclosureRepository.createQueryBuilder('disclosure')
      .orderBy('disclosure.isPinned DESC, disclosure.createdAt DESC');

    if (communityId) {
      query.where('disclosure.communityId = :communityId', { communityId });
    }

    if (type) {
      query.andWhere('disclosure.type = :type', { type });
    }

    if (status) {
      query.andWhere('disclosure.status = :status', { status });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: number): Promise<Disclosure> {
    const disclosure = await this.disclosureRepository.findOneBy({ id });
    if (!disclosure) {
      throw new NotFoundException(`公示 ${id} 不存在`);
    }
    return disclosure;
  }

  async update(id: number, dto: UpdateDisclosureDto): Promise<Disclosure> {
    const disclosure = await this.findOne(id);
    Object.assign(disclosure, dto);
    return this.disclosureRepository.save(disclosure);
  }

  async delete(id: number): Promise<void> {
    const result = await this.disclosureRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`公示 ${id} 不存在`);
    }
  }

  async publish(id: number): Promise<Disclosure> {
    const disclosure = await this.findOne(id);
    disclosure.status = DisclosureStatus.PUBLISHED;
    disclosure.publishedAt = new Date();
    return this.disclosureRepository.save(disclosure);
  }

  async archive(id: number): Promise<Disclosure> {
    const disclosure = await this.findOne(id);
    disclosure.status = DisclosureStatus.ARCHIVED;
    return this.disclosureRepository.save(disclosure);
  }

  async incrementView(id: number): Promise<void> {
    await this.disclosureRepository.increment({ id }, 'viewCount', 1);
  }
}