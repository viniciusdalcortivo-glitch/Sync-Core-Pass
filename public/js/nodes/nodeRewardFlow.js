import { openBoxAnimation } from "../roulette/roulette.js";
import { applyNodeReward, spendNodeCost } from "./nodeActions.js";

function createNodeRewardFlow({
  playerDataGetter,
  getCost,
  changePlayerPoints,
  pointsElement,
  confirmAction,
  highlightUnlockedConnection,
  savePlayer,
  updatePlayerStats,
  renderDom,
  hydrateRewards,
}) {
  async function openNodeReward(node, { highlightConnection = false } = {}) {
    const playerData = playerDataGetter();
    const payment = spendNodeCost({
      node,
      playerData,
      getCost,
      changePlayerPoints,
    });

    if (!payment.success) {
      alert("Essências Sync insuficientes");
      return null;
    }

    pointsElement.textContent = payment.points;
    const result = await openBoxAnimation(node);

    if (!result) {
      pointsElement.textContent = changePlayerPoints(payment.cost);
      return null;
    }

    applyNodeReward({ node, result, playerData });

    if (highlightConnection) highlightUnlockedConnection(node);

    await savePlayer();
    updatePlayerStats();
    renderDom();
    await hydrateRewards();

    return result;
  }

  function confirmNodeReward(
    node,
    { isReroll = false, highlightConnection = false } = {},
  ) {
    const cost = getCost(node);
    const actionText = isReroll
      ? "fazer REROLL desta caixa"
      : `abrir a caixa ${(node.rarity || "").toUpperCase()}`;
    const currency = cost > 1 ? "Essências Sync" : "Essência Sync";

    confirmAction(`Deseja gastar ${cost} ${currency} para ${actionText}?`, () =>
      openNodeReward(node, { highlightConnection }),
    );
  }

  return { confirmNodeReward };
}

export { createNodeRewardFlow };
