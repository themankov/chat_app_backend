const pg = require('pg');
const { Pool } = pg;

let localPoolConfig = {
  user: 'postgres12',
  password: 'aiA8uhfkxcwQq941VKJ47YSZqvOq7Grs',
  host: '127.0.0.1',
  port: '5432',
  database: 'chat_app_mhxa',
};
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : localPoolConfig;
const pool = new Pool(poolConfig);
module.exports = pool;
