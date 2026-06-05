const mysql = require('mysql2/promise');

const connection = mysql.createConnection({
  host: '47.100.87.38',
  port: 3306,
  user: 'property_show',
  password: 'Llb42272',
  database: 'property_show'
});

async function createTables() {
  const conn = await connection;
  console.log('连接数据库成功...');

  try {
    // 创建 ledger_entries 表
    await conn.execute(`
      CREATE TABLE ledger_entries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type ENUM('INCOME', 'EXPENSE') NOT NULL,
        category ENUM('PROPERTY_FEE','PARKING_FEE','ADVERTISING','STAFF_SALARY','CLEANING','SECURITY','MAINTENANCE','UTILITIES','OTHER') NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        counterparty VARCHAR(255) NOT NULL,
        occurred_at DATE NOT NULL,
        description VARCHAR(500) NULL,
        evidence_url VARCHAR(255) NULL,
        community_id INT NOT NULL,
        created_by VARCHAR(50) NOT NULL,
        hash_value TEXT NULL,
        is_verified TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_community (community_id),
        INDEX idx_occurred_at (occurred_at),
        INDEX idx_type (type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 已创建 ledger_entries 表');

    // 创建 hash_chain 表
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS hash_chain (
        id INT PRIMARY KEY AUTO_INCREMENT,
        prev_hash TEXT NOT NULL,
        current_hash TEXT NOT NULL,
        ledger_entry_id INT NOT NULL,
        chain_index INT NOT NULL,
        block_time DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_chain_index (chain_index)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 已创建 hash_chain 表');

    process.exit(0);
  } catch (error) {
    console.error('执行失败:', error);
    process.exit(1);
  }
}

createTables();
