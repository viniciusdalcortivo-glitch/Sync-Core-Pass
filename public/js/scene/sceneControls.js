let gridEl = null;
let sceneEl = null;
let nodes = [];
let updateSceneButtons = null;

let dragging = false;

let dragStart = {
  x: 0,
  y: 0,
  panX: 0,
  panY: 0,
};

let pan = {
  x: 0,
  y: 0,
};

let panBounds = {
  minX: -1000,
  maxX: 1000,
  minY: -1000,
  maxY: 1000,
};

let zoom = 1;

const zoomMin = 0.1;
const zoomMax = 3.0;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function computePanBounds() {
  try {
    if (!gridEl || !nodes.length) {
      return;
    }

    const extraPadding = 2000;

    const xs = nodes.map((node) => node.x);
    const ys = nodes.map((node) => node.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const paddedMinX = minX - extraPadding;

    const paddedMaxX = maxX + extraPadding;

    const paddedMinY = minY - extraPadding;

    const paddedMaxY = maxY + extraPadding;

    const containerRect = gridEl.getBoundingClientRect();

    const margin = 40;

    const containerW = containerRect.width;

    const containerH = containerRect.height;

    const scaledMinX = paddedMinX * zoom;

    const scaledMaxX = paddedMaxX * zoom;

    const scaledMinY = paddedMinY * zoom;

    const scaledMaxY = paddedMaxY * zoom;

    const maxPanX = margin - scaledMinX;

    const minPanX = containerW - margin - scaledMaxX;

    const maxPanY = margin - scaledMinY;

    const minPanY = containerH - margin - scaledMaxY;

    const contentW = scaledMaxX - scaledMinX;

    if (contentW < containerW - margin * 2) {
      const centerPanX = containerW / 2 - (scaledMinX + scaledMaxX) / 2;

      panBounds.minX = panBounds.maxX = centerPanX;
    } else {
      panBounds.minX = Math.min(minPanX, maxPanX);

      panBounds.maxX = Math.max(minPanX, maxPanX);
    }

    const contentH = scaledMaxY - scaledMinY;

    if (contentH < containerH - margin * 2) {
      const centerPanY = containerH / 2 - (scaledMinY + scaledMaxY) / 2;

      panBounds.minY = panBounds.maxY = centerPanY;
    } else {
      panBounds.minY = Math.min(minPanY, maxPanY);

      panBounds.maxY = Math.max(minPanY, maxPanY);
    }

    if (panBounds.minX > panBounds.maxX) {
      const center = (panBounds.minX + panBounds.maxX) / 2;

      panBounds.minX = panBounds.maxX = center;
    }

    if (panBounds.minY > panBounds.maxY) {
      const center = (panBounds.minY + panBounds.maxY) / 2;

      panBounds.minY = panBounds.maxY = center;
    }

    pan.x = clamp(pan.x, panBounds.minX, panBounds.maxX);

    pan.y = clamp(pan.y, panBounds.minY, panBounds.maxY);
  } catch (e) {
    console.error("computePanBounds", e);
  }
}

function updateSceneTransform() {
  if (!sceneEl) return;

  sceneEl.style.transform = `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`;

  if (updateSceneButtons) {
    updateSceneButtons();
  }
}

function snapToNearestNode() {
  try {
    if (!gridEl || !nodes.length) {
      return;
    }

    const rect = gridEl.getBoundingClientRect();

    const centerX = rect.width / 2;

    const centerY = rect.height / 2;

    let best = null;
    let bestDist = Infinity;

    nodes.forEach((node) => {
      const screenX = node.x * zoom + pan.x;

      const screenY = node.y * zoom + pan.y;

      const dx = screenX - centerX;

      const dy = screenY - centerY;

      const distance = Math.hypot(dx, dy);

      if (distance < bestDist) {
        bestDist = distance;
        best = node;
      }
    });

    if (!best) return;

    const targetPanX = centerX - best.x * zoom;

    const targetPanY = centerY - best.y * zoom;

    computePanBounds();

    const clampedX = clamp(targetPanX, panBounds.minX, panBounds.maxX);

    const clampedY = clamp(targetPanY, panBounds.minY, panBounds.maxY);

    try {
      gsap.to(pan, {
        x: clampedX,
        y: clampedY,
        duration: 0.45,
        ease: "power3.out",

        onUpdate: updateSceneTransform,

        onComplete: () => {
          updateSceneTransform();
        },
      });
    } catch (e) {
      pan.x = clampedX;
      pan.y = clampedY;

      updateSceneTransform();
    }
  } catch (err) {
    console.error("snap error", err);
  }
}

function initSceneControls({ grid, scene, sceneNodes, onSceneUpdate }) {
  gridEl = grid;
  sceneEl = scene;
  nodes = sceneNodes;

  updateSceneButtons = onSceneUpdate;

  gridEl.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".node")) {
      return;
    }

    if (e.button !== 0) {
      return;
    }

    dragging = true;

    dragStart.x = e.clientX;
    dragStart.y = e.clientY;

    dragStart.panX = pan.x;
    dragStart.panY = pan.y;

    gridEl.style.cursor = "grabbing";

    e.preventDefault();
  });

  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;

    const dx = e.clientX - dragStart.x;

    const dy = e.clientY - dragStart.y;

    pan.x = clamp(dragStart.panX + dx, panBounds.minX, panBounds.maxX);

    pan.y = clamp(dragStart.panY + dy, panBounds.minY, panBounds.maxY);

    updateSceneTransform();
  });

  window.addEventListener("pointerup", () => {
    if (!dragging) return;

    dragging = false;

    gridEl.style.cursor = "default";

    snapToNearestNode();
  });

  gridEl.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();

      const oldZoom = zoom;

      const delta = e.deltaY < 0 ? 0.12 : -0.12;

      zoom = clamp(zoom + delta, zoomMin, zoomMax);

      const rect = gridEl.getBoundingClientRect();

      const mouseX = e.clientX - rect.left;

      const mouseY = e.clientY - rect.top;

      const worldX = (mouseX - pan.x) / oldZoom;

      const worldY = (mouseY - pan.y) / oldZoom;

      pan.x = mouseX - worldX * zoom;

      pan.y = mouseY - worldY * zoom;

      computePanBounds();

      pan.x = clamp(pan.x, panBounds.minX, panBounds.maxX);

      pan.y = clamp(pan.y, panBounds.minY, panBounds.maxY);

      updateSceneTransform();
    },
    {
      passive: false,
    },
  );

  window.addEventListener("resize", () => {
    computePanBounds();
    updateSceneTransform();
  });
}

export { initSceneControls, computePanBounds, updateSceneTransform };
