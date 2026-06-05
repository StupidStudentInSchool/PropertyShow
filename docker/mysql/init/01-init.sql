-- 数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS property_show 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE property_show;

-- 创建扩展插件 (如果需要)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 提示
SELECT '数据库初始化完成！' AS message;
