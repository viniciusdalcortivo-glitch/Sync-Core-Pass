function renderAdminPlayerPoints(pointsEl, points) {
  if (!pointsEl) return;

  pointsEl.textContent = points;
}

export { renderAdminPlayerPoints };
