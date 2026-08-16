'use strict';

const catData = {
    megohime: {
        name: '愛姫',
        reading: 'めごひめ',
        fortuneImages: ['images/megohime/fortune001-1200.webp', 'images/megohime/fortune002-1200.webp'],
        gameImages: ['images/megohime/game-attack.webp'],
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
        fortuneImages: ['images/iroha/fortune001-1200.webp', 'images/iroha/fortune002-1200.webp'],
        gameImages: ['images/iroha/game-attack.webp'],
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
        fortuneImages: ['images/kouhime/fortune001-1200.webp', 'images/kouhime/fortune002-1200.webp'],
        gameImages: ['images/kouhime/game-attack.webp'],
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
const storagePrefix = 'nyanzGebokuShrine';
const GAME_MODES = {
    normal: {
        label: '普通モード',
        spawnBase: 0.95,
        spawnMin: 0.48,
        spawnRampPerSecond: 0.006,
        maxCats: 8,
        maxKouhime: 3,
    },
    rampage: {
        label: '暴走モード',
        spawnBase: 0.86,
        spawnMin: 0.38,
        spawnRampPerSecond: 0.0048,
        maxCats: 8,
        maxKouhime: 3,
    },
};

const SPEED_CONFIG = {
    rampPerSecond: 0.005,
    fullRampSeconds: 240,
    lateRampPerSecond: 0.0005,
    maximum: 2.5,
};

// 暴走モードの香姫は、この設定だけで発生頻度や速さを調整できます。
const RAMPAGE_KOUHIME = {
    baseSpeed: 218,
    initialSpecialDelay: [0.85, 1.55],
    specialDelayEarly: [0.9, 1.5],
    specialDelayLate: [0.48, 0.9],
    dashWarning: [0.26, 0.42],
    dashDuration: [0.2, 0.32],
    dashSpeed: [570, 720],
    burstSpeedMultiplier: 1.65,
    burstDuration: [0.3, 0.48],
    zigzagDuration: [0.8, 1.25],
    maxHorizontalSpeed: [190, 280],
    returnDuration: [0.24, 0.38],
};

const els = {
    fortuneImage: document.getElementById('fortuneImage'),
    fortuneFallback: document.getElementById('fortuneFallback'),
    fortuneName: document.getElementById('fortuneName'),
    fortuneLuck: document.getElementById('fortuneLuck'),
    fortuneComment: document.getElementById('fortuneComment'),
    fortuneBlessing: document.getElementById('fortuneBlessing'),
    activeEffect: document.getElementById('activeEffect'),
    activeMode: document.getElementById('activeMode'),
    canvas: document.getElementById('gameCanvas'),
    arenaWrap: document.querySelector('.arena-wrap'),
    startOverlay: document.getElementById('startOverlay'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlayText: document.getElementById('overlayText'),
    modeSelection: document.getElementById('modeSelection'),
    modeButtons: [...document.querySelectorAll('.mode-button')],
    startButton: document.getElementById('startButton'),
    overlayModeButton: document.getElementById('overlayModeButton'),
    retryButton: document.getElementById('retryButton'),
    modeSelectButton: document.getElementById('modeSelectButton'),
    scoreValue: document.getElementById('scoreValue'),
    timeValue: document.getElementById('timeValue'),
    speedValue: document.getElementById('speedValue'),
    hudBestValue: document.getElementById('hudBestValue'),
    dodgeValue: document.getElementById('dodgeValue'),
    guardValue: document.getElementById('guardValue'),
    resultCard: document.getElementById('resultCard'),
    resultScore: document.getElementById('resultScore'),
    resultTime: document.getElementById('resultTime'),
    bestScore: document.getElementById('bestScore'),
    bestScoreLabel: document.getElementById('bestScoreLabel'),
    normalBestValue: document.getElementById('normalBestValue'),
    rampageBestValue: document.getElementById('rampageBestValue'),
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
let selectedMode = null;
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
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        // プライベートブラウズ等で保存できなくてもゲームは継続する。
    }
}

function fortuneStorageKey() {
    return `${storagePrefix}:fortune:${todayKey()}`;
}

function bestScoreStorageKey(modeKey) {
    return `${storagePrefix}:best:${modeKey}`;
}

function getBestScore(modeKey) {
    try {
        return Math.max(0, Number(localStorage.getItem(bestScoreStorageKey(modeKey))) || 0);
    } catch (error) {
        return 0;
    }
}

function saveBestScore(modeKey, score) {
    const best = Math.max(getBestScore(modeKey), score);
    try {
        localStorage.setItem(bestScoreStorageKey(modeKey), String(best));
    } catch (error) {
        // 保存できない環境では今回の結果だけを表示する。
    }
    return best;
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
    const modeKey = selectedMode || 'normal';
    game = {
        running: false,
        ended: false,
        paused: false,
        lastTime: 0,
        elapsed: 0,
        score: 0,
        dodges: 0,
        modeKey,
        shield: cat.game.shield,
        scoreMultiplier: cat.game.scoreMultiplier,
        blessingSpeedMultiplier: cat.game.speedMultiplier,
        difficultyMultiplier: 1,
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
    els.activeMode.textContent = selectedMode ? GAME_MODES[modeKey].label : '未選択';
    els.arenaWrap.classList.toggle('rampage-mode', selectedMode === 'rampage');
    updateHud();
    drawScene();
}

function updateModeBestLabels() {
    els.normalBestValue.textContent = getBestScore('normal').toLocaleString('ja-JP');
    els.rampageBestValue.textContent = getBestScore('rampage').toLocaleString('ja-JP');
}

function selectMode(modeKey) {
    if (!GAME_MODES[modeKey]) return;
    selectedMode = modeKey;
    els.modeButtons.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.mode === modeKey));
    });
    els.startButton.disabled = false;
    els.startButton.textContent = `${GAME_MODES[modeKey].label}で開始`;
    resetGame();
}

