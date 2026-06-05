import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { DisclosureService, CreateDisclosureDto, UpdateDisclosureDto } from './disclosure.service';

@Controller('disclosure')
export class DisclosureController {
  constructor(private readonly disclosureService: DisclosureService) {}

  @Post()
  async create(@Body() dto: CreateDisclosureDto): Promise<any> {
    const data = await this.disclosureService.create(dto);
    return { code: 0, message: '创建成功', data, timestamp: Date.now() };
  }

  @Get()
  async findAll(
    @Query('communityId') communityId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    const data = await this.disclosureService.findAll(
      communityId ? Number(communityId) : undefined,
      type as any,
      status as any,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
    return { code: 0, message: 'success', data, timestamp: Date.now() };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    const data = await this.disclosureService.findOne(Number(id));
    return { code: 0, message: 'success', data, timestamp: Date.now() };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDisclosureDto): Promise<any> {
    const data = await this.disclosureService.update(Number(id), dto);
    return { code: 0, message: '更新成功', data, timestamp: Date.now() };
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    await this.disclosureService.delete(Number(id));
    return { code: 0, message: '删除成功', data: null, timestamp: Date.now() };
  }

  @Post(':id/publish')
  async publish(@Param('id') id: string): Promise<any> {
    const data = await this.disclosureService.publish(Number(id));
    return { code: 0, message: '发布成功', data, timestamp: Date.now() };
  }

  @Post(':id/archive')
  async archive(@Param('id') id: string): Promise<any> {
    const data = await this.disclosureService.archive(Number(id));
    return { code: 0, message: '已归档', data, timestamp: Date.now() };
  }

  @Post(':id/view')
  async incrementView(@Param('id') id: string): Promise<any> {
    await this.disclosureService.incrementView(Number(id));
    return { code: 0, message: 'success', data: null, timestamp: Date.now() };
  }
}