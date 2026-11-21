const { Pool } = require('pg');

const DB = new Pool({
  host: 'localhost',
  user: 'postgres',        
  password: 'password',
  database: 'database',
  port: 5432
});