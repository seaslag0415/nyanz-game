'use strict';

const catData = {
    megohime: {
        name: '愛姫',
        reading: 'めごひめ',
        fortuneImages: ['images/megohime/fortune001.jpg', 'images/megohime/fortune002.jpg'],
        gameImages: ['images/megohime/game-attack.png'],
        color: '#d95f59',
        fortunes: [
            {
                luck: 'まっすぐ吉',
                comment: '迷ったら、おやつの方へ進むにゃ',
                blessing: '1回だけ衝突を無効化。落ち着いて守れる日。',
            },
            {
                luck: 'ごきげん大吉',
                comment: '正面突破もたまには品格にゃ',
                blessing: '1回だけ衝突を無効化。終盤の粘りが強くなる。',
            },
            {
                luck: '警備吉',
                comment: '今日の皿番は任せたにゃ',
                blessing: '1回だけ衝突を無効化。初回ミスをなかったことにする。',
            },
        ],
        effectLabel: '愛姫の加護：1回だけ衝突を無効化',
        game: { shield: 1, scoreMultiplier: 1, speedMultiplier: 1 },
    },
    iroha: {
        name: 'いろは姫',
        reading: 'いろはひめ',
        fortuneImages: ['images/iroha/fortune001.jpg', 'images/iroha/fortune002.jpg'],
        gameImages: ['images/iroha/game-attack.png'],
        color: '#6c8fc7',
        fortunes: [
            {
                luck: 'ゆったり吉',
                comment: '急がずとも、おやつは見えているにゃ',
                blessing: '獲得スコアが増加。丁寧な回避が報われる。',
            },
            {
                luck: 'もちもち中吉',
                comment: '大きな気持ちで受け流すにゃ',
                blessing: '獲得スコアが増加。生存時間の価値が上がる。',
            },
            {
                luck: '優雅吉',
                comment: '慌てた下僕から皿を落とすにゃ',
                blessing: '獲得スコアが増加。回避数の得点が伸びる。',
            },
        ],
        effectLabel: 'いろは姫の加護：獲得スコア 1.35倍',
        game: { shield: 0, scoreMultiplier: 1.35, speedMultiplier: 1 },
    },
    kouhime: {
        name: '香姫',
        reading: 'こうひめ',
        fortuneImages: ['images/kouhime/fortune001.jpg', 'images/kouhime/fortune002.jpg'],
        gameImages: ['images/kouhime/game-attack.png'],
        color: '#b4812f',
        fortunes: [
            {
                luck: '暴走吉',
                comment: '考える前に走るにゃ',
                blessing: 'ミニゲームのスコア倍率2倍。ただしゲーム速度も上昇。',
            },
            {
                luck: '疾風大吉',
                comment: '止まっている皿から狙うにゃ',
                blessing: 'ゲーム全体の速度上昇とスコア倍率2倍。危険もご褒美も大きい。',
            },
            {
                luck: 'きらめき凶吉',
                comment: '読めない動きこそ姫のたしなみにゃ',
                blessing: 'ゲーム全体の速度上昇とスコア倍率2倍。集中力が試される。',
            },
        ],
        effectLabel: '香姫の加護：速度上昇、スコア 2倍',
        game: { shield: 0, scoreMultiplier: 2, speedMultiplier: 1.22 },
    },
};

const catKeys = Object.keys(catData);
const gameDuration = 25;
const storagePrefix = 'nyanzGebokuShrine';

const els = {
    fortuneImage: document.getElementById('fortuneImage'),
    fortuneFallback: document.getElementById('fortuneFallback'),
    fortuneName: document.getElementById('fortuneName'),
    fortuneLuck: document.getElementById('fortuneLuck'),
    fortuneComment: document.getElementById('fortuneComment'),
    fortuneBlessing: document.getElementById('fortuneBlessing'),
    activeEffect: document.getElementById('activeEffect'),
    canvas: document.getElementById('gameCanvas'),
    startOverlay: document.getElementById('startOverlay'),
    startButton: document.getElementById('startButton'),
    retryButton: document.getElementById('retryButton'),
    scoreValue: document.getElementById('scoreValue'),
    timeValue: document.getElementById('timeValue'),
    dodgeValue: document.getElementById('dodgeValue'),
    guardValue: document.getElementById('guardValue'),
    resultCard: document.getElementById('resultCard'),
    resultScore: document.getElementById('resultScore'),
    resultTime: document.getElementById('resultTime'),
    bestScore: document.getElementById('bestScore'),
    resultTitle: document.getElementById('resultTitle'),
    resultComment: document.getElementById('resultComment'),
    leftButton: document.getElementById('leftButton'),
    rightButton: document.getElementById('rightButton'),
};

