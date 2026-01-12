import express from "express";
import jwt from "jsonwebtoken";
import pkg from "pg";
const { Pool } = pkg;
const router = express.Router();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "no auth" });
  const token = header.split(" ")[1];
  req.user = jwt.verify(token, process.env.JWT_SECRET);
  next();
}

router.post("/", auth, async (req, res) => {
  const { title, content, tags, is_private, expires_at } = req.body;
  const result = await pool.query(
    `INSERT INTO pastes(owner, title, content, tags, is_private, expires_at)
    VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.user.id, title, content, tags, is_private, expires_at]
  );
  res.json(result.rows[0]);
});

router.get("/public", async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM pastes WHERE is_private=false AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at DESC`
  );
  res.json(result.rows);
});

router.get("/search", async (req, res) => {
  const q = `%${req.query.q}%`;
  const result = await pool.query(
    `SELECT * FROM pastes WHERE is_private=false AND tags::text ILIKE $1`,
    [q]
  );
  res.json(result.rows);
});

export default router;