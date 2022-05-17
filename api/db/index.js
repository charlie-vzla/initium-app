const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST || 'initium-db',
  database: 'initium_db',
  user: process.env.PGUSER || 'u_initium',
  password: process.env.PGPASSWORD || 'u_initium01*.,',
  port: process.env.PGPORT || 5432
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
}