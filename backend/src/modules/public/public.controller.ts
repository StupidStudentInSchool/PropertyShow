import { Controller, Get, Post, Param, Query, Body, HttpException, HttpStatus } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('disclosure/:communityId')
  async getDisclosure(@Param('communityId') communityId: string) {
    const id = parseInt(communityId);
    if (isNaN(id)) {
      throw new HttpException('无效的小区ID', HttpStatus.BAD_REQUEST);
    }
    return this.publicService.getDisclosure(id);
  }

  @Get('evidence/:id/download')
  async downloadEvidence(@Param('id') id: string) {
    const evidenceId = parseInt(id);
    if (isNaN(evidenceId)) {
      throw new HttpException('无效的凭证ID', HttpStatus.BAD_REQUEST);
    }
    return this.publicService.downloadEvidence(evidenceId);
  }

  @Get('hash/verify')
  async verifyHash(
    @Query('data') data: string,
    @Query('expectedHash') expectedHash: string,
  ) {
    if (!data || !expectedHash) {
      throw new HttpException('缺少必要参数', HttpStatus.BAD_REQUEST);
    }
    return this.publicService.verifyHash(data, expectedHash);
  }

  @Post('feedback')
  async submitFeedback(@Body() body: { content: string; contactInfo?: string; anonymous: boolean }) {
    if (!body.content || body.content.trim().length === 0) {
      throw new HttpException('反馈内容不能为空', HttpStatus.BAD_REQUEST);
    }
    return this.publicService.submitFeedback(body);
  }
}