function showModeSelection() {
    cancelAnimationFrame(animationId);
    if (game) game.running = false;
    resetGame();
    updateModeBestLabels();
    els.overlayTitle.textContent = '遊び方を選ぶ';
    els.overlayText.textContent =
        '左右キー、画面下のボタン、またはタッチでお皿を動かします。時間制限はありません。';
    els.modeSelection.classList.remove('hidden');
    els.overlayModeButton.classList.add('hidden');
    els.startButton.disabled = selectedMode === null;
    els.startButton.textContent = selectedMode
        ? `${GAME_MODES[selectedMode].label}で開始`
        : 'モードを選んで開始';
    els.startOverlay.classList.remove('hidden');
    els.arenaWrap.classList.add('overlay-visible');
    els.resultCard.classList.add('hidden');
}

function startGame() {
    if (!selectedMode) return;
    cancelAnimationFrame(animationId);
    resetGame();
    game.running = true;
    game.lastTime = performance.now();
    els.startOverlay.classList.add('hidden');
    els.arenaWrap.classList.remove('overlay-visible');
    els.resultCard.classList.add('hidden');
    animationId = requestAnimationFrame(loop);
}

function endGame() {
    if (!game.running) return;
    game.running = false;
    game.ended = true;
    cancelAnimationFrame(animationId);

    const finalScore = Math.max(0, Math.round(game.score));
    const best = saveBestScore(game.modeKey, finalScore);
    const modeLabel = GAME_MODES[game.modeKey].label;

    els.resultScore.textContent = finalScore.toLocaleString('ja-JP');
    els.resultTime.textContent = formatElapsed(game.elapsed);
    els.bestScore.textContent = best.toLocaleString('ja-JP');
    els.bestScoreLabel.textContent = `${modeLabel} BEST`;
    els.resultTitle.textContent = getTitle(finalScore);
    els.resultComment.textContent = getEndComment(finalScore);
    els.resultCard.classList.remove('hidden');
    els.overlayTitle.textContent = 'ゲームオーバー';
    els.overlayText.textContent = `${modeLabel}　スコア ${finalScore.toLocaleString('ja-JP')}　生存 ${formatElapsed(game.elapsed)}`;
    els.modeSelection.classList.add('hidden');
    els.startButton.disabled = false;
    els.startButton.textContent = '同じモードでもう一度';
    els.overlayModeButton.classList.remove('hidden');
    els.startOverlay.classList.remove('hidden');
    els.arenaWrap.classList.add('overlay-visible');
    updateModeBestLabels();
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
    game.elapsed += delta;
    game.difficultyMultiplier = getDifficultyMultiplier(game.elapsed);

    const stillRunning = updateGame(delta);
    drawScene();
    updateHud();

    if (stillRunning && game.running) {
        animationId = requestAnimationFrame(loop);
    }
}

