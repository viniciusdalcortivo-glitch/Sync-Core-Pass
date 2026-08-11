import { poolsByRarity } from "../data/rewards.js";
import {
  playRewardSound,
  playSpinSound,
  stopSpinSound,
} from "../audio/audio.js";

let boxOpeningContext = null;
let reelTween = null;
let spinTimeout = null;
let isSpinning = false;
let spinSoundPlayed = false;

function isRouletteOpening() {
  return boxOpeningContext !== null;
}

function pickWeighted(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  // remove viés de ordem
  const shuffled = items
    .map((i) => ({ i, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((o) => o.i);

  const total = shuffled.reduce(
    (sum, item) => sum + (Number(item.weight) || 0),
    0,
  );

  if (total <= 0) {
    return shuffled[Math.floor(Math.random() * shuffled.length)];
  }

  let random = Math.random() * total;

  for (const item of shuffled) {
    random -= Number(item.weight) || 0;

    if (random <= 0) {
      return item;
    }
  }

  return shuffled[shuffled.length - 1];
}

function poolForRarity(rarity) {
  if (!rarity) {
    return poolsByRarity.comum;
  }

  const key = String(rarity)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return poolsByRarity[key] || poolsByRarity.comum;
}

let itemsDOM = [];

function buildReelFromPool(reel, pool, options = {}) {
  try {
    gsap.killTweensOf(reel);
  } catch (e) {}

  reel.innerHTML = "";

  const unique =
    Array.isArray(pool) && pool.length
      ? pool.slice()
      : poolsByRarity.comum.slice();

  const repeatUsed = 50;

  for (let r = 0; r < repeatUsed; r++) {
    for (const item of unique) {
      const div = document.createElement("div");

      div.className = "item";

      div.innerHTML = `
        <img
          src="${item.img}"
          data-rarity="${item.rarity || "Comum"}"
          data-name="${encodeURIComponent(item.name)}"
          alt="${item.name}"
        >
      `;

      reel.appendChild(div);
    }
  }

  reel.style.paddingLeft = "60px";
  reel.style.paddingRight = "60px";

  itemsDOM = Array.from(reel.querySelectorAll(".item"));

  return itemsDOM;
}

function getReelItems() {
  return itemsDOM;
}

function calcTargetXByIndex(reel, index) {
  const itemW = itemsDOM[0].offsetWidth;
  const gap = 20;

  const paddingLeft = parseFloat(getComputedStyle(reel).paddingLeft) || 0;

  const stage = document.getElementById("stage");
  const stageCenter = stage.clientWidth / 2;

  const itemCenterX = paddingLeft + index * (itemW + gap) + itemW / 2;

  return stageCenter - itemCenterX;
}

async function waitImagesLoaded(root) {
  const images = Array.from(root.querySelectorAll("img"));

  await Promise.all(
    images.map((img) => {
      if (img.complete) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    }),
  );
}

function showRouletteResult(result, fallbackRarity) {
  const resultOverlay = document.getElementById("resultOverlay");
  const resultCard = document.getElementById("resultCard");
  const resultImg = document.getElementById("resultImg");
  const resultName = document.getElementById("resultName");
  const resultType = document.getElementById("resultType");
  const rarityLabel =
    document.getElementById("rarityLabel") ||
    document.querySelector(".rarityLabel");

  if (resultOverlay) {
    resultOverlay.style.display = "block";
  }

  if (resultCard) {
    resultCard.style.display = "flex";
  }

  if (rarityLabel) {
    rarityLabel.textContent = `${result.rarity || fallbackRarity} — ${result.name || ""}`;
  }

  if (resultImg) {
    resultImg.src = result.img || resultImg.src;
  }

  if (resultName) {
    resultName.textContent = result.name || "";
  }

  if (resultType) {
    const rarityRaw = result.rarity || fallbackRarity || "comum";

    let rarityKey = String(rarityRaw)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (rarityKey === "epico") {
      rarityKey = "epica";
    }

    if (rarityKey === "lendario") {
      rarityKey = "lendaria";
    }

    if (rarityKey === "mitico") {
      rarityKey = "mitica";
    }

    resultType.textContent = `Raridade: ${rarityRaw}`;

    resultType.className = `rarity-${rarityKey}`;

    resultType.style.color = "";

    const rarityRGB = {
      comum: "34,197,94",
      rara: "59,130,246",
      epica: "168,85,247",
      lendaria: "245,158,11",
      mitica: "255,0,200",
    };

    if (resultCard && rarityRGB[rarityKey]) {
      resultCard.style.setProperty("--rarity-rgb", rarityRGB[rarityKey]);
    }
  }
}

function openBoxAnimation(node) {
  return new Promise((resolve) => {
    const boxStage = document.getElementById("boxStage");

    const stage = document.getElementById("stage");

    const reelTrack = document.getElementById("reel");

    if (document.body && !document.body.contains(boxStage)) {
      document.body.appendChild(boxStage);
    }

    boxStage.style.display = "flex";
    boxStage.classList.add("show");

    stage.style.width = "";
    stage.style.height = "";

    const pool = poolForRarity(node.rarity);

    const chosenItem = pickWeighted(pool) || pool[0];

    // limpa animação anterior
    if (reelTween) {
      reelTween.kill();
      reelTween = null;
    }

    if (spinTimeout) {
      clearTimeout(spinTimeout);
      spinTimeout = null;
    }

    isSpinning = false;

    gsap.set(reelTrack, { x: 0 });

    reelTrack.innerHTML = "";

    try {
      buildReelFromPool(reelTrack, pool, {
        baseRepeat: 100,
        extraSpinsEstimate: 4,
      });
    } catch (e) {
      console.warn("buildReelFromPool failed", e);
    }

    const itemsDOM = getReelItems();

    // procura ocorrências do prêmio sorteado
    const occurrences = [];

    const chosenImg = chosenItem.img || "";

    const chosenName = (chosenItem.name || "").toString().toLowerCase();

    for (let i = 0; i < itemsDOM.length; i++) {
      const imgEl = itemsDOM[i].querySelector("img");

      const src = imgEl ? imgEl.getAttribute("src") || "" : "";

      const nameAttr = imgEl
        ? (imgEl.getAttribute("data-name") || "").toString().toLowerCase()
        : "";

      if (
        src === chosenImg ||
        nameAttr === chosenName ||
        (chosenName &&
          src.toLowerCase().includes(encodeURIComponent(chosenName)))
      ) {
        occurrences.push(i);
      }
    }

    const extraSpins = 6 + Math.floor(Math.random() * 6);

    const totalUnique = pool.length || 1;

    const spinOffset = extraSpins * totalUnique;

    const maxBaseIndex = itemsDOM.length - 1 - spinOffset;

    let baseIndex;

    if (occurrences.length > 0) {
      const valid = occurrences.filter((i) => i <= maxBaseIndex);

      baseIndex = valid[Math.floor(Math.random() * valid.length)];
    } else {
      baseIndex = Math.floor(Math.random() * maxBaseIndex);
    }

    const finalIndex = baseIndex + spinOffset;

    const finalX = calcTargetXByIndex(reelTrack, finalIndex);

    let revealed = false;

    function doReveal() {
      if (revealed) return;

      revealed = true;
      isSpinning = false;

      stopSpinSound();
      spinSoundPlayed = false;

      if (spinTimeout) {
        clearTimeout(spinTimeout);
        spinTimeout = null;
      }

      if (reelTween) {
        reelTween.kill();
        reelTween = null;
      }

      const result = chosenItem;

      playRewardSound(result, node.rarity);

      showRouletteResult(result, node.rarity);

      // flash da tela
      try {
        const flash = document.createElement("div");

        flash.style.position = "fixed";
        flash.style.left = "0";
        flash.style.top = "0";
        flash.style.width = "100%";
        flash.style.height = "100%";
        flash.style.background = "rgba(255,255,255,0.12)";
        flash.style.zIndex = "1400";
        flash.style.pointerEvents = "none";

        document.body.appendChild(flash);

        setTimeout(() => flash.remove(), 140);
      } catch (e) {}

      boxOpeningContext = null;

      resolve(result);
    }

    boxOpeningContext = {
      doReveal,
      finalX,
      _chosenItem: chosenItem,
    };

    try {
      gsap.killTweensOf(reelTrack);

      waitImagesLoaded(reelTrack).then(() => {
        reelTrack.getBoundingClientRect();

        const SPIN_DELAY = 300;

        if (isSpinning) return;

        isSpinning = true;

        spinTimeout = setTimeout(() => {
          if (reelTween) return;

          try {
            if (!spinSoundPlayed) {
              spinSoundPlayed = true;
              playSpinSound();
            }
          } catch (e) {}

          reelTween = gsap.to(reelTrack, {
            x: finalX,
            duration: 8,
            ease: "power3.out",
            overwrite: true,
            onComplete: doReveal,
          });
        }, SPIN_DELAY);
      });
    } catch (e) {
      console.error("GSAP animation error", e);

      boxStage.classList.remove("show");
      boxStage.style.display = "none";

      boxOpeningContext = null;

      resolve(null);
    }
  });
}

function skipRoulette() {
  if (!boxOpeningContext) {
    return;
  }

  try {
    const reelTrack = document.getElementById("reel");

    gsap.killTweensOf(reelTrack);

    gsap.set(reelTrack, {
      x: boxOpeningContext.finalX,
    });

    boxOpeningContext.doReveal();
  } catch (err) {
    console.error("skip-to-result error", err);
  }
}

function closeRouletteResult() {
  const resultCard = document.getElementById("resultCard");

  const resultOverlay = document.getElementById("resultOverlay");

  const rarityLabel = document.getElementById("rarityLabel");

  const boxStage = document.getElementById("boxStage");

  if (resultCard) {
    resultCard.style.display = "none";
  }

  if (resultOverlay) {
    resultOverlay.style.display = "none";
  }

  if (rarityLabel) {
    rarityLabel.textContent = "";
  }

  if (boxStage) {
    boxStage.classList.remove("show");
    boxStage.style.display = "none";
  }
}

export {
  pickWeighted,
  poolForRarity,
  buildReelFromPool,
  getReelItems,
  calcTargetXByIndex,
  waitImagesLoaded,
  showRouletteResult,
  openBoxAnimation,
  closeRouletteResult,
  skipRoulette,
  isRouletteOpening,
};
