import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pgPool = new Pool({
  connectionString: process.env.DB_URI,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Check if DB is connected
pgPool
  .connect()
  .then((client) => {
    console.log("✅ PostgreSQL Connected");
    return client.query("SELECT NOW();"); // Run a simple test query
  })
  .then((result) => {
    console.log("✅ Database Time:", result.rows[0]); // If this prints, DB is working
  })
  .catch((err) => console.error("❌ DB Connection Error:", err));

export default pgPool;
