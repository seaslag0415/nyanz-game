'use strict';

const assert = require('node:assert/strict');
const trigramData = require('../js/trigram-data.js');
const hexagramData = require('../js/hexagram-data.js');
const guardianData = require('../js/guardian-data.js');
const Divination = require('../js/divination.js');

function line(position, total) {
    const coinsByTotal = {
        6: [2, 2, 2],
        7: [3, 2, 2],
        8: [3, 3, 2],
        9: [3, 3, 3],
    };
    return Divination.createLine(position, coinsByTotal[total]);
}

function linesFromBits(bits, changingPositions = []) {
    return [...bits].map((bit, index) => {
        const position = index + 1;
        const changing = changingPositions.includes(position);
        return line(position, bit === '1' ? (changing ? 9 : 7) : changing ? 6 : 8);
    });
}

function runTests() {
    const trigramCases = {
        111: '乾',
        110: '兌',
        101: '離',
        100: '震',
        '011': '巽',
        '010': '坎',
        '001': '艮',
        '000': '坤',
    };
    for (const [bits, expected] of Object.entries(trigramCases)) {
        assert.equal(Divination.getTrigram(linesFromBits(bits)).name, expected);
    }

    const hexagramCases = [
        ['111111', 1, '乾為天'],
        ['000000', 2, '坤為地'],
        ['100100', 51, '震為雷'],
        ['010010', 29, '坎為水'],
        ['101101', 30, '離為火'],
    ];
    for (const [bits, number, name] of hexagramCases) {
        const actual = Divination.identifyHexagram(linesFromBits(bits));
        assert.equal(actual.number, number);
        assert.equal(actual.name, name);
    }

    assert.deepEqual(
        [6, 7, 8, 9].map((total) => Divination.changeLine(line(1, total)).yinYang),
        ['yang', 'yang', 'yin', 'yin']
    );

    // 第51卦（震為雷）の初爻・二爻を反転すると、下卦が坎になり第40卦（雷水解）となる。
    const result = Divination.analyzeLines(linesFromBits('100100', [1, 2]));
    assert.equal(result.originalHexagram.number, 51);
    assert.deepEqual(result.changingLines, [1, 2]);
    assert.equal(result.changedHexagram.number, 40);
    assert.equal(result.changedHexagram.name, '雷水解');

    const unchanged = Divination.analyzeLines(linesFromBits('111111'));
    assert.equal(unchanged.changedHexagram, null);
    assert.equal(unchanged.changedLines, null);

    assert.equal(Object.keys(trigramData).length, 8);
    assert.equal(Object.keys(hexagramData).length, 64);
    assert.deepEqual(
        [...new Set(Object.values(hexagramData).map((item) => item.number))].sort((a, b) => a - b),
        Array.from({ length: 64 }, (_, index) => index + 1)
    );

    // 全64組について、データの上卦・下卦キーと六爻からの判定結果が一致することを確認する。
    const bitsByTrigram = Object.fromEntries(
        Object.entries(trigramData).map(([bits, trigram]) => [trigram.name, bits])
    );
    for (const [key, expected] of Object.entries(hexagramData)) {
        const [upper, lower] = key.split('-');
        const actual = Divination.identifyHexagram(
            linesFromBits(`${bitsByTrigram[lower]}${bitsByTrigram[upper]}`)
        );
        assert.equal(actual.number, expected.number, key);
        assert.equal(actual.name, expected.name, key);
    }

    const guardianCounts = { 愛姫: 0, いろは姫: 0, 香姫: 0 };
    for (const hexagram of Object.values(hexagramData)) {
        const normalLength =
            hexagram.summary.length +
            hexagram.situation.length +
            hexagram.advice.length +
            hexagram.caution.length;
        const catLength =
            hexagram.nekomataInterpretation.message.length +
            hexagram.nekomataInterpretation.advice.length;

        assert.ok(
            normalLength >= 200 && normalLength <= 400,
            `第${hexagram.number}卦の通常解説文字数`
        );
        assert.ok(catLength >= 60 && catLength <= 150, `第${hexagram.number}卦の猫又解説文字数`);
        assert.ok(hexagram.keywords.length >= 3 && hexagram.keywords.length <= 6);
        assert.ok(guardianData[hexagram.guardian], `第${hexagram.number}卦の担当猫又`);
        assert.equal(Object.keys(hexagram.lineInterpretations).length, 6);
        assert.deepEqual(Object.keys(hexagram.interpretation), [
            'general',
            'work',
            'relationships',
            'love',
            'money',
            'decision',
        ]);
        guardianCounts[hexagram.guardian] += 1;
    }
    assert.deepEqual(guardianCounts, { 愛姫: 24, いろは姫: 22, 香姫: 18 });

    console.log('猫又易占: 全テスト成功');
    console.log('担当数:', guardianCounts);
}

runTests();
