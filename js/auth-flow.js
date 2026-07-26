/**
 * auth-flow.js — 首次登录判断 / 退出账号处理（共享业务模块）
 *
 * 设计目标：
 *  - 与具体页面解耦，onboarding-1.html / auth.html 等入口页统一引用本文件。
 *  - 内容文案「可配置」：业务方只需修改 XJAuth.config.firstLogin / logout 即可。
 *  - 首次登录判断基于 localStorage 中的「历史登录记录」(xj_login_history)，
 *    与登录态 (xj_account) 分离，保证「退出后仍是老用户」。
 *
 * 依赖：仅依赖 design-system.css 中的 .modal-backdrop / .modal-sheet / .btn-* 等通用类，
 *       底部 sheet 的内联样式自包含，不依赖任何页面私有 CSS。
 */
(function () {
  'use strict';

  var KEYS = {
    account: 'xj_account',
    guest: 'xj_guest',
    loginHistory: 'xj_login_history'
  };

  /* =========================================================
   * 可配置内容占位
   * —— 业务方上线前请替换 title / body / confirmText / redirect 的真实文案。
   * —— 当前为占位态（文案以「__待配置__」开头），便于后续填充。
   * ========================================================= */
  var config = {
    // ① 首次登录时展示的内容
    firstLogin: {
      title: '欢迎来到街角情绪盲盒',
      body: '__待配置__｜首次登录欢迎内容占位：可在此放置新手指引、新人权益或活动入口。',
      confirmText: '开始探索',
      redirect: 'index.html'
    },
    // ② 退出账号时展示的提示内容
    logout: {
      title: '你已退出账号',
      body: '__待配置__｜退出登录提示内容占位：可在此放置告别语、游客模式说明或重新登录入口。',
      confirmText: '重新登录',
      redirect: 'auth.html'
    }
  };

  /* ---------------- 工具 ---------------- */
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function readHistory() {
    try {
      var raw = localStorage.getItem(KEYS.loginHistory);
      if (!raw) return [];
      var v = JSON.parse(raw);
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  }

  /* ---------------- ① 首次登录判断 ---------------- */
  // 系统中无该用户的历史登录记录 → 视为首次登录
  function isFirstLogin() {
    return readHistory().length === 0;
  }

  // 记录一次登录（写入历史，用于区分新老用户）
  function markLogin() {
    try {
      var list = readHistory();
      list.push({ at: Date.now() });
      localStorage.setItem(KEYS.loginHistory, JSON.stringify(list));
    } catch (e) {}
  }

  /* ---------------- ② 退出账号：清理会话态，保留历史 ---------------- */
  // 主动退出：移除登录态/游客态，但「故意保留」loginHistory，
  // 以保证该用户再次登录时仍被识别为老用户（符合「历史登录记录」语义）。
  // options.skipPrompt=true 时直接进入授权页，不追加 ?logout=1。
  function dispatchLogout(redirectTo, options) {
    try {
      localStorage.removeItem(KEYS.account);
      localStorage.removeItem(KEYS.guest);
    } catch (e) {}
    // 通知页面（可选监听点）
    try { document.dispatchEvent(new CustomEvent('xj:logout')); } catch (e) {}
    var target = redirectTo || config.logout.redirect || 'auth.html';
    var skipPrompt = options && options.skipPrompt === true;
    if (!skipPrompt) {
      var sep = target.indexOf('?') === -1 ? '?' : '&';
      target += sep + 'logout=1';
    }
    try { window.location.href = target; } catch (e) {}
  }

  /* ---------------- 通用底部 sheet 渲染（自包含样式） ---------------- */
  function renderSheet(content, onConfirm) {
    var old = document.getElementById('xj-flow-sheet');
    if (old) old.remove();
    var oldB = document.getElementById('xj-flow-backdrop');
    if (oldB) oldB.remove();

    var backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'xj-flow-backdrop';

    var sheet = document.createElement('div');
    sheet.className = 'modal-sheet';
    sheet.id = 'xj-flow-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-labelledby', 'xj-flow-title');
    sheet.style.maxWidth = '480px';
    sheet.style.margin = '0 auto';
    sheet.innerHTML =
      '<div class="sheet-handle" aria-hidden="true"></div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-md);">' +
        '<h2 id="xj-flow-title" class="text-h2" style="font-weight:600;margin:0;">' + escapeHtml(content.title) + '</h2>' +
      '</div>' +
      '<p style="font-size:var(--type-body);color:var(--color-ink-secondary);line-height:1.65;margin:0;">' + escapeHtml(content.body) + '</p>' +
      '<button type="button" class="btn btn-primary btn-block" id="xj-flow-confirm" style="margin-top:var(--space-lg);">' + escapeHtml(content.confirmText) + '</button>';

    document.body.appendChild(backdrop);
    document.body.appendChild(sheet);

    requestAnimationFrame(function () {
      backdrop.classList.add('open');
      sheet.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    function close() {
      backdrop.classList.remove('open');
      sheet.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(function () { backdrop.remove(); sheet.remove(); }, 300);
    }

    sheet.querySelector('#xj-flow-confirm').addEventListener('click', function () {
      close();
      if (typeof onConfirm === 'function') onConfirm();
    });
    backdrop.addEventListener('click', close);
  }

  /* ---------------- ① 首次登录：展示内容 ---------------- */
  // 首次登录才弹内容；老用户直接执行 onConfirm（通常即进入首页）
  function handleFirstLogin(onConfirm) {
    if (!isFirstLogin()) {
      if (typeof onConfirm === 'function') onConfirm();
      return;
    }
    renderSheet(config.firstLogin, onConfirm);
  }

  /* ---------------- ② 退出提示：在落地页（?logout=1）展示 ---------------- */
  function handleLogoutPrompt() {
    var params;
    try { params = new URLSearchParams(window.location.search); } catch (e) { params = null; }
    if (params && params.get('logout') === '1') {
      renderSheet(config.logout, function () {
        try { window.location.href = config.logout.redirect || 'auth.html'; } catch (e) {}
      });
      return true;
    }
    return false;
  }

  /* ---------------- ③ 游客模式判断：未登录 / 仅游客态 ---------------- */
  // 游客态：xj_guest === '1' 且未建立正式账号（xj_account 非 '1'）。
  function isGuestMode() {
    var guest, account;
    try {
      guest = localStorage.getItem('xj_guest');
      account = localStorage.getItem('xj_account');
    } catch (e) { return false; }
    return guest === '1' && account !== '1';
  }

  /* ---------------- ③ 游客访问受限页：直接跳转授权页 ---------------- */
  // 游客点击「足迹」「我的」等受限 Tab 时，直接跳转 auth.html，并带 ?from 记录来源页。
  function guardGuest(targetPage) {
    var from = window.location.pathname.split('/').pop() || 'index.html';
    try { window.location.href = 'auth.html?from=' + encodeURIComponent(targetPage || from); } catch (e) {}
  }

  /* ---------------- ④ 退出登录二次确认：项目风格 sheet ---------------- */
  // 返回 Promise：用户点「确认退出」→ resolve(true)；点「取消」或点遮罩 → resolve(false)。
  // 风格：沿用 .modal-backdrop / .modal-sheet，圆角顶部 handle，主按钮紫红「确认退出」+ 次按钮「再想想」。
  function confirmLogout(opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      // 防止重复弹窗
      var old = document.getElementById('xj-logout-sheet');
      var oldB = document.getElementById('xj-logout-backdrop');
      if (old) old.remove();
      if (oldB) oldB.remove();

      var redirectTo = opts.redirectTo || config.logout.redirect || 'auth.html';

      var backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      backdrop.id = 'xj-logout-backdrop';

      var sheet = document.createElement('div');
      sheet.className = 'modal-sheet';
      sheet.id = 'xj-logout-sheet';
      sheet.setAttribute('role', 'dialog');
      sheet.setAttribute('aria-modal', 'true');
      sheet.setAttribute('aria-labelledby', 'xj-logout-title');
      sheet.setAttribute('aria-describedby', 'xj-logout-desc');
      sheet.style.maxWidth = '480px';
      sheet.style.margin = '0 auto';
      sheet.innerHTML =
        '<div class="sheet-handle" aria-hidden="true"></div>' +
        '<div style="text-align:center;padding:var(--space-md) 0 var(--space-lg);">' +
          '<div aria-hidden="true" style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#FFD8B5,#FBC0C6);display:inline-grid;place-items:center;margin-bottom:var(--space-md);box-shadow:var(--shadow-md);">' +
            '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9A4D5C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>' +
          '</div>' +
          '<h2 id="xj-logout-title" class="text-h2" style="font-weight:600;margin:0 0 var(--space-xs);">确认退出账号？</h2>' +
          '<p id="xj-logout-desc" style="font-size:var(--type-body);color:var(--color-ink-secondary);line-height:1.65;margin:0;">退出后将清除本设备的登录状态，重新进入需要再次授权。</p>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:var(--space-sm);">' +
          '<button type="button" class="btn btn-secondary btn-block" id="xj-logout-cancel">再想想</button>' +
          '<button type="button" class="btn btn-primary btn-block" id="xj-logout-confirm" style="background:linear-gradient(135deg,#F36A7E,#E94F6B);color:#FFFFFF;">确认退出</button>' +
        '</div>';

      document.body.appendChild(backdrop);
      document.body.appendChild(sheet);

      var resolved = false;
      function settle(result) {
        if (resolved) return;
        resolved = true;
        backdrop.classList.remove('open');
        sheet.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(function () {
          backdrop.remove();
          sheet.remove();
          resolve(result);
        }, 280);
      }

      requestAnimationFrame(function () {
        backdrop.classList.add('open');
        sheet.classList.add('open');
        document.body.style.overflow = 'hidden';
      });

      sheet.querySelector('#xj-logout-cancel').addEventListener('click', function () { settle(false); });
      backdrop.addEventListener('click', function () { settle(false); });
      sheet.querySelector('#xj-logout-confirm').addEventListener('click', function () {
        // 走统一退出逻辑：清理 xj_account / xj_guest → 派发 xj:logout → 跳转授权入口。
        // skipPrompt:true 避免回退到旧的 ?logout=1 提示逻辑（本流程自带确认）。
        settle(true);
        try {
          if (dispatchLogout) dispatchLogout(redirectTo, { skipPrompt: true });
        } catch (e) {
          try { window.location.href = redirectTo; } catch (_) {}
        }
      });
    });
  }

  window.XJAuth = {
    config: config,
    isFirstLogin: isFirstLogin,
    markLogin: markLogin,
    dispatchLogout: dispatchLogout,
    handleFirstLogin: handleFirstLogin,
    handleLogoutPrompt: handleLogoutPrompt,
    isGuestMode: isGuestMode,
    guardGuest: guardGuest,
    confirmLogout: confirmLogout
  };
})();
