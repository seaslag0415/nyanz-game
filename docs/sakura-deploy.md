# GitHub Actionsからさくらへ公開する

`.github/workflows/deploy.yml` は、mainへのマージまたは直接pushでサイトを公開します。
GitHub Actionsの手動実行にも対応しています（mainのみ）。ビルド処理は不要です。

## 初回設定

GitHubのリポジトリで **Settings → Secrets and variables → Actions → New repository secret**
から、以下の5項目を登録してください。秘密鍵をリポジトリに保存しないでください。

| Secret名 | 設定値 |
| --- | --- |
| `SAKURA_HOST` | SSH接続先（例：`nyanz-lab.sakura.ne.jp`。実際のSSH接続先を確認） |
| `SAKURA_USER` | SSHログインに使う初期アカウント名 |
| `SAKURA_DEPLOY_PATH` | サイトの公開先の絶対パス（例：`/home/アカウント名/www`） |
| `SAKURA_SSH_PRIVATE_KEY` | 公開用SSH秘密鍵の全文（BEGIN/END行を含む） |
| `SAKURA_SSH_KNOWN_HOSTS` | 接続先のホスト鍵を確認済みのknown_hostsエントリー |

公開先はサーバコントロールパネルの対象ドメインの設定で確認してください。
`/home/アカウント名/www` またはその配下の既存ディレクトリを指定します。
このワークフローのパス検証では半角英数字・アンダースコア・ハイフン・ドットのフォルダ名に対応します。
SSHポートは22、サーバ上で `rsync` コマンドが利用できることが前提です。

### SSH鍵

自動公開専用の鍵をローカルで作成します。既存の鍵を上書きしないファイル名を使ってください。

```powershell
ssh-keygen -t ed25519 -f "$env:USERPROFILE/.ssh/sakura_actions"
```

このワークフローではパスフレーズなしの鍵を使用します。
生成した `sakura_actions.pub` の公開鍵をさくらのサーバに登録し、
`sakura_actions` の秘密鍵全文を `SAKURA_SSH_PRIVATE_KEY` に登録します。
公開鍵の登録方法は[さくら公式手順](https://help.sakura.ad.jp/rs/2804/)を参照してください。

`SAKURA_SSH_KNOWN_HOSTS` には、普段利用しているSSH接続先について、
本人確認済みのローカル `~/.ssh/known_hosts` エントリーを登録できます。
以下で対象ホストのエントリーを表示できます（ホスト名は実際の接続先に変更）。

```powershell
ssh-keygen -F nyanz-lab.sakura.ne.jp
```

未登録なら、サーバ管理画面等の信頼できる経路でホスト鍵の指紋を確認してから登録してください。
ワークフローは登録済みのホスト鍵と照合して接続します。

## 転送内容

- トップページ、favicon、robots.txt、sitemap.xml、Google所有権確認ファイル
- `assets/`、`about/`、`games/`（tests、Markdown、隠しファイルを除く）
- `wordpress/themes/nyanz-lab-blog/` → 公開先の `blog/wp-content/themes/nyanz-lab-blog/`

WordPress本体、投稿・データベース、アップロード画像はサーバ側で管理します。
静的な `blog/index.html` は転送しません。開発用の `nyanz-icons/` も対象外です。
新しい公開用のトップレベルフォルダ・ファイルを追加した場合は、YAMLの転送対象も更新してください。

転送は同名ファイルを上書きします。サーバ上のファイルを自動削除しないため、
Gitから削除・改名した旧ファイルはサーバに残ります。不要なファイルは対象を確認して別途削除してください。
複数ファイルの更新はサイト全体で一括切り替えされる方式ではありません。

## 動作確認と運用

1. 既存サイト・テーマをバックアップします。
2. 初回のmainへの反映時は、Secrets登録前なら接続情報の検証で停止し、転送されません。
3. Secrets登録後、GitHubの **Actions → Deploy to Sakura → Run workflow** を開きます。
4. ブランチはmain、`dry_run`をオンで実行し、接続と転送予定をログで確認します。
5. 内容が正しければ、`dry_run`をオフにして手動実行します。
6. 以降はmainの更新で自動公開します。失敗時はActionsの実行ログを確認してください。

手動実行のdry runではサーバ上のファイルを更新しません。
mainへのpushによる実行は常に本番転送です。
実行中の転送は新しいpushで中断しないように設定しています。

GitHub Freeでも利用できます。非公開リポジトリは月2,000分の無料枠を他のActionsと共有します。
詳細は[GitHub公式の料金説明](https://docs.github.com/en/billing/concepts/product-billing/github-actions)を参照してください。
