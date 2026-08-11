import { getReward } from "../api/api.js";

async function hydrateNodeRewards(nodes, domMap) {
  for (const node of nodes) {
    if (node.unlocked && node.rewardId) {
      try {
        const reward = await getReward(node.rewardId);

        const el = domMap[node.id];

        if (el) {
          el.classList.add("has-reward");

          el.innerHTML = `
            <img
              src="${reward.img}"
              alt="${reward.name}"
              class="node-reward-img"
            />
          `;
        }
      } catch (e) {
        console.error("hydrateNodeRewards error", node.id, e);
      }
    }
  }
}

function createNodeElement(node, playerData, canUnlock) {
  const el = document.createElement("div");

  const isRoot = node.id === "root";
  const opened = isRoot || !!playerData.nodeRewards[node.id];

  let stateClass = "";

  if (opened) {
    stateClass = " unlocked";
  } else if (!canUnlock) {
    stateClass = " locked";
  }

  el.className = "node " + node.rarity + stateClass;

  el.dataset.id = node.id;

  el.style.left = `${node.x}px`;
  el.style.top = `${node.y}px`;
  el.style.position = "absolute";
  el.style.transform = "translate(-50%,-50%)";
  el.style.zIndex = 2;

  if (node.unlocked && node.rewardId) {
    el.innerHTML = `
      <div
        class="node-reward"
        data-reward="${node.rewardId}"
      >
      </div>
    `;
  } else {
    el.innerHTML = `
      <div
        style="
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:6px
        "
      >
      </div>
    `;
  }

  return el;
}

function renderNodeDetails(node, nodeDetails, cost) {
  nodeDetails.innerHTML = `
    <div class="rarity-label rarity-${node.rarity}">
      Raridade: ${(node.rarity || "").toUpperCase()}
    </div>

    <div style="margin-top:6px;font-weight:700">
      Valor da caixa: ${cost}
      ${cost > 1 ? "Essências Sync" : "Essência Sync"}
    </div>

    <div style="margin-top:6px;color:var(--muted)">
      Posição: ${node.idxFromRoot || 0}
    </div>
  `;

  const detailsCard = document.querySelector(".card.node-details");

  const rarityMap = {
    comum: {
      c: "#22c55e",
      rgb: "34,197,94",
    },
    rara: {
      c: "#3b82f6",
      rgb: "59,130,246",
    },
    epica: {
      c: "#a855f7",
      rgb: "168,85,247",
    },
    lendaria: {
      c: "#f59e0b",
      rgb: "245,158,11",
    },
    mitica: {
      c: "#ec4899",
      rgb: "236,72,153",
    },
  };

  if (!detailsCard) return;

  detailsCard.classList.remove("is-mitica");

  const rarity = rarityMap[node.rarity];

  if (rarity) {
    detailsCard.style.setProperty("--rarity-color", rarity.c);

    detailsCard.style.setProperty("--rarity-rgb", rarity.rgb);
  }

  if (node.rarity === "mitica") {
    detailsCard.classList.add("is-mitica");
  }
}

function renderNodes({
  nodes,
  domMap,
  sceneEl,
  playerData,
  nodeById,
  canUnlockNode,
  onNodeClick,
}) {
  // remove os nodes antigos
  Object.values(domMap).forEach((el) => {
    try {
      el.remove?.();
    } catch (e) {}
  });

  // limpa o mapa
  Object.keys(domMap).forEach((key) => delete domMap[key]);

  if (!nodes || !nodes.length) {
    return;
  }

  nodes.forEach((node) => {
    if (!node) return;

    const canUnlock = node.id === "root" || canUnlockNode(node, nodeById);

    const el = createNodeElement(node, playerData, canUnlock);

    el.addEventListener("click", (e) => {
      e.stopPropagation();

      onNodeClick(node.id);
    });

    sceneEl.appendChild(el);

    domMap[node.id] = el;
  });
}

function setActiveNode(nodeId, domMap) {
  Object.values(domMap).forEach((el) => {
    el.classList.remove("active");
  });

  const selectedEl = domMap[nodeId];

  if (selectedEl) {
    selectedEl.classList.add("active");
  }
}

export {
  hydrateNodeRewards,
  createNodeElement,
  renderNodeDetails,
  renderNodes,
  setActiveNode,
};
