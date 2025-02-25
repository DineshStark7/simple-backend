require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database on Hostinger!");
  }
});

app.post("/add-candidate", async (req, res) => {
  try {
    const {
      full_name,
      mobile_number,
      email,
      branch,
      year_of_passing,
      resume_link,
    } = req.body;

    // Validate input fields
    if (
      !full_name ||
      !mobile_number ||
      !email ||
      !branch ||
      !year_of_passing ||
      !resume_link
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const sql =
      "INSERT INTO candidates (full_name, mobile_number, email, branch, year_of_passing, resume_link) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(
      sql,
      [full_name, mobile_number, email, branch, year_of_passing, resume_link],
      (err, result) => {
        if (err) {
          console.error("❌ Database Error:", err);
          return res
            .status(500)
            .json({ message: "Database error", error: err.message });
        }
        res.json({
          message: "✅ Candidate added successfully!",
          id: result.insertId,
        });
      }
    );
  } catch (error) {
    console.error("❌ Unexpected Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Route to fetch candidates
app.get("/candidates", (req, res) => {
  db.query("SELECT * FROM candidates", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
