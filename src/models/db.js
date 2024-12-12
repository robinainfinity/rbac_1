import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: "localhost",
  user: "root", // Replace with your MySQL username
  password: "", // Replace with your MySQL password
  database: "rbac1_db", // Name of the database you just created
});

export default pool;