function updateGame(delta) {
    game.spawnTimer -= delta;
    if (game.spawnTimer <= 0) {
        const spawned = spawnCat();
        game.spawnTimer = spawned ? getSpawnDelay() : 0.14;
    }

    // 高速時も猫が皿を飛び越えないよう、最大移動量に応じて1フレームを分割する。
    const substeps = getCollisionSubsteps(delta);
    const stepDelta = delta / substeps;
    for (let step = 0; step < substeps; step += 1) {
        moveSnack(stepDelta);
        game.cats.forEach((cat) => updateCat(cat, stepDelta));

        for (const fallingCat of game.cats) {
            if (!fallingCat.hit && isColliding(fallingCat, game.snack)) {
                fallingCat.hit = true;
                if (game.shield > 0) {
                    game.shield -= 1;
                    fallingCat.y = els.canvas.height + fallingCat.radius;
                } else {
                    endGame();
                    return false;
                }
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
    return true;
}

function getDifficultyMultiplier(elapsed) {
    const mainRamp = Math.min(elapsed, SPEED_CONFIG.fullRampSeconds) * SPEED_CONFIG.rampPerSecond;
    const lateRamp = Math.max(0, elapsed - SPEED_CONFIG.fullRampSeconds) * SPEED_CONFIG.lateRampPerSecond;
    return Math.min(SPEED_CONFIG.maximum, 1 + mainRamp + lateRamp);
}

function getTotalSpeedMultiplier() {
    return game.difficultyMultiplier * game.blessingSpeedMultiplier;
}

function getRampageIntensity() {
    return Math.min(1, game.elapsed / 180);
}

function getSpawnDelay() {
    const mode = GAME_MODES[game.modeKey];
    return Math.max(mode.spawnMin, mode.spawnBase - game.elapsed * mode.spawnRampPerSecond);
}

function getCollisionSubsteps(delta) {
    let maxSpeed = game.snack.speed * 1.2;
    const speedMultiplier = getTotalSpeedMultiplier();
    game.cats.forEach((cat) => {
        maxSpeed = Math.max(maxSpeed, Math.hypot(cat.vx, cat.vy) * speedMultiplier);
    });
    return Math.max(1, Math.min(24, Math.ceil((maxSpeed * delta) / 8)));
}

function updateCat(cat, delta) {
    updateCatBehavior(cat, delta);
    const scaledDelta = delta * getTotalSpeedMultiplier();
    cat.y += cat.vy * scaledDelta;
    cat.x += cat.vx * scaledDelta;

    if (cat.x < cat.radius || cat.x > els.canvas.width - cat.radius) {
        cat.vx *= -1;
        cat.x = Math.max(cat.radius, Math.min(els.canvas.width - cat.radius, cat.x));
        if (cat.dashVx) cat.dashVx *= -1;
    }
}

function updateCatBehavior(cat, delta) {
    if (game.modeKey === 'normal') {
        if (cat.type === 'kouhime') updateNormalKouhime(cat, delta);
        return;
    }

    if (cat.type === 'iroha') updateRampageIroha(cat, delta);
    if (cat.type === 'kouhime') updateRampageKouhime(cat, delta);
}

function updateNormalKouhime(cat, delta) {
    cat.wobbleTime -= delta;
    if (cat.wobbleTime <= 0) {
        cat.vx = (Math.random() * 2 - 1) * 135;
        cat.wobbleTime = 0.18 + Math.random() * 0.35;
    }
}

function updateRampageIroha(cat, delta) {
    const intensity = getRampageIntensity();
    cat.turnTimer -= delta;
    if (cat.turnTimer <= 0) {
        const maxHorizontal = 85 + intensity * 90;
        cat.vx = (Math.random() * 2 - 1) * maxHorizontal;
        cat.turnTimer = randomBetween(0.65 + (1 - intensity) * 0.35, 1.1 + (1 - intensity) * 0.55);
    }
}

function updateRampageKouhime(cat, delta) {
    if (cat.state === 'windup') {
        cat.stateTimer -= delta;
        cat.vx = 0;
        cat.vy = 0;
        if (cat.stateTimer <= 0) {
            cat.state = 'dash';
            cat.stateTimer = randomBetween(...RAMPAGE_KOUHIME.dashDuration);
            cat.warning = false;
            cat.vx = cat.dashVx;
            cat.vy = cat.dashVy;
        }
        return;
    }

    if (cat.state === 'dash' || cat.state === 'burst' || cat.state === 'zigzag') {
        cat.stateTimer -= delta;
        if (cat.state === 'zigzag') {
            cat.zigzagTimer -= delta;
            if (cat.zigzagTimer <= 0) {
                cat.vx *= -1;
                cat.zigzagTimer = randomBetween(0.12, 0.2);
            }
        }
        if (cat.stateTimer <= 0) finishKouhimeAction(cat);
        return;
    }

    if (cat.state === 'return') {
        cat.stateTimer -= delta;
        if (cat.stateTimer <= 0) {
            if (cat.queueDash) {
                cat.queueDash = false;
                beginKouhimeDash(cat);
            } else {
                finishKouhimeAction(cat);
            }
        }
        return;
    }

    cat.vy = cat.baseVy;
    cat.wobbleTime -= delta;
    if (cat.wobbleTime <= 0) {
        const horizontal = 145 + getRampageIntensity() * 85;
        cat.vx = (Math.random() * 2 - 1) * horizontal;
        cat.wobbleTime = randomBetween(0.16, 0.36);
    }

    cat.specialTimer -= delta;
    if (
        cat.specialTimer <= 0 &&
        cat.y > cat.radius + 32 &&
        cat.y < els.canvas.height - 150
    ) {
        startKouhimeAction(cat);
    }
}

function startKouhimeAction(cat) {
    const intensity = getRampageIntensity();
    const roll = Math.random();
    if (roll < 0.3 + intensity * 0.1) {
        beginKouhimeDash(cat);
    } else if (roll < 0.52) {
        cat.state = 'burst';
        cat.stateTimer = randomBetween(...RAMPAGE_KOUHIME.burstDuration);
        cat.vy = cat.baseVy * RAMPAGE_KOUHIME.burstSpeedMultiplier;
        cat.vx = randomBetween(-220, 220);
    } else if (roll < 0.74) {
        cat.state = 'zigzag';
        cat.stateTimer = randomBetween(...RAMPAGE_KOUHIME.zigzagDuration);
        cat.zigzagTimer = 0.14;
        const horizontal = randomBetween(...RAMPAGE_KOUHIME.maxHorizontalSpeed);
        cat.vx = (Math.random() < 0.5 ? -1 : 1) * horizontal;
        cat.vy = cat.baseVy * 0.9;
    } else {
        // 上へ引き返してからダッシュする場合があり、通過・停止のフェイントになる。
        cat.state = 'return';
        cat.stateTimer = randomBetween(...RAMPAGE_KOUHIME.returnDuration);
        cat.queueDash = roll > 0.88;
        cat.vy = -cat.baseVy * 0.72;
        cat.vx *= -0.65;
    }
}

function beginKouhimeDash(cat) {
    const intensity = getRampageIntensity();
    const targetX = game.snack.x + randomBetween(-130, 130);
    const dx = targetX - cat.x;
    const dy = Math.max(170, game.snack.y - cat.y);
    const angle = Math.atan2(dy, dx);
    const dashSpeed = randomBetween(...RAMPAGE_KOUHIME.dashSpeed) + intensity * 90;
    cat.dashVx = Math.cos(angle) * dashSpeed;
    cat.dashVy = Math.sin(angle) * dashSpeed;
    cat.warningAngle = angle;
    cat.warning = true;
    cat.state = 'windup';
    cat.stateTimer = randomBetween(...RAMPAGE_KOUHIME.dashWarning);
}

function finishKouhimeAction(cat) {
    cat.state = 'cruise';
    cat.warning = false;
    cat.vy = cat.baseVy;
    cat.vx = randomBetween(-150, 150);
    const intensity = getRampageIntensity();
    const early = RAMPAGE_KOUHIME.specialDelayEarly;
    const late = RAMPAGE_KOUHIME.specialDelayLate;
    cat.specialTimer = randomBetween(
        early[0] + (late[0] - early[0]) * intensity,
        early[1] + (late[1] - early[1]) * intensity
    );
}

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
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
    const mode = GAME_MODES[game.modeKey];
    if (game.cats.length >= mode.maxCats) return false;

    const type = randomCatType();
    const base = {
        megohime: { radius: 31, speed: 142, vx: 0 },
        iroha: { radius: 39, speed: 118, vx: 0 },
        kouhime: {
            radius: 26,
            speed: game.modeKey === 'rampage' ? RAMPAGE_KOUHIME.baseSpeed : 192,
            vx: (Math.random() * 2 - 1) * 120,
        },
    }[type];
    const spawnX = findSafeSpawnX(base.radius);
    if (spawnX === null) return false;

    game.cats.push({
        type,
        image: randomLoadedImage(type),
        x: spawnX,
        y: -base.radius,
        radius: base.radius,
        baseVy: base.speed,
        vy: base.speed,
        vx: base.vx,
        wobbleTime: 0.2,
        turnTimer: randomBetween(0.8, 1.5),
        state: 'cruise',
        stateTimer: 0,
        specialTimer: randomBetween(...RAMPAGE_KOUHIME.initialSpecialDelay),
        warning: false,
        queueDash: false,
        hit: false,
    });
    return true;
}

function randomCatType() {
    const kouhimeCount = game.cats.filter((cat) => cat.type === 'kouhime').length;
    const canSpawnKouhime = kouhimeCount < GAME_MODES[game.modeKey].maxKouhime;
    const roll = Math.random();
    if (game.modeKey === 'normal') {
        if (roll < 0.38) return 'megohime';
        if (roll < 0.69 || !canSpawnKouhime) return 'iroha';
        return 'kouhime';
    }

    const kouhimeChance = 0.31 + getRampageIntensity() * 0.13;
    if (roll < kouhimeChance && canSpawnKouhime) return 'kouhime';
    if (roll < kouhimeChance + 0.31) return 'iroha';
    return 'megohime';
}

function findSafeSpawnX(radius) {
    for (let attempt = 0; attempt < 10; attempt += 1) {
        const x = radius + Math.random() * (els.canvas.width - radius * 2);
        const overlapsTopCat = game.cats.some(
            (cat) => cat.y < 125 && Math.abs(cat.x - x) < cat.radius + radius + 42
        );
        if (!overlapsTopCat) return x;
    }
    return null;
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
    els.scoreValue.textContent = Math.round(game.score).toLocaleString('ja-JP');
    els.timeValue.textContent = formatElapsed(game.elapsed);
    els.speedValue.textContent = `×${getTotalSpeedMultiplier().toFixed(2)}`;
    els.hudBestValue.textContent = (selectedMode ? getBestScore(game.modeKey) : 0).toLocaleString(
        'ja-JP'
    );
    els.dodgeValue.textContent = String(game.dodges);
    els.guardValue.textContent = String(game.shield);
}

function formatElapsed(seconds) {
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainder = totalSeconds % 60;
    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
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

    if (cat.warning) drawDashWarning(cat);
}

function drawDashWarning(cat) {
    const pulse = 1 + Math.sin(game.elapsed * 28) * 0.08;
    const warningRadius = (cat.radius + 8) * pulse;
    ctx.save();
    ctx.strokeStyle = 'rgba(183, 53, 48, 0.9)';
    ctx.fillStyle = 'rgba(183, 53, 48, 0.9)';
    ctx.lineWidth = 4;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.arc(cat.x, cat.y, warningRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    const startX = cat.x + Math.cos(cat.warningAngle) * (cat.radius + 10);
    const startY = cat.y + Math.sin(cat.warningAngle) * (cat.radius + 10);
    const endX = cat.x + Math.cos(cat.warningAngle) * (cat.radius + 42);
    const endY = cat.y + Math.sin(cat.warningAngle) * (cat.radius + 42);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(endX, endY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
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

window.addEventListener('blur', () => {
    keys = { left: false, right: false };
    touchTargetX = null;
});

document.addEventListener('visibilitychange', () => {
    if (!game || !game.running) return;

    if (document.hidden) {
        game.paused = true;
        cancelAnimationFrame(animationId);
        keys = { left: false, right: false };
        touchTargetX = null;
        return;
    }

    if (game.paused) {
        game.paused = false;
        game.lastTime = performance.now();
        animationId = requestAnimationFrame(loop);
    }
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

els.modeButtons.forEach((button) => {
    button.addEventListener('click', () => selectMode(button.dataset.mode));
});
els.startButton.addEventListener('click', startGame);
els.retryButton.addEventListener('click', startGame);
els.overlayModeButton.addEventListener('click', showModeSelection);
els.modeSelectButton.addEventListener('click', showModeSelection);
bindHoldButton(els.leftButton, -1);
bindHoldButton(els.rightButton, 1);

todaysFortune = getTodaysFortune();
renderFortune();
preloadGameImages();
resetGame();
updateModeBestLabels();
showModeSelection();
