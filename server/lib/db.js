import pg from "pg";
const { Pool } = pg;

export const db = new Pool({
  // connectionString: process.env.DB_URL,
  // ssl: process.env.DB_URL && process.env.DB_URL.includes("render") ? { rejectUnauthorized: false } : false 

  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

