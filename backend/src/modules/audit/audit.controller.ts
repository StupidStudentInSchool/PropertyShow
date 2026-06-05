import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AuditService, CreateAuditLogDto } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  async create(@Body() dto: CreateAuditLogDto): Promise<any> {
    const data = await this.auditService.create(dto);
    return { code: 0, message: '创建成功', data, timestamp: Date.now() };
  }

  @Get()
  async findAll(
    @Query('module') module?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    const data = await this.auditService.findAll(
      module as any,
      action as any,
      userId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
    return { code: 0, message: 'success', data, timestamp: Date.now() };
  }

  @Get('statistics')
  async getStatistics(): Promise<any> {
    const data = await this.auditService.getStatistics();
    return { code: 0, message: 'success', data, timestamp: Date.now() };
  }
}