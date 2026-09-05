'use strict';

const COIN = Object.freeze({ HEADS: 3, TAILS: 2 });
const LINE_COUNT = 6;
const TRIGRAM_LINE_COUNT = 3;

const LINE_BY_TOTAL = Object.freeze({
    6: Object.freeze({ yinYang: 'yin', type: '老陰', changing: true }),
    7: Object.freeze({ yinYang: 'yang', type: '少陽', changing: false }),
    8: Object.freeze({ yinYang: 'yin', type: '少陰', changing: false }),
    9: Object.freeze({ yinYang: 'yang', type: '老陽', changing: true }),
});

function getData(name) {
    if (typeof window !== 'undefined' && window[name]) return window[name];
    if (typeof require === 'function') {
        return require(name === 'trigramData' ? './trigram-data.js' : './hexagram-data.js');
    }
    throw new Error(`${name} が読み込まれていません。`);
}

function createLine(position, coins) {
    if (!Number.isInteger(position) || position < 1 || position > LINE_COUNT) {
        throw new RangeError('positionは1〜6の整数で指定してください。');
    }
    if (
        !Array.isArray(coins) ||
        coins.length !== 3 ||
        coins.some((coin) => coin !== 2 && coin !== 3)
    ) {
        throw new TypeError('coinsは2（裏）または3（表）を3個指定してください。');
    }

    const copiedCoins = [...coins];
    const total = copiedCoins.reduce((sum, coin) => sum + coin, 0);
    return Object.freeze({
        position,
        coins: Object.freeze(copiedCoins),
        total,
        ...LINE_BY_TOTAL[total],
    });
}

function castLine(position, random = Math.random) {
    const coins = Array.from({ length: 3 }, () => (random() < 0.5 ? COIN.HEADS : COIN.TAILS));
    return createLine(position, coins);
}

function getTrigram(lines) {
    if (!Array.isArray(lines) || lines.length !== TRIGRAM_LINE_COUNT) {
        throw new TypeError('八卦の判定には3本の爻が必要です。');
    }
    // bitは配列どおり「下爻 → 中爻 → 上爻」。陽=1、陰=0。
    const bits = lines.map((line) => (line.yinYang === 'yang' ? '1' : '0')).join('');
    const trigram = getData('trigramData')[bits];
    if (!trigram) throw new Error(`不正な八卦bitです: ${bits}`);
    return { bits, ...trigram };
}

function identifyHexagram(lines) {
    if (!Array.isArray(lines) || lines.length !== LINE_COUNT) {
        throw new TypeError('六十四卦の判定には6本の爻が必要です。');
    }
    // index 0〜2（初爻〜三爻）が下卦、index 3〜5（四爻〜上爻）が上卦。
    const lower = getTrigram(lines.slice(0, TRIGRAM_LINE_COUNT));
    const upper = getTrigram(lines.slice(TRIGRAM_LINE_COUNT, LINE_COUNT));
    const hexagram = getData('hexagramData')[`${upper.name}-${lower.name}`];
    if (!hexagram) throw new Error(`六十四卦データが見つかりません: ${upper.name}-${lower.name}`);
    return { ...hexagram, upperTrigramData: upper, lowerTrigramData: lower };
}

function changeLine(line) {
    if (!line.changing) return line;
    // 老陰（6）は陰→陽、老陽（9）は陽→陰。少陰・少陽は反転しない。
    return Object.freeze({
        ...line,
        yinYang: line.yinYang === 'yin' ? 'yang' : 'yin',
        changedFrom: line.yinYang,
    });
}

function analyzeLines(lines) {
    if (!Array.isArray(lines) || lines.length !== LINE_COUNT) {
        throw new TypeError('占断には6本の爻が必要です。');
    }
    // 六爻は常に下から上へ格納する: index 0 = 初爻、index 5 = 上爻。
    const originalLines = [...lines];
    const changingLines = originalLines
        .filter((line) => line.changing)
        .map((line) => line.position);
    const originalHexagram = identifyHexagram(originalLines);
    const changedLines = changingLines.length ? originalLines.map(changeLine) : null;
    const changedHexagram = changedLines ? identifyHexagram(changedLines) : null;

    return Object.freeze({
        lines: Object.freeze(originalLines),
        originalHexagram,
        changingLines: Object.freeze(changingLines),
        changedLines: changedLines ? Object.freeze(changedLines) : null,
        changedHexagram,
    });
}

function castHexagram(random = Math.random) {
    // 1回ずつ独立して生成するため、将来は各castLineの間に演出を挟める。
    const lines = Array.from({ length: LINE_COUNT }, (_, index) => castLine(index + 1, random));
    return analyzeLines(lines);
}

const NekomaEki = Object.freeze({
    COIN,
    LINE_COUNT,
    createLine,
    castLine,
    getTrigram,
    identifyHexagram,
    changeLine,
    analyzeLines,
    castHexagram,
});

if (typeof window !== 'undefined') window.NekomaEki = NekomaEki;
if (typeof module !== 'undefined' && module.exports) module.exports = NekomaEki;
