import { Controller, Get, Post, Put, Delete, Body, Query } from '@nestjs/common';
import { LedgerService, CreateLedgerEntryDto, UpdateLedgerEntryDto } from './ledger.service';

@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get()
  async findAll(@Query('communityId') communityId?: string): Promise<any> {
    const data = await this.ledgerService.findAll(communityId ? Number(communityId) : undefined);
    return { code: 0, message: 'success', data, timestamp: Date.now() };
  }

  @Get('statistics')
  async getStatistics(@Query('communityId') communityId?: string): Promise<any> {
    const data = await this.ledgerService.getStatistics(communityId ? Number(communityId) : undefined);
    return { code: 0, message: 'success', data, timestamp: Date.now() };
  }

  @Get('recent')
  async getRecent(@Query('limit') limit?: string, @Query('communityId') communityId?: string): Promise<any> {
    const data = await this.ledgerService.getRecentEntries(
      limit ? Number(limit) : 10,
      communityId ? Number(communityId) : undefined
    );
    return { code: 0, message: 'success', data, timestamp: Date.now() };
  }

  @Get(':id')
  async findOne(@Query('id') id: string): Promise<any> {
    const data = await this.ledgerService.findOne(Number(id));
    return { code: 0, message: 'success', data, timestamp: Date.now() };
  }

  @Post()
  async create(@Body() dto: CreateLedgerEntryDto): Promise<any> {
    const data = await this.ledgerService.create(dto);
    return { code: 0, message: '创建成功', data, timestamp: Date.now() };
  }

  @Put(':id')
  async update(@Query('id') id: string, @Body() dto: UpdateLedgerEntryDto): Promise<any> {
    const data = await this.ledgerService.update(Number(id), dto);
    return { code: 0, message: '更新成功', data, timestamp: Date.now() };
  }

  @Delete(':id')
  async delete(@Query('id') id: string): Promise<any> {
    await this.ledgerService.delete(Number(id));
    return { code: 0, message: '删除成功', data: null, timestamp: Date.now() };
  }
}