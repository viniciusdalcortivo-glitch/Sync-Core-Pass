function applyNodeReward({ node, result, playerData }) {
  if (!node || !result || !playerData) {
    return;
  }

  node.rewardId = result.id;
  node.unlocked = true;

  playerData.nodeRewards[node.id] = result.id;
}

function spendNodeCost({ node, playerData, getCost, changePlayerPoints }) {
  const cost = getCost(node);

  if (playerData.points < cost) {
    return {
      success: false,
      cost,
      points: playerData.points,
    };
  }

  const points = changePlayerPoints(-cost);

  return {
    success: true,
    cost,
    points,
  };
}

export { applyNodeReward, spendNodeCost };
