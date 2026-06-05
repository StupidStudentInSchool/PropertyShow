#!/bin/bash

# 物业透明化系统 - 快速启动脚本

set -e

echo "
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   物业透明化系统 - 快速启动                        ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "错误：Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "错误：Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

echo "✓ Docker 已安装"
echo "✓ Docker Compose 已安装"
echo ""

# 启动服务
echo "正在启动服务..."
docker-compose up -d

echo ""
echo "等待服务启动..."
sleep 10

# 检查服务状态
echo ""
echo "服务状态:"
docker-compose ps

echo ""
echo "
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   服务已启动！                                     ║
║                                                   ║
║   后端 API:    http://localhost:3000              ║
║   API 文档：   http://localhost:3000/api/docs     ║
║   MinIO:       http://localhost:9000              ║
║   MinIO 控制台：http://localhost:9001              ║
║                                                   ║
║   查看日志：docker-compose logs -f api            ║
║   停止服务：docker-compose down                   ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
"
