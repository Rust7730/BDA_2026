import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(' Query OK:', { text: text.substring(0, 50) + '...', duration, rows: res.rowCount });
    return res;
  } catch (error: any) {
    console.error(' ERROR SQL:', error.message);
    throw error;
  }
};