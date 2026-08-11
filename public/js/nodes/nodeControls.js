function renderSceneNodeButton({
  button,
  sceneEl,
  node,
  canShow,
  isReroll,
  cost,
}) {
  if (!button) return;

  if (!node || !canShow) {
    button.style.display = "none";
    return;
  }

  button.style.display = "inline-block";

  button.innerText = isReroll
    ? `Reroll | ${cost} ${cost > 1 ? "Essências" : "Essência"}`
    : `Abrir Caixa | ${cost} ${cost > 1 ? "Essências" : "Essência"}`;

  button.style.zIndex = 1400;
  button.style.pointerEvents = "auto";

  if (button.parentElement !== sceneEl) {
    sceneEl.appendChild(button);
  }

  button.style.position = "absolute";
  button.style.left = `${node.x}px`;
  button.style.top = `${node.y}px`;

  button.style.transform = "translate(-50%, -510%)";

  button.style.transformOrigin = "center";

  button.style.maxWidth = "260px";
  button.style.overflow = "visible";
}

function renderUnlockButton({
  button,
  node,
  canUnlock,
  isOpening,
  hasEnoughPoints,
  cost,
}) {
  if (!button || !node) return;

  // Node já aberto
  if (node.unlocked) {
    button.style.display = "none";
    return;
  }

  // Node disponível para abrir
  if (canUnlock) {
    if (isOpening) {
      button.style.display = "none";
      return;
    }

    button.style.display = "inline-block";

    button.disabled = !hasEnoughPoints;

    button.innerText = `Abrir Caixa (${cost} ${
      cost > 1 ? "Essências Sync" : "Essência Sync"
    })`;

    return;
  }

  // Node ainda bloqueado
  button.style.display = "inline-block";
  button.disabled = true;

  button.innerText = "Bloqueado (desbloqueie anterior)";
}

export { renderSceneNodeButton, renderUnlockButton };
