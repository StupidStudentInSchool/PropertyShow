import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { GovernanceService, CreateVoteDto, ReplyInquiryDto } from './governance.service';

@Controller('governance')
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Post('vote')
  async createVote(@Body() dto: CreateVoteDto): Promise<any> {
    const data = await this.governanceService.createVote(dto);
    return { code: 0, message: '投票创建成功', data, timestamp: Date.now() };
  }

  @Get('vote')
  async findAllVotes(@Query('communityId') communityId?: string): Promise<any> {
    const data = await this.governanceService.findAllVotes(communityId ? Number(communityId) : undefined);
    return { code: 0, message: 'success', data, timestamp: Date.now() };
  }

  @Get('vote/:id')
  async findVoteById(@Param('id') id: string): Promise<any> {
    const data = await this.governanceService.findVoteById(Number(id));
    return { code: 0, message: 'success', data, timestamp: Date.now() };
  }

  @Post('vote/:id/vote')
  async vote(
    @Param('id') id: string,
    @Body() body: { optionId: number; voterId: string; voterName: string }
  ): Promise<any> {
    const data = await this.governanceService.vote(
      Number(id),
      body.optionId,
      body.voterId,
      body.voterName
    );
    return { code: 0, message: '投票成功', data, timestamp: Date.now() };
  }

  @Post('vote/:id/close')
  async closeVote(@Param('id') id: string): Promise<any> {
    const data = await this.governanceService.closeVote(Number(id));
    return { code: 0, message: '投票已关闭', data, timestamp: Date.now() };
  }

  @Post('inquiry')
  async createInquiry(@Body() body: { title: string; content: string; authorId: string; authorName: string; communityId: number }): Promise<any> {
    const data = await this.governanceService.createInquiry(
      body.title,
      body.content,
      body.authorId,
      body.authorName,
      body.communityId
    );
    return { code: 0, message: '质询创建成功', data, timestamp: Date.now() };
  }

  @Get('inquiry')
  async findAllInquiries(
    @Query('communityId') communityId?: string,
    @Query('status') status?: string
  ): Promise<any> {
    const data = await this.governanceService.findAllInquiries(
      communityId ? Number(communityId) : undefined,
      status as any
    );
    return { code: 0, message: 'success', data, timestamp: Date.now() };
  }

  @Get('inquiry/:id')
  async findInquiryById(@Param('id') id: string): Promise<any> {
    const data = await this.governanceService.findInquiryById(Number(id));
    return { code: 0, message: 'success', data, timestamp: Date.now() };
  }

  @Put('inquiry/:id/reply')
  async replyInquiry(@Param('id') id: string, @Body() dto: ReplyInquiryDto): Promise<any> {
    const data = await this.governanceService.replyInquiry(Number(id), dto);
    return { code: 0, message: '回复成功', data, timestamp: Date.now() };
  }

  @Post('inquiry/:id/close')
  async closeInquiry(@Param('id') id: string): Promise<any> {
    const data = await this.governanceService.closeInquiry(Number(id));
    return { code: 0, message: '质询已关闭', data, timestamp: Date.now() };
  }

  @Delete('inquiry/:id')
  async deleteInquiry(@Param('id') id: string): Promise<any> {
    await this.governanceService.deleteInquiry(Number(id));
    return { code: 0, message: '删除成功', data: null, timestamp: Date.now() };
  }
}