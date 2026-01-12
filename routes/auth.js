import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pkg from "pg";
const { Pool } = pkg;

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  await pool.query("INSERT INTO users(email, password) VALUES($1,$2)", [email, hash]);
  res.json({ message: "registered" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  if (!user.rows.length) return res.status(401).json({ error: "invalid" });

  const valid = bcrypt.compareSync(password, user.rows[0].password);
  if (!valid) return res.status(401).json({ error: "invalid" });

  const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET);
  res.json({ token });
});

export default router;