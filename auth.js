// ============================================
// GitHub OAuth + Gist 同步模块
// ============================================

var SSYHSAuth = (function() {
  'use strict';

  var CLIENT_ID = 'Ov23liRMJTaardq7LSoz';
  var GIST_DESC = 'SSYHS背题吧-数据同步';
  var STORAGE_PREFIX = 'study-platform-';
  var GIST_ID_KEY = STORAGE_PREFIX + 'gist-id';
  var AUTH_KEY = STORAGE_PREFIX + 'auth';
  var SYNC_DEBOUNCE = 3000;
  var syncTimer = null;

  var SYNC_KEYS = [
    'study-platform-state',
    'study-platform-edits',
    'study-platform-notes',
    'study-platform-recycle',
    'study-platform-settings',
    'study-platform-imported',
    'study-platform-subjects'
  ];

  // ============================================
  // Auth helpers
  // ============================================
  function getToken() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)) || null; } catch(e) { return null; }
  }

  function isLoggedIn() {
    var auth = getToken();
    return !!(auth && auth.access_token && auth.user);
  }

  function getUser() {
    var auth = getToken();
    return auth && auth.user ? auth.user : null;
  }

  function getUserHeaders() {
    var auth = getToken();
    return {
      'Authorization': 'Bearer ' + (auth ? auth.access_token : ''),
      'Accept': 'application/vnd.github+json'
    };
  }

  // ============================================
  // UI
  // ============================================
  function injectUI() {
    injectStyles();
    injectHelpButton();
    injectLoginButton();
    injectInfoModal();
    injectLoginModal();
    injectHelpModal();
    updateLoginButton();
    document.addEventListener('click', function() {
      var menu = document.getElementById('authUserMenu');
      if (menu) menu.classList.remove('show');
    });
  }

  function injectStyles() {
    var style = document.createElement('style');
    style.textContent =
      '.auth-login-btn{background:none;border:1px solid var(--border);border-radius:8px;padding:6px 12px;cursor:pointer;font-size:13px;color:var(--text);display:flex;align-items:center;gap:6px;transition:all 0.2s;white-space:nowrap}' +
      '.auth-login-btn:hover{background:var(--surface);border-color:var(--primary)}' +
      '.auth-user-btn{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:4px 10px;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all 0.2s}' +
      '.auth-user-btn:hover{border-color:var(--primary)}' +
      '.auth-user-btn img{width:22px;height:22px;border-radius:50%}' +
      '.auth-user-btn span{font-size:13px;color:var(--text);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.auth-user-menu{position:absolute;top:100%;right:0;margin-top:4px;background:var(--bg);border:1px solid var(--border);border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.12);z-index:1000;min-width:150px;display:none;overflow:hidden}' +
      '.auth-user-menu.show{display:block}' +
      '.auth-menu-item{display:flex;align-items:center;gap:8px;width:100%;padding:10px 14px;border:none;background:none;cursor:pointer;font-size:13px;color:var(--text);transition:background 0.15s}' +
      '.auth-menu-item:hover{background:var(--surface)}' +
      '.auth-menu-item .menu-icon{font-size:14px;width:18px;text-align:center}' +
      '.auth-user-wrap{position:relative}' +

      '.auth-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.2s}' +
      '.auth-modal-overlay.show{opacity:1;pointer-events:auto}' +
      '.auth-modal{background:var(--bg);border-radius:16px;width:90%;max-width:400px;padding:24px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,0.15)}' +
      '.auth-modal-close{position:absolute;top:12px;right:14px;background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-secondary);padding:4px 8px;border-radius:6px}' +
      '.auth-modal-close:hover{background:var(--surface)}' +
      '.auth-modal-icon{font-size:40px;text-align:center;margin-bottom:12px}' +
      '.auth-modal-title{font-size:18px;font-weight:700;text-align:center;margin-bottom:6px;color:var(--text)}' +
      '.auth-modal-desc{font-size:13px;color:var(--text-secondary);text-align:center;margin-bottom:16px;line-height:1.5}' +
      '.auth-modal-verify{text-align:center;margin:16px 0}' +
      '.auth-modal-user-code{font-size:32px;font-weight:800;letter-spacing:4px;color:var(--primary);background:var(--surface);padding:12px 20px;border-radius:10px;display:inline-block;font-family:monospace}' +
      '.auth-modal-steps{background:var(--surface);border-radius:10px;padding:14px;margin:14px 0}' +
      '.auth-modal-steps ol{margin:0;padding-left:20px}' +
      '.auth-modal-steps li{font-size:13px;color:var(--text);margin-bottom:6px;line-height:1.5}' +
      '.auth-modal-steps li:last-child{margin-bottom:0}' +
      '.auth-modal-steps a{color:var(--primary);text-decoration:none;font-weight:500}' +
      '.auth-modal-steps a:hover{text-decoration:underline}' +
      '.auth-modal-status{font-size:12px;color:var(--text-muted);text-align:center;margin-top:12px;min-height:18px}' +
      '.auth-modal-status .spinner{display:inline-block;width:14px;height:14px;border:2px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:auth-spin 0.8s linear infinite;vertical-align:middle;margin-right:6px}' +
      '@keyframes auth-spin{to{transform:rotate(360deg)}}' +

      '.auth-info-benefits{margin:16px 0}' +
      '.auth-info-item{display:flex;align-items:center;gap:10px;padding:8px 0;font-size:14px;color:var(--text)}' +
      '.auth-info-icon{font-size:18px;width:24px;text-align:center}' +
      '.auth-info-start-btn{display:block;width:100%;padding:12px;border:none;border-radius:10px;background:var(--primary);color:#fff;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.2s;margin-top:8px}' +
      '.auth-info-start-btn:hover{opacity:0.88;transform:translateY(-1px)}' +
      '.auth-info-note{font-size:12px;color:var(--text-muted);text-align:center;margin-top:12px}' +

      '.auth-help-modal{max-width:480px;max-height:85vh;display:flex;flex-direction:column;overflow:hidden}' +
      '.auth-help-content{flex:1;overflow-y:auto;margin-top:8px;-webkit-overflow-scrolling:touch}' +
      '.auth-help-section{margin-bottom:14px}' +
      '.auth-help-section-title{font-size:14px;font-weight:700;color:var(--text);margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid var(--border)}' +
      '.auth-help-item{font-size:13px;color:var(--text-secondary);line-height:1.6;padding:2px 0}' +
      '.auth-help-item b{color:var(--text);font-weight:600}' +
      '.auth-help-highlight{color:var(--primary);font-weight:600;background:var(--surface);padding:8px 10px;border-radius:6px;margin-top:4px}' +
      '.auth-help-keys{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px}' +
      '.auth-help-key-row{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-secondary)}' +
      '.auth-help-key-row kbd{display:inline-block;padding:2px 8px;font-size:12px;font-family:monospace;background:var(--surface);border:1px solid var(--border);border-radius:4px;min-width:24px;text-align:center}' +

      '@media(max-width:768px){' +
        '.auth-login-btn span:last-child{display:none}' +
        '.auth-login-btn{padding:6px 8px}' +
        '.auth-user-btn span{display:none}' +
        '.auth-user-btn{padding:4px 6px}' +
        '.auth-user-menu{right:-10px}' +
        '.auth-modal{width:92%;padding:18px;border-radius:14px}' +
        '.auth-help-modal{max-width:none;width:95%}' +
        '.auth-modal-user-code{font-size:24px;letter-spacing:3px;padding:10px 14px}' +
        '.topbar{gap:8px;padding:0 12px}' +
        '.topbar-counter{display:none}' +
        '.topbar-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}' +
      '}' +
      '@media(max-width:400px){' +
        '.auth-login-btn{padding:6px;border-radius:6px}' +
        '.auth-modal{width:96%;padding:14px;border-radius:12px}' +
        '.auth-modal-icon{font-size:32px}' +
        '.auth-modal-title{font-size:16px}' +
        '.auth-help-section-title{font-size:13px}' +
        '.auth-help-item{font-size:12px}' +
      '}';
    document.head.appendChild(style);
  }

  function injectLoginButton() {
    var controls = document.querySelector('.topbar-controls');
    if (!controls) return;
    var btn = document.createElement('button');
    btn.className = 'auth-login-btn';
    btn.id = 'authLoginBtn';
    btn.title = '登录同步';
    btn.innerHTML = '<span style="font-size:15px">🔑</span><span>登录</span>';
    btn.addEventListener('click', function() { showInfoModal(); });
    controls.insertBefore(btn, controls.firstChild);
  }

  function injectHelpButton() {
    var controls = document.querySelector('.topbar-controls');
    if (!controls) return;
    var btn = document.createElement('button');
    btn.className = 'auth-login-btn';
    btn.id = 'authHelpBtn';
    btn.title = '使用说明';
    btn.innerHTML = '<span style="font-size:15px">📘</span><span>说明</span>';
    btn.addEventListener('click', function() { showHelpModal(); });
    controls.insertBefore(btn, controls.firstChild);
  }

  function injectHelpModal() {
    var modal = document.createElement('div');
    modal.className = 'auth-modal-overlay';
    modal.id = 'authHelpModal';
    modal.innerHTML =
      '<div class="auth-modal auth-help-modal">' +
        '<button class="auth-modal-close" id="authHelpClose">&times;</button>' +
        '<div class="auth-modal-icon">📖</div>' +
        '<div class="auth-modal-title">使用说明</div>' +
        '<div class="auth-help-content">' +

          '<div class="auth-help-section">' +
            '<div class="auth-help-section-title">📇 学习模式</div>' +
            '<div class="auth-help-item"><b>闪卡模式</b>：点击卡片翻转查看答案，适合快速浏览</div>' +
            '<div class="auth-help-item"><b>填空模式</b>：自动提取关键词生成填空，边想边填加深记忆</div>' +
            '<div class="auth-help-item"><b>默写模式</b>：先自己输入答案，再对比正确答案，查漏补缺</div>' +
          '</div>' +

          '<div class="auth-help-section">' +
            '<div class="auth-help-section-title">⭐ 标记与状态</div>' +
            '<div class="auth-help-item"><b>标记</b>（星标）：重点题目标记后可在「标记题目」中集中复习</div>' +
            '<div class="auth-help-item"><b>背了</b>：记录学习次数，点击可 ±1 调整，次数越多掌握越牢</div>' +
            '<div class="auth-help-item"><b>不背了</b>：已完全掌握的题目，移出常规刷题列表</div>' +
          '</div>' +

          '<div class="auth-help-section">' +
            '<div class="auth-help-section-title">🔍 筛选与搜索</div>' +
            '<div class="auth-help-item">顶部搜索框支持题目、答案关键词模糊搜索</div>' +
            '<div class="auth-help-item">科目/章节下拉框可按分类筛选题目</div>' +
            '<div class="auth-help-item">筛选模式：全部 / 标记 / 未学习 / 已学习 / 不背了</div>' +
          '</div>' +

          '<div class="auth-help-section">' +
            '<div class="auth-help-section-title">📥 导入导出</div>' +
            '<div class="auth-help-item"><b>导入</b>：支持 Q/A 格式和分隔符格式，详见导入弹窗内的格式说明</div>' +
            '<div class="auth-help-item"><b>导出</b>：可导出为 TXT / Markdown / Anki CSV，方便打印或导入其他工具</div>' +
          '</div>' +

          '<div class="auth-help-section">' +
            '<div class="auth-help-section-title">☁️ 数据同步</div>' +
            '<div class="auth-help-item">点击右上角「登录」，使用 GitHub 账号授权即可开启云同步</div>' +
            '<div class="auth-help-item">登录后每次操作自动同步到你的私有 Gist，换设备不丢进度</div>' +
            '<div class="auth-help-item auth-help-highlight">💡 不登录也能正常使用，数据保存在当前浏览器</div>' +
          '</div>' +

          '<div class="auth-help-section">' +
            '<div class="auth-help-section-title">📮 联系作者</div>' +
            '<div class="auth-help-item">微信：<b>SSYHS233</b>（反馈建议、问题咨询）</div>' +
          '</div>' +

        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    document.getElementById('authHelpClose').addEventListener('click', function() { closeHelpModal(); });
    modal.addEventListener('click', function(e) { if (e.target === modal) closeHelpModal(); });
  }

  function showHelpModal() {
    var modal = document.getElementById('authHelpModal');
    if (modal) modal.classList.add('show');
  }

  function closeHelpModal() {
    var modal = document.getElementById('authHelpModal');
    if (modal) modal.classList.remove('show');
  }

  function injectInfoModal() {
    var modal = document.createElement('div');
    modal.className = 'auth-modal-overlay';
    modal.id = 'authInfoModal';
    modal.innerHTML =
      '<div class="auth-modal">' +
        '<button class="auth-modal-close" id="authInfoClose">&times;</button>' +
        '<div class="auth-modal-icon">☁️</div>' +
        '<div class="auth-modal-title">登录同步</div>' +
        '<div class="auth-modal-desc">使用 GitHub 账号登录，答题进度自动云端同步</div>' +
        '<div class="auth-info-benefits">' +
          '<div class="auth-info-item"><span class="auth-info-icon">💻</span><span>换设备也能继续刷题</span></div>' +
          '<div class="auth-info-item"><span class="auth-info-icon">📱</span><span>手机、电脑进度实时同步</span></div>' +
          '<div class="auth-info-item"><span class="auth-info-icon">🔒</span><span>数据存在你的 GitHub 私有 Gist，仅你可见</span></div>' +
          '<div class="auth-info-item"><span class="auth-info-icon">💰</span><span>完全免费，不占用你的任何额度</span></div>' +
        '</div>' +
        '<button class="auth-info-start-btn" id="authInfoStartBtn">🔑 开始登录</button>' +
        '<div class="auth-info-note">需要 GitHub 账号 · 无需注册也可直接使用</div>' +
        '<div class="auth-help-highlight" style="margin-top:12px;font-size:13px;text-align:center">💡 不登录也能正常使用，数据保存在当前浏览器</div>' +
      '</div>';
    document.body.appendChild(modal);

    document.getElementById('authInfoClose').addEventListener('click', function() { closeInfoModal(); });
    modal.addEventListener('click', function(e) { if (e.target === modal) closeInfoModal(); });
    document.getElementById('authInfoStartBtn').addEventListener('click', function() {
      closeInfoModal();
      startDeviceFlow();
    });
  }

  function showInfoModal() {
    if (isLoggedIn()) return;
    var modal = document.getElementById('authInfoModal');
    if (modal) modal.classList.add('show');
  }

  function closeInfoModal() {
    var modal = document.getElementById('authInfoModal');
    if (modal) modal.classList.remove('show');
  }

  function injectLoginModal() {
    var modal = document.createElement('div');
    modal.className = 'auth-modal-overlay';
    modal.id = 'authLoginModal';
    modal.innerHTML =
      '<div class="auth-modal">' +
        '<button class="auth-modal-close" id="authModalClose">&times;</button>' +
        '<div class="auth-modal-icon">🔑</div>' +
        '<div class="auth-modal-title">GitHub 登录</div>' +
        '<div class="auth-modal-desc">授权后数据将同步到你的 GitHub Gist，换设备也不丢进度</div>' +
        '<div class="auth-modal-verify">' +
          '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:6px">你的授权码：</div>' +
          '<div class="auth-modal-user-code" id="authUserCode">--------</div>' +
        '</div>' +
        '<div class="auth-modal-steps">' +
          '<ol>' +
            '<li>在新窗口打开 <a id="authVerifyLink" href="https://github.com/login/device" target="_blank">github.com/login/device</a></li>' +
            '<li>输入上方授权码</li>' +
            '<li>点击 Authorize 授权</li>' +
          '</ol>' +
        '</div>' +
        '<div class="auth-modal-status" id="authModalStatus"></div>' +
      '</div>';
    document.body.appendChild(modal);

    document.getElementById('authModalClose').addEventListener('click', function() {
      closeLoginModal();
      cancelDeviceFlow();
    });
    modal.addEventListener('click', function(e) {
      if (e.target === modal) { closeLoginModal(); cancelDeviceFlow(); }
    });
  }

  function showLoginModal(code) {
    var modal = document.getElementById('authLoginModal');
    var codeEl = document.getElementById('authUserCode');
    var status = document.getElementById('authModalStatus');
    if (modal) modal.classList.add('show');
    if (codeEl) codeEl.textContent = code || '--------';
    if (status) status.innerHTML = '<span class="spinner"></span>等待授权...';
  }

  function closeLoginModal() {
    var modal = document.getElementById('authLoginModal');
    if (modal) modal.classList.remove('show');
  }

  function setLoginModalStatus(msg) {
    var status = document.getElementById('authModalStatus');
    if (status) status.innerHTML = msg;
  }

  function updateLoginButton() {
    var btn = document.getElementById('authLoginBtn');
    if (!btn) return;

    if (isLoggedIn()) {
      var user = getUser();
      btn.className = 'auth-user-btn';
      btn.title = user.login;
      btn.innerHTML =
        '<img src="' + user.avatar_url + '" alt="avatar">' +
        '<span>' + user.login + '</span>' +
        '<div class="auth-user-menu" id="authUserMenu">' +
          '<button class="auth-menu-item" id="authSyncNowBtn"><span class="menu-icon">🔄</span>立即同步</button>' +
          '<button class="auth-menu-item" id="authLogoutBtn"><span class="menu-icon">🚪</span>退出登录</button>' +
        '</div>';
      btn.onclick = function(e) {
        e.stopPropagation();
        var menu = document.getElementById('authUserMenu');
        if (menu) menu.classList.toggle('show');
      };

      var syncBtn = document.getElementById('authSyncNowBtn');
      if (syncBtn) {
        syncBtn.onclick = function(e) {
          e.stopPropagation();
          syncToGist();
          var menu = document.getElementById('authUserMenu');
          if (menu) menu.classList.remove('show');
        };
      }
      var logoutBtn = document.getElementById('authLogoutBtn');
      if (logoutBtn) {
        logoutBtn.onclick = function(e) {
          e.stopPropagation();
          logout();
          var menu = document.getElementById('authUserMenu');
          if (menu) menu.classList.remove('show');
        };
      }

    } else {
      btn.className = 'auth-login-btn';
      btn.title = '登录同步';
      btn.innerHTML = '<span style="font-size:15px">🔑</span><span>登录</span>';
      btn.onclick = function() { showInfoModal(); };
    }
  }

  function showToast(msg) {
    var t = document.getElementById('toast');
    if (t) {
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(function() { t.classList.remove('show'); }, 2500);
    }
  }

  // ============================================
  // OAuth Device Flow
  // ============================================
  var _devicePolling = false;
  var _pollInterval = null;

  function startDeviceFlow() {
    if (isLoggedIn()) { showToast('已登录'); return; }
    if (_devicePolling) return;

    _devicePolling = true;
    showLoginModal('');

    var body = 'client_id=' + CLIENT_ID + '&scope=gist';
    fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: body
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.error) {
        setLoginModalStatus('请求失败: ' + (data.error_description || data.error));
        _devicePolling = false;
        return;
      }
      document.getElementById('authUserCode').textContent = data.user_code;
      document.getElementById('authVerifyLink').href = data.verification_uri;
      setLoginModalStatus('<span class="spinner"></span>等待授权...');
      pollForToken(data.device_code, data.interval || 5);
    })
    .catch(function(err) {
      setLoginModalStatus('网络错误，请重试');
      _devicePolling = false;
    });
  }

  function pollForToken(deviceCode, interval) {
    if (_pollInterval) clearTimeout(_pollInterval);
    if (!_devicePolling) return;

    _pollInterval = setTimeout(function() {
      if (!_devicePolling) return;
      var body = 'client_id=' + CLIENT_ID +
                 '&device_code=' + deviceCode +
                 '&grant_type=urn:ietf:params:oauth:grant-type:device_code';

      fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
        body: body
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.access_token) {
          _pollInterval = null;
          _devicePolling = false;
          fetchUserProfile(data.access_token, data.scope);
          return;
        }
        switch (data.error) {
          case 'authorization_pending':
            pollForToken(deviceCode, interval);
            break;
          case 'slow_down':
            pollForToken(deviceCode, (data.interval || interval) + 5);
            break;
          case 'expired_token':
            _pollInterval = null;
            _devicePolling = false;
            setLoginModalStatus('授权码已过期，请重新登录');
            break;
          case 'access_denied':
            _pollInterval = null;
            _devicePolling = false;
            setLoginModalStatus('已取消授权');
            break;
          default:
            _pollInterval = null;
            _devicePolling = false;
            setLoginModalStatus('错误: ' + (data.error_description || data.error || '未知'));
        }
      })
      .catch(function() { pollForToken(deviceCode, interval); });
    }, interval * 1000);
  }

  function fetchUserProfile(token, scope) {
    fetch('https://api.github.com/user', {
      headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json' }
    })
    .then(function(r) { return r.json(); })
    .then(function(user) {
      var authData = {
        access_token: token,
        scope: scope || 'gist',
        user: { login: user.login, avatar_url: user.avatar_url, id: user.id }
      };
      try { localStorage.setItem(AUTH_KEY, JSON.stringify(authData)); } catch(e) {}
      closeLoginModal();
      updateLoginButton();
      showToast('登录成功，正在同步...');
      syncFromGist(true);
    })
    .catch(function() {
      var authData = { access_token: token, scope: scope || 'gist', user: { login: 'GitHub用户', avatar_url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="%23ddd"/><text x="11" y="15" text-anchor="middle" font-size="12" fill="%23666">?</text></svg>', id: 0 } };
      try { localStorage.setItem(AUTH_KEY, JSON.stringify(authData)); } catch(e) {}
      closeLoginModal();
      updateLoginButton();
      showToast('登录成功');
    });
  }

  function cancelDeviceFlow() {
    if (_pollInterval) { clearTimeout(_pollInterval); _pollInterval = null; }
    _devicePolling = false;
  }

  function logout() {
    try { localStorage.removeItem(AUTH_KEY); } catch(e) {}
    _gistId = null;
    updateLoginButton();
    showToast('已退出登录');
  }

  // ============================================
  // Gist API
  // ============================================
  var _gistId = null;

  function getStoredGistId() {
    if (_gistId) return _gistId;
    try { _gistId = localStorage.getItem(GIST_ID_KEY); } catch(e) {}
    return _gistId;
  }

  function collectSyncData() {
    var data = {};
    for (var i = 0; i < SYNC_KEYS.length; i++) {
      try { data[SYNC_KEYS[i]] = localStorage.getItem(SYNC_KEYS[i]); } catch(e) {}
    }
    data._timestamp = new Date().toISOString();
    return data;
  }

  function findOrCreateGist() {
    var stored = getStoredGistId();
    if (stored) {
      return fetch('https://api.github.com/gists/' + stored, { headers: getUserHeaders() })
        .then(function(r) {
          if (r.ok) return stored;
          return createGist();
        });
    }
    return createGist();
  }

  function createGist() {
    return fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: getUserHeaders(),
      body: JSON.stringify({
        description: GIST_DESC,
        public: false,
        files: { 'sync-data.json': { content: JSON.stringify(collectSyncData()) } }
      })
    })
    .then(function(r) { return r.json(); })
    .then(function(gist) {
      _gistId = gist.id;
      try { localStorage.setItem(GIST_ID_KEY, gist.id); } catch(e) {}
      return gist.id;
    });
  }

  function syncToGist() {
    if (!isLoggedIn()) return;
    findOrCreateGist().then(function(gistId) {
      return fetch('https://api.github.com/gists/' + gistId, {
        method: 'PATCH',
        headers: getUserHeaders(),
        body: JSON.stringify({
          description: GIST_DESC,
          files: { 'sync-data.json': { content: JSON.stringify(collectSyncData()) } }
        })
      });
    })
    .then(function() { showToast('已同步到云端'); })
    .catch(function() { showToast('同步失败，请检查网络'); });
  }

  function syncFromGist(reload) {
    if (!isLoggedIn()) return;
    findOrCreateGist().then(function(gistId) {
      return fetch('https://api.github.com/gists/' + gistId, { headers: getUserHeaders() });
    })
    .then(function(r) { return r.json(); })
    .then(function(gist) {
      var file = gist.files && gist.files['sync-data.json'];
      if (!file) return;
      var remoteData;
      try { remoteData = JSON.parse(file.content); } catch(e) { return; }

      var localData = collectSyncData();
      var merged = mergeSyncData(localData, remoteData);

      for (var key in merged) {
        if (key.charAt(0) !== '_' && merged.hasOwnProperty(key)) {
          try { localStorage.setItem(key, merged[key]); } catch(e) {}
        }
      }

      if (reload) {
        showToast('云端数据已同步，正在刷新...');
        setTimeout(function() { location.reload(); }, 800);
      } else {
        showToast('云端数据已同步');
      }
    })
    .catch(function() {});
  }

  // ============================================
  // Merge Logic
  // ============================================
  function mergeSyncData(local, remote) {
    var merged = {};
    var remoteTs = remote._timestamp || '1970-01-01';
    var localTs = local._timestamp || '1970-01-01';

    for (var i = 0; i < SYNC_KEYS.length; i++) {
      var key = SYNC_KEYS[i];
      var lRaw = local[key];
      var rRaw = remote[key];

      if (!lRaw && rRaw) { merged[key] = rRaw; continue; }
      if (!rRaw && lRaw) { merged[key] = lRaw; continue; }
      if (!lRaw && !rRaw) continue;

      if (key === 'study-platform-settings') {
        merged[key] = remoteTs >= localTs ? rRaw : lRaw;
        continue;
      }

      if (key === 'study-platform-state') {
        merged[key] = mergeState(lRaw, rRaw);
        continue;
      }

      if (key === 'study-platform-edits' || key === 'study-platform-notes') {
        merged[key] = mergeObjects(lRaw, rRaw);
        continue;
      }

      if (key === 'study-platform-imported') {
        merged[key] = mergeArrays(lRaw, rRaw);
        continue;
      }

      merged[key] = remoteTs >= localTs ? rRaw : lRaw;
    }

    return merged;
  }

  function mergeState(lRaw, rRaw) {
    var l = parseJSON(lRaw, {});
    var r = parseJSON(rRaw, {});

    var result = {
      marked: unionArrays(l.marked || [], r.marked || []),
      viewed: unionArrays(l.viewed || [], r.viewed || []),
      mastered: unionArrays(l.mastered || [], r.mastered || []),
      learnedCounts: {},
      lastIndex: (r.lastIndex || 0) > (l.lastIndex || 0) ? r.lastIndex : l.lastIndex
    };

    var lCounts = l.learnedCounts || {};
    var rCounts = r.learnedCounts || {};
    var allKeys = unionArrays(Object.keys(lCounts), Object.keys(rCounts));
    for (var i = 0; i < allKeys.length; i++) {
      var k = allKeys[i];
      result.learnedCounts[k] = Math.max(parseInt(lCounts[k]) || 0, parseInt(rCounts[k]) || 0);
    }

    return JSON.stringify(result);
  }

  function mergeObjects(lRaw, rRaw) {
    var l = parseJSON(lRaw, {});
    var r = parseJSON(rRaw, {});
    var result = {};
    var allKeys = unionArrays(Object.keys(l), Object.keys(r));
    for (var i = 0; i < allKeys.length; i++) {
      var k = allKeys[i];
      result[k] = r.hasOwnProperty(k) ? r[k] : l[k];
    }
    return JSON.stringify(result);
  }

  function mergeArrays(lRaw, rRaw) {
    var l = parseJSON(lRaw, []);
    var r = parseJSON(rRaw, []);
    var map = {};
    var result = [];
    var items = l.concat(r);
    for (var i = 0; i < items.length; i++) {
      var id = items[i] && items[i].id;
      if (id && !map[id]) {
        map[id] = true;
        result.push(items[i]);
      }
    }
    return JSON.stringify(result);
  }

  function parseJSON(str, fallback) {
    try { return JSON.parse(str); } catch(e) { return fallback; }
  }

  function unionArrays(a, b) {
    var seen = {};
    var result = [];
    for (var i = 0; i < a.length; i++) {
      if (!seen[a[i]]) { seen[a[i]] = true; result.push(a[i]); }
    }
    for (var j = 0; j < b.length; j++) {
      if (!seen[b[j]]) { seen[b[j]] = true; result.push(b[j]); }
    }
    return result;
  }

  // ============================================
  // Debounced sync for save hooks
  // ============================================
  function debouncedSyncToGist() {
    if (!isLoggedIn()) return;
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(function() { syncToGist(); }, SYNC_DEBOUNCE);
  }

  // ============================================
  // Public API
  // ============================================
  return {
    init: function() {
      injectUI();
      if (isLoggedIn()) {
        syncFromGist();
      }
    },
    isLoggedIn: isLoggedIn,
    getUser: getUser,
    syncToGist: syncToGist,
    syncFromGist: syncFromGist,
    debouncedSyncToGist: debouncedSyncToGist,
    startDeviceFlow: startDeviceFlow,
    logout: logout
  };

})();
