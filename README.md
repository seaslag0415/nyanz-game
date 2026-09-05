# nyanz-lab

猫たちとの暮らし、自作ブラウザゲーム、Web制作の試みをまとめる個人Webポータルです。

## ローカルでの確認

プロジェクト直下をドキュメントルートにして、HTTPサーバーで確認してください。ルート相対URLを使用しているため、HTMLファイルを直接開く方法ではなく `http://localhost:8000/` からアクセスします。

```powershell
python -m http.server 8000
```

## 主な構成

```text
index.html                     ポータルトップ
assets/css/common.css          ポータル共通スタイル
assets/js/common.js            SNS URL共通設定
games/index.html               ゲーム一覧
games/nyanz-game/              にゃんず下僕神社（ゲーム本体）
games/nekoma-eki/              猫又易占（易占い）
about/index.html               サイト・にゃんず紹介
wordpress/                     WordPress独自テーマと運用手順
robots.txt
sitemap.xml
```

## SNSリンクの変更

YouTube・X・noteのURLは `assets/js/common.js` の `SOCIAL_LINKS` で一括管理しています。

## Blogについて

`https://nyanz-lab.sakura.ne.jp/blog/` ではWordPressを運用しています。WordPress本体はサーバー側で管理し、独自テーマと運用手順は `wordpress/` にあります。

## ゲームの保存データ

「にゃんず下僕神社」は、今日の占い結果と今日のベストスコアをブラウザの `localStorage` に保存します。既存の保存キーは移設後も変更していません。

## 猫又易占の公開

トップページとゲーム一覧から `/games/nekoma-eki/` にアクセスできます。
サーバーの公開ディレクトリへ、次のファイルを同じ構成でアップロードしてください。

- `games/nekoma-eki/index.html` と同フォルダーの `css/`、`js/`、`images/`
- `index.html`、`games/index.html`
- `sitemap.xml`

占い本体と画像を先にアップロードしてから、入口のHTMLを更新してください。
