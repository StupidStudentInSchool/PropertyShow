import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || '47.100.87.38',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'property_show',
  password: process.env.DB_PASSWORD || 'Llb42272',
  database: process.env.DB_DATABASE || 'property_show',
  synchronize: false,
});

async function seed() {
  await dataSource.initialize();
  console.log('数据库连接成功');

  // 检查是否已存在
  const [rows] = await dataSource.query('SELECT * FROM communities WHERE id = 1');
  if (rows && rows.length > 0) {
    console.log('Community记录已存在');
  } else {
    await dataSource.query(`
      INSERT INTO communities (id, name, address, contact_phone, total_households, registered_households, status, description)
      VALUES (1, '阳光花园示范小区', '北京市朝阳区示范路1号', '010-12345678', 480, 450, 'ACTIVE', '位于北京市朝阳区的示范小区，环境优美，设施完善')
    `);
    console.log('Community记录创建成功');
  }

  await dataSource.destroy();
}

seed().catch(console.error);