const ctx = els.canvas.getContext('2d');
const loadedImages = {};
const snackPlateImage = new Image();
snackPlateImage.src = 'images/game/snack-plate.png';
let todaysFortune;
let game;
let animationId = 0;
let keys = { left: false, right: false };
let touchTargetX = null;

function todayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function readJson(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch (error) {
        return null;
    }
}

function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function fortuneStorageKey() {
    return `${storagePrefix}:fortune:${todayKey()}`;
}

function bestScoreStorageKey() {
    return `${storagePrefix}:best:${todayKey()}`;
}

function createFortune() {
    const catKey = randomItem(catKeys);
    const cat = catData[catKey];
    return {
        date: todayKey(),
        catKey,
        image: randomItem(cat.fortuneImages),
        fortune: randomItem(cat.fortunes),
    };
}

function getTodaysFortune() {
    const saved = readJson(fortuneStorageKey());
    const savedCat = saved && catData[saved.catKey];
    const hasCurrentImage =
        savedCat &&
        Array.isArray(savedCat.fortuneImages) &&
        savedCat.fortuneImages.includes(saved.image);

    if (saved && saved.date === todayKey() && savedCat && hasCurrentImage) {
        return saved;
    }

    const next = createFortune();
    writeJson(fortuneStorageKey(), next);
    return next;
}

function renderFortune() {
    const cat = catData[todaysFortune.catKey];
    els.fortuneName.textContent = cat.name;
    els.fortuneLuck.textContent = todaysFortune.fortune.luck;
    els.fortuneComment.textContent = `「${todaysFortune.fortune.comment}」`;
    els.fortuneBlessing.textContent = todaysFortune.fortune.blessing;
    els.activeEffect.textContent = cat.effectLabel;

    els.fortuneImage.classList.remove('is-missing');
    els.fortuneFallback.classList.remove('is-visible');
    els.fortuneImage.alt = `${cat.name}の写真`;
    els.fortuneImage.src = todaysFortune.image;
    els.fortuneImage.onerror = () => {
        els.fortuneImage.classList.add('is-missing');
        els.fortuneFallback.classList.add('is-visible');
    };
}

function preloadGameImages() {
    snackPlateImage.onload = () => {
        if (game) drawScene();
    };

    catKeys.forEach((catKey) => {
        loadedImages[catKey] = [];
        catData[catKey].gameImages.forEach((src) => {
            const img = new Image();
            img.src = src;
            img.onload = () => loadedImages[catKey].push(img);
        });
    });
}

function resetGame() {
    const cat = catData[todaysFortune.catKey];
    game = {
        running: false,
        ended: false,
        startTime: 0,
        lastTime: 0,
        elapsed: 0,
        score: 0,
        dodges: 0,
        shield: cat.game.shield,
        scoreMultiplier: cat.game.scoreMultiplier,
        speedMultiplier: cat.game.speedMultiplier,
        spawnTimer: 0,
        snack: {
            x: els.canvas.width / 2,
            y: els.canvas.height - 48,
            width: 92,
            height: 32,
            speed: 430,
        },
        cats: [],
    };

    keys = { left: false, right: false };
    touchTargetX = null;
    updateHud();
    drawScene();
}

function startGame() {
    cancelAnimationFrame(animationId);
    resetGame();
    game.running = true;
    game.startTime = performance.now();
    game.lastTime = game.startTime;
    els.startOverlay.classList.add('hidden');
    els.resultCard.classList.add('hidden');
    animationId = requestAnimationFrame(loop);
}

function endGame() {
    game.running = false;
    game.ended = true;
    cancelAnimationFrame(animationId);

    const finalScore = Math.max(0, Math.round(game.score));
    const best = Math.max(Number(localStorage.getItem(bestScoreStorageKey())) || 0, finalScore);
    localStorage.setItem(bestScoreStorageKey(), String(best));

    els.resultScore.textContent = finalScore.toLocaleString('ja-JP');
    els.resultTime.textContent = `${game.elapsed.toFixed(1)}秒`;
    els.bestScore.textContent = best.toLocaleString('ja-JP');
    els.resultTitle.textContent = getTitle(finalScore);
    els.resultComment.textContent = getEndComment(finalScore);
    els.resultCard.classList.remove('hidden');
    els.startOverlay.classList.remove('hidden');
    els.startButton.textContent = 'もう一度遊ぶ';
    drawScene();
}

