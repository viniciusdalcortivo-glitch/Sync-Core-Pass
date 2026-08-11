import {
  deletePlayerAction,
  resetPlayerAction,
  createPlayerAction,
} from "../player/playerActions.js";

function addPlayerPoints({ amount, changePlayerPoints }) {
  return changePlayerPoints(Number(amount));
}

function removePlayerPoints({ amount, changePlayerPoints }) {
  return changePlayerPoints(-Number(amount));
}

function definePlayerPoints({ amount, setPlayerPoints }) {
  return setPlayerPoints(amount);
}

async function createPlayerAdmin(playerId) {
  return await createPlayerAction(playerId);
}

async function resetPlayerAdmin(playerId) {
  await resetPlayerAction(playerId);

  return playerId;
}

async function deletePlayerAdmin(playerId, { getPlayers }) {
  await deletePlayerAction(playerId);

  const players = await getPlayers();

  return {
    players,
    nextPlayer: players.length > 0 ? players[0] : null,
  };
}

export {
  addPlayerPoints,
  removePlayerPoints,
  definePlayerPoints,
  resetPlayerAdmin,
  deletePlayerAdmin,
  createPlayerAdmin,
};
