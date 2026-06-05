-- ============================================================
-- 物业透明化系统 · 数据库初始化脚本 (完整版)
-- 适用于 MySQL 8.0
-- ============================================================

-- 1. 创建数据库
DROP DATABASE IF EXISTS property_show;
CREATE DATABASE property_show
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE property_show;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 2. 基础数据表
-- ============================================================

-- 2.1 小区表
CREATE TABLE community (
  id            VARCHAR(36)  PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  address       VARCHAR(255) NOT NULL,
  property_company_id VARCHAR(36) NULL,
  total_area    DECIMAL(12,2) DEFAULT 0,
  total_households INT DEFAULT 0,
  status        ENUM('PENDING','ACTIVE','SUSPENDED') NOT NULL DEFAULT 'PENDING',
  contact_phone VARCHAR(20),
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='小区';

-- 2.2 物业公司
CREATE TABLE property_company (
  id          VARCHAR(36)  PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  license_no  VARCHAR(100),
  contact     VARCHAR(50),
  phone       VARCHAR(20),
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='物业公司';

-- 2.3 物业员工
CREATE TABLE staff (
  id          VARCHAR(36)  PRIMARY KEY,
  community_id VARCHAR(36) NOT NULL,
  username    VARCHAR(50)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name        VARCHAR(50)  NOT NULL,
  phone       VARCHAR(20),
  role        ENUM('OPERATOR','REVIEWER','COMMUNITY_ADMIN','PLATFORM_ADMIN') NOT NULL DEFAULT 'OPERATOR',
  status      TINYINT(1)   NOT NULL DEFAULT 1,
  last_login_at TIMESTAMP NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_community_username (community_id, username),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='物业员工';

-- 2.4 楼栋
CREATE TABLE building (
  id          VARCHAR(36)  PRIMARY KEY,
  community_id VARCHAR(36) NOT NULL,
  name        VARCHAR(50)  NOT NULL,
  total_floors INT DEFAULT 0,
  total_units INT DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_community (community_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='楼栋';

-- 2.5 单元
CREATE TABLE unit (
  id          VARCHAR(36)  PRIMARY KEY,
  building_id VARCHAR(36)  NOT NULL,
  name        VARCHAR(50)  NOT NULL,
  total_floors INT DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_building (building_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='单元';

-- 2.6 房屋
CREATE TABLE house (
  id          VARCHAR(36)  PRIMARY KEY,
  unit_id     VARCHAR(36)  NOT NULL,
  building_id VARCHAR(36)  NOT NULL,
  community_id VARCHAR(36) NOT NULL,
  house_number VARCHAR(50) NOT NULL,
  floor       INT DEFAULT 0,
  area        DECIMAL(10,2) DEFAULT 0,
  house_type  ENUM('RESIDENTIAL','COMMERCIAL','OFFICE','OTHER') DEFAULT 'RESIDENTIAL',
  status      ENUM('OCCUPIED','VACANT','RENTED') DEFAULT 'OCCUPIED',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_community (community_id),
  INDEX idx_unit (unit_id),
  INDEX idx_building (building_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='房屋';

-- 2.7 业主
CREATE TABLE owner (
  id          VARCHAR(36)  PRIMARY KEY,
  community_id VARCHAR(36) NOT NULL,
  name        VARCHAR(50)  NOT NULL,
  phone_encrypted VARCHAR(255) NOT NULL,
  id_card_hash VARCHAR(64),
  email       VARCHAR(100),
  avatar      VARCHAR(255),
  status      TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_community (community_id),
  INDEX idx_phone (phone_encrypted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='业主';

-- 2.8 产权（业主-房屋关系）
CREATE TABLE ownership (
  id          VARCHAR(36)  PRIMARY KEY,
  owner_id    VARCHAR(36)  NOT NULL,
  house_id    VARCHAR(36)  NOT NULL,
  share_ratio DECIMAL(5,2) DEFAULT 100.00 COMMENT '产权比例%',
  ownership_type ENUM('OWN','JOINT','AUTHORIZED') DEFAULT 'OWN',
  start_date  DATE,
  end_date    DATE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_owner (owner_id),
  INDEX idx_house (house_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产权';

-- ============================================================
-- 3. 财务台账
-- ============================================================

-- 3.1 账期
CREATE TABLE account_period (
  id          VARCHAR(36)  PRIMARY KEY,
  community_id VARCHAR(36) NOT NULL,
  period_code VARCHAR(20)  NOT NULL COMMENT 'YYYY-MM',
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  status      ENUM('OPEN','REVIEWING','PUBLISHED','LOCKED') NOT NULL DEFAULT 'OPEN',
  total_income_cents BIGINT DEFAULT 0,
  total_expense_cents BIGINT DEFAULT 0,
  published_at TIMESTAMP NULL,
  locked_at    TIMESTAMP NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_community_period (community_id, period_code),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账期';

-- 3.2 会计科目
CREATE TABLE account_subject (
  id          VARCHAR(36)  PRIMARY KEY,
  community_id VARCHAR(36) NOT NULL,
  code        VARCHAR(20)  NOT NULL,
  name        VARCHAR(50)  NOT NULL,
  type        ENUM('INCOME','EXPENSE') NOT NULL,
  parent_id   VARCHAR(36)  NULL,
  sort_order  INT DEFAULT 0,
  status      TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uk_community_code (community_id, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会计科目';

-- 3.3 文件对象
CREATE TABLE file_object (
  id          VARCHAR(36)  PRIMARY KEY,
  bucket      VARCHAR(100) NOT NULL,
  object_key  VARCHAR(255) NOT NULL,
  file_name   VARCHAR(255) NOT NULL,
  mime_type   VARCHAR(100),
  size_bytes  BIGINT DEFAULT 0,
  sha256_hash VARCHAR(64),
  storage_provider ENUM('MINIO','OSS','S3') DEFAULT 'MINIO',
  uploader_id VARCHAR(36),
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sha256 (sha256_hash),
  INDEX idx_uploader (uploader_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件对象';

-- 3.4 财务分录（核心表）
CREATE TABLE journal_entry (
  id            VARCHAR(36)  PRIMARY KEY,
  community_id  VARCHAR(36)  NOT NULL,
  period_id     VARCHAR(36)  NOT NULL,
  entry_type    ENUM('INCOME','EXPENSE','TRANSFER') NOT NULL,
  category_id   VARCHAR(36)  NOT NULL,
  amount_cents  BIGINT       NOT NULL,
  counterparty  VARCHAR(255) NOT NULL,
  description   TEXT,
  occurred_at   TIMESTAMP    NOT NULL,
  operator_id   VARCHAR(36)  NOT NULL,
  reviewer_id   VARCHAR(36)  NULL,
  committee_id  VARCHAR(36)  NULL,
  status        ENUM('DRAFT','PENDING_REVIEW','PUBLISHED','VOIDED') NOT NULL DEFAULT 'DRAFT',
  voided_by_entry_id VARCHAR(36) NULL,
  prev_hash     VARCHAR(64),
  hash          VARCHAR(64)  NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_community_period (community_id, period_id),
  INDEX idx_occurred_at (occurred_at),
  INDEX idx_status (status),
  INDEX idx_hash (hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='财务分录';

-- 3.5 凭证
CREATE TABLE evidence (
  id            VARCHAR(36)  PRIMARY KEY,
  journal_entry_id VARCHAR(36) NOT NULL,
  evidence_type ENUM('INVOICE','CONTRACT','RECEIPT','PHOTO','QUOTE','ACCEPTANCE','MEETING_NOTE') NOT NULL,
  file_object_id VARCHAR(36) NOT NULL,
  invoice_number VARCHAR(100),
  invoice_code   VARCHAR(100),
  amount_cents   BIGINT,
  counterparty   VARCHAR(255),
  upload_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sha256_hash    VARCHAR(64) NOT NULL,
  ocr_data       JSON,
  verified       TINYINT(1) DEFAULT 0,
  verified_at    TIMESTAMP NULL,
  verified_by    VARCHAR(36),
  INDEX idx_journal_entry (journal_entry_id),
  INDEX idx_upload_at (upload_at),
  INDEX idx_hash (sha256_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='凭证';

-- 3.6 哈希链
CREATE TABLE hash_chain_block (
  id          VARCHAR(36)  PRIMARY KEY,
  community_id VARCHAR(36) NOT NULL,
  block_date  DATE NOT NULL,
  prev_hash   VARCHAR(64),
  current_hash VARCHAR(64) NOT NULL,
  entry_count INT NOT NULL,
  merkle_root VARCHAR(64),
  published_at TIMESTAMP NOT NULL,
  published_by VARCHAR(36) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_community_date (community_id, block_date),
  INDEX idx_block_date (block_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='哈希链';

-- ============================================================
-- 4. 业主共治
-- ============================================================

-- 4.1 投票议题
CREATE TABLE vote_issue (
  id          VARCHAR(36)  PRIMARY KEY,
  community_id VARCHAR(36) NOT NULL,
  initiator_id VARCHAR(36) NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  vote_type   ENUM('EXPENSE','PROPERTY_COMPANY','ELEVATOR','RENOVATION','FEE_ADJUSTMENT','OTHER') NOT NULL,
  amount_cents BIGINT,
  start_at    TIMESTAMP NOT NULL,
  end_at      TIMESTAMP NOT NULL,
  status      ENUM('DRAFT','ACTIVE','COMPLETED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  total_households INT NOT NULL,
  total_area  DECIMAL(12,2) NOT NULL,
  result_households INT DEFAULT 0,
  result_area DECIMAL(12,2) DEFAULT 0,
  result_passed TINYINT(1) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_community (community_id),
  INDEX idx_status (status),
  INDEX idx_end_at (end_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投票议题';

-- 4.2 投票记录
CREATE TABLE vote_record (
  id            VARCHAR(36)  PRIMARY KEY,
  issue_id      VARCHAR(36)  NOT NULL,
  owner_id      VARCHAR(36)  NOT NULL,
  house_id      VARCHAR(36)  NOT NULL,
  vote_option   ENUM('FOR','AGAINST','ABSTAIN') NOT NULL,
  vote_signature VARCHAR(255) NOT NULL,
  voted_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_valid      TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uk_issue_owner (issue_id, owner_id),
  INDEX idx_issue (issue_id),
  INDEX idx_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投票记录';

-- 4.3 质询
CREATE TABLE inquiry (
  id            VARCHAR(36)  PRIMARY KEY,
  community_id  VARCHAR(36)  NOT NULL,
  owner_id      VARCHAR(36)  NOT NULL,
  journal_entry_id VARCHAR(36) NULL,
  title         VARCHAR(255) NOT NULL,
  content       TEXT NOT NULL,
  status        ENUM('PENDING','REPLIED','CLOSED','REJECTED') NOT NULL DEFAULT 'PENDING',
  deadline      TIMESTAMP NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at     TIMESTAMP NULL,
  INDEX idx_community (community_id),
  INDEX idx_owner (owner_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='质询';

-- 4.4 质询回复
CREATE TABLE inquiry_reply (
  id          VARCHAR(36)  PRIMARY KEY,
  inquiry_id  VARCHAR(36)  NOT NULL,
  replier_id  VARCHAR(36)  NOT NULL,
  content     TEXT NOT NULL,
  evidence_ids JSON COMMENT '补充凭证ID列表',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_inquiry (inquiry_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='质询回复';

-- ============================================================
-- 5. 物业费
-- ============================================================

-- 5.1 账单
CREATE TABLE bill (
  id            VARCHAR(36)  PRIMARY KEY,
  community_id  VARCHAR(36)  NOT NULL,
  house_id      VARCHAR(36)  NOT NULL,
  owner_id      VARCHAR(36)  NOT NULL,
  period_id     VARCHAR(36)  NOT NULL,
  bill_type     ENUM('PROPERTY_FEE','PARKING_FEE','WATER','ELECTRIC','GAS','OTHER') NOT NULL,
  amount_cents  BIGINT NOT NULL,
  due_date      DATE NOT NULL,
  status        ENUM('UNPAID','PARTIAL','PAID','OVERDUE') NOT NULL DEFAULT 'UNPAID',
  paid_cents    BIGINT DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_community (community_id),
  INDEX idx_house (house_id),
  INDEX idx_owner (owner_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账单';

-- 5.2 支付
CREATE TABLE payment (
  id          VARCHAR(36)  PRIMARY KEY,
  bill_id     VARCHAR(36)  NOT NULL,
  amount_cents BIGINT NOT NULL,
  channel     ENUM('WECHAT','ALIPAY','BANK_TRANSFER','CASH','OTHER') NOT NULL,
  external_trade_no VARCHAR(100),
  status      ENUM('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  paid_at     TIMESTAMP NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bill (bill_id),
  INDEX idx_trade_no (external_trade_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付';

-- ============================================================
-- 6. 认证 / 授权
-- ============================================================

-- 6.1 业主账户
CREATE TABLE owner_account (
  id          VARCHAR(36)  PRIMARY KEY,
  owner_id    VARCHAR(36)  NOT NULL,
  community_id VARCHAR(36) NOT NULL,
  username    VARCHAR(50)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status      TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at TIMESTAMP NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_community_username (community_id, username),
  INDEX idx_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='业主账户';

-- 6.2 业委会
CREATE TABLE committee_member (
  id          VARCHAR(36)  PRIMARY KEY,
  community_id VARCHAR(36) NOT NULL,
  owner_id    VARCHAR(36)  NOT NULL,
  role        ENUM('CHAIR','VICE_CHAIR','MEMBER') NOT NULL DEFAULT 'MEMBER',
  term_start  DATE NOT NULL,
  term_end    DATE,
  status      TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_community_owner (community_id, owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='业委会成员';

-- ============================================================
-- 7. 公告 / 通知
-- ============================================================

CREATE TABLE announcement (
  id          VARCHAR(36)  PRIMARY KEY,
  community_id VARCHAR(36) NOT NULL,
  publisher_id VARCHAR(36) NOT NULL,
  title       VARCHAR(255) NOT NULL,
  content     TEXT NOT NULL,
  category    ENUM('NOTICE','EMERGENCY','MAINTENANCE','COMMUNITY','OTHER') DEFAULT 'NOTICE',
  pinned      TINYINT(1) DEFAULT 0,
  published_at TIMESTAMP NULL,
  expires_at  TIMESTAMP NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_community (community_id),
  INDEX idx_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公告';

-- ============================================================
-- 8. 审计日志
-- ============================================================

CREATE TABLE audit_log (
  id          VARCHAR(36)  PRIMARY KEY,
  community_id VARCHAR(36),
  actor_id    VARCHAR(36),
  actor_type  ENUM('OWNER','STAFF','COMMITTEE','PLATFORM','SYSTEM') NOT NULL,
  action      VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id   VARCHAR(36),
  payload     JSON,
  ip          VARCHAR(45),
  user_agent  VARCHAR(255),
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_community (community_id),
  INDEX idx_actor (actor_id),
  INDEX idx_action (action),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审计日志';

-- ============================================================
-- 9. 初始种子数据
-- ============================================================

-- 9.1 默认小区
INSERT INTO community (id, name, address, status, total_area, total_households, contact_phone)
VALUES
  ('11111111-1111-1111-1111-111111111111', '阳光花园示范小区', '北京市朝阳区示范路1号', 'ACTIVE', 50000.00, 480, '010-12345678');

-- 9.2 默认物业公司
INSERT INTO property_company (id, name, license_no, contact, phone)
VALUES
  ('22222222-2222-2222-2222-222222222222', '示范物业管理有限公司', '91110000XXXXXXXX01', '张经理', '13800138000');

-- 9.3 关联小区-物业
UPDATE community SET property_company_id = '22222222-2222-2222-2222-222222222222'
  WHERE id = '11111111-1111-1111-1111-111111111111';

-- 9.4 楼栋
INSERT INTO building (id, community_id, name, total_floors, total_units) VALUES
  ('b0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '1号楼', 18, 4),
  ('b0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '2号楼', 18, 4);

-- 9.5 管理员账号 (密码: admin123 已 bcrypt 加密)
INSERT INTO staff (id, community_id, username, password_hash, name, role, status)
VALUES
  ('s0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'admin', '$2b$10$KIXkP3sHJ3z0WmzL3ZWkGOeV4lJ5VWzpFO8W3pG/HG9G3bq3QKYaG', '系统管理员', 'COMMUNITY_ADMIN', 1);

-- 9.6 平台超级管理员 (密码: platform123)
INSERT INTO staff (id, community_id, username, password_hash, name, role, status)
VALUES
  ('s0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'platform', '$2b$10$3pG/HG9G3bq3QKYaGKIXkP3sHJ3z0WmzL3ZWkGOeV4lJ5VWzpFO8W', '平台管理员', 'PLATFORM_ADMIN', 1);

-- 9.7 基础会计科目
INSERT INTO account_subject (id, community_id, code, name, type, sort_order) VALUES
  ('as000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '4001', '物业费收入', 'INCOME', 1),
  ('as000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '4002', '停车费收入', 'INCOME', 2),
  ('as000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', '4003', '广告位收入', 'INCOME', 3),
  ('as000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', '5001', '人员工资', 'EXPENSE', 1),
  ('as000005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', '5002', '保洁服务', 'EXPENSE', 2),
  ('as000006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', '5003', '安保服务', 'EXPENSE', 3),
  ('as000007-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', '5004', '设备维保', 'EXPENSE', 4),
  ('as000008-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', '5005', '能耗费用', 'EXPENSE', 5);

-- 9.8 账期
INSERT INTO account_period (id, community_id, period_code, start_date, end_date, status)
VALUES
  ('ap202601-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '2026-01', '2026-01-01', '2026-01-31', 'OPEN'),
  ('ap202602-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '2026-02', '2026-02-01', '2026-02-28', 'OPEN'),
  ('ap202605-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', '2026-05', '2026-05-01', '2026-05-31', 'OPEN'),
  ('ap202606-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', '2026-06', '2026-06-01', '2026-06-30', 'OPEN');

SET FOREIGN_KEY_CHECKS = 1;

SELECT '数据库初始化完成！共 19 张业务表 + 8 条种子数据' AS message;
