function resetPlayerComboFilter(playerComboSearch, playerComboList) {
  playerComboSearch.value = "";

  playerComboList.querySelectorAll(".combobox-item").forEach((el) => {
    el.style.display = "block";
  });
}

function renderPlayerCombobox({
  players,
  currentPlayerId,
  playerComboList,
  playerComboLabel,
  onPlayerSelect,
}) {
  playerComboList.innerHTML = "";

  players.forEach((id) => {
    const item = document.createElement("div");

    item.className =
      "combobox-item" + (id === currentPlayerId ? " active" : "");

    item.textContent = id;

    item.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();

      onPlayerSelect(id);
    });

    playerComboList.appendChild(item);
  });

  playerComboLabel.textContent = currentPlayerId;
}

function initPlayerCombobox({
  playerCombobox,
  playerComboTrigger,
  playerComboPopover,
  playerComboSearch,
  playerComboList,
}) {
  playerComboTrigger.addEventListener("click", () => {
    const isOpen = playerComboPopover.classList.contains("show");

    playerComboPopover.classList.toggle("show");

    if (!isOpen) {
      resetPlayerComboFilter(playerComboSearch, playerComboList);

      playerComboSearch.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (!playerCombobox.contains(e.target)) {
      playerComboPopover.classList.remove("show");
    }
  });

  playerComboSearch.addEventListener("input", () => {
    const value = playerComboSearch.value.toLowerCase();

    playerComboList.querySelectorAll(".combobox-item").forEach((el) => {
      el.style.display = el.textContent.toLowerCase().includes(value)
        ? "block"
        : "none";
    });
  });
}

function openManageProfileSheet({
  manageProfileSheet,
  editPlayerNameInput,
  editPlayerNameBtn,
  savePlayerNameBtn,
  currentPlayerId,
  pointsInput,
  points,
}) {
  editPlayerNameInput.value = currentPlayerId;
  editPlayerNameInput.disabled = true;

  editPlayerNameBtn.style.display = "block";
  savePlayerNameBtn.style.display = "none";

  pointsInput.value = points;

  manageProfileSheet.style.display = "flex";
}

function closeManageProfileSheet(manageProfileSheet) {
  manageProfileSheet.style.display = "none";
}

function enablePlayerNameEdit({
  editPlayerNameInput,
  editPlayerNameBtn,
  savePlayerNameBtn,
}) {
  editPlayerNameInput.disabled = false;
  editPlayerNameInput.focus();

  editPlayerNameBtn.style.display = "none";
  savePlayerNameBtn.style.display = "block";
}

function disablePlayerNameEdit({
  editPlayerNameInput,
  editPlayerNameBtn,
  savePlayerNameBtn,
}) {
  editPlayerNameInput.disabled = true;

  editPlayerNameBtn.style.display = "block";
  savePlayerNameBtn.style.display = "none";
}

function openCreatePlayerSheet({ sheet, newPlayerIdInput }) {
  newPlayerIdInput.value = "";
  sheet.style.display = "flex";

  setTimeout(() => {
    newPlayerIdInput.focus();
  }, 0);
}

function closeCreatePlayerSheet({ sheet, newPlayerIdInput }) {
  sheet.style.display = "none";
  newPlayerIdInput.value = "";
}

function normalizePlayerId(value) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function renderPlayerStats({
  statPlayer,
  statPoints,
  statUnlocked,
  statOpened,
  statProgress,
  playerId,
  points,
  unlocked,
  opened,
  progress,
}) {
  statPlayer.textContent = playerId;
  statPoints.textContent = points;
  statUnlocked.textContent = unlocked;
  statOpened.textContent = opened;
  statProgress.textContent = `${progress}%`;
}

export {
  resetPlayerComboFilter,
  renderPlayerCombobox,
  initPlayerCombobox,
  openManageProfileSheet,
  closeManageProfileSheet,
  enablePlayerNameEdit,
  disablePlayerNameEdit,
  openCreatePlayerSheet,
  closeCreatePlayerSheet,
  normalizePlayerId,
  renderPlayerStats,
};
