import {
  TRIOS,
  NODES_PER_TRIO,
  armLength,
  center,
  spacing,
} from "../data/passConfig.js";

function makeNode(id, x, y, idxFromRoot, dir, nodes) {
  const index = idxFromRoot - 1;

  const trioIndex = Math.floor(index / NODES_PER_TRIO);
  const posInTrio = index % NODES_PER_TRIO;

  let rarity = "comum";

  if (posInTrio === NODES_PER_TRIO - 1) {
    rarity = TRIOS[trioIndex] || "comum";
  }

  const node = {
    id,
    x,
    y,
    rarity,
    dir,
    idxFromRoot,
    unlocked: false,
    rewardId: null,
  };

  nodes.push(node);

  return node;
}

function createNodeTree() {
  const nodes = [];

  const root = {
    id: "root",
    x: center.x,
    y: center.y,
    rarity: "root",
    dir: null,
    idxFromRoot: 0,
    unlocked: true,
  };

  nodes.push(root);

  const directions = [
    {
      dx: 1,
      dy: 0,
      name: "right",
    },
  ];

  directions.forEach((direction) => {
    for (let i = 1; i <= armLength; i++) {
      const x = center.x + direction.dx * i * spacing;

      const y = center.y + direction.dy * i * spacing;

      makeNode(`${direction.name}_${i}`, x, y, i, direction.name, nodes);
    }
  });

  const nodeById = {};

  nodes.forEach((node) => {
    nodeById[node.id] = node;
  });

  return {
    nodes,
    nodeById,
  };
}

function canUnlockNode(node, nodeById) {
  if (!node) return false;
  if (node.unlocked) return false;
  if (!node.dir) return false;

  if (node.idxFromRoot === 1) {
    return true;
  }

  const prev = nodeById[`${node.dir}_${node.idxFromRoot - 1}`];

  return !!(prev && prev.unlocked);
}

function getCost(node) {
  const base = {
    comum: 1,
    rara: 2,
    epica: 3,
    lendaria: 4,
    mitica: 10,
  };

  let cost = base[node.rarity] || 1;

  if (node.rarity === "epica" && node.idxFromRoot > 6) {
    cost = 6;
  }

  if (node.rarity === "lendaria" && node.idxFromRoot > 9) {
    cost = 8;
  }

  return cost;
}

function resetNodesProgress(nodes) {
  nodes.forEach((node) => {
    if (node.id !== "root") {
      node.unlocked = false;
      node.rewardId = null;
    }
  });
}

function applyPlayerProgressToNodes(nodes, nodeById, playerData) {
  resetNodesProgress(nodes);

  playerData.unlockedNodes.forEach((id) => {
    const node = nodeById[id];

    if (node) {
      node.unlocked = true;
    }
  });

  Object.entries(playerData.nodeRewards || {}).forEach(([nodeId, rewardId]) => {
    const node = nodeById[nodeId];

    if (node) {
      node.rewardId = rewardId;
      node.unlocked = true;
    }
  });
}

export {
  makeNode,
  createNodeTree,
  canUnlockNode,
  getCost,
  resetNodesProgress,
  applyPlayerProgressToNodes,
};
