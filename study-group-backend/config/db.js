import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const pool = mysql.createPool({
  host: "127.0.0.1",      
  user: "root",            
  password: "",             
  database: "study_group",  
  port: 3306,               
});

try {
  const connection = await pool.getConnection();
  console.log("✅ Connected to MySQL database!");
  connection.release();
} catch (err) {
  console.error("❌ Database connection failed:", err.message);
}
