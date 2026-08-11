import {
  canUnlockNode,
  getCost,
  resetNodesProgress,
  applyPlayerProgressToNodes,
  createNodeTree,
} from "./nodes/nodes.js";
import { initStars } from "./effects/stars.js";
import { getPlayers } from "./api/api.js";
import {
  getPlayerData,
  resetPlayerData,
  loadPlayerData,
  saveCurrentPlayer,
  setPlayerPoints,
  changePlayerPoints,
} from "./player/player.js";
import {
  skipRoulette,
  isRouletteOpening,
  closeRouletteResult,
} from "./roulette/roulette.js";
import { initAudio, stopRewardSounds } from "./audio/audio.js";
import {
  hydrateNodeRewards,
  renderNodeDetails,
  renderNodes,
  setActiveNode,
} from "./nodes/nodeViews.js";
import { initNodeInteractions } from "./nodes/nodeInteractions.js";
import { createNodeRewardFlow } from "./nodes/nodeRewardFlow.js";
import {
  renderSceneNodeButton,
  renderUnlockButton,
} from "./nodes/nodeControls.js";
import {
  initSceneControls,
  computePanBounds,
  updateSceneTransform,
} from "./scene/sceneControls.js";
import {
  initNeonConnections,
  highlightUnlockedConnection,
} from "./scene/neonConnections.js";
import {
  renderPlayerCombobox,
  initPlayerCombobox,
  openCreatePlayerSheet,
  closeCreatePlayerSheet,
  normalizePlayerId,
  renderPlayerStats,
} from "./player/playerViews.js";
import { initProfileSheet } from "./player/profileSheet.js";
import { openConfirmModal } from "./ui/confirmModal.js";
import {
  initAdminPointControls,
  initAdminPlayerControls,
  initAdminCreatePlayer,
  handleAdminPlayerSelect,
} from "./admin/adminInteractions.js";
import {
  createPlayerAdmin,
  resetPlayerAdmin,
  deletePlayerAdmin,
} from "./admin/adminActions.js";

