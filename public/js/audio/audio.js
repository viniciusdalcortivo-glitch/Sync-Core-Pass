import { soundMap } from "../data/sounds.js";

let currentRewardAudios = [];
let spinSound = null;

function initAudio(spinSoundElement) {
  spinSound = spinSoundElement;

  if (spinSound) {
    spinSound.loop = false;
    spinSound.volume = 0.6;
  }
}

function stopRewardSounds() {
  currentRewardAudios.forEach((audio) => {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (e) {}
  });

  currentRewardAudios.length = 0;
}

function playRewardSound(reward, fallbackRarity) {
  if (!reward) return;

  const rarity = (reward.rarity || fallbackRarity || "comum")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const rewardType = reward.type || "any";

  const rarityMap = soundMap[rarity];

  if (!rarityMap) return;

  const entry = rarityMap[rewardType] || rarityMap.any;

  if (!entry) return;

  stopRewardSounds();

  Object.values(entry).forEach((soundList) => {
    if (!Array.isArray(soundList) || soundList.length === 0) {
      return;
    }

    const src = soundList[Math.floor(Math.random() * soundList.length)];

    const audio = new Audio(src);

    audio.volume = 0.8;

    audio.play().catch(() => {});

    currentRewardAudios.push(audio);
  });
}

function playSpinSound() {
  if (!spinSound) return;

  try {
    spinSound.currentTime = 0;
    spinSound.play().catch(() => {});
  } catch (e) {}
}

function stopSpinSound() {
  if (!spinSound) return;

  try {
    spinSound.pause();
    spinSound.currentTime = 0;
  } catch (e) {}
}

export {
  initAudio,
  stopRewardSounds,
  playRewardSound,
  playSpinSound,
  stopSpinSound,
};
