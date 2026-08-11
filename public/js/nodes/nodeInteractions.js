function initNodeInteractions({
  unlockBtn,
  sceneUnlockBtn,
  gridEl,

  getSelectedNode,
  getPlayerData,

  canUnlockNode,
  nodeById,

  confirmNodeReward,
  clearSelectedNode,
}) {
  unlockBtn.addEventListener("click", () => {
    const selectedNode = getSelectedNode();

    if (!selectedNode) return;

    if (selectedNode.unlocked) return;

    confirmNodeReward(selectedNode, {
      highlightConnection: true,
    });
  });

  sceneUnlockBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    const selectedNode = getSelectedNode();

    if (!selectedNode) return;

    if (!canUnlockNode(selectedNode, nodeById) && !selectedNode.unlocked) {
      return;
    }

    const playerData = getPlayerData();

    const isReroll =
      selectedNode.unlocked && Boolean(playerData.nodeRewards[selectedNode.id]);

    confirmNodeReward(selectedNode, {
      isReroll,
      highlightConnection: !isReroll,
    });
  });

  gridEl.addEventListener("click", (e) => {
    if (e.target.closest(".node")) {
      return;
    }

    clearSelectedNode();
  });
}

export { initNodeInteractions };
