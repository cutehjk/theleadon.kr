/* 소식 게시판: news/posts.json 의 글을 읽어 메뉴·홈·목록·상세 화면을 그립니다.
   글이 하나도 없으면 홈의 소식 섹션과 푸터 링크를 숨기고 기존 화면을 그대로 둡니다. 관리자 글쓰기 화면은 admin.html/admin.js. */
(function () {
  var CATEGORIES = {
    notice: { label: '공지', en: 'NOTICE' },
    press: { label: '보도자료', en: 'PRESS' },
    news: { label: '사업소식', en: 'NEWS' }
  };
  var PER_PAGE = 9;
  var MAX_PINNED = 3;
  var NEW_DAYS = 7;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function toDate(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmt(s) { return String(s).replace(/-/g, '.'); }
  function isNew(s) { return (Date.now() - toDate(s).getTime()) / 864e5 <= NEW_DAYS; }
  function url(p) { return 'news-view.html?id=' + encodeURIComponent(p.id); }
  function catOf(p) { return CATEGORIES[p.category] || CATEGORIES.news; }
  // 첨부파일 링크는 상대 경로나 http(s)만 허용 (javascript: 등 차단)
  function safeHref(h) { h = String(h || ''); return /^\s*[a-z][a-z0-9+.-]*:/i.test(h) && !/^https?:\/\//i.test(h) ? '#' : h; }

  function thumb(p) {
    if (p.cover) return '<img src="' + esc(p.cover) + '" alt="' + esc(p.coverAlt || '') + '" loading="lazy" decoding="async">';
    var c = catOf(p);
    return '<div class="news-ph" role="img" aria-label="' + esc(c.label) + ' 기본 이미지"><img src="mark.png" alt="" width="34" height="26">' +
      '<span class="news-ph-cat">' + c.en + '</span><span class="news-ph-word">THELEAD<b>ON</b></span></div>';
  }
  function card(p) {
    return '<article class="news-card"><a href="' + url(p) + '"><div class="news-thumb">' + thumb(p) + '</div>' +
      '<div class="news-body"><div class="news-meta"><span class="news-cat">' + esc(catOf(p).label) + '</span>' +
      (isNew(p.date) ? '<span class="news-new">NEW</span>' : '') + '</div>' +
      '<h3>' + esc(p.title) + '</h3><time class="news-date" datetime="' + esc(p.date) + '">' + fmt(p.date) + '</time></div></a></article>';
  }
  function splitPinned(list) {
    var pinned = list.filter(function (p) { return p.pinned; }).slice(0, MAX_PINNED);
    return { pinned: pinned, rest: list.filter(function (p) { return pinned.indexOf(p) < 0; }) };
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

  function showNav(on) {
    document.querySelectorAll('[data-news-link]').forEach(function (a) { a.hidden = !on; });
  }

  /* 홈: 글이 있으면 '주요 사업 영역' 자리에 최근 소식 3건 */
  function renderHome(posts) {
    var sec = document.getElementById('home-news');
    if (!sec || !posts.length) return;
    sec.querySelector('[data-news-grid]').innerHTML = posts.slice(0, 3).map(card).join('');
    sec.hidden = false;
    var biz = document.getElementById('home-business');
    if (biz) biz.hidden = true;
  }

  /* 목록: news.html?category=&page= */
  function renderList(posts) {
    var root = document.getElementById('news-list');
    if (!root) return;
    var q = new URLSearchParams(location.search);
    var cat = CATEGORIES[q.get('category')] ? q.get('category') : '';
    var inCat = posts.filter(function (p) { return !cat || p.category === cat; });
    var parts = splitPinned(inCat);
    var pages = Math.max(1, Math.ceil(parts.rest.length / PER_PAGE));
    var page = Math.min(Math.max(parseInt(q.get('page'), 10) || 1, 1), pages);
    var link = function (c, n) {
      var s = new URLSearchParams();
      if (c) s.set('category', c);
      if (n > 1) s.set('page', n);
      var str = s.toString();
      return 'news.html' + (str ? '?' + str : '');
    };

    var tabs = [['', '전체']].concat(Object.keys(CATEGORIES).map(function (k) { return [k, CATEGORIES[k].label]; }));
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

    if (pages > 1) {
      html += '<nav class="pager" aria-label="페이지">' +
        (page > 1 ? '<a href="' + link(cat, page - 1) + '" aria-label="이전 페이지">‹</a>' : '<span aria-hidden="true">‹</span>');
      for (var n = 1; n <= pages; n++) html += '<a href="' + link(cat, n) + '" aria-label="' + n + '페이지"' + (n === page ? ' aria-current="page"' : '') + '>' + n + '</a>';
      html += (page < pages ? '<a href="' + link(cat, page + 1) + '" aria-label="다음 페이지">›</a>' : '<span aria-hidden="true">›</span>') + '</nav>';
    }
    if (isAdmin()) {
      html = '<div class="admin-bar"><a class="btn btn-navy" href="admin.html?new=' + (cat || 'notice') + '">+ 글쓰기</a>' +
        '<a class="btn btn-line" href="admin.html">글 관리</a></div>' + html;
    }
    root.innerHTML = html;
    if (cat) document.title = CATEGORIES[cat].label + ' - 소식 · 더리드온';
  }

  /* 상세: news-view.html?id= */
  function renderView(posts) {
    var root = document.getElementById('news-view');
    if (!root) return;
    var id = new URLSearchParams(location.search).get('id');
    var i = -1;
    posts.forEach(function (p, k) { if (p.id === id) i = k; });
    if (i < 0) {
      root.innerHTML = '<p class="news-empty">글을 찾을 수 없습니다. 삭제되었거나 주소가 잘못되었습니다.</p>' +
        '<div class="article-actions"><a class="btn btn-navy" href="news.html">목록으로</a></div>';
      return;
    }
    var p = posts[i], c = catOf(p);
    var crumb = document.querySelector('[data-news-crumb]');
    if (crumb) crumb.innerHTML = ' / <a href="news.html?category=' + esc(p.category) + '">' + esc(c.label) + '</a>';
    document.title = p.title + ' · 더리드온';

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
  function article(p, prev, next) {
    var c = catOf(p);
    var body = String(p.body || '').split(/\n\s*\n/).map(function (para) {
      return para.trim() ? '<p>' + esc(para.trim()).replace(/\n/g, '<br>') + '</p>' : '';
    }).join('');
    var imgs = (p.images || []).map(function (im) {
      return '<figure class="article-figure"><img src="' + esc(im.src) + '" alt="' + esc(im.alt || '') + '" loading="lazy">' +
        (im.alt ? '<figcaption>' + esc(im.alt) + '</figcaption>' : '') + '</figure>';
    }).join('');
    var files = (p.attachments || []).length ? '<div class="files"><h2>첨부파일</h2><ul>' + p.attachments.map(function (f) {
      return '<li><a href="' + esc(safeHref(f.href)) + '" download="' + esc(f.name) + '">📄 ' + esc(f.name) + (f.size ? ' <small>(' + esc(f.size) + ')</small>' : '') + '</a></li>';
    }).join('') + '</ul></div>' : '';
    var pn = function (q, label) {
      return q ? '<a href="' + url(q) + '"><span class="label">' + label + '</span><b>' + esc(q.title) + '</b><span class="news-date">' + fmt(q.date) + '</span></a>' : '';
    };

    return '<article class="article">' +
      '<div class="article-meta"><span class="news-cat">' + esc(c.label) + '</span><time class="news-date" datetime="' + esc(p.date) + '">' + fmt(p.date) + '</time></div>' +
      '<h1>' + esc(p.title) + '</h1>' +
      (p.cover ? '<figure class="article-cover"><img src="' + esc(p.cover) + '" alt="' + esc(p.coverAlt || '') + '">' + (p.coverAlt ? '<figcaption>' + esc(p.coverAlt) + '</figcaption>' : '') + '</figure>' : '') +
      '<div class="prose">' + body + imgs + '</div>' + files +
      (prev || next ? '<nav class="prevnext" aria-label="이전·다음 글">' + pn(prev, '이전 글') + pn(next, '다음 글') + '</nav>' : '') +
      '<div class="article-actions"><a class="btn btn-navy" href="news.html">목록</a><button class="btn btn-line" type="button" data-copy-link>🔗 링크 복사</button></div>' +
      '</article>';
  }

  // 관리자 페이지에서 연결한 적이 있는 브라우저에만 글쓰기·수정 버튼 표시
  function isAdmin() {
    try { return !!(localStorage.getItem('tlo-admin-token') || sessionStorage.getItem('tlo-admin-token')); } catch (e) { return false; }
  }

  window.LeadOnNews = { CATEGORIES: CATEGORIES, card: card, article: article, esc: esc };

  load().then(function (posts) {
    showNav(posts.length > 0);
    renderHome(posts);
    renderList(posts);
    renderView(posts);
  });
})();
