// kk_engine.js — 広告管理ツール｜Google広告の週次チェック: the audit. Pure functions, no network.
// One engine for the page (CSV paste / sample), the Worker (rows posted by the Ads Script) and node tests.
// Input week = { account:{id,name,currency}, period:{from,to}, terms:[{term,match,status,campaign,campaignId,adGroup,adGroupId,clicks,impr,cost,conv,value}],
//                campaigns:[{id,name,status,type,bid,clicks,impr,cost,conv,value,lostBudget}] }
// Rules carried from the shipped google-ads-audit-tool-weekly engine (ext_test 26/26): the waste line = the account's own cost per
// conversion (no conversions → 10 clicks' cost); a term that spent the line with 0 conversions = an [exact] negative; words that only
// ever appear in non-converting terms = "phrase" negatives. New here: NFKC grouping (全角/半角・半角ｶﾅ), ja-JP money, Japanese CSV headers.
(function (g) {
  'use strict';
  var V = 1;
  function norm(s) { return String(s == null ? '' : s).normalize('NFKC').toLowerCase().replace(/[\s　]+/g, ' ').trim(); }
  function num(x) {
    if (x == null) return 0; if (typeof x === 'number') return isFinite(x) ? x : 0;
    var s = String(x).normalize('NFKC').replace(/[¥$€£,\s%]/g, '').replace(/^--$/, '');
    var v = parseFloat(s); return isFinite(v) ? v : 0;
  }
  function r2(x) { return Math.round(x * 100) / 100; }
  function sum(a, k) { return a.reduce(function (s, r) { return s + (r[k] || 0); }, 0); }
  function money(x, cur) {
    if (x == null) return '';
    cur = cur || 'JPY';
    try { return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: cur, maximumFractionDigits: cur === 'JPY' ? 0 : 2 }).format(x); }
    catch (e) { return cur + ' ' + x.toFixed(2); }
  }
  function grams(t) {
    var w = t.split(' ').filter(Boolean), out = {};
    w.forEach(function (x) { if (x.length > 1 || /[぀-ヿ一-鿿]/.test(x)) out[x] = 1; });
    for (var i = 0; i + 1 < w.length; i++) out[w[i] + ' ' + w[i + 1]] = 1;
    return Object.keys(out);
  }

  // ── CSV / TSV from the Google Ads UI (Japanese or English headers; UTF-8 CSV or the UTF-16 TSV "Excel" export once decoded)
  var H = {
    term: ['検索語句', 'search term'], match: ['検索語句のマッチタイプ', 'マッチタイプ', 'search terms match type', 'match type'],
    status: ['追加/除外', 'added/excluded'], campaign: ['キャンペーン', 'キャンペーン名', 'campaign'], adGroup: ['広告グループ', '広告グループ名', 'ad group'],
    clicks: ['クリック数', 'clicks'], impr: ['表示回数', 'impr.', 'impressions'], cost: ['費用', 'コスト', 'cost'],
    conv: ['コンバージョン', 'コンバージョン数', 'conversions', 'conv.'], value: ['コンバージョン値', 'conv. value', 'conversion value'], currency: ['通貨コード', '通貨', 'currency code']
  };
  function splitLine(line, d) {
    var out = [], cur = '', q = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true; else if (c === d) { out.push(cur); cur = ''; } else cur += c;
    }
    out.push(cur); return out;
  }
  function parseCsv(text) {
    text = String(text || '').replace(/^﻿/, '');
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim() !== ''; });
    var hi = -1, d = ',';
    for (var i = 0; i < Math.min(lines.length, 12); i++) {
      var dd = lines[i].split('\t').length > lines[i].split(',').length ? '\t' : ',';
      var cells = splitLine(lines[i], dd).map(norm);
      if (cells.length > 1 && (cells.indexOf('検索語句') > -1 || cells.indexOf('search term') > -1)) { hi = i; d = dd; break; }
    }
    if (hi < 0) return { error: 'no_header', terms: [] };
    var hd = splitLine(lines[hi], d).map(norm), map = {};
    Object.keys(H).forEach(function (k) {
      var idx = -1;
      H[k].forEach(function (a) { if (idx < 0) idx = hd.indexOf(norm(a)); });
      if (k === 'conv' && idx > -1 && /値|value/.test(hd[idx])) idx = -1;
      map[k] = idx;
    });
    if (map.term < 0) return { error: 'no_term_col', terms: [] };
    var terms = [], cur = '';
    for (var j = hi + 1; j < lines.length; j++) {
      var c = splitLine(lines[j], d), t = (c[map.term] || '').trim();
      if (!t || /^(合計|total)/i.test(norm(t)) || /^--$/.test(t)) continue;
      if (map.currency > -1 && c[map.currency]) cur = c[map.currency].trim();
      terms.push({ term: t, match: map.match > -1 ? c[map.match] || '' : '', status: map.status > -1 ? c[map.status] || '' : '',
        campaign: map.campaign > -1 ? c[map.campaign] || '' : '', campaignId: '', adGroup: map.adGroup > -1 ? c[map.adGroup] || '' : '',
        clicks: num(c[map.clicks]), impr: num(c[map.impr]), cost: num(c[map.cost]), conv: num(c[map.conv]), value: map.value > -1 ? num(c[map.value]) : 0 });
    }
    return { terms: terms, currency: cur || 'JPY' };
  }

  function excluded(s) { s = norm(s); return s === 'excluded' || s === '除外' || s === '除外済み' || s === 'added_excluded' || s === 'both'; }

  // ── the audit
  function audit(week, opt) {
    opt = opt || {};
    var acc = week.account || {}, cur = acc.currency || week.currency || 'JPY';
    var terms = (week.terms || []).map(function (r) { return { term: String(r.term || ''), match: r.match || '', status: r.status || '', campaign: r.campaign || '', campaignId: String(r.campaignId || ''),
      adGroup: r.adGroup || '', clicks: num(r.clicks), impr: num(r.impr), cost: num(r.cost), conv: num(r.conv), value: num(r.value) }; });
    var camps = (week.campaigns || []).map(function (c) { return { id: String(c.id || ''), name: c.name || '', status: c.status || '', type: c.type || '', bid: c.bid || '',
      clicks: num(c.clicks), impr: num(c.impr), cost: num(c.cost), conv: num(c.conv), value: num(c.value), lostBudget: c.lostBudget == null ? null : num(c.lostBudget) }; });
    var base = camps.length ? camps : terms;
    var T = { cost: r2(sum(base, 'cost')), clicks: sum(base, 'clicks'), conv: r2(sum(base, 'conv')), value: r2(sum(base, 'value')) };
    T.cpa = T.conv > 0 ? r2(T.cost / T.conv) : null; T.cpc = T.clicks > 0 ? r2(T.cost / T.clicks) : null;
    var thr = Math.max(T.cpa != null ? T.cpa : (T.cpc != null ? r2(10 * T.cpc) : 0), cur === 'JPY' ? 100 : 1);

    // group: same campaign + same NFKC form = one term (全角/半角, 半角ｶﾅ, 全角スペース, upper/lower)
    var G = {}, order = [];
    terms.forEach(function (r) {
      var k = (r.campaignId || r.campaign) + '\u0001' + norm(r.term), o = G[k];
      if (!o) { o = G[k] = { key: norm(r.term), campaign: r.campaign, campaignId: r.campaignId, variants: {}, clicks: 0, impr: 0, cost: 0, conv: 0, value: 0, excluded: false, match: r.match }; order.push(k); }
      o.variants[r.term] = (o.variants[r.term] || 0) + r.cost;
      o.clicks += r.clicks; o.impr += r.impr; o.cost += r.cost; o.conv += r.conv; o.value += r.value;
      if (excluded(r.status)) o.excluded = true;
    });
    var groups = order.map(function (k) { var o = G[k]; o.cost = r2(o.cost); o.conv = r2(o.conv);
      o.list = Object.keys(o.variants).sort(function (a, b) { return o.variants[b] - o.variants[a]; }); o.term = o.list[0]; return o; });
    var merged = groups.filter(function (o) { return o.list.length > 1; });

    var F = [], negs = [], seen = {};
    function neg(text, type, o, why) {
      var k = type + '|' + (type === 'exact' ? text : norm(text)) + '|' + (o.campaignId || o.campaign); if (seen[k]) return; seen[k] = 1;   // exact: every written variant (Google matches negatives as written)
      negs.push({ id: '', text: text, type: type, campaign: o.campaign, campaignId: o.campaignId, cost: r2(o.cost), clicks: o.clicks, why: why });
    }
    // T1 — real traffic, no conversion at all → fix tracking first (no negatives are proposed on a blind account)
    if (T.clicks >= 30 && T.conv === 0) F.push({ id: 'T1', sev: 'high', money: T.cost, n: T.clicks, rows: [] });
    // W1 — terms that spent the waste line with 0 conversions → [exact] negatives (every written variant of the term)
    var w1 = groups.filter(function (o) { return !o.excluded && o.conv === 0 && o.cost >= thr; }).sort(function (a, b) { return b.cost - a.cost; });
    if (w1.length && T.conv > 0) {
      w1.forEach(function (o) { o.list.forEach(function (v) { neg(v, 'exact', o, 'W1'); }); });
      F.push({ id: 'W1', sev: sum(w1, 'cost') >= 0.05 * T.cost ? 'high' : 'med', money: r2(sum(w1, 'cost')), n: w1.length,
        rows: w1.slice(0, 100).map(function (o) { return [o.term, o.campaign, o.clicks, o.cost, o.list.length]; }) });
    }
    // W2 — words / word pairs that appear only in non-converting terms (≥2 terms) → "phrase" negatives also stop next week's variants
    if (T.conv > 0) {
      var good = {}, gm = {};
      groups.forEach(function (o) { if (o.conv > 0) grams(o.key).forEach(function (x) { good[x] = 1; }); });
      groups.forEach(function (o) {
        if (o.conv > 0 || o.cost <= 0 || o.excluded) return;
        grams(o.key).forEach(function (x) { if (good[x]) return; var m = gm[x] = gm[x] || { gram: x, cost: 0, clicks: 0, terms: [], campaign: o.campaign, campaignId: o.campaignId, camps: {} };
          m.cost += o.cost; m.clicks += o.clicks; m.terms.push(o.term); m.camps[o.campaignId || o.campaign] = 1; });
      });
      var keep = [];
      Object.keys(gm).map(function (k) { return gm[k]; }).filter(function (m) { return m.terms.length >= 2 && m.cost >= thr * 0.5; })
        .sort(function (a, b) { return b.cost - a.cost; }).forEach(function (m) {
          if (m.gram.indexOf(' ') > -1 && keep.some(function (k) { return k.gram.indexOf(' ') < 0 && (' ' + m.gram + ' ').indexOf(' ' + k.gram + ' ') > -1; })) return;
          keep.push(m);
        });
      keep = keep.slice(0, 25);
      if (keep.length) {
        keep.forEach(function (m) { if (Object.keys(m.camps).length === 1) neg(m.gram, 'phrase', { campaign: m.campaign, campaignId: m.campaignId, cost: m.cost, clicks: m.clicks }, 'W2');
          else neg(m.gram, 'phrase', { campaign: '', campaignId: '', cost: m.cost, clicks: m.clicks }, 'W2'); });
        F.push({ id: 'W2', sev: keep[0].cost >= thr ? 'med' : 'low', money: r2(sum(keep, 'cost')), n: keep.length,
          rows: keep.map(function (m) { return [m.gram, m.terms.length, m.clicks, r2(m.cost)]; }) });
      }
    }
    // C1 — a campaign with ≥20 clicks and 0 conversions while the account converts
    if (T.conv > 0) camps.forEach(function (c) { if (c.conv === 0 && c.clicks >= 20 && !/paused|removed|停止|削除/i.test(c.status)) F.push({ id: 'C1', sev: c.cost >= thr ? 'high' : 'med', money: r2(c.cost), n: c.clicks, rows: [[c.name, c.clicks, c.cost]] }); });
    // C2 — a campaign that converts at or below the account's cost per conversion but loses ≥20% of impressions to budget
    camps.forEach(function (c) { if (c.lostBudget != null && c.lostBudget >= 0.2 && c.conv > 0 && T.cpa != null && c.cost / c.conv <= T.cpa) F.push({ id: 'C2', sev: 'low', money: null, n: Math.round(c.lostBudget * 100), rows: [[c.name, Math.round(c.lostBudget * 100), r2(c.cost / c.conv)]] }); });

    negs.forEach(function (x, i) { x.id = 'n' + (i + 1); });
    var waste = r2(sum(w1, 'cost'));
    return { v: V, at: opt.at || new Date().toISOString(), account: { id: acc.id || '', name: acc.name || '' }, period: week.period || {}, currency: cur,
      totals: T, thr: r2(thr), findings: F, negatives: negs, waste: T.conv > 0 ? waste : 0, wastePct: T.cost > 0 && T.conv > 0 ? r2(100 * waste / T.cost) : 0,
      wasteTerms: T.conv > 0 ? w1.map(function (o) { return o.key; }) : [], merged: merged.map(function (o) { return o.list; }), terms: groups.length, rawTerms: terms.length };
  }

  // ── what Google Ads takes: one per line, [exact] / "phrase"
  function negLine(x) { return x.type === 'exact' ? '[' + x.text + ']' : '"' + x.text + '"'; }
  function negText(list) { return list.map(negLine).join('\n'); }
  function cell(s) { s = String(s == null ? '' : s); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
  function negCsv(list) { var L = ['キャンペーン,除外キーワード,マッチタイプ,費用,クリック数']; list.forEach(function (x) { L.push([x.campaign || '(全キャンペーン)', x.text, x.type === 'exact' ? '完全一致' : 'フレーズ一致', x.cost, x.clicks].map(cell).join(',')); }); return '﻿' + L.join('\r\n') + '\r\n'; }

  // ── week over week: this week's audit vs the saved previous week of the same account (Pro history)
  function compare(cur, prev) {
    if (!cur || !prev) return null;
    var out = { prev: prev.period, cost: [prev.totals.cost, cur.totals.cost], conv: [prev.totals.conv, cur.totals.conv], waste: [prev.waste, cur.waste], alerts: [] };
    var pw = {}, cw = {};
    (prev.wasteTerms || []).forEach(function (t) { pw[t] = 1; }); (cur.wasteTerms || []).forEach(function (t) { cw[t] = 1; });
    out.newWaste = Object.keys(cw).filter(function (t) { return !pw[t]; });
    out.goneWaste = Object.keys(pw).filter(function (t) { return !cw[t]; });
    if (prev.totals.conv > 0 && cur.totals.conv === 0 && cur.totals.clicks >= 30) out.alerts.push({ id: 'drop0', sev: 'high' });
    return out;
  }
  // a money leak worth one mail: new wasted terms this week · conversions fell to 0 · real traffic and no conversion at all
  function leak(a, cmp) {
    var why = [];
    if (cmp && cmp.newWaste.length) why.push({ id: 'newWaste', n: cmp.newWaste.length });
    if (!cmp && a.wasteTerms.length) why.push({ id: 'waste', n: a.wasteTerms.length });
    if (cmp && cmp.alerts.length) why.push({ id: 'drop0' });
    if (a.findings.some(function (f) { return f.id === 'T1'; }) && !(cmp && cmp.alerts.length)) why.push({ id: 'T1' });
    return why;
  }
  function slim(a) {
    return { v: a.v, at: a.at, account: a.account, period: a.period, currency: a.currency, totals: a.totals, thr: a.thr, waste: a.waste, wastePct: a.wastePct,
      wasteTerms: a.wasteTerms, findings: a.findings.map(function (f) { return { id: f.id, sev: f.sev, money: f.money, n: f.n }; }), negs: a.negatives.length };
  }

  var E = { audit: audit, parseCsv: parseCsv, norm: norm, num: num, money: money, negText: negText, negLine: negLine, negCsv: negCsv, compare: compare, leak: leak, slim: slim, grams: grams, V: V };
  g.KKEngine = E;
  if (typeof module !== 'undefined' && module.exports) module.exports = E;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
