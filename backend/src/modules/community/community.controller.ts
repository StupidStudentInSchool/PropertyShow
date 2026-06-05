import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CommunityService, CreateCommunityDto, UpdateCommunityDto } from './community.service';
import { Community } from '../../entities/community.entity';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  async findAll(): Promise<any> {
    const data = await this.communityService.findAll();
    return { code: 0, message: 'success', data, timestamp: Date.now() };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    const data = await this.communityService.findOne(Number(id));
    return { code: 0, message: 'success', data, timestamp: Date.now() };
  }

  @Post()
  async create(@Body() dto: CreateCommunityDto): Promise<any> {
    const data = await this.communityService.create(dto);
    return { code: 0, message: '创建成功', data, timestamp: Date.now() };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCommunityDto): Promise<any> {
    const data = await this.communityService.update(Number(id), dto);
    return { code: 0, message: '更新成功', data, timestamp: Date.now() };
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    await this.communityService.delete(Number(id));
    return { code: 0, message: '删除成功', data: null, timestamp: Date.now() };
  }

  @Post(':id/toggle-status')
  async toggleStatus(@Param('id') id: string): Promise<any> {
    const data = await this.communityService.toggleStatus(Number(id));
    return { code: 0, message: '状态已切换', data, timestamp: Date.now() };
  }
}