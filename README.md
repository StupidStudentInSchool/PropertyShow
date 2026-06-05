# 物业透明化系统 (PropertyShow)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.x-brightgreen.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/nestjs-%3E%3D10.x-red.svg)](https://nestjs.com/)
[![UniApp](https://img.shields.io/badge/uniapp-%3E%3D3.x-green.svg)](https://uniapp.dcloud.net.cn/)

## 项目简介

物业透明化系统是一个旨在重建物业与业主之间信任的 Web 应用系统。通过透明、可验证的财务数据公示和运营决策，让业主了解物业费的收支情况，增强双方互信。

### 核心功能

- **财务公示**: 每月物业收支明细公示，支持 SHA-256 哈希链防篡改
- **业主投票**: 重大事项业主投票，需三分之二多数通过
- **质询系统**: 业主可对财务数据提出质询，物业必须回复
- **公示大屏**: 小区公共区域展示关键信息
- **我的账单**: 业主查看个人物业费缴纳情况

### 技术架构

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  UniApp     │      │  NestJS     │      │   MySQL 8   │
│  前端       │◄────►│  后端       │◄────►│   数据库    │
│  (小程序)   │      │  (API)      │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │   Redis 7   │
                     │   缓存      │
                     └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │   MinIO     │
                     │   对象存储  │
                     └─────────────┘
```

## 快速开始

### 环境要求

- Node.js >= 18.x
- Docker & Docker Compose
- Git

### 方式一：使用 Docker Compose (推荐)

```bash
# 克隆项目
git clone <repository-url>
cd PropertyShow-1

# 启动所有服务 (MySQL, Redis, MinIO, Backend)
docker-compose up -d

# 查看日志
docker-compose logs -f api

# 停止服务
docker-compose down
```

服务启动后:
- 后端 API: http://localhost:3000
- API 文档：http://localhost:3000/api/docs
- MinIO 控制台：http://localhost:9001 (账号/密码：minioadmin/minioadmin)

### 方式二：本地开发

#### 1. 启动基础设施

```bash
docker-compose up -d mysql redis minio
```

#### 2. 后端开发

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，修改数据库等配置

# 运行数据库迁移
npm run migration:run

# 启动开发服务器
npm run start:dev
```

#### 3. 前端开发

```bash
cd frontend

# 安装依赖
npm install

# 启动 H5 开发服务器
npm run dev:h5

# 或启动微信小程序开发
npm run dev:mp-weixin
```

## 项目结构

```
PropertyShow-1/
├── backend/               # NestJS 后端
│   ├── src/
│   │   ├── common/       # 公共模块
│   │   ├── modules/      # 业务模块
│   │   │   ├── auth/     # 认证授权
│   │   │   ├── community/# 小区管理
│   │   │   ├── ledger/   # 财务台账
│   │   │   ├── governance/# 业主共治
│   │   │   ├── disclosure/# 公示服务
│   │   │   └── audit/    # 审计服务
│   │   └── main.ts
│   ├── package.json
│   └── Dockerfile
├── frontend/             # UniApp 前端
│   ├── src/
│   │   ├── pages/       # 页面
│   │   ├── components/  # 组件
│   │   ├── stores/      # Pinia 状态管理
│   │   ├── utils/       # 工具函数
│   │   └── api/         # API 接口
│   ├── package.json
│   └── manifest.json
├── docs/                 # 文档
│   └── system-design.md # 系统设计文档
├── docker/              # Docker 配置
│   └── mysql/
│       └── init/       # 初始化脚本
├── docker-compose.yml   # Docker Compose 配置
└── README.md
```

## 核心模块说明

### 后端模块

| 模块 | 说明 | API 路径 |
|------|------|----------|
| Auth | 用户认证、JWT 令牌 | `/api/v1/auth` |
| Community | 小区、楼栋、房屋管理 | `/api/v1/community` |
| Ledger | 财务台账、收支记录 | `/api/v1/ledger` |
| Governance | 业主投票、质询 | `/api/v1/governance` |
| Disclosure | 公示信息发布 | `/api/v1/disclosure` |
| Audit | 审计日志、哈希链验证 | `/api/v1/audit` |

### 前端页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/pages/index/index` | 系统首页 |
| 登录 | `/pages/login/login` | 用户登录 |
| 公示 | `/pages/disclosure/disclosure` | 财务公示列表 |
| 投票 | `/pages/vote/vote` | 业主投票 |
| 质询 | `/pages/inquiry/inquiry` | 质询列表 |
| 账单 | `/pages/bill/bill` | 我的账单 |
| 我的 | `/pages/profile/profile` | 个人中心 |

## 开发指南

### 数据库迁移

```bash
cd backend

# 生成新迁移
npm run migration:generate -- src/database/migrations/CreateUserTable

# 运行迁移
npm run migration:run

# 回滚迁移
npm run migration:revert
```

### 测试

```bash
cd backend

# 单元测试
npm run test

# 端到端测试
npm run test:e2e

# 测试覆盖率
npm run test:cov
```

### 代码规范

```bash
# 后端
cd backend
npm run lint
npm run format

# 前端
cd frontend
npm run lint
```

## API 文档

启动后端后访问: http://localhost:3000/api/docs

API 文档使用 Swagger 自动生成，支持在线测试。

## 部署

### 生产环境部署

1. 修改 `docker-compose.yml` 中的环境变量
2. 配置 HTTPS 证书
3. 设置强密码和 JWT 密钥
4. 配置对象存储 (建议使用云服务商的 OSS)
5. 配置监控和日志系统

```bash
# 生产环境启动
docker-compose -f docker-compose.prod.yml up -d
```

## 常见问题

### Q: 如何重置数据库？

```bash
docker-compose down -v mysql
docker-compose up -d mysql
```

### Q: 如何查看后端日志？

```bash
docker-compose logs -f api
```

### Q: 如何访问 MinIO 控制台？

访问 http://localhost:9001，使用 `.env` 文件中配置的账号密码登录。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

- 项目仓库：[GitHub](<repository-url>)
- 问题反馈：[Issues](<issues-url>)

---

**注意**: 本项目处于开发阶段，部分功能尚未实现。
