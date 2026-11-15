/**
 * 広告管理ツール｜Google広告の週次チェック — Google 広告スクリプト (getreadystack.com)
 * 貼る場所: Google 広告 → ツール → 一括操作 → スクリプト → ＋ → このコードを全部貼る → 「承認」→ 頻度「毎週」
 *
 * このスクリプトがすること（これ以外はしません）:
 *  1. 直近7日間の「検索語句」と「キャンペーン」の数字（語句・クリック数・表示回数・費用・コンバージョン）を読み、下の URL に送ります。
 *     送らないもの: 広告文・入札・予算の設定値・顧客データ・ログイン情報。OAuth も開発者トークンも使いません。
 *  2. あなたがページで「承認」した除外キーワードだけを追加します。承認がなければ何も変えません。
 *     プレビュー実行のときは何も追加せず、ログに「追加する予定」を出すだけです。
 *  3. 追加した結果（日時・語句・成功/失敗）を送り返し、ページの変更ログに残します。
 */
var KK = {
  BASE: '__BASE__',     // 監査サーバー（当社）
  ACCT: '__ACCT__',     // このアカウントの番号（ページが発行）
  TOKEN: '__TOKEN__',   // このアカウント専用の合言葉（他人に見せない）
  MAX_TERMS: 5000       // 費用の多い順に最大5000語句
};

function main() {
  var preview = AdsApp.getExecutionInfo().isPreview();
  // ── 1) 承認済みの除外キーワードを反映（承認がある時だけ）
  var ap = kkGet_('/api/approved');
  if (ap && ap.ok && ap.approval && ap.approval.items && ap.approval.items.length) {
    var res = kkApply_(ap.approval.items, preview);
    if (!preview) kkPost_('/api/applied', { id: ap.approval.id, results: res });
    Logger.log((preview ? '[プレビュー] 追加する予定: ' : '追加しました: ') + res.filter(function (r) { return r.ok; }).length + ' / ' + res.length);
  } else {
    Logger.log('承認待ちの除外キーワードはありません — 何も変更していません。');
  }
  // ── 2) 今週の数字を送って監査
  var acc = AdsApp.currentAccount();
  var week = { account: { id: acc.getCustomerId(), name: acc.getName(), currency: acc.getCurrencyCode(), tz: acc.getTimeZone() },
    period: kkPeriod_(acc.getTimeZone()), terms: kkTerms_(), campaigns: kkCampaigns_(), preview: preview, v: 1 };
  var r = kkPost_('/api/ingest', week);
  if (r && r.ok) {
    Logger.log('監査しました: 検索語句 ' + week.terms.length + ' 行 · ムダ候補 ' + r.summary.wasteTerms + ' 語句 · 除外キーワード案 ' + r.summary.negatives + ' 件');
    Logger.log('結果を見る: ' + r.url);
  } else {
    Logger.log('送信できませんでした: ' + JSON.stringify(r));
  }
}

function kkPeriod_(tz) {
  var d = new Date(), to = new Date(d.getTime() - 864e5), from = new Date(d.getTime() - 7 * 864e5);
  return { from: Utilities.formatDate(from, tz, 'yyyy-MM-dd'), to: Utilities.formatDate(to, tz, 'yyyy-MM-dd') };
}

function kkTerms_() {
  var q = 'SELECT search_term_view.search_term, search_term_view.status, segments.search_term_match_type, campaign.id, campaign.name, ' +
    'ad_group.id, ad_group.name, metrics.clicks, metrics.impressions, metrics.cost_micros, metrics.conversions, metrics.conversions_value ' +
    'FROM search_term_view WHERE segments.date DURING LAST_7_DAYS AND metrics.impressions > 0 ORDER BY metrics.cost_micros DESC LIMIT ' + KK.MAX_TERMS;
  var it = AdsApp.search(q), out = [];
  while (it.hasNext()) {
    var r = it.next();
    out.push({ term: r.searchTermView.searchTerm, status: r.searchTermView.status, match: r.segments.searchTermMatchType,
      campaignId: String(r.campaign.id), campaign: r.campaign.name, adGroupId: String(r.adGroup.id), adGroup: r.adGroup.name,
      clicks: Number(r.metrics.clicks || 0), impr: Number(r.metrics.impressions || 0), cost: Number(r.metrics.costMicros || 0) / 1e6,
      conv: Number(r.metrics.conversions || 0), value: Number(r.metrics.conversionsValue || 0) });
  }
  return out;
}

