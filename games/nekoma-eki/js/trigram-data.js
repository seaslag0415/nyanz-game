'use strict';

/**
 * 八卦の内部キーは、必ず「下爻 → 中爻 → 上爻」の順で並べた3bit。
 * 1は陽爻、0は陰爻を表す。
 */
const trigramData = Object.freeze({
    111: Object.freeze({ name: '乾', symbol: '☰', nature: '天' }),
    110: Object.freeze({ name: '兌', symbol: '☱', nature: '沢' }),
    101: Object.freeze({ name: '離', symbol: '☲', nature: '火' }),
    100: Object.freeze({ name: '震', symbol: '☳', nature: '雷' }),
    '011': Object.freeze({ name: '巽', symbol: '☴', nature: '風' }),
    '010': Object.freeze({ name: '坎', symbol: '☵', nature: '水' }),
    '001': Object.freeze({ name: '艮', symbol: '☶', nature: '山' }),
    '000': Object.freeze({ name: '坤', symbol: '☷', nature: '地' }),
});

if (typeof window !== 'undefined') window.trigramData = trigramData;
if (typeof module !== 'undefined' && module.exports) module.exports = trigramData;
