const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const DB_PATH = path.join(__dirname, "database", "DataBase.json");
const REWARDS_PATH = path.join(__dirname, "database", "Rewards.json");

/* helpers */
function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* ===== PLAYER ===== */

// carregar player
app.get("/player/:id", (req, res) => {
  const db = readJSON(DB_PATH);
  res.json(db[req.params.id] || null);
});

// salvar player
app.post("/player/:id/save", (req, res) => {
  const db = readJSON(DB_PATH);
  db[req.params.id] = req.body;
  writeJSON(DB_PATH, db);
  res.json({ success: true });
});

app.get("/players", (req, res) => {
  try {
    const db = readJSON(DB_PATH);
    res.json(Object.keys(db));
  } catch (err) {
    console.error("Erro ao listar players:", err);
    res.status(500).json([]);
  }
});

// remover player
app.delete("/player/:id", (req, res) => {
  const { id } = req.params;

  // ler o banco primeiro
  const db = readJSON(DB_PATH);

  if (!db[id]) {
    return res.status(404).json({ error: "Player não encontrado" });
  }

  delete db[id];

  writeJSON(DB_PATH, db);

  console.log(`Player removido: ${id}`);
  res.json({ success: true });
});

/* ===== REWARDS ===== */

// pegar catálogo
app.get("/rewards", (req, res) => {
  res.json(readJSON(REWARDS_PATH));
});

// pegar recompensa completa por ID
app.get("/reward/:id", (req, res) => {
  const rewards = readJSON(REWARDS_PATH);
  res.json(rewards[req.params.id] || null);
});

app.listen(3000, () => {
  console.log("✅ Backend rodando em http://localhost:3000");
});