function kkCampaigns_() {
  var q = 'SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, campaign.bidding_strategy_type, ' +
    'metrics.clicks, metrics.impressions, metrics.cost_micros, metrics.conversions, metrics.conversions_value, metrics.search_budget_lost_impression_share ' +
    'FROM campaign WHERE segments.date DURING LAST_7_DAYS AND campaign.status != \'REMOVED\' AND metrics.impressions > 0';
  var it = AdsApp.search(q), out = [];
  while (it.hasNext()) {
    var r = it.next();
    out.push({ id: String(r.campaign.id), name: r.campaign.name, status: r.campaign.status, type: r.campaign.advertisingChannelType, bid: r.campaign.biddingStrategyType,
      clicks: Number(r.metrics.clicks || 0), impr: Number(r.metrics.impressions || 0), cost: Number(r.metrics.costMicros || 0) / 1e6,
      conv: Number(r.metrics.conversions || 0), value: Number(r.metrics.conversionsValue || 0),
      lostBudget: r.metrics.searchBudgetLostImpressionShare == null ? null : Number(r.metrics.searchBudgetLostImpressionShare) });
  }
  return out;
}

// 承認された行だけ: { text, type: 'exact' | 'phrase', campaignId }。campaignId が空 = 有効な検索キャンペーン全部。
function kkApply_(items, preview) {
  var res = [];
  items.forEach(function (x) {
    var kw = x.type === 'exact' ? '[' + x.text + ']' : '"' + x.text + '"';
    var sel = AdsApp.campaigns().withCondition("campaign.status = 'ENABLED'").withCondition("campaign.advertising_channel_type = 'SEARCH'");
    if (x.campaignId) sel = AdsApp.campaigns().withIds([Number(x.campaignId)]);
    var it = sel.get(), n = 0;
    if (!it.hasNext()) { res.push({ id: x.id, text: x.text, type: x.type, campaignId: x.campaignId || '', ok: false, err: 'campaign_not_found' }); return; }
    while (it.hasNext()) {
      var c = it.next();
      if (preview) { res.push({ id: x.id, text: x.text, type: x.type, campaignId: String(c.getId()), ok: true, preview: true }); n++; continue; }
      try { c.createNegativeKeyword(kw); res.push({ id: x.id, text: x.text, type: x.type, campaignId: String(c.getId()), campaign: c.getName(), ok: true }); }
      catch (e) { res.push({ id: x.id, text: x.text, type: x.type, campaignId: String(c.getId()), ok: false, err: String(e).slice(0, 160) }); }
      n++;
    }
  });
  return res;
}

function kkGet_(path) {
  try {
    var r = UrlFetchApp.fetch(KK.BASE + path + '?acct=' + encodeURIComponent(KK.ACCT) + '&token=' + encodeURIComponent(KK.TOKEN), { muteHttpExceptions: true });
    return JSON.parse(r.getContentText());
  } catch (e) { Logger.log('GET ' + path + ' failed: ' + e); return null; }
}
function kkPost_(path, body) {
  try {
    body.acct = KK.ACCT; body.token = KK.TOKEN;
    var r = UrlFetchApp.fetch(KK.BASE + path, { method: 'post', contentType: 'application/json', payload: JSON.stringify(body), muteHttpExceptions: true });
    return JSON.parse(r.getContentText());
  } catch (e) { Logger.log('POST ' + path + ' failed: ' + e); return null; }
}
