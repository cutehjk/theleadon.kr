/* 소식·뉴스레터 게시판: news/posts.json 의 글을 읽어 홈·목록·상세 화면을 그립니다.
   category가 newsletter인 글은 뉴스레터(newsletter.html), 나머지는 소식(news.html)에 표시합니다.
   글이 하나도 없으면 홈의 해당 섹션과 푸터 링크를 숨깁니다. 관리자 글쓰기 화면은 admin.html/admin.js. */
(function () {
  var CATEGORIES = {
    notice: { label: '공지', en: 'NOTICE' },
    press: { label: '보도자료', en: 'PRESS' },
    news: { label: '사업소식', en: 'NEWS' },
    newsletter: { label: '뉴스레터', en: 'NEWSLETTER' }
  };
  var NEWS_CATS = ['notice', 'press', 'news'];
  var PER_PAGE = 9;
  var LETTERS_PER_PAGE = 20;
  var MAX_PINNED = 3;
  var NEW_DAYS = 7;
  // 기사 목록이 있는 뉴스레터 맨 아래에 자동으로 붙는 안내 문구
  var LETTER_NOTE = '※ 이 뉴스레터는 AI가 이번 주 공개된 기사 중 정보통신·국방·보안 분야 대학원생에게 도움이 될 기사를 골라 수집하고, ' +
    '더리드온이 검토해 정리했습니다. 기사 내용과 저작권은 각 언론사에 있으며, 제목을 누르면 원문으로 이동합니다.';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function toDate(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmt(s) { return String(s).replace(/-/g, '.'); }
  function isNew(s) { return (Date.now() - toDate(s).getTime()) / 864e5 <= NEW_DAYS; }
  function isLetter(p) { return p.category === 'newsletter'; }
  function listPage(p) { return isLetter(p) ? 'newsletter.html' : 'news.html'; }
  function url(p) { return (isLetter(p) ? 'newsletter-view.html' : 'news-view.html') + '?id=' + encodeURIComponent(p.id); }
  function catOf(p) { return CATEGORIES[p.category] || CATEGORIES.news; }
  function vol(p) { return isLetter(p) && p.vol ? 'Vol.' + esc(p.vol) : ''; }
  // 첨부파일 링크는 상대 경로나 http(s)만 허용 (javascript: 등 차단)
  function safeHref(h) { h = String(h || ''); return /^\s*[a-z][a-z0-9+.-]*:/i.test(h) && !/^https?:\/\//i.test(h) ? '#' : h; }
  function excerpt(p, n) {
    var t = String(p.body || '').split(/\n\s*\n/)[0].replace(/\s+/g, ' ').trim();
    // 머리말이 없는 뉴스레터는 첫 기사 제목들로 요약
    if (!t && p.sections) {
      t = [].concat.apply([], p.sections.map(function (s) { return (s.items || []).map(function (it) { return it.title; }); }))
        .filter(Boolean).slice(0, 3).join(' · ');
    }
    return t.length > n ? t.slice(0, n) + '…' : t;
  }

  function thumb(p) {
    if (p.cover) return '<img src="' + esc(p.cover) + '" alt="' + esc(p.coverAlt || '') + '" loading="lazy" decoding="async">';
    var c = catOf(p);
    return '<div class="news-ph" role="img" aria-label="' + esc(c.label) + ' 기본 이미지"><img src="mark.png" alt="" width="34" height="26">' +
      '<span class="news-ph-cat">' + c.en + (vol(p) ? ' · ' + vol(p).toUpperCase() : '') + '</span><span class="news-ph-word">THELEAD<b>ON</b></span></div>';
  }
  function card(p) {
    return '<article class="news-card"><a href="' + url(p) + '"><div class="news-thumb">' + thumb(p) + '</div>' +
      '<div class="news-body"><div class="news-meta"><span class="news-cat">' + esc(catOf(p).label) + (vol(p) ? ' ' + vol(p) : '') + '</span>' +
      (isNew(p.date) ? '<span class="news-new">NEW</span>' : '') + '</div>' +
      '<h3>' + esc(p.title) + '</h3><time class="news-date" datetime="' + esc(p.date) + '">' + fmt(p.date) + '</time></div></a></article>';
  }
  function splitPinned(list) {
    var pinned = list.filter(function (p) { return p.pinned; }).slice(0, MAX_PINNED);
    return { pinned: pinned, rest: list.filter(function (p) { return pinned.indexOf(p) < 0; }) };
  }
  function pager(page, pages, link) {
    if (pages < 2) return '';
    var html = '<nav class="pager" aria-label="페이지">' +
      (page > 1 ? '<a href="' + link(page - 1) + '" aria-label="이전 페이지">‹</a>' : '<span aria-hidden="true">‹</span>');
    for (var n = 1; n <= pages; n++) html += '<a href="' + link(n) + '" aria-label="' + n + '페이지"' + (n === page ? ' aria-current="page"' : '') + '>' + n + '</a>';
    return html + (page < pages ? '<a href="' + link(page + 1) + '" aria-label="다음 페이지">›</a>' : '<span aria-hidden="true">›</span>') + '</nav>';
  }
  function qs(base, params) {
    var s = new URLSearchParams();
    Object.keys(params).forEach(function (k) { if (params[k]) s.set(k, params[k]); });
    var str = s.toString();
    return base + (str ? '?' + str : '');
  }
  function adminBar(cat) {
    return isAdmin() ? '<div class="admin-bar"><a class="btn btn-navy" href="admin.html?new=' + cat + '">+ 글쓰기</a>' +
      '<a class="btn btn-line" href="admin.html' + (cat === 'newsletter' ? '?tab=newsletter' : '') + '">글 관리</a></div>' : '';
  }

  function load() {
    return fetch('/news/posts.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (list) {
        return (Array.isArray(list) ? list : [])
          .filter(function (p) { return p && p.id && p.title && p.date && !p.draft; })
          .sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : (a.id < b.id ? 1 : -1); });
      })
      .catch(function () { return []; });
  }

  function showLinks(attr, on) {
    document.querySelectorAll('[' + attr + ']').forEach(function (a) { a.hidden = !on; });
  }

  /* 홈: 소식이 있으면 '주요 사업 영역' 자리에 최근 소식 3건, 뉴스레터가 있으면 최신호 띠 */
  function renderHome(news, letters) {
    var sec = document.getElementById('home-news');
    if (sec && news.length) {
      sec.querySelector('[data-news-grid]').innerHTML = news.slice(0, 3).map(card).join('');
      sec.hidden = false;
      var biz = document.getElementById('home-business');
      if (biz) biz.hidden = true;
    }
    var strip = document.getElementById('home-letter');
    if (strip && letters.length) {
      var p = letters[0];
      strip.querySelector('[data-letter-strip]').innerHTML =
        '<a class="nl-strip" href="' + url(p) + '"><span class="eyebrow">Newsletter</span>' +
        '<span class="nl-strip-body"><b>' + (isNew(p.date) ? '이번 주 뉴스레터' : '최신 뉴스레터') + '</b>' +
        '<span class="nl-strip-title">' + (vol(p) ? vol(p) + ' · ' : '') + esc(p.title) + '</span></span>' +
        '<span class="nl-strip-go" aria-hidden="true">→</span></a>';
      strip.hidden = false;
    }
  }

  /* 소식 목록: news.html?category=&page= */
  function renderList(posts) {
    var root = document.getElementById('news-list');
    if (!root) return;
    var q = new URLSearchParams(location.search);
    var cat = NEWS_CATS.indexOf(q.get('category')) >= 0 ? q.get('category') : '';
    var inCat = posts.filter(function (p) { return !cat || p.category === cat; });
    var parts = splitPinned(inCat);
    var pages = Math.max(1, Math.ceil(parts.rest.length / PER_PAGE));
    var page = Math.min(Math.max(parseInt(q.get('page'), 10) || 1, 1), pages);
    var link = function (c, n) { return qs('news.html', { category: c, page: n > 1 ? n : '' }); };

    var tabs = [['', '전체']].concat(NEWS_CATS.map(function (k) { return [k, CATEGORIES[k].label]; }));
    var html = '<nav class="news-tabs" aria-label="분류">' + tabs.map(function (t) {
      return '<a href="' + link(t[0], 1) + '"' + (t[0] === cat ? ' aria-current="page"' : '') + '>' + t[1] + '</a>';
    }).join('') + '</nav>';

    if (page === 1 && parts.pinned.length) {
      html += '<ul class="pinned" aria-label="고정 공지">' + parts.pinned.map(function (p) {
        return '<li><a href="' + url(p) + '"><span class="pin-badge">고정</span><span class="news-cat">' + esc(catOf(p).label) +
          '</span><span class="pinned-title">' + esc(p.title) + '</span><time class="news-date" datetime="' + esc(p.date) + '">' + fmt(p.date) + '</time></a></li>';
      }).join('') + '</ul>';
    }
    var items = parts.rest.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    if (items.length) html += '<div class="news-grid">' + items.map(card).join('') + '</div>';
    else if (!(page === 1 && parts.pinned.length)) html += '<p class="news-empty">등록된 글이 없습니다.</p>';
    html += pager(page, pages, function (n) { return link(cat, n); });

    root.innerHTML = adminBar(cat || 'notice') + html;
    if (cat) document.title = CATEGORIES[cat].label + ' - 소식 · 더리드온';
  }

  /* 뉴스레터 목록: newsletter.html?year=&page= — 1페이지 맨 위에 최신호를 크게 */
  function renderLetters(letters) {
    var root = document.getElementById('newsletter-list');
    if (!root) return;
    var q = new URLSearchParams(location.search);
    var years = [];
    letters.forEach(function (p) { var y = p.date.slice(0, 4); if (years.indexOf(y) < 0) years.push(y); });
    var year = years.indexOf(q.get('year')) >= 0 ? q.get('year') : '';
    var list = letters.filter(function (p) { return !year || p.date.slice(0, 4) === year; });
    var feature = !year && (parseInt(q.get('page'), 10) || 1) === 1 ? list[0] : null;
    var rest = year ? list : list.slice(1);
    var pages = Math.max(1, Math.ceil(rest.length / LETTERS_PER_PAGE));
    var page = Math.min(Math.max(parseInt(q.get('page'), 10) || 1, 1), pages);
    var link = function (y, n) { return qs('newsletter.html', { year: y, page: n > 1 ? n : '' }); };
    var html = '';

    if (!letters.length) {
      root.innerHTML = adminBar('newsletter') + '<p class="news-empty">아직 발행된 뉴스레터가 없습니다.</p>';
      return;
    }
    if (feature) {
      html += '<article class="nl-feature"><a href="' + url(feature) + '"><div class="news-thumb">' + thumb(feature) + '</div>' +
        '<div class="nl-feature-body"><div class="news-meta"><span class="news-cat">' + (vol(feature) || '뉴스레터') + '</span>' +
        (isNew(feature.date) ? '<span class="news-new">NEW</span>' : '') + '</div>' +
        '<h2>' + esc(feature.title) + '</h2>' + (excerpt(feature, 140) ? '<p>' + esc(excerpt(feature, 140)) + '</p>' : '') +
        '<time class="news-date" datetime="' + esc(feature.date) + '">' + fmt(feature.date) + '</time><span class="more-link">읽어보기 →</span></div></a></article>';
    }
    if (years.length > 1 || year) {
      html += '<nav class="news-tabs" aria-label="연도">' + [['', '전체']].concat(years.map(function (y) { return [y, y + '년']; })).map(function (t) {
        return '<a href="' + link(t[0], 1) + '"' + (t[0] === year ? ' aria-current="page"' : '') + '>' + t[1] + '</a>';
      }).join('') + '</nav>';
    }
    var items = rest.slice((page - 1) * LETTERS_PER_PAGE, page * LETTERS_PER_PAGE);
    if (items.length) {
      html += (feature ? '<h2 class="nl-past">지난 뉴스레터</h2>' : '') + '<ul class="nl-list">' + items.map(function (p) {
        return '<li><a href="' + url(p) + '"><span class="nl-vol">' + (vol(p) || '-') + '</span><span class="nl-title">' + esc(p.title) + '</span>' +
          '<time class="news-date" datetime="' + esc(p.date) + '">' + fmt(p.date) + '</time></a></li>';
      }).join('') + '</ul>';
    }
    html += pager(page, pages, function (n) { return link(year, n); });
    root.innerHTML = adminBar('newsletter') + html;
    if (year) document.title = year + '년 - 뉴스레터 · 더리드온';
  }

  /* 상세: news-view.html?id= / newsletter-view.html?id= */
  function renderView(posts) {
    var root = document.getElementById('news-view');
    if (!root) return;
    var letterPage = !!root.hasAttribute('data-newsletter');
    posts = posts.filter(function (p) { return isLetter(p) === letterPage; });
    var id = new URLSearchParams(location.search).get('id');
    var i = -1;
    posts.forEach(function (p, k) { if (p.id === id) i = k; });
    if (i < 0) {
      root.innerHTML = '<p class="news-empty">글을 찾을 수 없습니다. 삭제되었거나 주소가 잘못되었습니다.</p>' +
        '<div class="article-actions"><a class="btn btn-navy" href="' + (letterPage ? 'newsletter.html' : 'news.html') + '">목록으로</a></div>';
      return;
    }
    var p = posts[i], c = catOf(p);
    var crumb = document.querySelector('[data-news-crumb]');
    if (crumb && !letterPage) crumb.innerHTML = ' / <a href="news.html?category=' + esc(p.category) + '">' + esc(c.label) + '</a>';
    if (crumb && letterPage && p.vol) crumb.textContent = ' / Vol.' + p.vol;
    document.title = (vol(p) ? vol(p) + ' ' : '') + p.title + ' · 더리드온';

    root.innerHTML = article(p, posts[i + 1], posts[i - 1]);
    if (isAdmin()) {
      root.querySelector('.article-actions').insertAdjacentHTML('beforeend',
        '<a class="btn btn-line" href="admin.html?edit=' + encodeURIComponent(p.id) + '">수정</a>');
    }

    var btn = root.querySelector('[data-copy-link]');
    btn.addEventListener('click', function () {
      var label = btn.textContent;
      var done = function (t) { btn.textContent = t; setTimeout(function () { btn.textContent = label; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { done('✓ 복사되었습니다'); }, function () { done('복사에 실패했습니다'); });
      else done('복사에 실패했습니다');
    });
  }

  /* 글 상세 화면 HTML (관리자 미리보기에서도 사용) */
  function paras(text) {
    return String(text || '').split(/\n\s*\n/).map(function (para) {
      return para.trim() ? '<p>' + esc(para.trim()).replace(/\n/g, '<br>') + '</p>' : '';
    }).join('');
  }
  // 뉴스레터 기사 목록: 묶음 제목(+사진) 아래 번호 붙은 기사 제목(링크)과 출처
  function sections(p) {
    return (p.sections || []).map(function (s) {
      var items = (s.items || []).filter(function (it) { return it && it.title; });
      return '<section class="nl-sec">' + (s.title ? '<h2>' + esc(s.title) + '</h2>' : '') +
        (s.image ? '<img class="nl-sec-img" src="' + esc(s.image) + '" alt="' + esc(s.imageAlt || '') + '" loading="lazy">' : '') +
        (items.length ? '<ol class="nl-items">' + items.map(function (it) {
          var t = esc(it.title);
          return '<li>' + (/^https?:\/\//i.test(it.url || '') ? '<a href="' + esc(it.url) + '" target="_blank" rel="noopener">' + t + '</a>' : '<b>' + t + '</b>') +
            (it.source ? '<span class="nl-src">' + esc(it.source) + '</span>' : '') + '</li>';
        }).join('') + '</ol>' : '') + '</section>';
    }).join('');
  }

  function article(p, prev, next) {
    var c = catOf(p);
    var body = paras(p.body);
    var imgs = (p.images || []).map(function (im) {
      return '<figure class="article-figure"><img src="' + esc(im.src) + '" alt="' + esc(im.alt || '') + '" loading="lazy">' +
        (im.alt ? '<figcaption>' + esc(im.alt) + '</figcaption>' : '') + '</figure>';
    }).join('');
    var files = (p.attachments || []).length ? '<div class="files"><h2>첨부파일</h2><ul>' + p.attachments.map(function (f) {
      return '<li><a href="' + esc(safeHref(f.href)) + '" download="' + esc(f.name) + '">📄 ' + esc(f.name) + (f.size ? ' <small>(' + esc(f.size) + ')</small>' : '') + '</a></li>';
    }).join('') + '</ul></div>' : '';
    var pn = function (q, label) {
      return q ? '<a href="' + url(q) + '"><span class="label">' + label + '</span><b>' + (vol(q) ? vol(q) + ' ' : '') + esc(q.title) + '</b><span class="news-date">' + fmt(q.date) + '</span></a>' : '';
    };

    return '<article class="article">' +
      '<div class="article-meta"><span class="news-cat">' + esc(c.label) + (vol(p) ? ' ' + vol(p) : '') + '</span><time class="news-date" datetime="' + esc(p.date) + '">' + fmt(p.date) + '</time></div>' +
      '<h1>' + esc(p.title) + '</h1>' +
      (p.cover ? '<figure class="article-cover"><img src="' + esc(p.cover) + '" alt="' + esc(p.coverAlt || '') + '">' + (p.coverAlt ? '<figcaption>' + esc(p.coverAlt) + '</figcaption>' : '') + '</figure>' : '') +
      (body ? '<div class="prose">' + body + '</div>' : '') + sections(p) +
      (isLetter(p) && (p.sections || []).length ? '<p class="nl-note">' + LETTER_NOTE + '</p>' : '') +
      (imgs || p.outro ? '<div class="prose">' + imgs + paras(p.outro) + '</div>' : '') +
      (/^https?:\/\//i.test(p.link || '') ? '<p class="article-source"><a class="btn btn-line" href="' + esc(p.link) + '" target="_blank" rel="noopener">원문 기사 보기 ↗</a></p>' : '') + files +
      (prev || next ? '<nav class="prevnext" aria-label="이전·다음 글">' + pn(prev, '이전 글') + pn(next, '다음 글') + '</nav>' : '') +
      '<div class="article-actions"><a class="btn btn-navy" href="' + listPage(p) + '">목록</a><button class="btn btn-line" type="button" data-copy-link>🔗 링크 복사</button></div>' +
      '</article>';
  }

  // 관리자 페이지에서 연결한 적이 있는 브라우저에만 글쓰기·수정 버튼 표시
  function isAdmin() {
    try { return !!(localStorage.getItem('tlo-admin-token') || sessionStorage.getItem('tlo-admin-token')); } catch (e) { return false; }
  }

  window.LeadOnNews = { CATEGORIES: CATEGORIES, card: card, article: article, esc: esc };

  load().then(function (posts) {
    var news = posts.filter(function (p) { return !isLetter(p); });
    var letters = posts.filter(isLetter);
    showLinks('data-news-link', news.length > 0);
    showLinks('data-letter-link', letters.length > 0);
    renderHome(news, letters);
    renderList(news);
    renderLetters(letters);
    renderView(posts);
  });
})();
