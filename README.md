# 広告管理ツール｜Google広告の週次チェック（Google 広告スクリプト）

Google 広告の「スクリプト」に1回貼るだけで、毎週、直近7日間の検索語句を読み、ムダな検索語句と除外キーワード案を出します。
**あなたが承認した除外キーワードだけ**を次の実行で追加します。承認がなければ何も変えません。OAuth 連携・開発者トークン・API キーは不要です。

- ページ（スクリプトの発行・結果・承認）: https://getreadystack.com/ja/apps/kokoku-kanri-tool-google-ads-weekly-check/
- スクリプト本体: [`app/kk_script.gs`](app/kk_script.gs)（110行・読めば全部わかる長さ）

## 使い方（5分）

1. 上のページを開き、自分のアカウント用のスクリプトを出します。`ACCT`（このアカウントの番号）と `TOKEN`（このアカウント専用の合言葉・他人に見せない）が入った状態で出ます。
2. Google 広告 → **ツール → 一括操作 → スクリプト → ＋** を開き、出てきたコードを全部貼ります。
3. 「承認」を押して、スクリプトに広告アカウントへのアクセスを許可します。
4. まず **プレビュー** で実行します。プレビューでは何も追加せず、ログに「追加する予定」だけが出ます。
5. 頻度を **毎週** にして保存します。実行ログの最後に「結果を見る: …」の URL が出ます。

## スクリプトが読むもの・送るもの

- 読む: 直近7日間の検索語句レポート（語句・一致タイプ・キャンペーン・広告グループ・クリック数・表示回数・費用・コンバージョン・コンバージョン値）と、キャンペーンの同じ数字（予算による表示機会損失率を含む）。費用の多い順に最大5,000語句。
- 送る: 上の数字だけをページのサーバーへ。**送らないもの**: 広告文・入札や予算の設定値・顧客データ・ログイン情報。

## スクリプトが変えるもの（これだけ）

- ページで **あなたが承認した** 除外キーワード（`[完全一致]` / `"フレーズ一致"`）を、指定キャンペーン（指定がなければ有効な検索キャンペーン全部）に追加します。
- 追加の結果（日時・語句・成功/失敗）を送り返し、ページの日付つき変更ログに残します。
- 入札・予算・広告文・P-MAX/ショッピング/ディスプレイの設定は変えません。

## 承認の流れ

週次の結果 → 除外キーワード案にチェック → 「承認」 → 次のスクリプト実行で追加 → 変更ログに記録。承認しなかった案は追加されません。

## 無料で使える範囲

サンプル、CSV 貼り付け（ブラウザ内で計算）、スクリプトで1アカウントの最新週の監査。

---

## English (short)

A Google Ads script for a weekly search-terms check: it reads the last 7 days of search terms and campaign numbers, flags wasted terms and suggests negative keywords, and adds **only the negatives you approved** on the page at the next run (preview runs add nothing). No OAuth, developer token or API key.
Install: open the page above → get your script (with your `ACCT` and `TOKEN`) → Google Ads → Tools → Bulk actions → Scripts → + → paste → Authorize → Preview → set frequency to Weekly.
It never changes bids, budgets, ads or P-MAX/Shopping/Display settings. The page is in Japanese.

Google 広告は Google LLC の商標です。このツールは Google とは無関係です。成果の向上は約束しません。

© 2026 Rulestamp · https://getreadystack.com
