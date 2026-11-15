// kk_i18n.js — every word on the page in ja (default) · en · de · es · pt. t(key) falls back to ja.
(function (g) {
  'use strict';
  var D = {
    ja: {
      h1: '広告管理ツール｜Google広告の週次チェック：ムダな検索語句・除外キーワード案・承認してから反映',
      tags: '広告運用ツール · 広告キャンペーン管理 · 自分のアカウントに貼るスクリプト、APIキー不要',
      lede1: '記入例（架空のシューズ通販・7日間）：費用 ¥47,380 のうち、コンバージョン0件で1件あたり費用 ¥3,384 を超えた検索語句「シューズ 安い」「ランニングシューズ 中古」に ¥9,040（19.08%）が出ていました。',
      lede2: 'Google広告に貼るスクリプトが毎週このチェックをして、あなたが承認した除外キーワードだけを追加します。',
      b1: 'OAuth連携も開発者トークンもなし：Google広告の「スクリプト」に1回貼るだけ。媒体の再認証エラーで止まりません。',
      b2: '承認してから反映：チェックを入れた除外キーワードだけを次の実行で追加し、日付つき変更ログに残します。承認がなければ何も変わりません。',
      b3: '毎月の理由：毎週新しい検索語句に費用が出ます。毎週の監査を前週と比べ（新しいムダ・直った語句）、お金が漏れた週だけ日本語のアラートメール。全角/半角・半角ｶﾅの揺れは同じ語句として合計します。',
      tryS: 'サンプルで試す（架空の記入例）', tryC: 'CSVを貼る（無料・ブラウザ内で計算）', tryG: 'スクリプトで自動（無料で1アカウント）',
      csvHelp: 'Google広告 → キャンペーン → 分析情報とレポート → 検索語句 → ダウンロード（CSV）。日本語・英語の列名どちらでも読めます。ファイルはこのブラウザの外に出ません。',
      csvRun: '監査する', csvFile: 'ファイルを選ぶ', csvErr: '「検索語句」の列が見つかりません。検索語句レポートのCSVを貼ってください。',
      gHelp: '1) 下のコードをコピー → 2) Google広告 → ツール → 一括操作 → スクリプト → ＋ → 全部貼る → 「承認」 → 3) 「プレビュー」を押す → 4) このページで「結果を読み込む」。毎週チェックしたい時は頻度を「毎週」に。',
      gSends: 'スクリプトが送るのは直近7日間の検索語句・キャンペーンの数字（語句・クリック数・表示回数・費用・コンバージョン）だけです。広告文・入札・ログイン情報は送りません。',
      gNew: 'コードを発行', gCopy: 'コードをコピー', gLoad: '結果を読み込む', gWait: 'まだ届いていません。Google広告でスクリプトを実行してから押してください。',
      copied: 'コピーしました',
      kCost: '7日間の費用', kConv: 'コンバージョン', kCpa: '1件あたり費用（ムダの基準）', kWaste: 'ムダ候補の費用', kTerms: '検索語句',
      merged: '全角/半角・表記揺れを同じ語句として合計: {n} 組', period: '期間', acct: 'アカウント',
      fW1: 'コンバージョン0件で、1件あたり費用 {thr} 以上を使った検索語句（完全一致で除外）', fW2: 'コンバージョンした語句に一度も出てこない単語（フレーズ一致で除外すると来週の言い換えも止まります）',
      fT1: '{n} クリックでコンバージョン0件 — 除外より先にコンバージョン計測（タグ）を確認してください', fC1: 'クリック {n} 回でコンバージョン0件のキャンペーン',
      fC2: '1件あたり費用が平均以下なのに、予算不足で表示の {n}% を失っているキャンペーン', none: 'このデータではお金が漏れている検索語句は見つかりませんでした。',
      th: ['検索語句', 'キャンペーン', 'クリック', '費用', '表記揺れ'], th2: ['単語', '語句数', 'クリック', '費用'], th3: ['キャンペーン', 'クリック', '費用'], th4: ['キャンペーン', '失った表示%', '1件あたり費用'],
      negH: '除外キーワード案 {n} 件', negCopy: '全部コピー（Google広告の除外キーワード欄にそのまま貼れます）', exact: '完全一致', phrase: 'フレーズ一致', allCamp: '全検索キャンペーン',
      approve: 'チェックした {n} 件を承認 → 次のスクリプト実行で追加', approveFree: '承認→自動追加・毎週の履歴・アラートメール・CSV/PDFは Pro です（コピーして手で追加するのは無料）',
      approved: '承認済み：{n} 件。次のスクリプト実行で追加されます（すぐ反映したい時はスクリプト画面で「実行」）。', applied: '{at} に {n} 件追加しました',
      proH: 'Pro：毎週の履歴・承認→反映・アラート', key: 'ライセンスキー', keyBtn: 'キーを使う', keyBad: 'このキーは使えません', keyOk: 'Pro が有効です',
      addAcct: 'アカウントを追加', accts: 'アカウント', cap: '上限 {n} アカウント', email: 'アラートメールの宛先（お金が漏れた週だけ届きます）', save: '保存',
      hist: '週ごとの履歴', histTh: ['週の最終日', '費用', 'CV', 'ムダ候補', '新しいムダ語句'], cmp: '前週と比べて：新しいムダ語句 {a} · 直った語句 {b}', log: '変更ログ（日付つき）', logTh: ['反映日時', '除外キーワード', 'マッチタイプ', 'キャンペーン', '結果'],
      histNone: 'まだ履歴はありません。次のスクリプト実行から週ごとに残ります。', logNone: 'まだ変更はありません。承認した除外キーワードを追加すると、ここに日時つきで残ります。',
      csvH: '履歴CSV', csvN: '除外キーワードCSV', csvL: '変更ログCSV', print: 'レポートを印刷 / PDF',
      buyH: 'Pro にする', buyM: '月額プラン — 1アカウント', buyY: '年額プラン — 1アカウント', buyA: '代理店プラン — 最大10アカウント',
      buyWhy: '解約すると：毎週の自動監査・アラート・承認→反映が止まります。CSVで貼る無料の1週間チェックはそのまま使えます。',
      scope: 'できないこと：P-MAX・ショッピング・ディスプレイの検索語句の除外、入札や予算の自動変更はしません（スクリプトが追加するのは承認した除外キーワードだけ）。',
      more: '日本語のほかのツール', moreA: '検索順位 チェック（毎日のGoogle順位）', allTools: 'すべてのツール'
    },
    en: {
      h1: '広告管理ツール | Google Ads weekly check: wasted search terms, negative keyword list, applied only after you approve',
      tags: 'Ad ops tool · ad campaign management · a script you paste into your own account, no API key',
      lede1: 'Example (made-up shoe shop, 7 days): of ¥47,380 spent, ¥9,040 (19.08%) went to search terms like "シューズ 安い" and "ランニングシューズ 中古" that each spent more than the ¥3,384 cost per conversion and converted 0 times.',
      lede2: 'A script in your Google Ads account runs this check every week and adds only the negative keywords you approved.',
      b1: 'No OAuth, no developer token: paste it once into Google Ads Scripts. No reconnect errors.',
      b2: 'Approve, then apply: only the negatives you tick are added on the next run, with a dated change log. Nothing changes without approval.',
      b3: 'Why monthly: new search terms cost money every week. Each audit is compared with last week (new waste, fixed terms) and you get a mail only in weeks money leaks. Full/half-width variants are summed as one term.',
      tryS: 'Try the sample (made-up)', tryC: 'Paste a CSV (free, computed in your browser)', tryG: 'Automatic script (free for 1 account)',
      csvHelp: 'Google Ads → Campaigns → Insights and reports → Search terms → Download (CSV). Japanese or English headers. The file never leaves this browser.',
      csvRun: 'Audit', csvFile: 'Choose file', csvErr: 'No "Search term" column found. Paste the search terms report CSV.',
      gHelp: '1) Copy the code → 2) Google Ads → Tools → Bulk actions → Scripts → + → paste all → Authorize → 3) Preview → 4) press "Load result" here. For a weekly check set the frequency to Weekly.',
      gSends: 'The script sends only the last 7 days of search-term and campaign numbers (term, clicks, impressions, cost, conversions). No ad text, bids or logins.',
      gNew: 'Get my code', gCopy: 'Copy code', gLoad: 'Load result', gWait: 'Nothing received yet. Run the script in Google Ads first.', copied: 'Copied',
      kCost: 'Cost, 7 days', kConv: 'Conversions', kCpa: 'Cost per conversion (waste line)', kWaste: 'Likely waste', kTerms: 'Search terms',
      merged: 'Full/half-width variants summed as one term: {n}', period: 'Period', acct: 'Account',
      fW1: 'Terms with 0 conversions that spent at least {thr} (exclude as exact)', fW2: 'Words that never appear in a converting term (a phrase negative also stops next week\'s variants)',
      fT1: '{n} clicks and 0 conversions — check conversion tracking before adding negatives', fC1: 'Campaign with {n} clicks and 0 conversions',
      fC2: 'Campaign below the average cost per conversion that loses {n}% of impressions to budget', none: 'No search term is leaking money in this data.',
      th: ['Search term', 'Campaign', 'Clicks', 'Cost', 'Variants'], th2: ['Word', 'Terms', 'Clicks', 'Cost'], th3: ['Campaign', 'Clicks', 'Cost'], th4: ['Campaign', 'Lost impr. %', 'Cost/conv.'],
      negH: '{n} negative keywords', negCopy: 'Copy all (paste into the Google Ads negative keyword box)', exact: 'Exact', phrase: 'Phrase', allCamp: 'All search campaigns',
      approve: 'Approve the {n} ticked → added on the next script run', approveFree: 'Approve → auto-add, weekly history, alert mail and CSV/PDF are Pro (copying and adding by hand is free)',
      approved: 'Approved: {n}. They are added on the next script run (press Run in Scripts to apply now).', applied: '{n} added at {at}',
      proH: 'Pro: weekly history · approve → apply · alerts', key: 'Licence key', keyBtn: 'Use key', keyBad: 'This key does not work', keyOk: 'Pro is active',
      addAcct: 'Add account', accts: 'Accounts', cap: 'up to {n} accounts', email: 'Alert mail to (only in weeks money leaks)', save: 'Save',
      hist: 'Weekly history', histTh: ['Week ending', 'Cost', 'Conv.', 'Waste', 'New waste terms'], cmp: 'vs last week: new waste terms {a} · fixed {b}', log: 'Change log (dated)', logTh: ['Applied at', 'Negative', 'Match', 'Campaign', 'Result'],
      histNone: 'No history yet. Each script run from now on adds its week.', logNone: 'No changes yet. Approved negatives appear here with the date they were added.',
      csvH: 'History CSV', csvN: 'Negatives CSV', csvL: 'Change log CSV', print: 'Print report / PDF',
      buyH: 'Go Pro', buyM: 'Monthly — 1 account', buyY: 'Yearly — 1 account', buyA: 'Agency — up to 10 accounts',
      buyWhy: 'If you cancel: the weekly audit, alerts and approve → apply stop. The free one-week CSV check keeps working.',
      scope: 'Not included: excluding Performance Max / Shopping / Display terms, and any automatic bid or budget change (the script only adds the negatives you approved).',
      more: 'More tools', moreA: '検索順位 チェック (daily Google rankings)', allTools: 'All tools'
    },
    de: {
      h1: '広告管理ツール | Google Ads Wochen-Check: teure Suchbegriffe, ausschließende Keywords, erst nach Ihrer Freigabe',
      lede1: 'Beispiel (erfundener Schuhshop, 7 Tage): von ¥47.380 Kosten gingen ¥9.040 (19,08 %) an Suchbegriffe wie „シューズ 安い", die je mehr als die ¥3.384 Kosten pro Conversion ausgaben und 0 Conversions brachten.',
      lede2: 'Ein Skript in Ihrem Google-Ads-Konto prüft das jede Woche und fügt nur die freigegebenen ausschließenden Keywords hinzu.',
      b1: 'Kein OAuth, kein Developer-Token: einmal in Google-Ads-Skripte einfügen.', b2: 'Erst freigeben, dann anwenden: nur angehakte Keywords, mit datiertem Änderungsprotokoll.',
      b3: 'Warum monatlich: jede Woche neue Suchbegriffe. Vergleich mit der Vorwoche, E-Mail nur in Wochen mit Geldverlust.',
      tryS: 'Beispiel testen (erfunden)', tryC: 'CSV einfügen (kostenlos, im Browser)', tryG: 'Automatisches Skript (1 Konto kostenlos)', csvRun: 'Prüfen', gNew: 'Code erstellen', gCopy: 'Code kopieren', gLoad: 'Ergebnis laden',
      kCost: 'Kosten, 7 Tage', kConv: 'Conversions', kCpa: 'Kosten/Conversion (Grenze)', kWaste: 'Wahrscheinlich verschwendet', kTerms: 'Suchbegriffe', negCopy: 'Alle kopieren', exact: 'Genau', phrase: 'Wortgruppe',
      buyH: 'Pro holen', buyM: 'Monatlich — 1 Konto', buyY: 'Jährlich — 1 Konto', buyA: 'Agentur — bis 10 Konten', more: 'Weitere Tools', allTools: 'Alle Tools'
    },
    es: {
      h1: '広告管理ツール | Revisión semanal de Google Ads: términos de búsqueda que gastan, palabras clave negativas, aplicadas solo tras tu aprobación',
      lede1: 'Ejemplo (tienda de zapatillas ficticia, 7 días): de ¥47.380 gastados, ¥9.040 (19,08 %) fueron a términos como «シューズ 安い» que gastaron más de ¥3.384 por conversión sin convertir.',
      lede2: 'Un script en tu cuenta de Google Ads lo revisa cada semana y añade solo las negativas que apruebas.',
      b1: 'Sin OAuth ni token de desarrollador: se pega una vez en Scripts de Google Ads.', b2: 'Aprobar y luego aplicar: solo las marcadas, con registro de cambios fechado.',
      b3: 'Por qué mensual: cada semana hay términos nuevos. Comparación con la semana anterior y correo solo cuando se pierde dinero.',
      tryS: 'Probar el ejemplo (ficticio)', tryC: 'Pegar CSV (gratis, en tu navegador)', tryG: 'Script automático (1 cuenta gratis)', csvRun: 'Revisar', gNew: 'Obtener código', gCopy: 'Copiar código', gLoad: 'Cargar resultado',
      kCost: 'Coste, 7 días', kConv: 'Conversiones', kCpa: 'Coste/conversión (límite)', kWaste: 'Gasto probablemente perdido', kTerms: 'Términos', negCopy: 'Copiar todo', exact: 'Exacta', phrase: 'Frase',
      buyH: 'Hazte Pro', buyM: 'Mensual — 1 cuenta', buyY: 'Anual — 1 cuenta', buyA: 'Agencia — hasta 10 cuentas', more: 'Más herramientas', allTools: 'Todas las herramientas'
    },
    pt: {
      h1: '広告管理ツール | Revisão semanal do Google Ads: termos de pesquisa que desperdiçam, palavras-chave negativas, aplicadas só após sua aprovação',
      lede1: 'Exemplo (loja de tênis fictícia, 7 dias): de ¥47.380 gastos, ¥9.040 (19,08%) foram para termos como "シューズ 安い" que gastaram mais de ¥3.384 por conversão sem converter.',
      lede2: 'Um script na sua conta do Google Ads faz essa revisão toda semana e adiciona só as negativas que você aprovou.',
      b1: 'Sem OAuth nem token de desenvolvedor: cole uma vez em Scripts do Google Ads.', b2: 'Aprovar e depois aplicar: só as marcadas, com registro de alterações datado.',
      b3: 'Por que mensal: toda semana surgem termos novos. Comparação com a semana anterior e e-mail só quando há vazamento de dinheiro.',
      tryS: 'Testar o exemplo (fictício)', tryC: 'Colar CSV (grátis, no navegador)', tryG: 'Script automático (1 conta grátis)', csvRun: 'Revisar', gNew: 'Gerar código', gCopy: 'Copiar código', gLoad: 'Carregar resultado',
      kCost: 'Custo, 7 dias', kConv: 'Conversões', kCpa: 'Custo/conversão (limite)', kWaste: 'Provável desperdício', kTerms: 'Termos', negCopy: 'Copiar tudo', exact: 'Exata', phrase: 'Frase',
      buyH: 'Assinar o Pro', buyM: 'Mensal — 1 conta', buyY: 'Anual — 1 conta', buyA: 'Agência — até 10 contas', more: 'Mais ferramentas', allTools: 'Todas as ferramentas'
    }
  };
  var LANGS = ['ja', 'en', 'de', 'es', 'pt'];
  function t(lang, k, v) {
    var s = (D[lang] && D[lang][k] != null) ? D[lang][k] : (lang !== 'ja' && D.en[k] != null ? D.en[k] : D.ja[k]);
    if (s == null) return k;
    if (v && typeof s === 'string') Object.keys(v).forEach(function (x) { s = s.split('{' + x + '}').join(v[x]); });
    return s;
  }
  g.KKI18n = { t: t, LANGS: LANGS, D: D };
})(typeof globalThis !== 'undefined' ? globalThis : this);
