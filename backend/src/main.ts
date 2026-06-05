import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 全局前缀
  const apiPrefix = configService.get<string>('API_PREFIX', '/api/v1');
  app.setGlobalPrefix(apiPrefix);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());

  // 全局拦截器
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('物业透明化系统 API')
    .setDescription('物业透明化系统后端服务 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', '认证授权')
    .addTag('community', '小区管理')
    .addTag('ledger', '财务台账')
    .addTag('governance', '业主共治')
    .addTag('disclosure', '公示服务')
    .addTag('audit', '审计服务')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // 启用 CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = configService.get<number>('APP_PORT', 3000);
  await app.listen(port);
  
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║   物业透明化系统后端服务已启动                      ║
  ║                                                   ║
  ║   环境：${configService.get('NODE_ENV', 'development').padEnd(10)}                      ║
  ║   端口：${port.toString().padEnd(10)}                      ║
  ║   API:  http://localhost:${port.toString().padEnd(5)}${apiPrefix}              ║
  ║   Docs: http://localhost:${port.toString().padEnd(5)}/api/docs          ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
  `);
}

bootstrap();
