import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisclosureController } from './disclosure.controller';
import { DisclosureService } from './disclosure.service';
import { Disclosure } from '../../entities/disclosure.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Disclosure])],
  controllers: [DisclosureController],
  providers: [DisclosureService],
  exports: [DisclosureService],
})
export class DisclosureModule {}