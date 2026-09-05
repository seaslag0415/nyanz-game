'use strict';

const castButton = document.querySelector('#cast-button');
const linesElement = document.querySelector('#lines');
const resultElement = document.querySelector('#result');

const POSITION_NAMES = Object.freeze(['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']);

function renderLine(line) {
    const item = document.createElement('li');
    item.className = `yao ${line.yinYang}${line.changing ? ' changing' : ''}`;

    const label = document.createElement('span');
    label.className = 'yao-label';
    label.textContent = POSITION_NAMES[line.position - 1];

    const figure = document.createElement('span');
    figure.className = 'yao-figure';
    figure.setAttribute('aria-label', line.yinYang === 'yang' ? '陽爻' : '陰爻');
    figure.textContent = line.yinYang === 'yang' ? '━━━━━━' : '━━  ━━';

    const detail = document.createElement('span');
    detail.className = 'yao-detail';
    const coins = line.coins.map((coin) => (coin === 3 ? '表' : '裏')).join('・');
    detail.textContent = `${line.type}（${coins}＝${line.total}）${line.changing ? '・変爻' : ''}`;

    item.append(label, figure, detail);
    return item;
}

function renderHexagram(result) {
    const original = result.originalHexagram;
    const changed = result.changedHexagram;
    const guardian = window.guardianData[original.guardian];
    // 結果を表示するたび、担当する姫の写真を同じ確率で1枚選ぶ。
    const guardianImage = guardian.images[Math.floor(Math.random() * guardian.images.length)];
    const changingText = result.changingLines.length
        ? result.changingLines.map((position) => POSITION_NAMES[position - 1]).join('、')
        : 'なし';
    const noChangeMessage = result.changingLines.length
        ? ''
        : `<p class="no-change-note">今回は変爻がありません。現在の卦の意味を中心に読んでください。</p>
           <p class="guardian-aside">「今回は大きく形を変える兆しは出ていないにゃ。今の状況を丁寧に見るにゃ。」</p>`;

    resultElement.innerHTML = `
        <section class="hexagram-result original-result">
            <p class="result-kicker">現在の卦・第${original.number}卦</p>
            <h2>${original.name}</h2>
            <p class="reading">${original.reading}</p>
            <div class="trigram-stack" aria-label="上卦${original.upperTrigram}、下卦${original.lowerTrigram}">
                <span>${original.upperTrigramData.symbol}<small>上卦 ${original.upperTrigram}・${original.upperTrigramData.nature}</small></span>
                <span>${original.lowerTrigramData.symbol}<small>下卦 ${original.lowerTrigram}・${original.lowerTrigramData.nature}</small></span>
            </div>
            <div class="keywords" aria-label="キーワード">${original.keywords.map((word) => `<span>${word}</span>`).join('')}</div>
            <div class="interpretation-blocks">
                <section><h3>この卦の意味</h3><p>${original.summary}</p></section>
                <section><h3>現在の状態</h3><p>${original.situation}</p></section>
                <section><h3>行動のヒント</h3><p>${original.advice}</p></section>
                <section class="caution"><h3>注意すること</h3><p>${original.caution}</p></section>
            </div>
        </section>
        <section class="guardian-card">
            <div class="guardian-heading">
                <img src="${guardianImage}" alt="${guardian.alt}" width="160" height="160" />
                <div><p class="result-kicker">本日の担当猫又</p><h2>${original.guardian}</h2><p class="reading">${guardian.reading}</p></div>
            </div>
            <blockquote><p>${original.nekomataInterpretation.message}</p><p>${original.nekomataInterpretation.advice}</p></blockquote>
        </section>
        <section class="change-flow" aria-label="卦の変化">
            <div><span>現在</span><strong>${original.name}</strong></div>
            <span class="flow-arrow" aria-hidden="true">↓</span>
            <div><span>変爻</span><strong>${changingText}</strong></div>
            ${changed ? `<span class="flow-arrow" aria-hidden="true">↓</span><div><span>変化の先</span><strong>${changed.name}</strong></div>` : ''}
        </section>
        ${noChangeMessage}
        <section class="hexagram-result changed-result">
            <p class="result-kicker">${changed ? `変化の先・第${changed.number}卦` : '之卦'}</p>
            ${changed ? `<h2>${changed.name}</h2><p class="reading">${changed.reading}</p><div class="keywords">${changed.keywords.map((word) => `<span>${word}</span>`).join('')}</div><h3>変化した先の流れ</h3><p>${changed.summary}</p><p>${changed.situation}</p><p class="changed-advice"><strong>その先のヒント：</strong>${changed.advice}</p>` : '<p class="no-change">変爻がないため、今回は之卦を立てません。</p>'}
        </section>
        <p class="entertainment-note">※この占いは娯楽を目的としたものです。重要な判断は、現実の状況や専門家の助言も踏まえて行ってください。</p>`;
    resultElement.hidden = false;
}

function cast() {
    castButton.disabled = true;
    const result = window.NekomaEki.castHexagram();
    linesElement.replaceChildren();
    // 保持は下→上だが、画面は上爻から初爻の順にするため逆順で描画する。
    [...result.lines].reverse().forEach((line) => linesElement.append(renderLine(line)));
    renderHexagram(result);
    castButton.disabled = false;
}

castButton.addEventListener('click', cast);