function getTitle(score) {
    if (score >= 4200) return '暴走子猫の通過儀礼を生き延びた下僕';
    if (score >= 2600) return '完全なる下僕';
    if (score >= 1300) return '姫様専属おやつ警備員';
    return 'まだ下僕見習い';
}

function getEndComment(score) {
    const cat = catData[todaysFortune.catKey];
    if (score >= 4200) return `${cat.name}「見事にゃ。今日のおやつ皿は預けてもよいにゃ」`;
    if (score >= 2600) return `${cat.name}「なかなかやる下僕にゃ。次はもっと速く行くにゃ」`;
    if (score >= 1300) return `${cat.name}「皿を守る姿勢は認めるにゃ」`;
    return `${cat.name}「まだ修行が足りないにゃ。もう一度おつとめにゃ」`;
}

function loop(now) {
    const delta = Math.min((now - game.lastTime) / 1000, 0.05);
    game.lastTime = now;
    game.elapsed = (now - game.startTime) / 1000;

    updateGame(delta);
    drawScene();
    updateHud();

    if (game.elapsed >= gameDuration) {
        endGame();
        return;
    }

    if (game.running) {
        animationId = requestAnimationFrame(loop);
    }
}

function updateGame(delta) {
    moveSnack(delta);

    game.spawnTimer -= delta;
    if (game.spawnTimer <= 0) {
        spawnCat();
        const pace = Math.max(0.42, 0.95 - game.elapsed * 0.015);
        game.spawnTimer = pace / game.speedMultiplier;
    }

    const scaledDelta = delta * game.speedMultiplier;
    game.cats.forEach((cat) => {
        cat.y += cat.vy * scaledDelta;
        cat.x += cat.vx * scaledDelta;

        if (cat.type === 'kouhime') {
            cat.wobbleTime -= scaledDelta;
            if (cat.wobbleTime <= 0) {
                cat.vx = (Math.random() * 2 - 1) * 135;
                cat.wobbleTime = 0.18 + Math.random() * 0.35;
            }
        }

        if (cat.x < cat.radius || cat.x > els.canvas.width - cat.radius) {
            cat.vx *= -1;
            cat.x = Math.max(cat.radius, Math.min(els.canvas.width - cat.radius, cat.x));
        }
    });

    for (const fallingCat of game.cats) {
        if (!fallingCat.hit && isColliding(fallingCat, game.snack)) {
            fallingCat.hit = true;
            if (game.shield > 0) {
                game.shield -= 1;
                fallingCat.y = els.canvas.height + fallingCat.radius;
            } else {
                endGame();
                return;
            }
        }
    }

    game.cats = game.cats.filter((cat) => {
        if (cat.y - cat.radius > els.canvas.height) {
            game.dodges += 1;
            game.score += 70 * game.scoreMultiplier;
            return false;
        }
        return true;
    });

    game.score += delta * 42 * game.scoreMultiplier;
}

function moveSnack(delta) {
    let direction = 0;
    if (keys.left) direction -= 1;
    if (keys.right) direction += 1;

    if (touchTargetX !== null) {
        const diff = touchTargetX - game.snack.x;
        const maxMove = game.snack.speed * delta * 1.2;
        game.snack.x += Math.max(-maxMove, Math.min(maxMove, diff));
    } else if (direction !== 0) {
        game.snack.x += direction * game.snack.speed * delta;
    }

    const half = game.snack.width / 2;
    game.snack.x = Math.max(half, Math.min(els.canvas.width - half, game.snack.x));
}

function spawnCat() {
    const type = randomCatType();
    const base = {
        megohime: { radius: 31, speed: 142, vx: 0 },
        iroha: { radius: 39, speed: 118, vx: 0 },
        kouhime: { radius: 26, speed: 192, vx: (Math.random() * 2 - 1) * 120 },
    }[type];

    game.cats.push({
        type,
        image: randomLoadedImage(type),
        x: base.radius + Math.random() * (els.canvas.width - base.radius * 2),
        y: -base.radius,
        radius: base.radius,
        vy: base.speed + game.elapsed * 3.2,
        vx: base.vx,
        wobbleTime: 0.2,
        hit: false,
    });
}

function randomCatType() {
    const roll = Math.random();
    if (roll < 0.38) return 'megohime';
    if (roll < 0.69) return 'iroha';
    return 'kouhime';
}

function isColliding(cat, snack) {
    const closestX = Math.max(
        snack.x - snack.width / 2,
        Math.min(cat.x, snack.x + snack.width / 2)
    );
    const closestY = Math.max(
        snack.y - snack.height / 2,
        Math.min(cat.y, snack.y + snack.height / 2)
    );
    const dx = cat.x - closestX;
    const dy = cat.y - closestY;
    return dx * dx + dy * dy < cat.radius * cat.radius * 0.82;
}

