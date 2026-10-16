/* 공유용 글 페이지(p/<글 번호>.html) 생성기
   카카오톡·페이스북 등은 페이지를 열 때 자바스크립트를 실행하지 않으므로, 글마다 제목·요약·대표 사진을
   미리 넣어 둔 HTML을 따로 만들어 둡니다. 화면은 news-view.html / newsletter-view.html 과 같습니다.
   관리자 페이지(admin.js)가 저장할 때마다 다시 만들고, 처음 한 번은 node 로도 만들 수 있습니다. */
(function (root) {
  var SITE = 'https://theleadon.kr';
  var DIR = 'p';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function isLetter(p) { return p.category === 'newsletter'; }
  function path(p) { return DIR + '/' + p.id + '.html'; }
  function abs(src) { return /^https?:\/\//i.test(src) ? src : SITE + '/' + String(src).replace(/^\/+/, ''); }

  function title(p) { return (isLetter(p) && p.vol ? 'Vol.' + p.vol + ' ' : '') + p.title; }
  function summary(p) {
    var t = String(p.body || '').split(/\n\s*\n/)[0].replace(/\s+/g, ' ').trim();
    if (!t && p.sections) {
      t = [].concat.apply([], p.sections.map(function (s) { return (s.items || []).map(function (it) { return it.title; }); }))
        .filter(Boolean).slice(0, 3).join(' · ');
    }
    if (!t) t = isLetter(p) ? '더리드온 뉴스레터' : '더리드온 소식';
    return t.length > 120 ? t.slice(0, 120) + '…' : t;
  }
  // 대표 사진: 대표 이미지 → 첫 묶음 사진 → 첫 추가 사진 → 홈페이지 기본 사진
  function image(p) {
    var sec = (p.sections || []).filter(function (s) { return s.image; })[0];
    var img = (p.images || [])[0];
    return p.cover || (sec && sec.image) || (img && img.src) || '';
  }

  function meta(tpl, attr, name, value) {
    var re = new RegExp('(<meta ' + attr + '="' + name.replace(/[.:]/g, '\\$&') + '" content=")[^"]*(")');
    return tpl.replace(re, function (m, a, b) { return a + esc(value) + b; });
  }

  function build(tpl, p) {
    var url = SITE + '/' + path(p), img = image(p), t = title(p), d = summary(p);
    var s = tpl.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="/">');
    s = s.replace(/<title>[^<]*<\/title>/, '<title>' + esc(t) + ' · 더리드온</title>');
    s = meta(s, 'name', 'description', d);
    s = meta(s, 'property', 'og:type', 'article');
    s = meta(s, 'property', 'og:title', t);
    s = meta(s, 'property', 'og:description', d);
    if (img) {
      s = meta(s, 'property', 'og:image', abs(img));
      s = s.replace(/<meta property="og:image:(width|height)" content="[^"]*">\n?/g, '');
    }
    s = s.replace(/(<meta property="og:locale" content="[^"]*">)/,
      '$1\n<meta property="og:url" content="' + esc(url) + '">\n<link rel="canonical" href="' + esc(url) + '">');
    s = s.replace('<div id="news-view"', '<div id="news-view" data-id="' + esc(p.id) + '"');
    return s;
  }

  /* 공개된 글 전체의 공유 페이지 { 경로: HTML } — 임시저장 글은 만들지 않음 */
  function pages(list, tpl) {
    var out = {};
    list.forEach(function (p) {
      if (p.draft || !p.id || !/^[\w-]+$/.test(p.id)) return;
      out[path(p)] = build(isLetter(p) ? tpl.newsletter : tpl.news, p);
    });
    return out;
  }

  var api = { DIR: DIR, path: path, build: build, pages: pages };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LeadOnShare = api;
})(this);
