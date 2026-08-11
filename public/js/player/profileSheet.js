import {
  closeManageProfileSheet,
  disablePlayerNameEdit,
  enablePlayerNameEdit,
  normalizePlayerId,
  openManageProfileSheet,
} from "./playerViews.js";
import { renamePlayerAction } from "./playerActions.js";

function initProfileSheet({
  openButton,
  closeButton,
  sheet,
  editPlayerNameInput,
  editPlayerNameBtn,
  savePlayerNameBtn,
  pointsInput,
  getCurrentPlayerId,
  getPlayerData,
  confirmPlayerAction,
  activatePlayer,
  debug,
}) {
  const disableNameEdit = () =>
    disablePlayerNameEdit({
      editPlayerNameInput,
      editPlayerNameBtn,
      savePlayerNameBtn,
    });

  editPlayerNameBtn.addEventListener("click", () => {
    enablePlayerNameEdit({
      editPlayerNameInput,
      editPlayerNameBtn,
      savePlayerNameBtn,
    });
  });

  savePlayerNameBtn.addEventListener("click", () => {
    const currentPlayerId = getCurrentPlayerId();
    const newPlayerId = normalizePlayerId(editPlayerNameInput.value);

    if (!newPlayerId) {
      alert("Nome inválido");
      return;
    }

    if (newPlayerId === currentPlayerId) {
      disableNameEdit();
      return;
    }

    confirmPlayerAction(
      `Deseja renomear o player para <b>${newPlayerId}</b>?`,
      async () => {
        try {
          const renamedPlayerId = await renamePlayerAction({
            currentPlayerId,
            newPlayerId,
            playerData: getPlayerData(),
          });

          await activatePlayer(renamedPlayerId);
          closeManageProfileSheet(sheet);
          debug(`Player renomeado para ${renamedPlayerId}`);
        } finally {
          disableNameEdit();
        }
      },
    );
  });

  openButton.addEventListener("click", () => {
    openManageProfileSheet({
      manageProfileSheet: sheet,
      editPlayerNameInput,
      editPlayerNameBtn,
      savePlayerNameBtn,
      currentPlayerId: getCurrentPlayerId(),
      pointsInput,
      points: getPlayerData().points,
    });
  });

  closeButton.addEventListener("click", () => closeManageProfileSheet(sheet));

  return { close: () => closeManageProfileSheet(sheet) };
}

export { initProfileSheet };
