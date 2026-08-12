'use strict';

// ソーシャルURLの共通設定。変更時はこの3項目だけを更新してください。
const SOCIAL_LINKS = {
    youtube: 'https://www.youtube.com/@nanatsuno071',
    x: 'https://x.com/blueudcat22',
    note: 'https://note.com/aozaki_s',
    pixta: 'https://creator.pixta.jp/@blue_sayo',
};

document.querySelectorAll('[data-social]').forEach((link) => {
    const url = SOCIAL_LINKS[link.dataset.social];
    if (!url) return;

    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.removeAttribute('aria-disabled');

    const state = link.querySelector('.social-state');
    if (state) state.textContent = '開く ↗';
});
