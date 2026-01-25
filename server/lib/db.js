import pg from "pg";
const { Pool } = pg;

export const db = new Pool({
  connectionString: process.env.DB_URL,
  ssl: process.env.DB_URL && process.env.DB_URL.includes("render") ? { rejectUnauthorized: false } : false
});

