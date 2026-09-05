'use strict';

const interpretationData =
    typeof window !== 'undefined' && window.hexagramInterpretations
        ? window.hexagramInterpretations
        : typeof require === 'function'
          ? require('./hexagram-interpretations.js')
          : null;

/*
 * 周易の一般的な卦番号（文王卦序）。キーは「上卦-下卦」。
 * 卦の識別情報と、別ファイルの解説・猫又データをここで統合する。
 */
const hexagramRows = [
    ['乾', '乾', 1, '乾為天', 'けんいてん'],
    ['坤', '坤', 2, '坤為地', 'こんいち'],
    ['坎', '震', 3, '水雷屯', 'すいらいちゅん'],
    ['艮', '坎', 4, '山水蒙', 'さんすいもう'],
    ['坎', '乾', 5, '水天需', 'すいてんじゅ'],
    ['乾', '坎', 6, '天水訟', 'てんすいしょう'],
    ['坤', '坎', 7, '地水師', 'ちすいし'],
    ['坎', '坤', 8, '水地比', 'すいちひ'],
    ['巽', '乾', 9, '風天小畜', 'ふうてんしょうちく'],
    ['乾', '兌', 10, '天沢履', 'てんたくり'],
    ['坤', '乾', 11, '地天泰', 'ちてんたい'],
    ['乾', '坤', 12, '天地否', 'てんちひ'],
    ['乾', '離', 13, '天火同人', 'てんかどうじん'],
    ['離', '乾', 14, '火天大有', 'かてんたいゆう'],
    ['坤', '艮', 15, '地山謙', 'ちざんけん'],
    ['震', '坤', 16, '雷地豫', 'らいちよ'],
    ['兌', '震', 17, '沢雷随', 'たくらいずい'],
    ['艮', '巽', 18, '山風蠱', 'さんぷうこ'],
    ['坤', '兌', 19, '地沢臨', 'ちたくりん'],
    ['巽', '坤', 20, '風地観', 'ふうちかん'],
    ['離', '震', 21, '火雷噬嗑', 'からいぜいごう'],
    ['艮', '離', 22, '山火賁', 'さんかひ'],
    ['艮', '坤', 23, '山地剥', 'さんちはく'],
    ['坤', '震', 24, '地雷復', 'ちらいふく'],
    ['乾', '震', 25, '天雷无妄', 'てんらいむもう'],
    ['艮', '乾', 26, '山天大畜', 'さんてんたいちく'],
    ['艮', '震', 27, '山雷頤', 'さんらいい'],
    ['兌', '巽', 28, '沢風大過', 'たくふうたいか'],
    ['坎', '坎', 29, '坎為水', 'かんいすい'],
    ['離', '離', 30, '離為火', 'りいか'],
    ['兌', '艮', 31, '沢山咸', 'たくざんかん'],
    ['震', '巽', 32, '雷風恒', 'らいふうこう'],
    ['乾', '艮', 33, '天山遯', 'てんざんとん'],
    ['震', '乾', 34, '雷天大壮', 'らいてんたいそう'],
    ['離', '坤', 35, '火地晋', 'かちしん'],
    ['坤', '離', 36, '地火明夷', 'ちかめいい'],
    ['巽', '離', 37, '風火家人', 'ふうかかじん'],
    ['離', '兌', 38, '火沢睽', 'かたくけい'],
    ['坎', '艮', 39, '水山蹇', 'すいざんけん'],
    ['震', '坎', 40, '雷水解', 'らいすいかい'],
    ['艮', '兌', 41, '山沢損', 'さんたくそん'],
    ['巽', '震', 42, '風雷益', 'ふうらいえき'],
    ['兌', '乾', 43, '沢天夬', 'たくてんかい'],
    ['乾', '巽', 44, '天風姤', 'てんぷうこう'],
    ['兌', '坤', 45, '沢地萃', 'たくちすい'],
    ['坤', '巽', 46, '地風升', 'ちふうしょう'],
    ['兌', '坎', 47, '沢水困', 'たくすいこん'],
    ['坎', '巽', 48, '水風井', 'すいふうせい'],
    ['兌', '離', 49, '沢火革', 'たくかかく'],
    ['離', '巽', 50, '火風鼎', 'かふうてい'],
    ['震', '震', 51, '震為雷', 'しんいらい'],
    ['艮', '艮', 52, '艮為山', 'ごんいざん'],
    ['巽', '艮', 53, '風山漸', 'ふうざんぜん'],
    ['震', '兌', 54, '雷沢帰妹', 'らいたくきまい'],
    ['震', '離', 55, '雷火豊', 'らいかほう'],
    ['離', '艮', 56, '火山旅', 'かざんりょ'],
    ['巽', '巽', 57, '巽為風', 'そんいふう'],
    ['兌', '兌', 58, '兌為沢', 'だいたく'],
    ['巽', '坎', 59, '風水渙', 'ふうすいかん'],
    ['坎', '兌', 60, '水沢節', 'すいたくせつ'],
    ['巽', '兌', 61, '風沢中孚', 'ふうたくちゅうふ'],
    ['震', '艮', 62, '雷山小過', 'らいざんしょうか'],
    ['坎', '離', 63, '水火既済', 'すいかきせい'],
    ['離', '坎', 64, '火水未済', 'かすいびせい'],
];

const hexagramData = Object.freeze(
    Object.fromEntries(
        hexagramRows.map(([upperTrigram, lowerTrigram, number, name, reading]) => {
            const content = interpretationData?.[number];
            if (!content) throw new Error(`第${number}卦の解説データがありません。`);
            return [
                `${upperTrigram}-${lowerTrigram}`,
                Object.freeze({
                    number,
                    name,
                    reading,
                    upperTrigram,
                    lowerTrigram,
                    keywords: content.keywords,
                    keyword: content.keywords[0],
                    summary: content.summary,
                    situation: content.situation,
                    advice: content.advice,
                    caution: content.caution,
                    guardian: content.guardian,
                    subGuardian: content.subGuardian,
                    guardianReason: content.guardianReason,
                    nekomataInterpretation: content.nekomataInterpretation,
                    nekomataMessage: content.nekomataInterpretation.message,
                    specialEffect: content.specialEffect,
                    lineInterpretations: content.lineInterpretations,
                    interpretation: Object.freeze({
                        general: `${content.summary}${content.situation}${content.advice}${content.caution}`,
                        work: '',
                        relationships: '',
                        love: '',
                        money: '',
                        decision: '',
                    }),
                }),
            ];
        })
    )
);

if (typeof window !== 'undefined') window.hexagramData = hexagramData;
if (typeof module !== 'undefined' && module.exports) module.exports = hexagramData;
