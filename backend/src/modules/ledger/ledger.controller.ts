import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { LedgerService, CreateLedgerEntryDto, UpdateLedgerEntryDto } from './ledger.service';

@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get()
  async findAll(@Query('communityId') communityId?: string) {
    return this.ledgerService.findAll(communityId ? Number(communityId) : undefined);
  }

  @Get('statistics')
  async getStatistics(@Query('communityId') communityId?: string) {
    return this.ledgerService.getStatistics(communityId ? Number(communityId) : undefined);
  }

  @Get('recent')
  async getRecent(@Query('limit') limit?: string, @Query('communityId') communityId?: string) {
    return this.ledgerService.getRecentEntries(
      limit ? Number(limit) : 10,
      communityId ? Number(communityId) : undefined
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ledgerService.findOne(Number(id));
  }

  @Post()
  async create(@Body() dto: CreateLedgerEntryDto) {
    return this.ledgerService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateLedgerEntryDto) {
    return this.ledgerService.update(Number(id), dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.ledgerService.delete(Number(id));
  }
}