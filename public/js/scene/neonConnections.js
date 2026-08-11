let sceneEl = null;
let linkCanvas = null;
let linkCtx = null;

let nodes = [];
let nodeById = null;

let getPlayerData = null;
let canUnlockNode = null;

let dashOffset = 0;
let lastUnlockedNode = null;

function getWorldBounds() {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x);
    maxY = Math.max(maxY, node.y);
  });

  const padding = 300;

  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
}

function resizeLinkCanvas() {
  if (!sceneEl || !linkCanvas || !linkCtx || !nodes.length) {
    return;
  }

  const world = getWorldBounds();
  const dpr = window.devicePixelRatio || 1;

  sceneEl.style.width = `${world.width}px`;
  sceneEl.style.height = `${world.height}px`;

  linkCanvas.width = world.width * dpr;
  linkCanvas.height = world.height * dpr;

  linkCanvas.style.width = `${world.width}px`;
  linkCanvas.style.height = `${world.height}px`;

  linkCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawDashedFlow(x1, y1, x2, y2) {
  dashOffset -= 0.5;

  linkCtx.lineWidth = 3;
  linkCtx.strokeStyle = "#67e8f9";

  linkCtx.setLineDash([8, 12]);
  linkCtx.lineDashOffset = dashOffset;

  linkCtx.shadowColor = "#67e8f9";
  linkCtx.shadowBlur = 18;

  linkCtx.beginPath();
  linkCtx.moveTo(x1, y1);
  linkCtx.lineTo(x2, y2);
  linkCtx.stroke();

  linkCtx.setLineDash([]);
}

function drawConnections() {
  if (!linkCtx || !linkCanvas) return;

  const playerData = getPlayerData();

  if (!playerData) return;

  linkCtx.clearRect(0, 0, linkCanvas.width, linkCanvas.height);

  for (let i = 0; i < nodes.length - 1; i++) {
    const from = nodes[i];
    const to = nodes[i + 1];

    if (!to) continue;

    const x1 = from.x;
    const y1 = from.y;
    const x2 = to.x;
    const y2 = to.y;

    // linha base
    linkCtx.lineWidth = 2;
    linkCtx.strokeStyle = "rgba(0,200,255,0.15)";

    linkCtx.setLineDash([]);

    linkCtx.beginPath();
    linkCtx.moveTo(x1, y1);
    linkCtx.lineTo(x2, y2);
    linkCtx.stroke();

    const isOpened = !!playerData.nodeRewards[to.id];

    const canUnlock = canUnlockNode(to, nodeById);

    // caixa já aberta
    if (isOpened) {
      linkCtx.lineWidth = 3;

      linkCtx.strokeStyle = "rgba(34,211,238,0.95)";

      linkCtx.shadowColor = "rgba(34,211,238,0.8)";

      linkCtx.shadowBlur = 12;

      linkCtx.beginPath();
      linkCtx.moveTo(x1, y1);
      linkCtx.lineTo(x2, y2);
      linkCtx.stroke();
    }

    // próxima caixa disponível
    if (canUnlock && !isOpened) {
      drawDashedFlow(x1, y1, x2, y2);
    }

    // boost temporário após abrir
    if (to === lastUnlockedNode) {
      drawDashedFlow(x1, y1, x2, y2);
    }

    linkCtx.shadowBlur = 0;
  }
}

function linkLoop() {
  drawConnections();
  requestAnimationFrame(linkLoop);
}

function highlightUnlockedConnection(node) {
  lastUnlockedNode = node;

  setTimeout(() => {
    if (lastUnlockedNode === node) {
      lastUnlockedNode = null;
    }
  }, 1500);
}

function initNeonConnections({
  scene,
  canvas,
  sceneNodes,
  sceneNodeById,
  playerDataGetter,
  unlockChecker,
}) {
  sceneEl = scene;
  linkCanvas = canvas;
  linkCtx = linkCanvas.getContext("2d");

  nodes = sceneNodes;
  nodeById = sceneNodeById;

  getPlayerData = playerDataGetter;
  canUnlockNode = unlockChecker;

  resizeLinkCanvas();

  window.addEventListener("resize", resizeLinkCanvas);

  linkLoop();
}

export { initNeonConnections, resizeLinkCanvas, highlightUnlockedConnection };
