/**
 * 街角情绪盲盒 — 分享功能
 * 渠道：微信好友 / 朋友圈 / 小红书
 * 降级：复制链接 / 生成分享卡（保存图片） / Web Share API
 *
 * 真实 SDK 接入说明（生产环境）：
 * - 微信：在微信内打开 H5 时，由后端通过 JSSDK 签名注入 wx.config，
 *   再调用 wx.updateAppMessageShareData / wx.updateTimelineShareData；
 *   微信外的普通浏览器走 weixin:// 唤起或引导复制链接。
 * - 小红书：目前无公开 Web 分享 SDK，优先尝试 xhsdiscover:// 唤起 App，
 *   否则引导用户在小红书 App 内手动发布。
 *
 * 原型阶段：检测到无 SDK 时会走降级路径并以 Toast 反馈。
 */
(function () {
  'use strict';

  const ICONS = {
    wechat_friend:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.69 4C4.96 4 2 6.46 2 9.5c0 1.66.92 3.13 2.36 4.13l-.6 1.78 2.13-1.1c.62.17 1.27.26 1.96.27.13 0 .26-.01.39-.02-.09-.36-.14-.74-.14-1.13 0-2.97 2.86-5.37 6.39-5.37.2 0 .4.01.59.03C14.39 5.86 11.77 4 8.69 4zM6.5 7.5a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zm4.4 0a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zM15.5 9.4c-2.95 0-5.34 1.94-5.34 4.34 0 2.4 2.39 4.34 5.34 4.34.6 0 1.17-.08 1.7-.22l1.74.9-.5-1.46c1.2-.85 1.97-2.11 1.97-3.56 0-2.4-2.39-4.34-5.34-4.34zm-1.9 2.7a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4zm3.7 0a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4z"/></svg>',
    wechat_moments:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
    xiaohongshu:
      '<svg viewBox="0 0 24 24"><text x="12" y="17" text-anchor="middle" font-size="13" font-weight="700" font-family="-apple-system, sans-serif" fill="currentColor">小红</text></svg>',
    copy_link:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    save_image:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };

  const CHANNELS = [
    { id: 'wechat_friend', label: '微信好友', image: 'assets/image/wechat-friend.png', icon: ICONS.wechat_friend, sdk: 'wechat', intent: 'weixin://' },
    { id: 'wechat_moments', label: '朋友圈', image: 'assets/image/wechat-moments.png', icon: ICONS.wechat_moments, sdk: 'wechat', intent: 'weixin://' },
    { id: 'xiaohongshu', label: '小红书', image: 'assets/image/xiaohongshu.svg', icon: ICONS.xiaohongshu, sdk: 'xhs', intent: 'xhsdiscover://' },
    { id: 'copy_link', label: '复制链接', color: 'transparent', icon: ICONS.copy_link, sdk: 'native' },
    { id: 'save_image', label: '保存图片', color: 'transparent', icon: ICONS.save_image, sdk: 'native' }
  ];

  function detect() {
    const ua = navigator.userAgent || '';
    return {
      inWeChat: /MicroMessenger/i.test(ua),
      inXHS: /xhs|RED/i.test(ua),
      hasWxSDK: typeof window.wx !== 'undefined' && typeof window.wx.updateAppMessageShareData === 'function',
      hasXhsSDK: typeof window.xhs !== 'undefined',
      hasWebShare: typeof navigator.share === 'function',
      hasClipboard: !!(navigator.clipboard && navigator.clipboard.writeText)
    };
  }

  function showToast(msg) {
    if (typeof window.showToast === 'function') { window.showToast(msg); return; }
    let toast = document.getElementById('xj-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'xj-toast';
      toast.style.cssText = 'position:fixed;left:50%;bottom:96px;transform:translateX(-50%);background:rgba(44,34,72,0.88);color:#fff;padding:10px 18px;border-radius:999px;font-size:14px;z-index:9999;opacity:0;transition:opacity 200ms ease;pointer-events:none;backdrop-filter:blur(8px);';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2200);
  }

  function vibrate(p) {
    if (navigator.vibrate) { try { navigator.vibrate(p); } catch (e) {} }
  }

  function domainOf(url) {
    try { return new URL(url, location.href).host.replace(/^www\./, ''); } catch (e) { return '街角情绪盲盒'; }
  }

  function escapeHtml(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  function buildSheet(payload) {
    const wrap = document.createElement('div');
    wrap.className = 'xj-share-root';
    wrap.innerHTML = `
      <div class="modal-backdrop open" data-share-backdrop></div>
      <div class="modal-sheet open share-sheet" role="dialog" aria-label="分享" data-sheet>
        <div class="sheet-header">
          <span class="sheet-title">分享这份温柔</span>
          <button class="sheet-close" data-share-close aria-label="关闭">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="share-preview" aria-label="分享卡片预览">
          <div class="share-preview-thumb">${payload.image
            ? '<img src="' + escapeHtml(payload.image) + '" alt="" onerror="this.replaceWith(document.createTextNode(\'🌿\'))">'
            : '🌿'}</div>
          <div class="share-preview-body">
            <div class="share-preview-title">${escapeHtml(payload.title)}</div>
            <div class="share-preview-desc">${escapeHtml(payload.desc)}</div>
            <div class="share-preview-domain">${escapeHtml(domainOf(payload.link))}</div>
          </div>
        </div>
        <div class="share-channels" data-share-channels></div>
        <div class="share-secondary">
          <button data-share-action="copy_link" type="button">
            <span class="share-secondary-icon">${ICONS.copy_link}</span>
            <span>复制链接</span>
          </button>
          <button data-share-action="save_image" type="button">
            <span class="share-secondary-icon">${ICONS.save_image}</span>
            <span>生成分享卡</span>
          </button>
        </div>
      </div>
    `;

    const channelsEl = wrap.querySelector('[data-share-channels]');
    CHANNELS.forEach(ch => {
      if (ch.id === 'copy_link' || ch.id === 'save_image') return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'share-channel';
      btn.dataset.shareChannel = ch.id;
      btn.setAttribute('aria-label', ch.label);
      var inner = ch.image
        ? '<span class="share-channel-icon"><img src="' + escapeHtml(ch.image) + '" alt="' + escapeHtml(ch.label) + '" draggable="false"></span>'
        : '<span class="share-channel-icon">' + ch.icon + '</span>';
      btn.innerHTML = inner + '<span class="share-channel-label">' + escapeHtml(ch.label) + '</span>';
      // 始终作为可交互渠道渲染：handler 内部已包含 SDK 检测与降级（intent/toast）
      btn.addEventListener('click', () => invoke(ch.id, payload));
      channelsEl.appendChild(btn);
    });

    wrap.querySelectorAll('[data-share-action]').forEach(btn => {
      btn.addEventListener('click', () => invoke(btn.dataset.shareAction, payload));
    });

    return wrap;
  }

  function shareToWechatFriend(p) {
    return new Promise(resolve => {
      const env = detect();
      if (env.inWeChat && env.hasWxSDK) {
        try {
          window.wx.updateAppMessageShareData({ title: p.title, desc: p.desc, link: p.link, imgUrl: p.image });
          showToast('请点击右上角菜单发送给朋友');
          resolve({ ok: true, pending: true, channel: 'wechat_friend' });
        } catch (e) {
          resolve({ ok: false, channel: 'wechat_friend', error: e.message });
        }
      } else {
        showToast('正在打开微信…');
        try { window.location.href = 'weixin://'; } catch (e) {}
        resolve({ ok: true, pending: true, channel: 'wechat_friend', fallback: 'intent' });
      }
    });
  }

  function shareToWechatMoments(p) {
    return new Promise(resolve => {
      const env = detect();
      if (env.inWeChat && env.hasWxSDK) {
        try {
          window.wx.updateTimelineShareData({ title: p.title, link: p.link, imgUrl: p.image });
          showToast('请点击右上角菜单分享到朋友圈');
          resolve({ ok: true, pending: true, channel: 'wechat_moments' });
        } catch (e) {
          resolve({ ok: false, channel: 'wechat_moments', error: e.message });
        }
      } else {
        showToast('请在微信中打开后分享到朋友圈');
        resolve({ ok: false, channel: 'wechat_moments', fallback: 'open_wechat' });
      }
    });
  }

  function shareToXiaohongshu(p) {
    return new Promise(resolve => {
      const env = detect();
      if (env.hasXhsSDK) {
        try {
          window.xhs.shareNote({ title: p.title, desc: p.desc, images: [p.image].filter(Boolean), tags: p.tags || [] });
          showToast('正在打开小红书…');
          resolve({ ok: true, pending: true, channel: 'xiaohongshu' });
        } catch (e) {
          resolve({ ok: false, channel: 'xiaohongshu', error: e.message });
        }
      } else if (env.inXHS) {
        showToast('请在小红书 App 内发布笔记');
        resolve({ ok: false, channel: 'xiaohongshu', fallback: 'manual' });
      } else {
        showToast('请打开小红书 App 分享');
        try { window.location.href = 'xhsdiscover://'; } catch (e) {}
        resolve({ ok: false, channel: 'xiaohongshu', fallback: 'intent' });
      }
    });
  }

  function copyLink(p) {
    return new Promise(resolve => {
      const done = (ok, err) => {
        if (ok) showToast('链接已复制，去粘贴给朋友吧');
        else showToast('复制失败：' + (err || ''));
        resolve({ ok, channel: 'copy_link', error: err });
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(p.link).then(() => done(true)).catch(() => fallbackCopy(p.link, done));
      } else {
        fallbackCopy(p.link, done);
      }
    });
  }

  function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    let ok = false, err = '';
    try { ok = document.execCommand('copy'); } catch (e) { err = e.message; }
    ta.remove();
    cb(ok, ok ? '' : (err || 'execCommand 失败'));
  }

  function saveImage(p) {
    return new Promise(resolve => {
      try {
        generateShareCard(p).then(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'xj-share-' + Date.now() + '.png';
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 4000);
          showToast('分享卡已生成，可保存或转发');
          resolve({ ok: true, channel: 'save_image' });
        }).catch(err => {
          showToast('生成失败：' + (err.message || '未知错误'));
          resolve({ ok: false, channel: 'save_image', error: err.message });
        });
      } catch (e) {
        showToast('当前环境不支持');
        resolve({ ok: false, channel: 'save_image', error: e.message });
      }
    });
  }

  function generateShareCard(p) {
    return new Promise((resolve, reject) => {
      const W = 720, H = 1280;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas 不可用'));

      const cs = getComputedStyle(document.documentElement);
      const c1 = (cs.getPropertyValue('--color-background') || '#F8F6FC').trim() || '#F8F6FC';
      const c2 = (cs.getPropertyValue('--color-background-warm') || '#FCFAF7').trim() || '#FCFAF7';
      const accent = (cs.getPropertyValue('--color-primary') || '#B8A9E8').trim() || '#B8A9E8';
      const ink = (cs.getPropertyValue('--color-ink') || '#2C2C2E').trim() || '#2C2C2E';
      const ink2 = (cs.getPropertyValue('--color-ink-secondary') || 'rgba(44,44,46,0.72)').trim() || 'rgba(44,44,46,0.72)';

      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const orb = ctx.createRadialGradient(W * 0.2, H * 0.18, 0, W * 0.2, H * 0.18, 360);
      orb.addColorStop(0, hexA(accent, 0.42));
      orb.addColorStop(1, hexA(accent, 0));
      ctx.fillStyle = orb;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = ink2;
      ctx.font = '500 28px -apple-system, "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('WEEKLY · 街角情绪盲盒', W / 2, 140);

      ctx.fillStyle = ink;
      ctx.font = '700 60px -apple-system, "PingFang SC", sans-serif';
      wrapText(ctx, p.title, W / 2, 220, W - 120, 78);

      const cardY = 380, cardH = 520;
      roundRect(ctx, 60, cardY, W - 120, cardH, 32);
      ctx.save();
      ctx.clip();
      const grad2 = ctx.createLinearGradient(0, cardY, W, cardY + cardH);
      grad2.addColorStop(0, hexA(accent, 0.55));
      grad2.addColorStop(1, hexA(accent, 0.15));
      ctx.fillStyle = grad2;
      ctx.fillRect(60, cardY, W - 120, cardH);
      ctx.beginPath();
      ctx.arc(W / 2, cardY + cardH / 2, 130, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fill();
      ctx.restore();
      ctx.textAlign = 'left';
      ctx.fillStyle = ink;
      ctx.font = '600 40px -apple-system, "PingFang SC", sans-serif';
      ctx.fillText('温柔足迹', 96, cardY + 64);
      ctx.font = '400 26px -apple-system, "PingFang SC", sans-serif';
      ctx.fillStyle = ink2;
      wrapText(ctx, p.desc, 96, cardY + 110, W - 192, 38);

      ctx.textAlign = 'center';
      ctx.fillStyle = ink;
      ctx.font = '600 44px -apple-system, "PingFang SC", sans-serif';
      ctx.fillText('把 15 分钟步行圈', W / 2, H - 220);
      ctx.fillText('变成有温度的情绪空间', W / 2, H - 168);
      ctx.font = '500 24px -apple-system, sans-serif';
      ctx.fillStyle = accent;
      ctx.fillText('— 街角情绪盲盒 · 扫码加入', W / 2, H - 108);

      try {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob 失败')), 'image/png');
      } catch (e) {
        reject(e);
      }
    });
  }

  function wrapText(ctx, text, x, y, maxW, lineH) {
    const lines = String(text || '').split(/\n/);
    let yy = y;
    lines.forEach(line => {
      const chars = Array.from(line);
      let cur = '';
      chars.forEach(c => {
        const test = cur + c;
        if (ctx.measureText(test).width > maxW && cur) {
          ctx.fillText(cur, x, yy);
          yy += lineH;
          cur = c;
        } else {
          cur = test;
        }
      });
      ctx.fillText(cur, x, yy);
      yy += lineH;
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function hexA(hex, a) {
    if (!hex) return 'rgba(184,169,232,' + a + ')';
    const m = hex.replace('#', '').match(/^([0-9a-f]{3,8})$/i);
    if (!m) return 'rgba(184,169,232,' + a + ')';
    let s = m[1];
    if (s.length === 3) s = s.split('').map(c => c + c).join('');
    if (s.length === 6) {
      const r = parseInt(s.slice(0, 2), 16);
      const g = parseInt(s.slice(2, 4), 16);
      const b = parseInt(s.slice(4, 6), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    }
    return hex;
  }

  const HANDLERS = {
    wechat_friend: shareToWechatFriend,
    wechat_moments: shareToWechatMoments,
    xiaohongshu: shareToXiaohongshu,
    copy_link: copyLink,
    save_image: saveImage
  };

  let activeSheet = null;

  function closeSheet() {
    if (!activeSheet) return;
    const backdrop = activeSheet.querySelector('[data-share-backdrop]');
    const sheet = activeSheet.querySelector('[data-sheet]');
    if (backdrop) backdrop.classList.remove('open');
    if (sheet) sheet.classList.remove('open');
    setTimeout(() => {
      if (activeSheet && activeSheet.parentNode) activeSheet.parentNode.removeChild(activeSheet);
      activeSheet = null;
    }, 320);
  }

  function invoke(channelId, payload) {
    vibrate([20]);
    const handler = HANDLERS[channelId];
    if (!handler) return;
    const result = handler(payload);
    if (result && typeof result.then === 'function') {
      result.then(r => {
        if (r && r.ok && !r.pending) {
          setTimeout(closeSheet, 700);
        } else if (r && !r.ok && !r.fallback) {
          showToast('分享失败，请稍后再试');
        }
      });
    }
  }

  function open(userPayload) {
    if (activeSheet) closeSheet();
    const payload = Object.assign({
      title: document.title || '街角情绪盲盒',
      desc: '把 15 分钟步行圈变成有温度的情绪空间',
      link: window.location.href,
      image: 'assets/image/card-img.png',
      tags: []
    }, userPayload || {});
    activeSheet = buildSheet(payload);
    document.body.appendChild(activeSheet);

    const backdrop = activeSheet.querySelector('[data-share-backdrop]');
    const closeBtn = activeSheet.querySelector('[data-share-close]');
    backdrop.addEventListener('click', closeSheet);
    closeBtn.addEventListener('click', closeSheet);

    function escHandler(e) {
      if (e.key === 'Escape') { closeSheet(); document.removeEventListener('keydown', escHandler); }
    }
    document.addEventListener('keydown', escHandler);
  }

  window.XJShare = { open, closeSheet, detect, CHANNELS };
})();
