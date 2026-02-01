import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  // Opcional: Log para ver qué queries se ejecutan y cuánto tardan
  console.log('Query ejecutado', { text, duration, rows: res.rowCount });
  
  return res;
};