require('dotenv').config();
const oracledb = require('oracledb');

async function test() {
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING
    });

    const result = await connection.execute(
      'SELECT USER FROM DUAL'
    );

    console.log('DATABASE CONNECTED:', result.rows);
  } catch (error) {
    console.error('DATABASE CONNECTION FAILED:', error.message);
  } finally {
    if (connection) await connection.close();
  }
}

test();