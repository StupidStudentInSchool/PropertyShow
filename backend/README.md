# 物业透明化系统 - 后端服务

## 技术栈

- **框架**: NestJS 10.x
- **语言**: TypeScript
- **数据库**: MySQL 8.0
- **缓存**: Redis 7.x
- **对象存储**: MinIO

## 快速开始

### 环境要求

- Node.js >= 18.x
- MySQL 8.0
- Redis 7.x
- MinIO (可选)

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 到 `.env` 并修改配置:

```bash
cp .env.example .env
```

### 启动开发服务器

```bash
npm run start:dev
```

### 数据库迁移

```bash
# 生成迁移
npm run migration:generate -- src/database/migrations/CreateInitialTables

# 运行迁移
npm run migration:run

# 回滚迁移
npm run migration:revert
```

## 项目结构

```
src/
├── main.ts                 # 应用入口
├── common/                 # 公共模块
│   ├── decorators/        # 自定义装饰器
│   ├── filters/           # 异常过滤器
│   ├── guards/            # 权限守卫
│   ├── interceptors/      # 拦截器
│   └── pipes/             # 管道
├── modules/               # 业务模块
│   ├── auth/              # 认证授权
│   ├── community/         # 小区管理
│   ├── ledger/            # 财务台账
│   ├── governance/        # 业主共治
│   ├── disclosure/        # 公示服务
│   └── audit/             # 审计服务
└── database/              # 数据库配置
    ├── typeorm.config.ts
    └── migrations/
```

## API 文档

启动后访问: http://localhost:3000/api/docs

## 测试

```bash
# 单元测试
npm run test

# 端到端测试
npm run test:e2e

# 测试覆盖率
npm run test:cov
```

## 许可证

MIT
