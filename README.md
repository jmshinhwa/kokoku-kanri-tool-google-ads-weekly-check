# 広告管理ツール｜Google広告の週次チェック：ムダな検索語句・除外キーワード案・承認してから反映

広告管理ツール — Google広告に貼るスクリプトで毎週ムダな検索語句を見つけ、承認した除外キーワードだけを追加

広告管理ツール：Google広告の「スクリプト」に1回貼るだけで、毎週、直近7日間の検索語句を監査します。OAuth連携・開発者トークン・APIキーは不要です。

• 記入例（架空のシューズ通販・7日間）：費用 ¥47,380 のうち、コンバージョン0件で1件あたり費用 ¥3,384 を超えた検索語句に ¥9,040（19.08%）。
• 承認してから反映：チェックを入れた除外キーワード（[完全一致] / "フレーズ一致"）だけを次のスクリプト実行で追加し、日付つき変更ログに残します。承認がなければ何も変わりません。
• 全角/半角・半角ｶﾅの揺れを同じ語句として合計、円表示、日本語のレポートとアラートメール。
• 毎月の理由：毎週の監査を前週と比べ（新しいムダ語句・直った語句）、お金が漏れた週だけアラートメール。週ごとの履歴と変更ログが残ります。
• 解約すると毎週の自動監査・アラート・承認→反映が止まります。CSVで貼る1週間の無料チェックは使い続けられます。

無料：サンプル、CSV貼り付け（ブラウザ内で計算）、スクリプトで1アカウントの最新週。
Pro：毎週の履歴・前週比較・承認→自動追加・変更ログ・アラートメール・CSV・印刷/PDF。代理店プランは最大10アカウント。

広告運用ツール・広告キャンペーン管理として使えます。P-MAX・ショッピング・ディスプレイの検索語句の除外、入札や予算の自動変更はしません。成果の向上は約束しません。

## Use it
- On the web (always the latest version): https://getreadystack.com/ja/apps/kokoku-kanri-tool-google-ads-weekly-check/
- Offline: download `kokoku-kanri-tool-google-ads-weekly-check-v1.0.0.zip` from the Releases page, unzip it and open `app/index.html` in your browser (or serve the `app/` folder with any static server).

## Pro
The free part works without a key. The Pro part opens with a licence key from https://getreadystack.com/api/buy/web/kokoku-kanri-tool-google-ads-weekly-check — paste it into the key box in the app.
The key is checked at https://getreadystack.com/api/lic, the same check the web page uses.

© 2026 Rulestamp · https://getreadystack.com
