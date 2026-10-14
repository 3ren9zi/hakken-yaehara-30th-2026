# Decap CMS GitHub OAuth Worker

八重原公民館サイトのDecap CMS管理画面とGitHubを安全に接続するためのCloudflare Workerです。

Cloudflareには次の暗号化されたシークレットを設定します。値をGitHubやローカルファイルへ保存しないでください。

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

GitHub OAuth AppのCallback URLは、WorkerのURLの末尾に `/callback` を付けたものを指定します。
