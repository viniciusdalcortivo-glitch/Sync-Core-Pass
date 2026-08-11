import { createPlayer, deletePlayer } from "../api/api.js";

function createInitialPlayerData() {
  return {
    points: 0,
    unlockedNodes: ["root"],
    nodeRewards: {},
  };
}

async function createPlayerAction(playerId) {
  const initialPlayerData = createInitialPlayerData();

  await createPlayer(playerId, initialPlayerData);

  return playerId;
}

async function renamePlayerAction({
  currentPlayerId,
  newPlayerId,
  playerData,
}) {
  await createPlayer(newPlayerId, playerData);

  await deletePlayer(currentPlayerId);

  return newPlayerId;
}

async function deletePlayerAction(playerId) {
  await deletePlayer(playerId);

  return playerId;
}

async function resetPlayerAction(playerId) {
  const initialPlayerData = createInitialPlayerData();

  await createPlayer(playerId, initialPlayerData);

  return initialPlayerData;
}

export {
  createPlayerAction,
  renamePlayerAction,
  deletePlayerAction,
  resetPlayerAction,
};
