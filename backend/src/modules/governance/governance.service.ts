import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote, VoteStatus } from '../../entities/vote.entity';
import { VoteOption } from '../../entities/vote-option.entity';
import { VoteRecord } from '../../entities/vote-record.entity';
import { Inquiry, InquiryStatus } from '../../entities/inquiry.entity';

export interface CreateVoteDto {
  title: string;
  description?: string;
  options: { text: string }[];
  startDate: Date;
  endDate: Date;
  communityId: number;
  createdBy: string;
  isAnonymous?: boolean;
}

export interface ReplyInquiryDto {
  replyContent: string;
  repliedBy: string;
}

@Injectable()
export class GovernanceService {
  constructor(
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
    @InjectRepository(VoteOption)
    private voteOptionRepository: Repository<VoteOption>,
    @InjectRepository(VoteRecord)
    private voteRecordRepository: Repository<VoteRecord>,
    @InjectRepository(Inquiry)
    private inquiryRepository: Repository<Inquiry>,
  ) {}

  async createVote(dto: CreateVoteDto): Promise<Vote> {
    const vote = this.voteRepository.create({
      title: dto.title,
      description: dto.description,
      startDate: dto.startDate,
      endDate: dto.endDate,
      communityId: dto.communityId,
      createdBy: dto.createdBy,
      isAnonymous: dto.isAnonymous || false,
      status: VoteStatus.ONGOING,
      totalVotes: 0,
    });

    const savedVote = await this.voteRepository.save(vote);

    const options = dto.options.map((opt, index) => ({
      voteId: savedVote.id,
      text: opt.text,
      votes: 0,
    }));

    await this.voteOptionRepository.save(options);

    return savedVote;
  }

  async findAllVotes(communityId?: number): Promise<any[]> {
    const query = this.voteRepository.createQueryBuilder('vote')
      .leftJoinAndSelect('vote.options', 'options')
      .orderBy('vote.createdAt', 'DESC');

    if (communityId) {
      query.where('vote.communityId = :communityId', { communityId });
    }

    const votes = await query.getMany();

    return votes.map(vote => ({
      ...vote,
      participants: vote.totalVotes,
    }));
  }

  async findVoteById(id: number): Promise<Vote> {
    const vote = await this.voteRepository.findOne({
      where: { id },
      relations: ['options'],
    });
    if (!vote) {
      throw new NotFoundException(`投票 ${id} 不存在`);
    }
    return vote;
  }

  async vote(voteId: number, optionId: number, voterId: string, voterName: string): Promise<Vote> {
    const vote = await this.findVoteById(voteId);
    
    if (vote.status !== VoteStatus.ONGOING) {
      throw new Error('投票已结束');
    }

    const existingVote = await this.voteRecordRepository.findOne({
      where: { voteId, voterId },
    });

    if (existingVote) {
      throw new Error('您已参与过此投票');
    }

    const option = vote.options.find(opt => opt.id === optionId);
    if (!option) {
      throw new NotFoundException('投票选项不存在');
    }

    await this.voteOptionRepository.increment({ id: optionId }, 'votes', 1);
    await this.voteRepository.increment({ id: voteId }, 'totalVotes', 1);

    await this.voteRecordRepository.save({
      voteId,
      optionId,
      voterId,
      voterName,
    });

    return this.findVoteById(voteId);
  }

  async closeVote(id: number): Promise<Vote> {
    const vote = await this.findVoteById(id);
    vote.status = VoteStatus.ENDED;
    return this.voteRepository.save(vote);
  }

  async createInquiry(title: string, content: string, authorId: string, authorName: string, communityId: number): Promise<Inquiry> {
    const inquiry = this.inquiryRepository.create({
      title,
      content,
      authorId,
      authorName,
      communityId,
      status: InquiryStatus.PENDING,
    });
    return this.inquiryRepository.save(inquiry);
  }

  async findAllInquiries(communityId?: number, status?: InquiryStatus): Promise<Inquiry[]> {
    const query = this.inquiryRepository.createQueryBuilder('inquiry')
      .orderBy('inquiry.createdAt', 'DESC');

    if (communityId) {
      query.where('inquiry.communityId = :communityId', { communityId });
    }

    if (status) {
      query.andWhere('inquiry.status = :status', { status });
    }

    return query.getMany();
  }

  async findInquiryById(id: number): Promise<Inquiry> {
    const inquiry = await this.inquiryRepository.findOneBy({ id });
    if (!inquiry) {
      throw new NotFoundException(`质询 ${id} 不存在`);
    }
    return inquiry;
  }

  async replyInquiry(id: number, dto: ReplyInquiryDto): Promise<Inquiry> {
    const inquiry = await this.findInquiryById(id);
    inquiry.replyContent = dto.replyContent;
    inquiry.repliedBy = dto.repliedBy;
    inquiry.repliedAt = new Date();
    inquiry.status = InquiryStatus.REPLIED;
    return this.inquiryRepository.save(inquiry);
  }

  async closeInquiry(id: number): Promise<Inquiry> {
    const inquiry = await this.findInquiryById(id);
    inquiry.status = InquiryStatus.CLOSED;
    inquiry.closedAt = new Date();
    return this.inquiryRepository.save(inquiry);
  }

  async deleteInquiry(id: number): Promise<void> {
    const result = await this.inquiryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`质询 ${id} 不存在`);
    }
  }
}