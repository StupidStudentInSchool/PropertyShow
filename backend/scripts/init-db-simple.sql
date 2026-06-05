-- 简化版数据库初始化脚本（供本地开发使用）
-- 这些表是后端代码需要的简化结构

USE property_show;

SET FOREIGN_KEY_CHECKS = 0;

-- 财务台账条目表（简化版）
CREATE TABLE IF NOT EXISTS ledger_entry (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  type        ENUM('INCOME', 'EXPENSE') NOT NULL,
  category    VARCHAR(50) NOT NULL,
  amount      DECIMAL(12,2) NOT NULL,
  counterparty VARCHAR(255) NOT NULL,
  occurred_at DATETIME NOT NULL,
  description TEXT,
  evidence_url VARCHAR(500),
  hash_value  VARCHAR(255),
  community_id INT NOT NULL,
  created_by  VARCHAR(50) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_community (community_id),
  INDEX idx_occurred_at (occurred_at),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='财务台账条目';

-- 哈希链表（简化版）
CREATE TABLE IF NOT EXISTS hash_chain (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  prev_hash       TEXT NOT NULL,
  current_hash     TEXT NOT NULL,
  ledger_entry_id INT NOT NULL,
  chain_index     INT NOT NULL,
  block_time      DATETIME NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chain_index (chain_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='哈希链';

-- 审计日志表（简化版）
CREATE TABLE IF NOT EXISTS audit_logs (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  action      VARCHAR(50) NOT NULL,
  module      VARCHAR(50) NOT NULL,
  user_id     VARCHAR(50) NOT NULL,
  user_name   VARCHAR(50) NOT NULL,
  target_id   INT,
  target_name VARCHAR(200),
  detail      TEXT,
  ip          VARCHAR(50),
  user_agent  VARCHAR(255),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_module (module),
  INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审计日志';

-- 小区表（简化版）
CREATE TABLE IF NOT EXISTS community (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(100) NOT NULL,
  address         VARCHAR(255) NOT NULL,
  contact_phone   VARCHAR(20),
  total_households INT DEFAULT 0,
  status          VARCHAR(20) DEFAULT 'ACTIVE',
  description     TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='小区';

-- 公示表
CREATE TABLE IF NOT EXISTS disclosures (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  title           VARCHAR(200) NOT NULL,
  content         TEXT,
  type            ENUM('FINANCIAL', 'ANNOUNCEMENT', 'NOTICE', 'DOCUMENT') NOT NULL,
  status          ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT',
  community_id    INT NOT NULL,
  created_by      VARCHAR(50) NOT NULL,
  published_at    DATETIME,
  scheduled_at    DATETIME,
  is_pinned       BOOLEAN DEFAULT FALSE,
  view_count      INT DEFAULT 0,
  attachment_urls TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_community (community_id),
  INDEX idx_type (type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公示';

-- 投票表
CREATE TABLE IF NOT EXISTS vote (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  start_date      DATETIME NOT NULL,
  end_date        DATETIME NOT NULL,
  community_id    INT NOT NULL,
  created_by      VARCHAR(50) NOT NULL,
  is_anonymous    BOOLEAN DEFAULT FALSE,
  status          VARCHAR(20) DEFAULT 'ACTIVE',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_community (community_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投票';

-- 投票选项表
CREATE TABLE IF NOT EXISTS vote_option (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  vote_id         INT NOT NULL,
  text            VARCHAR(255) NOT NULL,
  INDEX idx_vote_id (vote_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投票选项';

-- 投票记录表
CREATE TABLE IF NOT EXISTS vote_record (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  vote_id         INT NOT NULL,
  option_id       INT NOT NULL,
  voter_id        VARCHAR(50) NOT NULL,
  voter_name      VARCHAR(50) NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vote_id (vote_id),
  INDEX idx_voter_id (voter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投票记录';

-- 咨询表
CREATE TABLE IF NOT EXISTS inquiry (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  title           VARCHAR(255) NOT NULL,
  content         TEXT NOT NULL,
  author_id       VARCHAR(50) NOT NULL,
  author_name     VARCHAR(50) NOT NULL,
  community_id    INT NOT NULL,
  status          VARCHAR(20) DEFAULT 'PENDING',
  reply_content   TEXT,
  replied_by      VARCHAR(50),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_community (community_id),
  INDEX idx_author (author_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='咨询';

-- 账单表
CREATE TABLE IF NOT EXISTS bill (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  title           VARCHAR(255) NOT NULL,
  type            VARCHAR(50) NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  status          VARCHAR(20) DEFAULT 'UNPAID',
  community_id    INT NOT NULL,
  created_by      VARCHAR(50) NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_community (community_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账单';

-- 插入示例数据（仅插入已存在的列）
INSERT INTO community (name, address, contact_phone, total_households, status) VALUES
  ('阳光花园示范小区', '北京市朝阳区示范路1号', '010-12345678', 480, 'ACTIVE') ON DUPLICATE KEY UPDATE name=name;

SET FOREIGN_KEY_CHECKS = 1;

SELECT '简化表结构创建完成！' AS message;
