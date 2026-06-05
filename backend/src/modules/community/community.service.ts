import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community, CommunityStatus } from '../../entities/community.entity';

export interface CreateCommunityDto {
  name: string;
  address: string;
  contactPhone?: string;
  totalHouseholds?: number;
  description?: string;
}

export interface UpdateCommunityDto {
  name?: string;
  address?: string;
  contactPhone?: string;
  totalHouseholds?: number;
  status?: CommunityStatus;
  description?: string;
}

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(Community)
    private communityRepository: Repository<Community>,
  ) {}

  async findAll(): Promise<Community[]> {
    return this.communityRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Community> {
    const community = await this.communityRepository.findOneBy({ id });
    if (!community) {
      throw new NotFoundException(`社区 ${id} 不存在`);
    }
    return community;
  }

  async create(dto: CreateCommunityDto): Promise<Community> {
    const community = this.communityRepository.create({
      ...dto,
      totalHouseholds: dto.totalHouseholds || 0,
      registeredHouseholds: 0,
    });
    return this.communityRepository.save(community);
  }

  async update(id: number, dto: UpdateCommunityDto): Promise<Community> {
    const community = await this.findOne(id);
    Object.assign(community, dto);
    return this.communityRepository.save(community);
  }

  async delete(id: number): Promise<void> {
    const result = await this.communityRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`社区 ${id} 不存在`);
    }
  }

  async toggleStatus(id: number): Promise<Community> {
    const community = await this.findOne(id);
    community.status = community.status === CommunityStatus.ACTIVE 
      ? CommunityStatus.INACTIVE 
      : CommunityStatus.ACTIVE;
    return this.communityRepository.save(community);
  }
}