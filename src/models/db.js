import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: "localhost",
  user: "root", 
  password: "", 
  database: "rbac1_db", 
});

export default pool;
