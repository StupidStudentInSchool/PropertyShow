import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRecord } from '../../entities/service-record.entity';
import { ServiceRecordService } from './service-record.service';
import { ServiceRecordController } from './service-record.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRecord]), AuthModule],
  providers: [ServiceRecordService],
  controllers: [ServiceRecordController],
  exports: [ServiceRecordService],
})
export class ServiceRecordModule {}
