const API_URL = "http://localhost:3000";

async function getPlayers() {
  const response = await fetch(`${API_URL}/players`);

  if (!response.ok) {
    throw new Error("Erro ao buscar players");
  }

  return response.json();
}

async function getPlayer(id) {
  const response = await fetch(`${API_URL}/player/${id}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar player");
  }

  return response.json();
}

async function savePlayerData(id, data) {
  const response = await fetch(`${API_URL}/player/${id}/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao salvar player");
  }

  return response.json();
}

async function createPlayer(id, data) {
  const response = await fetch(`${API_URL}/player/${id}/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar player");
  }

  return response.json();
}

async function deletePlayer(id) {
  const response = await fetch(`${API_URL}/player/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Erro ao deletar player");
  }

  return response.json();
}

async function getReward(id) {
  const response = await fetch(`${API_URL}/reward/${id}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar recompensa");
  }

  return response.json();
}

export {
  getPlayers,
  getPlayer,
  savePlayerData,
  createPlayer,
  deletePlayer,
  getReward,
};
