const { Pool } = require('pg');

// Tus credenciales exactas
const connectionString = 'postgres://app_reporter:Rust127754@127.0.0.1:5433/actividad_db';

const pool = new Pool({
  connectionString,
  ssl: false 
});

console.log('Intentando conectar a:', connectionString);

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ ERROR FATAL DE CONEXIÓN:');
    console.error(err);
  } else {
    console.log('✅ ¡ÉXITO! Conexión establecida.');
    console.log('Hora de la base de datos:', res.rows[0].now);
  }
  pool.end();
});
