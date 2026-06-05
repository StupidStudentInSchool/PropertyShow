import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

// 模块
import { AuthModule } from './modules/auth/auth.module';
import { CommunityModule } from './modules/community/community.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { GovernanceModule } from './modules/governance/governance.module';
import { DisclosureModule } from './modules/disclosure/disclosure.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 数据库
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'property_show',
      charset: 'utf8mb4',
      synchronize: false, // 生产环境禁用
      logging: process.env.NODE_ENV === 'development',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
    }),

    // 定时任务
    ScheduleModule.forRoot(),

    // 事件总线
    EventEmitterModule.forRoot(),

    // 业务模块
    AuthModule,
    CommunityModule,
    LedgerModule,
    GovernanceModule,
    DisclosureModule,
    AuditModule,
  ],
})
export class AppModule {}
