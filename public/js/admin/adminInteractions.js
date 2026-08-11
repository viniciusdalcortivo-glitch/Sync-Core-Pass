import {
  addPlayerPoints,
  removePlayerPoints,
  definePlayerPoints,
} from "./adminActions.js";

import { renderAdminPlayerPoints } from "./adminViews.js";

function initAdminPointControls({
  pointsInput,
  addPointsBtn,
  removePointsBtn,
  setPointsBtn,
  pointsEl,

  changePlayerPoints,
  setPlayerPoints,

  savePlayer,
  updatePlayerStats,
  updateNodeControls,
}) {
  async function applyAdminPointAction(action) {
    const points = action();

    renderAdminPlayerPoints(pointsEl, points);

    await savePlayer();

    updatePlayerStats();
    updateNodeControls();

    return points;
  }

  addPointsBtn.addEventListener("click", async () => {
    await applyAdminPointAction(() =>
      addPlayerPoints({
        amount: pointsInput.value,
        changePlayerPoints,
      }),
    );
  });

  removePointsBtn.addEventListener("click", async () => {
    await applyAdminPointAction(() =>
      removePlayerPoints({
        amount: pointsInput.value,
        changePlayerPoints,
      }),
    );
  });

  setPointsBtn.addEventListener("click", async () => {
    await applyAdminPointAction(() =>
      definePlayerPoints({
        amount: pointsInput.value,
        setPlayerPoints,
      }),
    );
  });
}

function initAdminPlayerControls({
  resetPlayerBtn,
  deletePlayerBtn,

  getCurrentPlayerId,

  confirmPlayerAction,

  resetPlayerAdmin,
  deletePlayerAdmin,

  getPlayers,

  activatePlayer,
  closeManageProfile,

  onNoPlayers,
  onPlayerDeleted,
}) {
  resetPlayerBtn.addEventListener("click", () => {
    const playerId = getCurrentPlayerId();

    if (!playerId) return;

    confirmPlayerAction(
      `
          Tem certeza que deseja
          <b>RESETAR COMPLETAMENTE</b>
          o player <b>${playerId}</b>?<br><br>

          <span style="color:#f87171">
            Essa ação não pode ser desfeita.
          </span>
        `,

      async () => {
        await resetPlayerAdmin(playerId);

        await activatePlayer(playerId);
      },
    );
  });

  deletePlayerBtn.addEventListener("click", () => {
    const playerId = getCurrentPlayerId();

    if (!playerId) return;

    confirmPlayerAction(
      `
          Tem certeza que deseja
          <b>DELETAR PERMANENTEMENTE</b>
          o player <b>${playerId}</b>?<br><br>

          <span style="color:#f87171">
            Todos os dados serão perdidos e essa ação
            não pode ser desfeita.
          </span>
        `,

      async () => {
        const { nextPlayer } = await deletePlayerAdmin(playerId, {
          getPlayers,
        });

        if (!nextPlayer) {
          onNoPlayers();
          return;
        }

        await activatePlayer(nextPlayer);

        closeManageProfile();

        onPlayerDeleted(nextPlayer);
      },
    );
  });
}

function initAdminCreatePlayer({
  openCreatePlayer,
  closeSheetBtn,
  createPlayerBtn,
  newPlayerIdInput,
  sheet,

  normalizePlayerId,
  openCreatePlayerSheet,
  closeCreatePlayerSheet,

  createPlayerAdmin,
  activatePlayer,
}) {
  openCreatePlayer.addEventListener("click", () => {
    openCreatePlayerSheet({
      sheet,
      newPlayerIdInput,
    });
  });

  closeSheetBtn.addEventListener("click", () => {
    closeCreatePlayerSheet({
      sheet,
      newPlayerIdInput,
    });
  });

  createPlayerBtn.addEventListener("click", async () => {
    const id = normalizePlayerId(newPlayerIdInput.value);

    if (!id) {
      alert("Informe um ID");
      return;
    }

    const createdPlayerId = await createPlayerAdmin(id);

    await activatePlayer(createdPlayerId);

    closeCreatePlayerSheet({
      sheet,
      newPlayerIdInput,
    });
  });
}

async function handleAdminPlayerSelect(
  playerId,
  { getCurrentPlayerId, savePlayer, closePlayerCombobox, activatePlayer },
) {
  if (playerId === getCurrentPlayerId()) {
    return;
  }

  await savePlayer();

  closePlayerCombobox();

  await activatePlayer(playerId);
}

export {
  initAdminPointControls,
  initAdminPlayerControls,
  initAdminCreatePlayer,
  handleAdminPlayerSelect,
};
