import { getPlayer, savePlayerData } from "../api/api.js";

let playerData = {
  points: 0,
  unlockedNodes: ["root"],
  nodeRewards: {},
};

function getPlayerData() {
  return playerData;
}

function resetPlayerData() {
  playerData = {
    points: 0,
    unlockedNodes: ["root"],
    nodeRewards: {},
  };

  return playerData;
}

async function loadPlayerData(playerId) {
  const data = await getPlayer(playerId);

  if (data) {
    playerData = data;
  }

  playerData.unlockedNodes = [
    "root",
    ...Object.keys(playerData.nodeRewards || {}),
  ];

  return playerData;
}

async function saveCurrentPlayer(playerId) {
  playerData.unlockedNodes = [
    "root",
    ...Object.keys(playerData.nodeRewards || {}),
  ];

  await savePlayerData(playerId, playerData);

  return playerData;
}

function setPlayerPoints(value) {
  playerData.points = Math.max(0, Math.floor(Number(value) || 0));

  return playerData.points;
}

function changePlayerPoints(delta) {
  return setPlayerPoints(playerData.points + Number(delta || 0));
}

export {
  getPlayerData,
  resetPlayerData,
  loadPlayerData,
  saveCurrentPlayer,
  setPlayerPoints,
  changePlayerPoints,
};
