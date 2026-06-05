const mysql = require('mysql2/promise');

const connection = mysql.createConnection({
  host: '47.100.87.38',
  port: 3306,
  user: 'property_show',
  password: 'Llb42272',
  database: 'property_show'
});

async function resetLedgerTable() {
  const conn = await connection;
  console.log('连接数据库成功...');

  try {
    await conn.execute('DROP TABLE IF EXISTS ledger_entries');
    console.log('已删除 ledger_entries 表');

    console.log('等待 TypeORM 重新创建表 (重启后端)...');
    process.exit(0);
  } catch (error) {
    console.error('执行失败:', error);
    process.exit(1);
  }
}

resetLedgerTable();