document.addEventListener("DOMContentLoaded", () => {
  let CURRENT_PLAYER_ID = localStorage.getItem("currentPlayer") || "player1";
  const debug = (text, { clearAfter = 0 } = {}) => {
    const el = document.getElementById("debugOverlay");

    if (el) {
      el.textContent = text;

      if (clearAfter > 0) {
        setTimeout(() => {
          el.textContent = "";
        }, clearAfter);
      }
    }

    console.log(text);
  };

  try {
    debug("Init: construindo cena...");
    // CONFIG

    // DOM refs
    const gridEl = document.getElementById("grid");
    const sceneEl = document.getElementById("scene");
    const nodeDetails = document.getElementById("nodeDetails");
    const unlockBtn = document.getElementById("unlockBtn");

    // ===== CANVAS DE CONEXÕES (LINHAS) =====
    const linkCanvas = document.getElementById("linkCanvas");

    const confirmGlobal = document.getElementById("confirmGlobal");
    const confirmGlobalText = document.getElementById("confirmGlobalText");
    const confirmGlobalYes = document.getElementById("confirmGlobalYes");
    const confirmGlobalNo = document.getElementById("confirmGlobalNo");
    const sceneUnlockBtn = document.getElementById("sceneUnlockBtn");
    const playerCombobox = document.getElementById("playerCombobox");
    const playerComboTrigger = document.getElementById("playerComboTrigger");
    const playerComboLabel = document.getElementById("playerComboLabel");
    const playerComboPopover = document.getElementById("playerComboPopover");
    const playerComboList = document.getElementById("playerComboList");
    const playerComboSearch = document.getElementById("playerComboSearch");
    const resetPlayerBtn = document.getElementById("resetPlayerBtn");

    // POINTS CONTROLS
    const pointsInput = document.getElementById("pointsInput");
    const addPointsBtn = document.getElementById("addPointsBtn");
    const removePointsBtn = document.getElementById("removePointsBtn");
    const setPointsBtn = document.getElementById("setPointsBtn");

    const statPlayer = document.getElementById("statPlayer");
    const statPoints = document.getElementById("statPoints");
    const statUnlocked = document.getElementById("statUnlocked");
    const statOpened = document.getElementById("statOpened");
    const statProgress = document.getElementById("statProgress");

    // stage refs
    const resultClose = document.getElementById("resultClose");
    let selectedNode = null;

    function confirmAction(text, onConfirm) {
      openConfirmModal({
        modal: confirmGlobal,
        textElement: confirmGlobalText,
        confirmButton: confirmGlobalYes,
        cancelButton: confirmGlobalNo,
        text,
        onConfirm,
        onError: debug,
      });
    }

    function confirmPlayerAction(text, onConfirm) {
      openConfirmModal({
        modal: confirmSheet,
        textElement: confirmSheetText,
        confirmButton: confirmSheetYes,
        cancelButton: confirmSheetNo,
        text,
        onConfirm,
        onError: debug,
      });
    }

    const spinSound = document.getElementById("s_open");
    initAudio(spinSound);

    //CREATE PLAYER SHEET
    const openCreatePlayer = document.getElementById("openCreatePlayer");
    const sheet = document.getElementById("createPlayerSheet");
    const closeSheetBtn = document.getElementById("closeSheetBtn");
    const createPlayerBtn = document.getElementById("createPlayerBtn");
    const newPlayerIdInput = document.getElementById("newPlayerId");

    // GERENCIAR PERFIL SHEET
    const openManageProfile = document.getElementById("openManageProfile");
    const manageProfileSheet = document.getElementById("manageProfileSheet");
    const closeManageProfile = document.getElementById("closeManageProfile");
    const editPlayerNameInput = document.getElementById("editPlayerNameInput");
    const editPlayerNameBtn = document.getElementById("editPlayerNameBtn");
    const savePlayerNameBtn = document.getElementById("savePlayerNameBtn");
    const confirmSheet = document.getElementById("confirmSheet");
    const confirmSheetText = document.getElementById("confirmSheetText");
    const confirmSheetYes = document.getElementById("confirmSheetYes");
    const confirmSheetNo = document.getElementById("confirmSheetNo");
    const deletePlayerBtn = document.getElementById("deletePlayerBtn");

    const { nodes: NODES, nodeById } = createNodeTree();
    const domMap = {};
    let playerData = getPlayerData();

    function resetGameState() {
      playerData = resetPlayerData();

      resetNodesProgress(NODES);

      selectedNode = null;

      updatePlayerStats();
    }

    async function activatePlayer(
      playerId,
      { refreshPlayersList = true } = {},
    ) {
      CURRENT_PLAYER_ID = playerId;

      localStorage.setItem("currentPlayer", playerId);

      resetGameState();

      await loadPlayer();

      updatePlayerStats();
      renderDom();

      await hydrateNodeRewards(NODES, domMap);

      if (refreshPlayersList) {
        await loadPlayersList();
      }
    }

    initNeonConnections({
      scene: sceneEl,
      canvas: linkCanvas,
      sceneNodes: NODES,
      sceneNodeById: nodeById,

      playerDataGetter: () => playerData,

      unlockChecker: canUnlockNode,
    });

    initPlayerCombobox({
      playerCombobox,
      playerComboTrigger,
      playerComboPopover,
      playerComboSearch,
      playerComboList,
    });

    const handlePlayerSelect = (playerId) =>
      handleAdminPlayerSelect(playerId, {
        getCurrentPlayerId: () => CURRENT_PLAYER_ID,

        savePlayer,

        closePlayerCombobox: () => {
          playerComboPopover.classList.remove("show");
        },

        activatePlayer,
      });

    async function loadPlayersList() {
      try {
        const players = await getPlayers();

        if (players.length === 0) {
          playerComboList.innerHTML = "";
          playerComboLabel.textContent = "Nenhum player";

          CURRENT_PLAYER_ID = null;

          localStorage.removeItem("currentPlayer");

          return;
        }

        if (!players.includes(CURRENT_PLAYER_ID)) {
          CURRENT_PLAYER_ID = players[0];

          localStorage.setItem("currentPlayer", CURRENT_PLAYER_ID);
        }

        renderPlayerCombobox({
          players,
          currentPlayerId: CURRENT_PLAYER_ID,
          playerComboList,
          playerComboLabel,
          onPlayerSelect: handlePlayerSelect,
        });
      } catch (e) {
        console.error("Erro ao carregar players", e);
        debug(`Erro ao carregar players: ${e.message || e}`);
        throw e;
      }
    }

    async function loadPlayer() {
      try {
        playerData = await loadPlayerData(CURRENT_PLAYER_ID);

        applyPlayerProgressToNodes(NODES, nodeById, playerData);

        debug("Save carregado com sucesso");
      } catch (err) {
        console.error("Erro ao carregar save:", err);
        debug(`Erro ao carregar save: ${err.message || err}`);
        throw err;
      }
    }

    function updatePlayerStats() {
      if (!playerData) return;

      const totalNodes = NODES.filter((node) => node.id !== "root").length;

      const openedBoxes = Object.keys(playerData.nodeRewards || {}).length;

      const progress =
        totalNodes > 0 ? Math.round((openedBoxes / totalNodes) * 100) : 0;

      renderPlayerStats({
        statPlayer,
        statPoints,
        statUnlocked,
        statOpened,
        statProgress,

        playerId: CURRENT_PLAYER_ID,
        points: playerData.points,

        // +1 por causa do root
        unlocked: openedBoxes + 1,

        opened: openedBoxes,
        progress,
      });
    }

    async function savePlayer() {
      try {
        await saveCurrentPlayer(CURRENT_PLAYER_ID);

        debug("Progresso salvo", { clearAfter: 2000 });
      } catch (err) {
        console.error("Erro ao salvar:", err);
        debug(`Erro ao salvar: ${err.message || err}`);
        throw err;
      }
    }

    // ESC para eskipar a animação da roleta
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        skipRoulette();
      }
    });

    resultClose.addEventListener("click", async () => {
      stopRewardSounds();

      closeRouletteResult();

      renderDom();

      await hydrateNodeRewards(NODES, domMap);
    });

    // Rendering & Connections
    function renderDom() {
      try {
        renderNodes({
          nodes: NODES,
          domMap,
          sceneEl,
          playerData,
          nodeById,
          canUnlockNode,
          onNodeClick,
        });

        computePanBounds();
        updateSceneButtons();
      } catch (e) {
        console.error("renderDom error", e);
      }
    }

    function updateNodeControls() {
      if (!selectedNode) {
        unlockBtn.style.display = "none";
        sceneUnlockBtn.style.display = "none";
        return;
      }

      const node = selectedNode;
      const cost = getCost(node);

      renderUnlockButton({
        button: unlockBtn,
        node,
        canUnlock: canUnlockNode(node, nodeById),
        isOpening: isRouletteOpening(),
        hasEnoughPoints: playerData.points >= cost,
        cost,
      });

      updateSceneButtons();
    }

    function onNodeClick(id) {
      const node = nodeById[id];

      if (!node) return;

      selectedNode = node;

      setActiveNode(node.id, domMap);

      renderNodeDetails(node, nodeDetails, getCost(node));

      updateNodeControls();
    }

    function clearSelectedNode() {
      selectedNode = null;

      updateNodeControls();
    }

    const { confirmNodeReward } = createNodeRewardFlow({
      playerDataGetter: () => playerData,
      getCost,
      changePlayerPoints,
      pointsElement: statPoints,
      confirmAction,
      highlightUnlockedConnection,
      savePlayer,
      updatePlayerStats,
      renderDom,
      hydrateRewards: () => hydrateNodeRewards(NODES, domMap),
    });

    initNodeInteractions({
      unlockBtn,
      sceneUnlockBtn,
      gridEl,

      getSelectedNode: () => selectedNode,

      getPlayerData: () => playerData,

      canUnlockNode,
      nodeById,

      confirmNodeReward,
      clearSelectedNode,
    });

    const profileSheet = initProfileSheet({
      openButton: openManageProfile,
      closeButton: closeManageProfile,
      sheet: manageProfileSheet,
      editPlayerNameInput,
      editPlayerNameBtn,
      savePlayerNameBtn,
      pointsInput,
      getCurrentPlayerId: () => CURRENT_PLAYER_ID,
      getPlayerData: () => playerData,
      confirmPlayerAction,
      activatePlayer,
      debug,
    });

    initAdminCreatePlayer({
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
    });

    initAdminPointControls({
      pointsInput,
      addPointsBtn,
      removePointsBtn,
      setPointsBtn,
      pointsEl: statPoints,

      changePlayerPoints,
      setPlayerPoints,

      savePlayer,
      updatePlayerStats,
      updateNodeControls,
    });

    initAdminPlayerControls({
      resetPlayerBtn,
      deletePlayerBtn,

      getCurrentPlayerId: () => CURRENT_PLAYER_ID,

      confirmPlayerAction,

      resetPlayerAdmin,
      deletePlayerAdmin,

      getPlayers,

      activatePlayer,

      closeManageProfile: profileSheet.close,

      onNoPlayers: () => {
        localStorage.removeItem("currentPlayer");

        profileSheet.close();

        alert("Nenhum player restante. Crie um novo.");
      },

      onPlayerDeleted: (newPlayer) => {
        debug(`Player deletado. Novo player ativo: ${newPlayer}`);
      },
    });

    // scene buttons (like "Abrir Caixa" sobre o nó selecionado)
    function updateSceneButtons() {
      if (isRouletteOpening()) {
        sceneUnlockBtn.style.display = "none";
        return;
      }

      if (!selectedNode) {
        sceneUnlockBtn.style.display = "none";
        return;
      }

      const node = selectedNode;

      const canShow =
        (!node.unlocked && canUnlockNode(node, nodeById)) ||
        (node.unlocked && playerData.nodeRewards[node.id]);

      renderSceneNodeButton({
        button: sceneUnlockBtn,
        sceneEl,
        node,
        canShow,
        isReroll: node.unlocked,
        cost: getCost(node),
      });
    }

    initSceneControls({
      grid: gridEl,
      scene: sceneEl,
      sceneNodes: NODES,
      onSceneUpdate: updateSceneButtons,
    });

    (async () => {
      try {
        debug("Init: carregando players...");

        await loadPlayersList();

        if (CURRENT_PLAYER_ID) {
          await activatePlayer(CURRENT_PLAYER_ID, {
            refreshPlayersList: false,
          });
        } else {
          resetGameState();
          renderDom();

          debug("Nenhum player encontrado — crie um novo player.");
        }

        updateSceneTransform();

        debug("Init: pronto — jogo inicializado com sucesso", {
          clearAfter: 2000,
        });
      } catch (e) {
        console.error("init failed", e);

        const el = document.getElementById("debugOverlay");

        if (el) {
          el.textContent = "Init error: " + (e.message || e);
        }
      }
    })();

    initStars();
  } catch (e) {
    console.error("setup failed", e);

    const el = document.getElementById("debugOverlay");

    if (el) {
      el.textContent = "Init error: " + (e.message || e);
    }
  }
});
