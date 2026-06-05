// 数据库初始化脚本
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function main() {
  const config = {
    host: '47.100.87.38',
    port: 3306,
    user: 'property_show',
    password: 'Llb42272',
    // 先不指定数据库，因为需要创建数据库
  };

  console.log('连接数据库...');
  const connection = await mysql.createConnection(config);

  try {
    // 读取 SQL 文件
    const sqlFilePath = path.join(__dirname, '../docker/mysql/init/01-init.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

    // 分割 SQL 语句（按分号分割，但要处理字符串内的分号）
    const statements = sqlContent
      .split(/;(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/g)
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`开始执行 ${statements.length} 条 SQL 语句...`);
    
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (!stmt) continue;

      try {
        await connection.execute(stmt);
        successCount++;
        if (i % 10 === 0) {
          console.log(`\r进度: ${i + 1}/${statements.length}`);
        }
      } catch (err) {
        failCount++;
        console.log(`\n第 ${i + 1} 条语句执行失败:`);
        console.log(`SQL: ${stmt.substring(0, 100)}...`);
        console.log(`错误: ${err.message}`);
      }
    }

    console.log(`\n执行完成: ${successCount} 成功, ${failCount} 失败`);

    if (failCount === 0) {
      console.log('\n✅ 数据库初始化成功!');
    }

  } catch (err) {
    console.error('初始化过程出错:', err);
  } finally {
    await connection.end();
    console.log('连接已关闭');
  }
}

main().catch(console.error);