const rarityLevels = ["comum", "rara", "epica", "lendaria", "mitica"];

// CONFIGURAÇÃO DOS TRIOS
const TRIOS = [
  "rara",
  "epica",
  "rara",
  "lendaria",
  "rara",
  "epica",
  "lendaria",
  "mitica",
];
// automaticamente define quantos nós existem
const NODES_PER_TRIO = 4;
const armLength = TRIOS.length * NODES_PER_TRIO;
const center = { x: 650, y: 350 };
const spacing = 250;

export { rarityLevels, TRIOS, NODES_PER_TRIO, armLength, center, spacing };
