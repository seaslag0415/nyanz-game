'use strict';

/** 猫又三姫の表示情報。画像差し替えはこのファイルだけで行う。 */
const guardianData = Object.freeze({
    愛姫: Object.freeze({
        reading: 'めごひめ',
        images: Object.freeze([
            'images/guardians/megohime-01.png',
            'images/guardians/megohime-02.png',
        ]),
        alt: '愛姫',
    }),
    いろは姫: Object.freeze({
        reading: 'いろはひめ',
        images: Object.freeze(['images/guardians/iroha-01.png', 'images/guardians/iroha-02.png']),
        alt: 'いろは姫',
    }),
    香姫: Object.freeze({
        reading: 'こうひめ',
        images: Object.freeze([
            'images/guardians/kouhime-01.png',
            'images/guardians/kouhime-02.png',
        ]),
        alt: '香姫',
    }),
});

if (typeof window !== 'undefined') window.guardianData = guardianData;
if (typeof module !== 'undefined' && module.exports) module.exports = guardianData;
