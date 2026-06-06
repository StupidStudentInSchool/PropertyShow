import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ServiceRecordService, CreateServiceRecordDto, UpdateServiceRecordDto } from './service-record.service';
import { ServiceRecord } from '../../entities/service-record.entity';
import { AuthGuard } from '../auth/auth.guard';

@Controller('service-records')
@UseGuards(AuthGuard)
export class ServiceRecordController {
  constructor(private serviceRecordService: ServiceRecordService) {}

  @Post()
  async create(@Body() dto: CreateServiceRecordDto): Promise<ServiceRecord> {
    return this.serviceRecordService.create(dto);
  }

  @Get()
  async findAll(
    @Query('communityId') communityId?: number,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<{ data: ServiceRecord[]; total: number }> {
    return this.serviceRecordService.findAll(communityId, category as any, status as any, page, limit);
  }

  @Get('today/:communityId')
  async findToday(@Param('communityId') communityId: number): Promise<ServiceRecord[]> {
    return this.serviceRecordService.findTodayRecords(communityId);
  }

  @Get('stats/:communityId')
  async getStats(@Param('communityId') communityId: number) {
    return this.serviceRecordService.getStats(communityId);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ServiceRecord> {
    return this.serviceRecordService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateServiceRecordDto): Promise<ServiceRecord> {
    return this.serviceRecordService.update(id, dto);
  }

  @Put(':id/complete')
  async complete(@Param('id') id: number, @Body() body: { notes?: string }) {
    return this.serviceRecordService.complete(id, body.notes);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.serviceRecordService.delete(id);
  }
}
