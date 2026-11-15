// kk_sample.js — サンプル（架空の記入例）: a made-up running-shoe web shop, one week of search terms. Not a real account.
// Campaign totals are computed from these rows so every number on the screen adds up.
(function (g) {
  'use strict';
  var C1 = { id: '20000000001', name: '検索｜ランニングシューズ' }, C2 = { id: '20000000002', name: '検索｜ブランド名' };
  // term, campaign, clicks, impr, cost(¥), conv, value(¥)
  var R = [
    ['ランニングシューズ メンズ', C1, 96, 1840, 9120, 4, 47600],
    ['ランニングシューズ 初心者', C1, 71, 1310, 6390, 3, 34500],
    ['ランニングシューズ レディース', C1, 54, 1020, 5130, 2, 23800],
    ['マラソン シューズ', C1, 38, 760, 3610, 1, 12900],
    ['シューズ 安い', C1, 33, 905, 3135, 0, 0],
    ['ｼｭｰｽﾞ 安い', C1, 19, 412, 1805, 0, 0],
    ['ランニングシューズ 中古', C1, 41, 980, 4100, 0, 0],
    ['シューズ 中古 メルカリ', C1, 22, 610, 2090, 0, 0],
    ['ランニングシューズ 洗い方', C1, 29, 1150, 2610, 0, 0],
    ['ランニングシューズ 洗い方 洗濯機', C1, 14, 520, 1260, 0, 0],
    ['ランニングシューズ 無料', C1, 9, 300, 810, 0, 0],
    ['ＲＵＮ　シューズ　セール', C1, 8, 260, 760, 0, 0],
    ['run シューズ セール', C1, 6, 190, 570, 0, 0],
    ['ランニング 靴 幅広', C1, 18, 400, 1710, 1, 11800],
    ['readyrun 公式', C2, 64, 520, 2560, 2, 25600],
    ['readyrun シューズ', C2, 31, 300, 1240, 1, 12400],
    ['readyrun 店舗', C2, 12, 140, 480, 0, 0]
  ];
  function week() {
    var terms = R.map(function (r) { return { term: r[0], match: 'BROAD', status: 'NONE', campaign: r[1].name, campaignId: r[1].id, adGroup: '基本', adGroupId: '1',
      clicks: r[2], impr: r[3], cost: r[4], conv: r[5], value: r[6] }; });
    var camps = [C1, C2].map(function (c) {
      var t = terms.filter(function (x) { return x.campaignId === c.id; });
      var s = function (k) { return t.reduce(function (a, x) { return a + x[k]; }, 0); };
      return { id: c.id, name: c.name, status: 'ENABLED', type: 'SEARCH', bid: 'MAXIMIZE_CONVERSIONS', clicks: s('clicks'), impr: s('impr'), cost: s('cost'), conv: s('conv'), value: s('value'),
        lostBudget: c === C2 ? 0.27 : 0.04 };
    });
    return { account: { id: '123-456-7890', name: 'サンプル：ランニングシューズ通販（架空）', currency: 'JPY' }, period: { from: '2026-11-08', to: '2026-11-14' }, terms: terms, campaigns: camps };
  }
  g.KKSample = { week: week };
  if (typeof module !== 'undefined' && module.exports) module.exports = g.KKSample;
})(typeof globalThis !== 'undefined' ? globalThis : this);
