# nyanz-lab WordPress 導入

既存の静的サイトとゲームはそのまま維持し、WordPress は
`https://nyanz-lab.sakura.ne.jp/blog/` だけで運用します。

## 管理対象

- WordPress 本体、アップロード画像、`wp-config.php` はこのリポジトリで管理しません。
- 独自テーマは `wordpress/themes/nyanz-lab-blog/` で管理します。
- WordPress は `/blog/` に導入済みです。静的な `blog/index.html` は再配置しないでください。

## さくらのレンタルサーバーへの導入

1. 既存サイトとデータベースをバックアップします。
2. サーバーコントロールパネルの「Webサイト/データ」→「WordPress」→「クイックインストール」を開きます。
3. 公開ドメインに `nyanz-lab.sakura.ne.jp`、サブディレクトリに `blog` を指定します。
4. HTTPS、データベース、サイト名、管理ユーザーを設定してインストールします。
5. `wordpress/themes/nyanz-lab-blog/` を、サーバー上の
   `blog/wp-content/themes/nyanz-lab-blog/` へアップロードします。
6. WordPress 管理画面の「外観」→「テーマ」で「nyanz-lab Blog」を有効化します。
7. 「設定」→「パーマリンク」で「投稿名」を選び、変更を保存します。
8. `https://nyanz-lab.sakura.ne.jp/blog/`、投稿、404、スマートフォン表示を確認します。

## 公開後の運用

- WordPress が生成するサイトマップを Search Console に追加します。
- WordPress 本体、テーマ、プラグインを更新し、定期バックアップを設定します。

管理者パスワード、データベース情報、認証キーはコミットしないでください。