function updateHud() {
    const remaining = Math.max(0, gameDuration - game.elapsed);
    els.scoreValue.textContent = Math.round(game.score).toLocaleString('ja-JP');
    els.timeValue.textContent = remaining.toFixed(1);
    els.dodgeValue.textContent = String(game.dodges);
    els.guardValue.textContent = String(game.shield);
}

function drawScene() {
    const width = els.canvas.width;
    const height = els.canvas.height;
    ctx.clearRect(0, 0, width, height);

    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#fff1d8');
    sky.addColorStop(1, '#e9c692');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    drawShrineLines(width, height);
    game.cats.forEach(drawCatIcon);
    drawSnackPlate(game.snack);
}

function drawShrineLines(width, height) {
    ctx.save();
    ctx.strokeStyle = 'rgba(131, 39, 35, 0.18)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(48, 54);
    ctx.lineTo(width - 48, 54);
    ctx.moveTo(74, 84);
    ctx.lineTo(width - 74, 84);
    ctx.stroke();

    ctx.fillStyle = 'rgba(131, 39, 35, 0.12)';
    for (let x = 72; x < width; x += 120) {
        ctx.fillRect(x, 54, 12, 60);
    }
    ctx.restore();
}

function drawCatIcon(cat) {
    const data = catData[cat.type];
    const img = cat.image;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cat.x, cat.y, cat.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    if (img) {
        ctx.drawImage(img, cat.x - cat.radius, cat.y - cat.radius, cat.radius * 2, cat.radius * 2);
    } else {
        ctx.fillStyle = data.color;
        ctx.fillRect(cat.x - cat.radius, cat.y - cat.radius, cat.radius * 2, cat.radius * 2);
        ctx.fillStyle = '#fffaf0';
        ctx.font = `900 ${Math.max(18, cat.radius * 0.9)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('猫', cat.x, cat.y);
    }

    ctx.restore();
    ctx.strokeStyle = '#fffaf0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cat.x, cat.y, cat.radius - 1, 0, Math.PI * 2);
    ctx.stroke();
}

function randomLoadedImage(catKey) {
    const list = loadedImages[catKey] || [];
    if (!list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
}

function drawSnackPlate(snack) {
    ctx.save();
    ctx.translate(snack.x, snack.y);
    ctx.fillStyle = 'rgba(46, 39, 36, 0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 18, snack.width * 0.55, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    if (snackPlateImage.complete && snackPlateImage.naturalWidth > 0) {
        ctx.drawImage(
            snackPlateImage,
            -snack.width / 2,
            -snack.height / 2,
            snack.width,
            snack.height
        );
        ctx.restore();
        return;
    }

    ctx.fillStyle = '#fffdf7';
    ctx.strokeStyle = '#8f5f4d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, snack.width / 2, snack.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#c99a3e';
    for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.arc(i * 20, -4, 8, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function canvasPoint(event) {
    const rect = els.canvas.getBoundingClientRect();
    return {
        x: ((event.clientX - rect.left) / rect.width) * els.canvas.width,
        y: ((event.clientY - rect.top) / rect.height) * els.canvas.height,
    };
}

window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') keys.left = true;
    if (event.key === 'ArrowRight') keys.right = true;
});

window.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft') keys.left = false;
    if (event.key === 'ArrowRight') keys.right = false;
});

els.canvas.addEventListener('pointerdown', (event) => {
    if (!game.running) return;
    els.canvas.setPointerCapture(event.pointerId);
    touchTargetX = canvasPoint(event).x;
});

els.canvas.addEventListener('pointermove', (event) => {
    if (!game.running || touchTargetX === null) return;
    touchTargetX = canvasPoint(event).x;
});

els.canvas.addEventListener('pointerup', () => {
    touchTargetX = null;
});

function bindHoldButton(button, direction) {
    const set = (active) => {
        if (direction < 0) keys.left = active;
        if (direction > 0) keys.right = active;
    };

    button.addEventListener('pointerdown', () => set(true));
    button.addEventListener('pointerup', () => set(false));
    button.addEventListener('pointerleave', () => set(false));
    button.addEventListener('pointercancel', () => set(false));
}

els.startButton.addEventListener('click', startGame);
els.retryButton.addEventListener('click', startGame);
bindHoldButton(els.leftButton, -1);
bindHoldButton(els.rightButton, 1);

todaysFortune = getTodaysFortune();
renderFortune();
preloadGameImages();
resetGame();
