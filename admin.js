/* 소식 관리: GitHub API로 news/posts.json 과 사진·첨부파일을 저장합니다.
   한 번 저장할 때 바뀐 파일을 커밋 하나로 묶어 올리고, GitHub Pages가 1~2분 뒤 홈페이지에 반영합니다. */
(function () {
  var REPO = 'cutehjk/theleadon.kr';
  var BRANCH = new URLSearchParams(location.search).get('branch') || 'main';
  var POSTS = 'news/posts.json';
  var KEY = 'tlo-admin-token';
  var MAX_FILE = 20 * 1024 * 1024;
  var MAX_IMG_W = 1600;
  var MAX_PINNED = 3;
  var N = window.LeadOnNews, CATS = N.CATEGORIES, esc = N.esc;

  var $ = function (id) { return document.getElementById(id); };
  var token = '', posts = [], tab = '', ed = null, dirty = false, broken = null;

  /* ---------- 공통 ---------- */
  function msg(text, kind) {
    var m = $('msg');
    m.hidden = !text; m.textContent = text || ''; m.className = 'adm-msg' + (kind ? ' ' + kind : '');
    if (text) m.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function show(id) { ['login', 'board', 'editor'].forEach(function (k) { $(k).hidden = k !== id; }); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function rand() { return Math.random().toString(36).slice(2, 7); }
  function sizeLabel(file) {
    var ext = (file.name.split('.').pop() || '').toUpperCase();
    var kb = file.size / 1024;
    return (ext ? ext + ' · ' : '') + (kb < 1024 ? Math.max(1, Math.round(kb)) + 'KB' : (kb / 1024).toFixed(1) + 'MB');
  }
  function store(t, remember) {
    try { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); if (t) (remember ? localStorage : sessionStorage).setItem(KEY, t); } catch (e) {}
  }
  function stored() { try { return localStorage.getItem(KEY) || sessionStorage.getItem(KEY) || ''; } catch (e) { return ''; } }

  /* ---------- GitHub API ---------- */
  function api(path, opt) {
    opt = opt || {};
    return fetch('https://api.github.com/repos/' + REPO + path, {
      method: opt.method || 'GET',
      cache: 'no-store',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': opt.raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: opt.body ? JSON.stringify(opt.body) : undefined
    }).then(function (r) {
      if (r.ok) return opt.raw ? r.text() : r.json();
      var err = new Error('GitHub ' + r.status); err.status = r.status;
      throw err;
    });
  }
  function explain(e) {
    if (e.status === 401) return '접근 키가 올바르지 않거나 만료되었습니다. [연결 해제] 후 새 키로 다시 연결해 주세요.';
    if (e.status === 403) return '접근 키에 쓰기 권한이 없습니다. 키 설정에서 Contents를 "Read and write"로 바꿔 주세요.';
    if (e.status === 404) return '저장소를 찾을 수 없습니다. 키를 만들 때 cutehjk/theleadon.kr 저장소를 선택했는지 확인해 주세요.';
    if (e.status === 422 || e.status === 409) return '다른 곳에서 동시에 수정되어 저장하지 못했습니다. 다시 시도해 주세요.';
    return '저장 중 문제가 생겼습니다. 인터넷 연결을 확인하고 다시 시도해 주세요. (' + e.message + ')';
  }
  function sortPosts(list) {
    return list.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : (a.id < b.id ? 1 : -1); });
  }
  function readPosts(ref) {
    return api('/contents/' + POSTS + '?ref=' + encodeURIComponent(ref), { raw: true })
      .then(function (t) {
        // 직접 고치다 형식이 깨진 파일은 빈 목록으로 보고 다음 저장 때 올바른 형식으로 다시 씀
        try { var l = JSON.parse(t); return Array.isArray(l) ? l : []; } catch (e) { broken = t; return []; }
      })
      .catch(function (e) { if (e.status === 404) return []; throw e; });
  }

  /* 최신 상태에서 mutate(list)를 적용하고, 업로드 파일·삭제 파일과 함께 커밋 하나로 저장 */
  function commit(message, mutate, uploads, removes, retry) {
    var head, list;
    return api('/git/ref/heads/' + BRANCH).then(function (ref) {
      head = ref.object.sha;
      return Promise.all([api('/git/commits/' + head), readPosts(head)]);
    }).then(function (r) {
      list = sortPosts(mutate(r[1]));
      return Promise.all(uploads.map(function (u) {
        return api('/git/blobs', { method: 'POST', body: { content: u.b64, encoding: 'base64' } })
          .then(function (b) { return { path: u.path, mode: '100644', type: 'blob', sha: b.sha }; });
      })).then(function (entries) {
        entries.push({ path: POSTS, mode: '100644', type: 'blob', content: JSON.stringify(list, null, 2) + '\n' });
        removes.forEach(function (p) { entries.push({ path: p, mode: '100644', type: 'blob', sha: null }); });
        return api('/git/trees', { method: 'POST', body: { base_tree: r[0].tree.sha, tree: entries } });
      });
    }).then(function (tree) {
      return api('/git/commits', { method: 'POST', body: { message: message, tree: tree.sha, parents: [head] } });
    }).then(function (c) {
      return api('/git/refs/heads/' + BRANCH, { method: 'PATCH', body: { sha: c.sha } });
    }).then(function () { posts = list; return list; })
      .catch(function (e) {
        if (!retry && (e.status === 422 || e.status === 409)) return commit(message, mutate, uploads, removes, true);
        throw e;
      });
  }

  /* 저장 후 실제 홈페이지에 반영됐는지 확인 */
  function watchLive(check) {
    var tries = 0;
    var tick = function () {
      fetch('/news/posts.json?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (l) {
        if (check(l)) msg('✓ 홈페이지에 반영되었습니다.', 'ok');
        else if (++tries < 30) setTimeout(tick, 10000);
      }).catch(function () { if (++tries < 30) setTimeout(tick, 10000); });
    };
    setTimeout(tick, 15000);
  }

  /* ---------- 파일 ---------- */
  function readB64(blob) {
    return new Promise(function (ok, fail) {
      var fr = new FileReader();
      fr.onload = function () { ok(String(fr.result).split(',')[1]); };
      fr.onerror = fail;
      fr.readAsDataURL(blob);
    });
  }
  // 사진은 가로 1600px 이하 JPEG로 줄여서 올림 (휴대폰 원본 사진도 가볍게)
  function shrink(file) {
    return new Promise(function (ok) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight, s = Math.min(1, MAX_IMG_W / w);
        var cv = document.createElement('canvas');
        cv.width = Math.round(w * s); cv.height = Math.round(h * s);
        var cx = cv.getContext('2d');
        cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height);
        cx.drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        cv.toBlob(function (b) { ok(b || file); }, 'image/jpeg', 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); ok(null); };
      img.src = url;
    });
  }

  /* ---------- 목록 ---------- */
  function renderBoard() {
    $('tabs').innerHTML = [['', '전체']].concat(Object.keys(CATS).map(function (k) { return [k, CATS[k].label]; })).map(function (t) {
      var n = posts.filter(function (p) { return !t[0] || p.category === t[0]; }).length;
      return '<a href="#" data-tab="' + t[0] + '"' + (t[0] === tab ? ' aria-current="page"' : '') + '>' + t[1] + ' ' + n + '</a>';
    }).join('');
    var list = posts.filter(function (p) { return !tab || p.category === tab; });
    $('list').innerHTML = list.map(function (p) {
      var c = CATS[p.category] || CATS.news;
      return '<li><span class="news-cat c">' + esc(c.label) + '</span>' +
        '<span style="min-width:0;display:flex;align-items:center"><a class="t" href="news-view.html?id=' + encodeURIComponent(p.id) + '" target="_blank" rel="noopener">' + esc(p.title) + '</a>' +
        (p.pinned ? '<span class="tag">고정</span>' : '') + (p.draft ? '<span class="tag">임시저장</span>' : '') + '</span>' +
        '<span class="news-date">' + esc(String(p.date).replace(/-/g, '.')) + '</span>' +
        '<span class="acts"><button type="button" data-edit="' + esc(p.id) + '">수정</button><button type="button" class="del" data-del="' + esc(p.id) + '">삭제</button></span></li>';
    }).join('');
    $('list-empty').hidden = list.length > 0;
    $('btn-new').textContent = '+ ' + (tab ? CATS[tab].label + ' ' : '') + '글쓰기';
    show('board');
  }

  function connect(t, remember) {
    token = t;
    msg('불러오는 중…');
    return readPosts(BRANCH).then(function (list) {
      // 쓰기 권한 확인
      return api('').then(function (repo) {
        if (repo.permissions && !repo.permissions.push) { var e = new Error('no push'); e.status = 403; throw e; }
        if (remember !== undefined) store(t, remember);
        posts = sortPosts(list);
        msg(broken === null ? '' : '글 목록 파일(posts.json)의 형식이 깨져 있어 글을 읽지 못했습니다. 새 글을 저장하면 올바른 형식으로 다시 만들어집니다.', 'err');
        return true;
      });
    }).catch(function (e) {
      token = '';
      if (e.status === 401) store('');
      show('login');
      msg(explain(e), 'err');
      return false;
    });
  }

  /* ---------- 글쓰기 ---------- */
  function openEditor(p, cat) {
    ed = {
      id: p ? p.id : null,
      cover: p && p.cover ? { path: p.cover, alt: p.coverAlt || '' } : null,
      images: ((p && p.images) || []).map(function (im) { return { path: im.src, alt: im.alt || '' }; }),
      files: ((p && p.attachments) || []).map(function (f) { return { path: f.href, name: f.name, size: f.size || '' }; }),
      removed: []
    };
    $('ed-title').textContent = p ? '글 수정' : '새 글 쓰기';
    $('btn-save').textContent = p ? '수정 완료' : '등록';
    var c = p ? p.category : (cat || tab || 'notice');
    $('ed-cat').innerHTML = Object.keys(CATS).map(function (k) {
      return '<label><input type="radio" name="cat" value="' + k + '"' + (k === c ? ' checked' : '') + '> ' + CATS[k].label + '</label>';
    }).join('');
    $('ed-subject').value = p ? p.title : '';
    $('ed-date').value = p ? p.date : today();
    $('ed-pinned').checked = !!(p && p.pinned);
    $('ed-draft').checked = !!(p && p.draft);
    $('ed-body').value = p ? p.body || '' : '';
    $('ed-link').value = p ? p.link || '' : '';
    $('preview').hidden = true;
    renderFiles();
    dirty = false;
    show('editor');
    msg('');
    window.scrollTo(0, $('editor').getBoundingClientRect().top + scrollY - 90);
    $('ed-subject').focus({ preventScroll: true });
  }
  function src(item) { return item.blob ? item.url : item.path; }
  function renderFiles() {
    var row = function (item, kind, i) {
      return '<li><img src="' + esc(src(item)) + '" alt="">' +
        '<input type="text" placeholder="사진 설명 (예: 2026년 10월 교육 현장)" value="' + esc(item.alt) + '" data-alt="' + kind + ':' + i + '" aria-label="사진 설명">' +
        '<button type="button" data-rm="' + kind + ':' + i + '">삭제</button></li>';
    };
    $('ed-cover').innerHTML = ed.cover ? row(ed.cover, 'cover', 0) : '';
    $('pick-cover').firstChild.textContent = ed.cover ? '📷 사진 바꾸기' : '📷 사진 선택';
    $('ed-images').innerHTML = ed.images.map(function (im, i) { return row(im, 'images', i); }).join('');
    $('ed-files').innerHTML = ed.files.map(function (f, i) {
      return '<li class="nothumb"><span class="nm">📄 ' + esc(f.name) + ' <small>(' + esc(f.size) + ')</small></span><button type="button" data-rm="files:' + i + '">삭제</button></li>';
    }).join('');
  }
  function drop(item) {
    if (item.blob) URL.revokeObjectURL(item.url);
    else if (/^news\//.test(item.path || '')) ed.removed.push(item.path);
  }
  function addImages(files, multi) {
    return Promise.all([].slice.call(files).map(function (f) {
      return shrink(f).then(function (b) {
        if (!b) { msg('"' + f.name + '"은(는) 열 수 없는 사진 형식입니다. JPG·PNG로 바꿔 주세요.', 'err'); return null; }
        return { blob: b, url: URL.createObjectURL(b), alt: '' };
      });
    })).then(function (items) {
      items = items.filter(Boolean);
      if (!items.length) return;
      if (multi) ed.images = ed.images.concat(items);
      else { if (ed.cover) drop(ed.cover); ed.cover = items[0]; }
      dirty = true; renderFiles();
    });
  }

  function formPost() {
    return {
      id: ed.id || '',
      title: $('ed-subject').value.trim(),
      category: (document.querySelector('input[name=cat]:checked') || {}).value || 'notice',
      date: $('ed-date').value,
      pinned: $('ed-pinned').checked,
      draft: $('ed-draft').checked,
      body: $('ed-body').value.replace(/\r\n/g, '\n').trim(),
      link: $('ed-link').value.trim()
    };
  }
  function validate(p) {
    if (!p.title) return ['ed-subject', '제목을 입력해 주세요.'];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date)) return ['ed-date', '날짜를 입력해 주세요.'];
    if (p.link && !/^https?:\/\//i.test(p.link)) return ['ed-link', '원문 링크는 http:// 또는 https://로 시작해야 합니다.'];
    if (ed.cover && !ed.cover.alt.trim()) return [null, '대표 사진의 설명을 적어 주세요. (시각장애인 안내와 검색에 쓰입니다)'];
    if (p.pinned && posts.filter(function (q) { return q.pinned && q.id !== p.id; }).length >= MAX_PINNED) {
      return ['ed-pinned', '고정 글은 최대 ' + MAX_PINNED + '개입니다. 다른 글의 고정을 먼저 풀어 주세요.'];
    }
    return null;
  }

  function preview() {
    var p = formPost();
    var view = { id: p.id || 'preview', title: p.title || '(제목 없음)', category: p.category, date: p.date || today(), body: p.body, link: p.link };
    if (ed.cover) { view.cover = src(ed.cover); view.coverAlt = ed.cover.alt; }
    view.images = ed.images.map(function (im) { return { src: src(im), alt: im.alt }; });
    view.attachments = ed.files.map(function (f) { return { name: f.name, href: '#', size: f.size }; });
    var box = $('preview');
    box.innerHTML = '<div class="lbl">PREVIEW · 목록 카드</div>' + N.card(view) + '<div class="lbl">PREVIEW · 글 화면</div>' + N.article(view);
    box.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });
    var acts = box.querySelector('.article-actions'); if (acts) acts.remove();
    box.hidden = false;
    box.scrollIntoView({ behavior: 'smooth' });
  }

  function save(e) {
    e.preventDefault();
    var p = formPost(), bad = validate(p);
    if (bad) { msg(bad[1], 'err'); if (bad[0]) $(bad[0]).focus(); return; }
    var stamp = p.date.replace(/-/g, '');
    var uploads = [];
    var place = function (blob, path) { uploads.push({ blob: blob, path: path }); return path; };

    if (ed.cover) {
      p.cover = ed.cover.blob ? place(ed.cover.blob, 'news/images/' + stamp + '-' + rand() + '.jpg') : ed.cover.path;
      p.coverAlt = ed.cover.alt.trim();
    }
    if (ed.images.length) p.images = ed.images.map(function (im) {
      return { src: im.blob ? place(im.blob, 'news/images/' + stamp + '-' + rand() + '.jpg') : im.path, alt: im.alt.trim() };
    });
    if (ed.files.length) p.attachments = ed.files.map(function (f) {
      var ext = (f.name.match(/\.[a-z0-9]{1,8}$/i) || [''])[0].toLowerCase();
      return { name: f.name, href: f.blob ? place(f.blob, 'news/files/' + stamp + '-' + rand() + ext) : f.path, size: f.size };
    });
    if (!p.pinned) delete p.pinned;
    if (!p.draft) delete p.draft;
    if (!p.body) delete p.body;
    if (!p.link) delete p.link;

    var btn = $('btn-save'), label = btn.textContent;
    btn.disabled = true; btn.textContent = '저장 중…';
    msg(uploads.length ? '사진·파일을 올리는 중입니다… (' + uploads.length + '개)' : '저장 중…');

    Promise.all(uploads.map(function (u) { return readB64(u.blob).then(function (b) { u.b64 = b; return u; }); }))
      .then(function (ups) {
        return commit((ed.id ? '소식 수정: ' : '소식 등록: ') + p.title, function (list) {
          if (!p.id) {
            var n = 1;
            while (list.some(function (q) { return q.id === stamp + '-' + n; })) n++;
            p.id = stamp + '-' + n;
            return list.concat([p]);
          }
          var found = false;
          list = list.map(function (q) { if (q.id === p.id) { found = true; return p; } return q; });
          return found ? list : list.concat([p]);
        }, ups, ed.removed);
      })
      .then(function () {
        dirty = false;
        var saved = JSON.stringify(p);
        msg((p.draft ? '임시저장했습니다.' : '저장했습니다. 1~2분 뒤 홈페이지에 나타납니다.') + ' (반영 확인 중…)', 'ok');
        watchLive(function (l) { return l.some(function (q) { return JSON.stringify(q) === saved; }); });
        tab = p.category;
        renderBoard();
      })
      .catch(function (err) { msg(explain(err), 'err'); })
      .then(function () { btn.disabled = false; btn.textContent = label; });
  }

  function remove(id) {
    var p = posts.filter(function (q) { return q.id === id; })[0];
    if (!p || !confirm('"' + p.title + '" 글을 삭제할까요?\n삭제하면 되돌릴 수 없습니다.')) return;
    var files = [p.cover].concat((p.images || []).map(function (i) { return i.src; }), (p.attachments || []).map(function (f) { return f.href; }))
      .filter(function (f) { return /^news\//.test(f || ''); });
    msg('삭제 중…');
    commit('소식 삭제: ' + p.title, function (list) { return list.filter(function (q) { return q.id !== id; }); }, [], files)
      .then(function () {
        msg('삭제했습니다. 1~2분 뒤 홈페이지에서도 사라집니다.', 'ok');
        watchLive(function (l) { return !l.some(function (q) { return q.id === id; }); });
        renderBoard();
      })
      .catch(function (err) { msg(explain(err), 'err'); });
  }

  /* ---------- 이벤트 ---------- */
  $('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var t = $('token').value.trim();
    if (!t) return;
    connect(t, $('remember').checked).then(function (ok) { if (ok) { $('token').value = ''; renderBoard(); } });
  });
  $('btn-logout').addEventListener('click', function () {
    if (!confirm('이 컴퓨터에서 연결을 해제할까요? 다시 쓰려면 접근 키를 붙여 넣어야 합니다.')) return;
    store(''); token = ''; posts = []; msg(''); show('login');
  });
  $('tabs').addEventListener('click', function (e) {
    var a = e.target.closest('[data-tab]'); if (!a) return;
    e.preventDefault(); tab = a.getAttribute('data-tab'); renderBoard();
  });
  $('btn-new').addEventListener('click', function () { openEditor(null); });
  $('list').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var id = b.getAttribute('data-edit') || b.getAttribute('data-del');
    if (b.hasAttribute('data-edit')) openEditor(posts.filter(function (q) { return q.id === id; })[0]);
    else remove(id);
  });
  $('btn-cancel').addEventListener('click', function () {
    if (dirty && !confirm('작성 중인 내용이 사라집니다. 취소할까요?')) return;
    dirty = false; msg(''); renderBoard();
  });
  $('btn-preview').addEventListener('click', preview);
  $('editor').addEventListener('submit', save);
  $('editor').addEventListener('input', function (e) {
    dirty = true;
    var k = e.target.getAttribute('data-alt');
    if (k) { var s = k.split(':'); (s[0] === 'cover' ? ed.cover : ed[s[0]][+s[1]]).alt = e.target.value; }
  });
  $('editor').addEventListener('click', function (e) {
    var b = e.target.closest('[data-rm]'); if (!b) return;
    var s = b.getAttribute('data-rm').split(':');
    if (s[0] === 'cover') { drop(ed.cover); ed.cover = null; }
    else drop(ed[s[0]].splice(+s[1], 1)[0]);
    dirty = true; renderFiles();
  });
  $('in-cover').addEventListener('change', function () { addImages(this.files, false); this.value = ''; });
  $('in-images').addEventListener('change', function () { addImages(this.files, true); this.value = ''; });
  $('in-files').addEventListener('change', function () {
    [].slice.call(this.files).forEach(function (f) {
      if (f.size > MAX_FILE) { msg('"' + f.name + '"은(는) 20MB를 넘어서 올릴 수 없습니다.', 'err'); return; }
      ed.files.push({ blob: f, name: f.name, size: sizeLabel(f) });
    });
    this.value = ''; dirty = true; renderFiles();
  });
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- 시작 ---------- */
  var q = new URLSearchParams(location.search);
  msg('');
  var t = stored();
  if (!t) { show('login'); return; }
  connect(t).then(function (ok) {
    if (!ok) return;
    var editId = q.get('edit'), newCat = q.get('new');
    var p = editId && posts.filter(function (x) { return x.id === editId; })[0];
    if (p) openEditor(p);
    else if (newCat !== null) openEditor(null, CATS[newCat] ? newCat : '');
    else renderBoard();
  });
})();
