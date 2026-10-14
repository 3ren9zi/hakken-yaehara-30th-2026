# Decap CMS 試用版

現在の公開サイトには影響しない、管理画面付きの試用版です。

## 編集できるもの

- 8地区の紹介文、地名の由来、補足
- 歴史遺物・建造物の名称、所在地、説明
- 写真の追加と差し替え

地区IDは固定されているため、`#mokushi` など既存のページ内URLは変わりません。

## パソコン上で試す手順

1. このフォルダーで `npm install` を1回だけ実行します。
2. 1つ目の画面で `npm run cms` を実行します。
3. 2つ目の画面で `npm run build`、続けて `npm run dev` を実行します。
4. ブラウザーで `http://127.0.0.1:4173/admin/` を開きます。
5. 「地域の歴史・文化」から地区を選び、保存します。
6. `npm run build` をもう一度実行すると、公開用データへ反映されます。

## GitHub Pagesで公開する前に必要なこと

- 公民館が管理するGitHubアカウントまたはOrganization
- 公開用Repository
- 編集担当者のGitHubアカウントと書き込み権限
- Decap CMSのGitHubログイン用OAuth設定

GitHub Pagesだけでは管理画面のログイン機能は付きません。公開作業では、GitHub OAuth用の小さな認証サービスを別途設定します。

公開用Repository: https://github.com/3ren9zi/hakken-yaehara-30th-2026
