/**
 * 街角情绪盲盒 — 共享交互脚本
 * 处理：情绪选择、字数统计、底部卡片、微光粒子、震动反馈（模拟）、页面切换
 */

(function () {
  'use strict';

  const easeSoft = 'cubic-bezier(0.25, 1, 0.5, 1)';

  // 启动时立即应用动态时段主题，避免视觉闪屏
  let currentTheme = null;
  if (window.XJTheme) {
    currentTheme = window.XJTheme.pickTheme();
    window.XJTheme.applyTheme(currentTheme);
  }

  // ===== 工具函数 =====
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function vibrate(pattern = [40, 300, 40]) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  }

  function createParticle(x, y, color = 'var(--color-primary)') {
    const particle = document.createElement('span');
    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: ${color};
      box-shadow: 0 0 16px ${color};
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%) scale(0);
      opacity: 0.9;
    `;
    document.body.appendChild(particle);

    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 80;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    const animation = particle.animate([
      { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.9 },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1)`, opacity: 0.6, offset: 0.4 },
      { transform: `translate(calc(-50% + ${tx * 1.4}px), calc(-50% + ${ty * 1.4}px)) scale(0)`, opacity: 0 }
    ], {
      duration: 700 + Math.random() * 300,
      easing: easeSoft,
      fill: 'forwards'
    });

    animation.onfinish = () => particle.remove();
  }

  function burstParticles(x, y, count = 14) {
    const colors = [
      'var(--color-primary)',
      'var(--color-accent-pink)',
      'var(--color-accent-blue)',
      'var(--color-accent-mint)',
      'var(--color-secondary)'
    ];
    for (let i = 0; i < count; i++) {
      createParticle(x, y, colors[Math.floor(Math.random() * colors.length)]);
    }
  }

  // ===== 底部 Sheet =====
  function openSheet(sheetId) {
    const backdrop = $(`[data-sheet-backdrop="${sheetId}"]`);
    const sheet = $(`[data-sheet="${sheetId}"]`);
    if (!sheet) return;
    if (backdrop) backdrop.classList.add('open');
    sheet.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSheet(sheetId) {
    const backdrop = $(`[data-sheet-backdrop="${sheetId}"]`);
    const sheet = $(`[data-sheet="${sheetId}"]`);
    if (!sheet) return;
    if (backdrop) backdrop.classList.remove('open');
    sheet.classList.remove('open');
    document.body.style.overflow = '';
  }

  function initSheets() {
    $$('[data-open-sheet]').forEach(btn => {
      btn.addEventListener('click', () => openSheet(btn.dataset.openSheet));
    });

    $$('[data-close-sheet]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.closeSheet || btn.closest('[data-sheet]')?.dataset.sheet;
        if (id) closeSheet(id);
      });
    });

    $$('[data-sheet-backdrop]').forEach(backdrop => {
      backdrop.addEventListener('click', () => closeSheet(backdrop.dataset.sheetBackdrop));
    });

    // 下滑关闭（简单实现）
    $$('[data-sheet]').forEach(sheet => {
      let startY = 0;
      sheet.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
      sheet.addEventListener('touchend', e => {
        const endY = e.changedTouches[0].clientY;
        if (endY - startY > 80 && e.target.closest('.sheet-header')) {
          closeSheet(sheet.dataset.sheet);
        }
      }, { passive: true });
    });
  }

  // ===== 情绪选择 =====
  function initMoodSelector() {
    $$('.mood-option').forEach(option => {
      option.addEventListener('click', () => {
        $$('.mood-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        const input = $('input[name="mood"]');
        if (input) input.value = option.dataset.mood;
      });
    });
  }

  // ===== 字数统计 =====
  function initCharCounter() {
    $$('[data-char-counter]').forEach(counter => {
      const targetId = counter.dataset.charCounter;
      const input = targetId ? $('#' + targetId) : counter.previousElementSibling;
      if (!input) return;

      const max = parseInt(counter.dataset.max, 10) || 140;
      const update = () => {
        const len = input.value.length;
        counter.textContent = `${len}/${max}`;
        counter.classList.toggle('text-error', len > max);
        if (len > max) input.value = input.value.slice(0, max);
      };

      input.addEventListener('input', update);
      update();
    });
  }

  // ===== 接收此温柔 =====
  // 队列分支时序（叠加按钮"已接收"反馈后开始切换）：
  //   0ms    粒子 + 震动 + 按钮"已接收"成功态
  //   ~320ms 旧卡离场动画启动（card-exit 520ms：缩放 + 淡出 + 旋转）
  //   520ms  旧卡完全隐藏 → 切换数据 + 重置按钮 → 新卡从底部弹性弹起（card-rise 720ms）
  //   1240ms 清除入场类（动画已停稳，无回弹残留）
  function initReceiveButton() {
    $$('[data-receive]').forEach(btn => {
      btn.addEventListener('click', e => {
        const card = btn.closest('[data-proximity-card]');
        const isQueue = card && card.hasAttribute('data-pickup-queue');

        // 1) 立刻给反馈：粒子 + 震动 + 按钮成功态
        const rect = btn.getBoundingClientRect();
        burstParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 18);
        vibrate([60, 240, 60]);

        btn.disabled = true;
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 已接收这份温柔`;
        btn.classList.add('btn-success');

        // 2) 队列分支：更短的成功态停顿，让切换动画紧跟
        const holdMs = isQueue ? 320 : 900;
        setTimeout(() => {
          if (!card) return;

          if (isQueue) {
            advancePickupQueue(card);
            return;
          }

          // 默认行为（单份温柔）：简单的淡出 + 关闭 sheet
          card.style.transition = 'opacity 400ms, transform 400ms';
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => closeSheet(card.dataset.sheet || 'pickup'), 350);
        }, holdMs);
      });
    });
  }

  // ===== 多份温柔队列（pickup 页面专用） =====
  // 设计原则：每条温柔用不同的修辞 / 句式 / 感官 / 视角 / 时段 / 情绪副层，
  // 避免模板化重复。共同守住"被接住"的温柔基调。
  const PICKUP_QUEUE = [
    {
      // ① 拟人 · 长铺短收 · 视觉 · 黄昏街角 · 第一人称观察 · 等待的小确幸
      img: 'assets/image/card-img.png',
      alt: '黄昏街角的路灯下，一只橘猫眯着眼，影子被拉成一条长线',
      mood: '暖意 · 橙',
      moodClass: 'badge-mood-warm',
      time: '周二 17:20 · 24°C 微风',
      quote: '"下班路上，这只橘猫又蹲在路灯下。它眯着眼看我，影子被拉成一条长线——好像我才是被它接住的那一个。"',
      author: '来自 · 一位等猫的路人',
      tone: 'warm'
    },
    {
      // ② 通感 + 反问 · 短句堆叠 + 反问收束 · 嗅觉/触觉 · 清晨巷口 · 第二人称对话 · 意外的甜
      img: 'assets/image/card-guihuagao.jpeg',
      alt: '清晨巷口的早餐摊，刚出锅的桂花糕冒着热气，糯米香气在空气里散开',
      mood: '微甜 · 粉',
      moodClass: 'badge-mood-sweet',
      time: '周四 08:10 · 18°C 晴',
      quote: '"桂花糕刚出锅，巷口就闻得见甜。老板娘递纸袋时，指尖还沾着糯米粉——她说『今天做多了，剩下的归你』。你看，连陌生人都想替你留一份。"',
      author: '来自 · 一位识路的糯米商贩',
      tone: 'sweet'
    },
    {
      // ③ 排比 + 留白 · 慢节奏长句 + 句号呼吸 · 触觉/听觉 · 午后公园 · 第一人称沉浸 · 卸下防备的松弛
      img: 'assets/image/card-snap.jpeg',
      alt: '午后公园里随手拍下的瞬间，长椅边的光斑落在树叶上',
      mood: '松弛 · 绿',
      moodClass: 'badge-mood-relaxed',
      time: '周六 15:42 · 22°C 微风',
      quote: '"公园长椅被太阳晒得刚刚好。闭眼五分钟，醒来发现小狗也来蹭了一席之地——它没叫我，我也不叫它，风把树叶推过来又推走。"',
      author: '来自 · 一位午后假寐的园丁',
      tone: 'relaxed'
    },
    {
      // ④ 比喻 + 自问自答 · 短开篇 + 长铺 + 反问式总结 · 听觉/视觉 · 深夜便利店 · 第一人称内省 · 与疲惫和解
      img: 'assets/image/card-familymark.jpeg',
      alt: '雨夜街角的便利店，玻璃门里透出暖黄灯光，招牌在湿漉漉的街面上映出倒影',
      mood: '平静 · 蓝',
      moodClass: 'badge-mood-calm',
      time: '周五 22:55 · 16°C 小雨',
      quote: '"你走过的每条街，最后都通向一盏亮着的灯。便利店风铃一推就响，老板没抬头，只把热好的饭团往你这边推了推——这城市总有办法接住一个疲惫的人。"',
      author: '来自 · 一位在便利店打烊的晚归人',
      tone: 'calm'
    },
    {
      // ⑤ 拟物 + 通感 · 散文诗式自由断句 · 视觉 + 时间感 · 下午桥上 · 第三人称旁观 · 悬浮的空灵感
      img: 'assets/image/card-tree.jpeg',
      alt: '桥畔的柳树垂下枝条，河水缓缓流过，光影在树梢间慢慢游走',
      mood: '发呆 · 灰',
      moodClass: 'badge-mood-daydream',
      time: '周日 14:08 · 19°C 多云',
      quote: '"下午三点，桥上没人说话。河水把云影揉碎又拼好，对岸的柳条垂下来，像在发呆——我猜它们也累了，只是懒得承认。"',
      author: '来自 · 一位假装看风景的旁观者',
      tone: 'daydream'
    }
  ];

  let pickupIndex = 0;

  function setPickupCardData(card, item) {
    const img    = card.querySelector('[data-field="img"]');
    const mood   = card.querySelector('[data-field="mood"]');
    const time   = card.querySelector('[data-field="time"]');
    const quote  = card.querySelector('[data-field="quote"]');
    const author = card.querySelector('[data-field="author"]');
    const cover  = card.querySelector('.media-cover');
    const ind    = card.querySelector('[data-queue-indicator]');

    if (img) {
      img.alt = item.alt;
      // 仅当图片路径真的变化时，重新触发 is-loaded 淡入
      if (img.getAttribute('src') !== item.img) {
        const cover_ = img.closest('.media-cover');
        if (cover_) cover_.classList.remove('is-loaded');
        img.classList.remove('is-error');
        img.src = item.img;
      }
    }
    if (mood) {
      mood.textContent = item.mood;
      // 替换为对应情绪的 badge-mood-* 类
      mood.className = 'badge ' + item.moodClass;
    }
    if (time)   time.textContent = item.time;
    if (quote)  quote.textContent = item.quote;
    if (author) author.textContent = item.author;
    if (cover)  cover.setAttribute('data-tone', item.tone);
    if (ind)    ind.textContent = (pickupIndex + 1) + ' / ' + PICKUP_QUEUE.length;
  }

  function resetPickupButton(card) {
    const btn = card.querySelector('[data-receive]');
    if (!btn) return;
    btn.disabled = false;
    btn.classList.remove('btn-success');
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> 接收此温柔`;
  }

  // 卡片切换：先让旧卡以"缩放 + 淡出 + 旋转"完全离场，
  // 待其彻底隐藏（opacity 归零）后再把新卡从底部弹性弹出，避免新旧重叠/闪烁。
  // 动画时长全部在 CSS 端（card-exit 520ms / card-rise 720ms）。
  const EXIT_MS = 520;     // 必须 >= card-exit 时长，保证旧卡完全离场后才换新
  const ENTER_MS = 760;    // 略大于 card-rise 720ms，确保弹性入场完整播放后再清类

  function advancePickupQueue(card) {
    // 起手：清除可能残留的入场态，再让旧卡离场（缩放 + 淡出 + 旋转）
    card.classList.remove('is-entering');
    card.classList.add('is-leaving');

    // EXIT_MS 后：旧卡 opacity 已为 0，安全切换内容并触发新卡入场
    setTimeout(() => {
      pickupIndex++;

      // 末位：保持离场状态直接跳走（动画在跳转间被浏览器裁断，无残留）
      if (pickupIndex >= PICKUP_QUEUE.length) {
        setTimeout(() => { window.location.href = 'index.html'; }, 360);
        return;
      }

      // 切换内容 + 重置按钮（此刻旧卡不可见，文字/图片替换无闪烁）
      setPickupCardData(card, PICKUP_QUEUE[pickupIndex]);
      resetPickupButton(card);

      // 同步进度指示器与氛围色调
      const indicator = document.querySelector('[data-queue-indicator]');
      if (indicator) indicator.textContent = (pickupIndex + 1) + ' / ' + PICKUP_QUEUE.length;
      const cover = card.querySelector('.media-cover');
      if (cover) cover.setAttribute('data-tone', PICKUP_QUEUE[pickupIndex].tone);

      // 触发新卡入场：清除离场态 → 加 is-entering（card-rise 关键帧接管）
      card.classList.remove('is-leaving');
      card.classList.add('is-entering');

      // 强制 reflow：让浏览器把 is-entering 的 0% 初始位姿"记下来"再开始过渡
      // eslint-disable-next-line no-unused-expressions
      void card.offsetWidth;

      // 等弹性入场完整播放（720ms）后再移除类，避免动画被提前截断导致"跳变"
      setTimeout(() => { card.classList.remove('is-entering'); }, ENTER_MS);
    }, EXIT_MS);
  }

  // ===== 页面加载：用队列数据渲染第一份温柔 =====
  // 让 HTML 模板中的占位内容被 PICKUP_QUEUE[0] 覆盖，避免重复维护两套文案
  function initPickupQueue() {
    const card = document.querySelector('[data-pickup-queue]');
    if (!card || !PICKUP_QUEUE.length) return;

    // 数量来源优先级：URL ?n= > localStorage > 默认 5
    // 收到 N 后，截取前 N 份作为本次会话的队列，指示器同步为 1 / N
    let count = parseInt(new URLSearchParams(location.search).get('n') || '', 10);
    if (!(count >= 1 && count <= 5)) {
      try { count = parseInt(localStorage.getItem('xj_nearby_count') || '', 10) || 5; } catch (_) { count = 5; }
    }
    count = Math.max(1, Math.min(5, count));
    const queue = PICKUP_QUEUE.slice(0, count);

    // 替换原数组引用，使 advancePickupQueue 继续从同一份队列推进
    PICKUP_QUEUE.length = 0;
    queue.forEach(item => PICKUP_QUEUE.push(item));

    pickupIndex = 0;
    setPickupCardData(card, PICKUP_QUEUE[0]);

    const indicator = document.querySelector('[data-queue-indicator]');
    if (indicator) indicator.textContent = '1 / ' + PICKUP_QUEUE.length;
  }

  // ===== 提交发布 =====
  function initReleaseForm() {
    const form = $('#release-form');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const mood = $('input[name="mood"]')?.value;
      if (!mood) {
        showToast('请先选择一种情绪颜色');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const rect = btn.getBoundingClientRect();
      burstParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);
      vibrate([50, 200, 50, 200, 50]);

      btn.disabled = true;
      btn.innerHTML = '正在封存…';

      setTimeout(() => {
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> 已留在这个街角`;
        showToast('温柔盲盒已种下，72 小时后自然消散');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1200);
      }, 1200);
    });
  }

  // ===== Toast =====
  function showToast(message, duration = 2600) {
    let toast = $('#app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.style.cssText = `
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: var(--color-surface-elevated);
        backdrop-filter: var(--backdrop-glass-strong);
        border: 1px solid var(--color-border);
        border-radius: 9999px;
        padding: 12px 20px;
        box-shadow: var(--shadow-xl);
        font-size: var(--type-body);
        color: var(--color-ink);
        opacity: 0;
        pointer-events: none;
        z-index: var(--z-toast);
        transition: opacity 260ms var(--ease-soft), transform 260ms var(--ease-soft);
        white-space: nowrap;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-20px)';
    }, duration);
  }

  // ===== Tab Bar Active State + Sliding Indicator + Entrance Rhythm =====
  function initTabBar() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const bars = $$('.tab-bar');

    bars.forEach(bar => {
      const items = $$('.tab-item', bar);
      let activeItem = null;

      items.forEach(item => {
        const href = item.getAttribute('href') || item.dataset.href;
        if (href && (href === path || (path === '' && href === 'index.html'))) {
          item.classList.add('active');
          item.setAttribute('aria-selected', 'true');
          activeItem = item;
        } else {
          item.setAttribute('aria-selected', 'false');
        }

        // Tactile press feedback before navigation
        item.addEventListener('pointerdown', () => {
          item.style.transform = 'scale(0.96)';
        });
        item.addEventListener('pointerup', () => {
          item.style.transform = '';
        });
        item.addEventListener('pointerleave', () => {
          item.style.transform = '';
        });
      });

      const indicator = $('.tab-indicator', bar);
      if (!indicator) return;

      function positionIndicator(target = activeItem) {
        if (!target || !bar.contains(target)) return;
        const barRect = bar.getBoundingClientRect();
        const itemRect = target.getBoundingClientRect();
        const left = itemRect.left + itemRect.width / 2 - barRect.left;
        indicator.style.left = `${left}px`;
      }

      // Hover/focus slides the indicator as a preview
      items.forEach(item => {
        item.addEventListener('mouseenter', () => positionIndicator(item));
        item.addEventListener('focus', () => positionIndicator(item));
        item.addEventListener('mouseleave', () => positionIndicator(activeItem));
        item.addEventListener('blur', () => positionIndicator(activeItem));
      });

      // Initial positioning + staggered entrance
      requestAnimationFrame(() => {
        positionIndicator();
        requestAnimationFrame(() => bar.classList.add('is-ready'));
      });

      // Keep indicator aligned after resize / orientation change
      window.addEventListener('resize', () => positionIndicator());
      window.addEventListener('orientationchange', () => setTimeout(positionIndicator, 100));
    });
  }

  // ===== 呼吸光点随机位置 =====
  // ===== 呼吸光点：可爱表情球 =====
  // 4 套不同表情（柔和、俏皮、走神、温暖），分别对应 4 种情绪色
  const DOT_FACES = [
    // 0: 松弛（relaxed 紫）- 豆豆眼 + 弯弯嘴
    '<svg class="dot-face" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7.8" cy="10" r="1.3" fill="currentColor" stroke="none"></circle><circle cx="16.2" cy="10" r="1.3" fill="currentColor" stroke="none"></circle><path d="M9.2 15.2c1.1 1.2 2.5 1.9 3.8 1.9s2.7-.7 3.8-1.9"></path></svg>',
    // 1: 微甜（sweet 粉）- 眯眯眼 + 开心嘴
    '<svg class="dot-face" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 10.5c1.2-1.4 2.8-1.4 4 0"></path><path d="M13.5 10.5c1.2-1.4 2.8-1.4 4 0"></path><path d="M8.5 15.5c1.1 1.4 2.6 2.1 3.5 2.1s2.4-.7 3.5-2.1"></path></svg>',
    // 2: 发呆（daydream 蓝）- 圆点眼 + 小 o 嘴
    '<svg class="dot-face" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7.8" cy="10" r="1.3" fill="currentColor" stroke="none"></circle><circle cx="16.2" cy="10" r="1.3" fill="currentColor" stroke="none"></circle><circle cx="12" cy="16" r="1.4" fill="currentColor" stroke="none"></circle></svg>',
    // 3: 暖意（warm 黄）- 圆点眼 + 吐舌笑
    '<svg class="dot-face" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7.8" cy="10" r="1.3" fill="currentColor" stroke="none"></circle><circle cx="16.2" cy="10" r="1.3" fill="currentColor" stroke="none"></circle><path d="M9 15c1 1.4 2.4 2.2 3.5 2.2 1.1 0 2.5-.8 3.5-2.2"></path><circle cx="13.6" cy="17.2" r="1.1" fill="currentColor" stroke="none"></circle></svg>'
  ];

  function initBreathingDots() {
    const canvas = $('.compass-canvas');
    if (!canvas) return;

    // 附近温柔数量随机 1–5，每次进入首页刷新都不同
    const DOT_COUNT = 1 + Math.floor(Math.random() * 5);
    try { localStorage.setItem('xj_nearby_count', String(DOT_COUNT)); } catch (_) { /* private mode 兜底 */ }
    const colors = [
      'var(--dot-color-1, var(--mood-relaxed))',
      'var(--dot-color-2, var(--mood-sweet))',
      'var(--dot-color-3, var(--mood-daydream))',
      'var(--dot-color-4, var(--mood-warm))'
    ];
    for (let i = 0; i < DOT_COUNT; i++) {
      const dot = document.createElement('div');
      dot.className = 'breathing-dot';
      // 可爱豆：宽度略窄、高度略长，形成柔软椭圆/豆形
      const w = 26 + Math.random() * 12; // 26-38px
      const h = 34 + Math.random() * 14; // 34-48px
      const left = 14 + Math.random() * 72;
      const top = 14 + Math.random() * 72;
      const delay = (Math.random() * 1.5).toFixed(2);
      const color = colors[i % colors.length];

      // 计算到中心 (50,50) 的欧式距离，0–50（保持原逻辑，50m 近场仍可用）
      const dx = left - 50;
      const dy = top - 50;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 固定 1.5s 周期呼吸缩放
      const anim = `breathe 1.5s ease-in-out ${delay}s infinite`;

      dot.style.cssText = [
        'left:' + left + '%',
        'top:' + top + '%',
        'width:' + w + 'px',
        'height:' + h + 'px',
        '--dot-bg:' + color,
        '--dot-delay:' + delay + 's',
        'animation:' + anim
      ].join(';');

      // 内嵌表情
      dot.innerHTML = DOT_FACES[i % DOT_FACES.length];

      dot.dataset.distance = distance.toFixed(1);
      dot.dataset.origAnimation = anim;
      canvas.appendChild(dot);
    }

    // 同步下方卡片"附近还有 N 份温柔"：画布光点数 = 卡片份数（严格一致）
    const nearbyNumber = document.querySelector('.card-glass [style*="color: var(--color-primary)"]');
    if (nearbyNumber) nearbyNumber.textContent = String(DOT_COUNT);

    // 同步"去拾取温柔"链接：把当前随机数带给 pickup 页，保证指示器与队列数量一致
    const pickupLink = document.querySelector('.card-glass a[href$="pickup.html"]');
    if (pickupLink) pickupLink.setAttribute('href', 'pickup.html?n=' + DOT_COUNT);
  }

  // ===== 视角模式切换：15min 全圈 ↔ 50m 近场 =====
  function initViewModeToggle() {
    const canvas = $('#compass-canvas');
    if (!canvas) return;
    const scopeLabel = $('#compass-scope');
    const nearbyNumber = document.querySelector('.card-glass [style*="color: var(--color-primary)"]');
    const nearbyHint = document.querySelector('.card-glass .text-caption');
    const originHintText = nearbyHint ? nearbyHint.textContent : '';

    const NEAR_FIELD_RADIUS = 18; // 距中心 %，对应 50m 近场
    const LOCK_MS = 280; // 略大于动画，留出安全缓冲

    let isNearField = false;
    let isAnimating = false;
    const originNearbyText = nearbyNumber ? nearbyNumber.textContent.trim() : '';

    function updateDots(nearField) {
      $$('.breathing-dot', canvas).forEach(dot => {
        const distance = parseFloat(dot.dataset.distance || '50');
        const isFar = distance > NEAR_FIELD_RADIUS;
        if (nearField && isFar) {
          dot.style.transition = 'opacity 250ms ease';
          dot.style.animation = 'none';
          // 强制 reflow 以应用 animation:none
          void dot.offsetWidth;
          dot.style.opacity = '0';
        } else if (!nearField) {
          dot.style.transition = 'opacity 250ms ease';
          dot.style.opacity = '0.5';
          setTimeout(() => {
            dot.style.animation = dot.dataset.origAnimation || '';
            dot.style.opacity = '';
            setTimeout(() => { dot.style.transition = ''; }, 260);
          }, 260);
        }
      });
    }

    function updateNearbyCard(nearField) {
      if (!nearbyNumber) return;
      let nearCount = 0;
      $$('.breathing-dot', canvas).forEach(dot => {
        const d = parseFloat(dot.dataset.distance || '50');
        if (d <= NEAR_FIELD_RADIUS) nearCount++;
      });
      if (nearField) {
        nearbyNumber.textContent = String(nearCount);
        if (nearbyHint) nearbyHint.textContent = '近场 50m 内的温柔';
      } else {
        nearbyNumber.textContent = originNearbyText || '3';
        if (nearbyHint) nearbyHint.textContent = originHintText;
      }
    }

    function toggle() {
      if (isAnimating) return;
      isAnimating = true;
      canvas.classList.add('is-locked');
      isNearField = !isNearField;
      canvas.classList.toggle('is-near-field', isNearField);
      canvas.setAttribute('aria-label', isNearField
        ? '切换视图模式：当前 50m 近场，点击切换 15min 全圈'
        : '切换视图模式：当前 15min 全圈，点击切换 50m 近场'
      );
      if (scopeLabel) {
        scopeLabel.textContent = isNearField
          ? '50m 近场 · 点击回到全圈'
          : '15min 步行圈 · 点击切换近场';
      }
      updateDots(isNearField);
      updateNearbyCard(isNearField);
      vibrate([20]);

      setTimeout(() => {
        isAnimating = false;
        canvas.classList.remove('is-locked');
      }, LOCK_MS);
    }

    canvas.addEventListener('click', toggle);
    canvas.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  }

  // ===== 媒体图容器：加载成功/失败状态管理 =====
  function initMediaCover() {
    $$('.media-cover').forEach(container => {
      const img = container.querySelector('img');
      if (!img) return;

      const markLoaded = () => container.classList.add('is-loaded');
      const markError = () => {
        img.classList.add('is-error');
        container.classList.add('is-error');
      };

      if (img.complete && img.naturalWidth > 0) {
        markLoaded();
      } else if (img.complete && img.naturalWidth === 0) {
        markError();
      } else {
        img.addEventListener('load', markLoaded, { once: true });
        img.addEventListener('error', markError, { once: true });
      }
    });
  }

  // ===== 发布页：拍照与录音交互 =====
  function initMediaCapture() {
    const capture = $('#media-capture');
    const cameraBtn = $('#btn-camera');
    const audioBtn = $('#btn-audio');
    const imagePreview = $('#capture-image-preview');
    const removeImage = $('#btn-remove-image');
    const removeAudio = $('#btn-remove-audio');
    const playBtn = $('#btn-play-audio');
    const wave = $('#audio-wave');
    const timeDisplay = $('#audio-time');
    const statusDisplay = $('#audio-status');

    if (!capture) return;

    // 生成波形条
    if (wave) {
      for (let i = 0; i < 12; i++) {
        const bar = document.createElement('div');
        bar.className = 'wave-bar';
        bar.style.setProperty('--i', i);
        bar.style.height = '8px';
        wave.appendChild(bar);
      }
    }

    function setState(state) {
      capture.dataset.state = state;
      capture.classList.toggle('has-media', state !== 'empty');
    }

    function formatTime(seconds) {
      const s = Math.max(0, Math.floor(seconds));
      const m = Math.floor(s / 60);
      const rem = s % 60;
      return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
    }

    // 拍照：仅显示预设示意图，不调用真实摄像头、文件选择或保存功能
    if (cameraBtn) {
      cameraBtn.addEventListener('click', () => {
        imagePreview.src = 'assets/image/uploading image.png';
        setState('image');
        vibrate([30, 60, 30]);
        showToast('照片示意图已添加');
      });
    }

    if (removeImage) {
      removeImage.addEventListener('click', e => {
        e.stopPropagation();
        imagePreview.src = '';
        setState('empty');
        showToast('已移除照片');
      });
    }

    // 录音：模拟 5 秒录音，带波形动画与倒计时
    let recording = false;
    let audioDuration = 5;
    let recordTimer = null;
    let playTimer = null;
    let isPlaying = false;

    function startRecording() {
      if (recording) return;
      recording = true;
      setState('audio');
      capture.querySelector('.capture-audio').classList.add('is-recording');
      capture.querySelector('.capture-audio').classList.remove('has-recording');
      wave.classList.add('is-recording');
      statusDisplay.textContent = '正在录音…';
      audioBtn.disabled = true;
      audioBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><rect x="9" y="9" width="6" height="6" rx="1"></rect></svg> 录音中`;

      let elapsed = 0;
      timeDisplay.textContent = `${formatTime(elapsed)} / ${formatTime(audioDuration)}`;
      vibrate([40, 120]);

      recordTimer = setInterval(() => {
        elapsed++;
        timeDisplay.textContent = `${formatTime(elapsed)} / ${formatTime(audioDuration)}`;
        // 随机化波形高度，增强临场感
        wave.querySelectorAll('.wave-bar').forEach(bar => {
          bar.style.height = Math.max(8, Math.min(48, 8 + Math.random() * 40)) + 'px';
        });

        if (elapsed >= audioDuration) {
          stopRecording();
        }
      }, 1000);
    }

    function stopRecording() {
      if (!recording) return;
      recording = false;
      clearInterval(recordTimer);
      wave.classList.remove('is-recording');
      capture.querySelector('.capture-audio').classList.remove('is-recording');
      capture.querySelector('.capture-audio').classList.add('has-recording');
      statusDisplay.textContent = '轻触播放回放';
      timeDisplay.textContent = `00:00 / ${formatTime(audioDuration)}`;
      audioBtn.disabled = false;
      audioBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg> 重新录音`;
      playBtn.disabled = false;
      vibrate([60, 80]);
      showToast('录音完成，可回放');

      // 重置波形高度
      wave.querySelectorAll('.wave-bar').forEach(bar => { bar.style.height = '8px'; });
    }

    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        if (recording) return;
        startRecording();
      });
    }

    // 播放/暂停回放
    function togglePlayback() {
      const audioWrap = capture.querySelector('.capture-audio');
      if (isPlaying) {
        isPlaying = false;
        clearInterval(playTimer);
        audioWrap.classList.remove('is-playing');
        statusDisplay.textContent = '轻触播放回放';
        timeDisplay.textContent = `00:00 / ${formatTime(audioDuration)}`;
        wave.querySelectorAll('.wave-bar').forEach(bar => { bar.style.height = '8px'; });
      } else {
        isPlaying = true;
        audioWrap.classList.add('is-playing');
        statusDisplay.textContent = '正在回放…';
        let pos = 0;
        timeDisplay.textContent = `${formatTime(pos)} / ${formatTime(audioDuration)}`;

        playTimer = setInterval(() => {
          pos++;
          timeDisplay.textContent = `${formatTime(pos)} / ${formatTime(audioDuration)}`;
          wave.querySelectorAll('.wave-bar').forEach(bar => {
            bar.style.height = Math.max(8, Math.min(44, 8 + Math.random() * 36)) + 'px';
          });
          if (pos >= audioDuration) {
            clearInterval(playTimer);
            isPlaying = false;
            audioWrap.classList.remove('is-playing');
            statusDisplay.textContent = '轻触播放回放';
            timeDisplay.textContent = `00:00 / ${formatTime(audioDuration)}`;
            wave.querySelectorAll('.wave-bar').forEach(bar => { bar.style.height = '8px'; });
          }
        }, 1000);
      }
    }

    if (playBtn) {
      playBtn.addEventListener('click', togglePlayback);
    }

    if (removeAudio) {
      removeAudio.addEventListener('click', e => {
        e.stopPropagation();
        if (recording) stopRecording();
        if (isPlaying) togglePlayback();
        setState('empty');
        capture.querySelector('.capture-audio').classList.remove('has-recording');
        statusDisplay.textContent = '准备录音';
        timeDisplay.textContent = `00:00 / ${formatTime(audioDuration)}`;
        audioBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg> 录音 5s`;
        showToast('已移除录音');
      });
    }
  }

  // ===== 我的页面：资料交互 =====
  function initProfile() {
    // 功能入口点击：行内跳转（带 href 的元素走原生导航），其他未上线项弹 Toast 占位
    $$('[data-func]').forEach(row => {
      const isLink = row.tagName === 'A' && row.getAttribute('href');
      if (isLink) return; // 链接元素直接交给浏览器处理
      row.addEventListener('click', () => showToast(`「${row.dataset.func}」即将上线`));
    });

    // 头像更换
    $$('[data-open-avatar]').forEach(btn => {
      btn.addEventListener('click', () => openSheet('avatar'));
    });
    $$('[data-avatar-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.avatarAction;
        closeSheet('avatar');
        const avatar = $('#profile-avatar');
        if (avatar) {
          const hues = [265, 20, 200, 150, 330, 48];
          const h = hues[Math.floor(Math.random() * hues.length)];
          avatar.style.background = `linear-gradient(135deg, hsl(${h},60%,78%) 0%, hsl(${(h + 40) % 360},60%,84%) 100%)`;
        }
        showToast(action === 'camera' ? '已通过相机更新头像' : '已从相册更新头像');
      });
    });

    // 昵称编辑
    $$('[data-open-nickname]').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = $('#nickname-input');
        const display = $('#profile-nickname');
        if (input && display) input.value = display.textContent.trim();
        openSheet('nickname');
      });
    });
    const saveBtn = $('[data-save-nickname]');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const input = $('#nickname-input');
        const display = $('#profile-nickname');
        const val = (input.value || '').trim();
        if (!val) { showToast('昵称不能为空'); return; }
        if (display) display.textContent = val;
        closeSheet('nickname');
        showToast('昵称已更新');
      });
    }
    const nickInput = $('#nickname-input');
    const nickCounter = $('[data-nickname-counter]');
    if (nickInput && nickCounter) {
      const update = () => {
        nickCounter.textContent = `${nickInput.value.length}/20`;
        if (nickInput.value.length > 20) nickInput.value = nickInput.value.slice(0, 20);
      };
      nickInput.addEventListener('input', update);
      update();
    }

    // 退出登录
    const logout = $('#btn-logout');
    if (logout) {
      logout.addEventListener('click', () => {
        if (typeof confirm === 'function' && confirm('确定要退出登录吗？')) {
          showToast('已退出登录');
        }
      });
    }
  }

  // ===== 我的页面：下拉刷新 =====
  function initPullToRefresh() {
    const ptr = $('#ptr');
    if (!ptr) return;
    let startY = 0, pulling = false, refreshing = false;

    document.addEventListener('touchstart', e => {
      if (refreshing) return;
      if (window.scrollY <= 0) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    }, { passive: true });

    document.addEventListener('touchmove', e => {
      if (!pulling || refreshing) return;
      const delta = e.touches[0].clientY - startY;
      if (delta > 0 && window.scrollY <= 0) {
        const pull = Math.min(delta * 0.5, 80);
        ptr.style.transform = `translateY(${pull}px)`;
        ptr.style.opacity = String(Math.min(pull / 60, 1));
        ptr.querySelector('.ptr-text').textContent = pull > 60 ? '松开刷新' : '下拉刷新';
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      if (!pulling || refreshing) return;
      pulling = false;
      const m = ptr.style.transform.match(/[\d.]+/);
      const pull = m ? parseFloat(m[0]) : 0;
      if (pull >= 60) {
        refreshing = true;
        ptr.style.transition = 'transform 200ms ease';
        ptr.style.transform = 'translateY(50px)';
        ptr.querySelector('.ptr-spinner').classList.add('spin');
        ptr.querySelector('.ptr-text').textContent = '刷新中…';
        setTimeout(() => {
          ptr.querySelector('.ptr-spinner').classList.remove('spin');
          ptr.style.transform = 'translateY(0)';
          ptr.style.opacity = '0';
          refreshing = false;
          showToast('已是最新内容');
          $$('.stat-num').forEach(el => {
            const base = parseInt(el.dataset.base || '0', 10);
            el.textContent = base + Math.floor(Math.random() * 5);
          });
        }, 1200);
      } else {
        ptr.style.transition = 'transform 200ms ease';
        ptr.style.transform = 'translateY(0)';
        ptr.style.opacity = '0';
      }
      setTimeout(() => { ptr.style.transition = ''; }, 220);
    }, { passive: true });
  }

  // ===== 我的页面：上拉加载更多 =====
  function initInfiniteScroll() {
    const list = $('#activity-list');
    if (!list) return;
    const pool = [
      { color: 'var(--mood-sweet)', title: '你收藏了一份温柔', desc: '微甜 · 咖啡店的窗边云朵', time: '2 小时前' },
      { color: 'var(--mood-daydream)', title: '你浏览了晚霞盲盒', desc: '发呆 · 天桥上的月亮', time: '昨天' },
      { color: 'var(--mood-warm)', title: '你解锁了暖意盲盒', desc: '暖意 · 橘猫与晚霞', time: '昨天' },
      { color: 'var(--mood-relaxed)', title: '你种下了一份温柔', desc: '松弛 · 清晨公园长椅', time: '3 天前' },
      { color: 'var(--color-primary)', title: '收到一条新温柔提醒', desc: '附近有人留下了善意', time: '3 天前' },
      { color: 'var(--mood-sweet)', title: '你收藏了发呆盲盒', desc: '发呆 · 河流与风声', time: '上周' },
    ];
    let loading = false, page = 0;
    const maxPages = 4;

    function makeSpinner() {
      const s = document.createElement('span');
      s.className = 'ptr-spinner';
      return s;
    }

    function createItem(d) {
      const item = document.createElement('div');
      item.className = 'activity-item animate-fade-in-up';
      item.innerHTML = `
        <div class="activity-icon" style="background:${d.color};"></div>
        <div class="activity-body">
          <p class="text-body" style="font-weight:600;">${d.title}</p>
          <p class="text-caption text-secondary">${d.desc}</p>
        </div>
        <span class="text-caption text-muted" style="flex-shrink:0;">${d.time}</span>`;
      return item;
    }

    function loadMore() {
      const loader = $('#activity-loader');
      if (loading || page >= maxPages) {
        if (loader && page >= maxPages) loader.textContent = '没有更多了';
        return;
      }
      loading = true;
      if (loader) {
        loader.style.display = 'flex';
        loader.textContent = '';
        loader.appendChild(makeSpinner());
      }
      setTimeout(() => {
        const start = (page * 2) % pool.length;
        pool.slice(start, start + 2).forEach(d => list.appendChild(createItem(d)));
        page++;
        loading = false;
        if (loader) {
          loader.style.display = 'none';
          if (page >= maxPages) loader.textContent = '没有更多了';
        }
      }, 700);
    }

    window.addEventListener('scroll', () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 120) {
        loadMore();
      }
    }, { passive: true });

    loadMore();
  }

  // ===== 设置页 =====
  function initSettings() {
    const page = $('#settings-page');
    if (!page) return;

    const labels = {
      theme: { light: '浅色', dark: '深色', system: '跟随系统' },
      language: { 'zh-CN': '简体中文', 'zh-TW': '繁體中文', en: 'English' }
    };

    // 主题选择即时保存
    $$('input[data-radio="theme"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const val = radio.value;
        const label = labels.theme[val] || val;
        const display = $('#theme-value');
        if (display) display.textContent = label;
        document.documentElement.setAttribute('data-theme-mode', val);
        if (val === 'dark') document.documentElement.classList.add('dark');
        else if (val === 'light') document.documentElement.classList.remove('dark');
        else {
          const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.toggle('dark', prefersDark);
        }
        showToast(`主题已切换为：${label}`);
      });
    });

    // 语言选择即时保存
    $$('input[data-radio="language"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const val = radio.value;
        const label = labels.language[val] || val;
        const display = $('#language-value');
        if (display) display.textContent = label;
        showToast(`语言已切换为：${label}`);
      });
    });

    // Toggle 开关变化提示
    $$('[data-setting]').forEach(toggle => {
      toggle.addEventListener('change', () => {
        const key = toggle.dataset.setting;
        const on = toggle.checked;
        const map = {
          'notify-nearby': '温柔提醒',
          'notify-resonance': '共鸣解锁通知',
          'notify-weekly': '每周情绪回顾',
          'haptic-feedback': '触感反馈',
          'ambient-sound': '环境音',
          'precise-location': '精确位置',
          'auto-cleanup': '数据自动清理'
        };
        showToast(`${map[key] || key}已${on ? '开启' : '关闭'}`);
      });
    });

    // 清理缓存
    const clearCache = $('[data-func="clear-cache"]');
    if (clearCache) {
      clearCache.addEventListener('click', () => {
        const cacheValue = $('#cache-value');
        if (cacheValue) cacheValue.textContent = '0 MB';
        const sizeText = page.querySelector('[data-sheet="storage-sheet"] .text-h1');
        if (sizeText) sizeText.textContent = '0 MB';
        const sheet = page.querySelector('[data-sheet="storage-sheet"]');
        if (sheet) closeSheet(sheet.dataset.sheet);
        showToast('缓存已清理');
      });
    }

    // 恢复默认设置
    const resetBtn = $('[data-func="reset-settings"]');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (typeof confirm === 'function' && confirm('确定要恢复默认设置吗？')) {
          $$('[data-setting]').forEach(t => {
            t.checked = ['notify-nearby', 'notify-resonance', 'haptic-feedback', 'precise-location', 'auto-cleanup'].includes(t.dataset.setting);
          });
          $$('input[data-radio="theme"][value="system"]').forEach(r => {
            r.checked = true;
            r.dispatchEvent(new Event('change'));
          });
          $$('input[data-radio="language"][value="zh-CN"]').forEach(r => {
            r.checked = true;
            r.dispatchEvent(new Event('change'));
          });
          showToast('已恢复默认设置');
        }
      });
    }

    // 设置页通用占位提示
    $$('#settings-page [data-func]').forEach(btn => {
      const func = btn.dataset.func;
      if (['clear-cache', 'reset-settings'].includes(func)) return;
      btn.addEventListener('click', () => showToast(`「${func}」即将上线`));
    });

    // 退出登录
    const logout = $('#settings-logout');
    if (logout) {
      logout.addEventListener('click', () => {
        if (typeof confirm === 'function' && confirm('确定要退出登录吗？')) {
          showToast('已退出登录');
        }
      });
    }
  }

  // ===== 本周情绪图卷 =====
  function initWeeklyChart() {
    const btnGen = $('#btn-generate-chart');
    if (!btnGen) return;
    const card = $('#weekly-chart-card');
    const canvas = $('#weekly-chart-canvas');
    const avgEl = $('#chart-avg');
    const domEl = $('#chart-dominant');
    const legendEl = $('#chart-legend');
    const btnExport = $('#btn-export-chart');
    const btnClose = $('#btn-close-chart');

    const MOODS = {
      warm:     { label: '暖意', color: '#FECEB6', index: 4 },
      sweet:    { label: '微甜', color: '#FFE5D9', index: 5 },
      relaxed:  { label: '松弛', color: '#D8E2DC', index: 4 },
      daydream: { label: '发呆', color: '#D8E1E9', index: 3 },
      calm:     { label: '平静', color: '#CFE3E0', index: 4 },
      anxious:  { label: '焦虑', color: '#F4C38A', index: 2 },
      low:      { label: '低落', color: '#C2CBD4', index: 2 },
      happy:    { label: '开心', color: '#FFD7BE', index: 5 },
    };
    const GREY = '#C9C9D0';

    // 情绪图卷顶部 emoji：3 种表情共用同一颗柔和光球，按"最常出现的情绪"切换
    const EMOJI_FACES = {
      happy:
        '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="开心">' +
          '<defs><radialGradient id="emojiGradHappy" cx="35%" cy="30%" r="80%">' +
            '<stop offset="0%" stop-color="#FCE5D9"/>' +
            '<stop offset="35%" stop-color="#FADADD"/>' +
            '<stop offset="70%" stop-color="#D8E1E9"/>' +
            '<stop offset="100%" stop-color="#B8D4F0"/>' +
          '</radialGradient></defs>' +
          '<circle cx="50" cy="50" r="45" fill="url(#emojiGradHappy)"/>' +
          '<ellipse cx="38" cy="30" rx="13" ry="9" fill="rgba(255,255,255,0.45)"/>' +
          '<circle cx="38" cy="50" r="3.2" fill="#2a2a2e"/>' +
          '<circle cx="62" cy="50" r="3.2" fill="#2a2a2e"/>' +
          '<path d="M 38 60 Q 50 73 62 60" stroke="#2a2a2e" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
        '</svg>',
      neutral:
        '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="发呆">' +
          '<defs><radialGradient id="emojiGradNeutral" cx="35%" cy="30%" r="80%">' +
            '<stop offset="0%" stop-color="#FCE5D9"/>' +
            '<stop offset="35%" stop-color="#FADADD"/>' +
            '<stop offset="70%" stop-color="#D8E1E9"/>' +
            '<stop offset="100%" stop-color="#B8D4F0"/>' +
          '</radialGradient></defs>' +
          '<circle cx="50" cy="50" r="45" fill="url(#emojiGradNeutral)"/>' +
          '<ellipse cx="38" cy="30" rx="13" ry="9" fill="rgba(255,255,255,0.45)"/>' +
          '<circle cx="38" cy="50" r="3.2" fill="#2a2a2e"/>' +
          '<circle cx="62" cy="50" r="3.2" fill="#2a2a2e"/>' +
          '<path d="M 42 63 Q 46 66 50 64 T 58 63" stroke="#2a2a2e" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>',
      calm:
        '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="平静">' +
          '<defs><radialGradient id="emojiGradCalm" cx="35%" cy="30%" r="80%">' +
            '<stop offset="0%" stop-color="#FCE5D9"/>' +
            '<stop offset="35%" stop-color="#FADADD"/>' +
            '<stop offset="70%" stop-color="#D8E1E9"/>' +
            '<stop offset="100%" stop-color="#B8D4F0"/>' +
          '</radialGradient></defs>' +
          '<circle cx="50" cy="50" r="45" fill="url(#emojiGradCalm)"/>' +
          '<ellipse cx="38" cy="30" rx="13" ry="9" fill="rgba(255,255,255,0.45)"/>' +
          '<circle cx="38" cy="50" r="3.2" fill="#2a2a2e"/>' +
          '<circle cx="62" cy="50" r="3.2" fill="#2a2a2e"/>' +
          '<path d="M 42 62 Q 50 69 58 62" stroke="#2a2a2e" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '</svg>'
    };
    const MOOD_TO_EMOJI = {
      sweet: 'happy',      // 微甜 → 开心
      warm: 'happy',       // 暖意 → 开心
      daydream: 'neutral', // 发呆 → 中性
      relaxed: 'calm',     // 松弛 → 平静
      calm: 'calm'         // 平静 → 平静
    };
    const emojiEl = $('#chart-emoji');

    function renderEmoji(dominantKey) {
      if (!emojiEl) return;
      const type = MOOD_TO_EMOJI[dominantKey];
      emojiEl.innerHTML = type ? EMOJI_FACES[type] : '';
    }

    // 在 canvas 上绘制同一颗光球（用于"保存为图片"导出）
    function drawEmojiOnCanvas(ctx, cx, cy, r, type) {
      const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.4, r * 0.1, cx, cy, r);
      grad.addColorStop(0, '#FCE5D9');
      grad.addColorStop(0.35, '#FADADD');
      grad.addColorStop(0.7, '#D8E1E9');
      grad.addColorStop(1, '#B8D4F0');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      // 顶部高光
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.25, cy - r * 0.4, r * 0.3, r * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      // 眼睛
      ctx.fillStyle = '#2a2a2e';
      ctx.beginPath();
      ctx.arc(cx - r * 0.25, cy, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + r * 0.25, cy, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
      // 嘴巴（按表情分）
      ctx.strokeStyle = '#2a2a2e';
      ctx.lineWidth = Math.max(1.5, r * 0.06);
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (type === 'happy') {
        ctx.moveTo(cx - r * 0.22, cy + r * 0.18);
        ctx.quadraticCurveTo(cx, cy + r * 0.4, cx + r * 0.22, cy + r * 0.18);
      } else if (type === 'neutral') {
        ctx.moveTo(cx - r * 0.18, cy + r * 0.24);
        ctx.quadraticCurveTo(cx, cy + r * 0.3, cx + r * 0.18, cy + r * 0.24);
      } else {
        ctx.moveTo(cx - r * 0.16, cy + r * 0.2);
        ctx.quadraticCurveTo(cx, cy + r * 0.34, cx + r * 0.16, cy + r * 0.2);
      }
      ctx.stroke();
    }

    // 演示数据：本周 7 天（含无记录日）
    const SAMPLE = [
      { weekday: '周一', date: '7/15', mood: 'sweet' },
      { weekday: '周二', date: '7/16', mood: null },
      { weekday: '周三', date: '7/17', mood: 'daydream' },
      { weekday: '周四', date: '7/18', mood: 'warm' },
      { weekday: '周五', date: '7/19', mood: null },
      { weekday: '周六', date: '7/20', mood: 'relaxed' },
      { weekday: '周日', date: '7/21', mood: 'calm' },
    ];

    function yFor(v, top, h) { return top + h * (1 - v / 5); }

    function roundRect(ctx, x, y, w, h, r) {
      if (h < 0) { y += h; h = -h; }
      r = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function shade(hex, percent) {
      const n = parseInt(hex.slice(1), 16);
      let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
      r = Math.max(0, Math.min(255, r + Math.round(255 * percent / 100)));
      g = Math.max(0, Math.min(255, g + Math.round(255 * percent / 100)));
      b = Math.max(0, Math.min(255, b + Math.round(255 * percent / 100)));
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function drawChart() {
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, 'rgba(255,255,255,0.85)');
      bg.addColorStop(1, 'rgba(250,248,247,0.65)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const padL = 46, padR = 24, padT = 26, padB = 58;
      const plotW = W - padL - padR;
      const plotH = H - padT - padB;
      const colW = plotW / SAMPLE.length;

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.font = '11px -apple-system, "PingFang SC", sans-serif';
      for (let v = 0; v <= 5; v++) {
        const y = yFor(v, padT, plotH);
        ctx.strokeStyle = 'rgba(120,120,140,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(W - padR, y);
        ctx.stroke();
        ctx.fillStyle = 'rgba(120,120,140,0.55)';
        ctx.fillText(String(v), padL - 10, y);
      }

      const pts = [];
      SAMPLE.forEach((d, i) => {
        if (d.mood) {
          pts.push({ x: padL + colW * (i + 0.5), y: yFor(MOODS[d.mood].index, padT, plotH), mood: d.mood });
        }
      });
      if (pts.length > 1) {
        ctx.strokeStyle = 'rgba(150,130,200,0.55)';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
        ctx.stroke();
      }

      SAMPLE.forEach((d, i) => {
        const cx = padL + colW * (i + 0.5);
        const bx = cx - colW * 0.26;
        const bw = colW * 0.52;

        if (d.mood) {
          const info = MOODS[d.mood];
          const top = yFor(info.index, padT, plotH);
          const bh = padT + plotH - top;
          const grad = ctx.createLinearGradient(0, top, 0, top + bh);
          grad.addColorStop(0, info.color);
          grad.addColorStop(1, shade(info.color, -8));
          roundRect(ctx, bx, top, bw, bh, 8);
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx, top, 5, 0, Math.PI * 2);
          ctx.fillStyle = info.color;
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#fff';
          ctx.stroke();
          ctx.fillStyle = '#6b6b70';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.font = '12px -apple-system, "PingFang SC", sans-serif';
          ctx.fillText(info.label, cx, top - 10);
        } else {
          const top = padT + plotH - 8;
          ctx.fillStyle = 'rgba(201,201,208,0.35)';
          roundRect(ctx, bx, top, bw, 8, 4);
          ctx.fill();
          ctx.fillStyle = GREY;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '11px -apple-system, "PingFang SC", sans-serif';
          ctx.fillText('无记录', cx, padT + plotH / 2);
        }

        ctx.fillStyle = '#8a8a92';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = '11px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText(d.weekday, cx, padT + plotH + 12);
        ctx.fillStyle = '#b0b0b8';
        ctx.font = '10px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText(d.date, cx, padT + plotH + 28);
      });
    }

    function computeSummary() {
      const recorded = SAMPLE.filter(d => d.mood);
      if (!recorded.length) return { avg: '--', dominant: '—', dominantKey: null, present: [] };
      const avg = (recorded.reduce((s, d) => s + MOODS[d.mood].index, 0) / recorded.length).toFixed(1);
      const count = {};
      recorded.forEach(d => count[d.mood] = (count[d.mood] || 0) + 1);
      const dominantKey = Object.keys(count).sort((a, b) => count[b] - count[a])[0];
      return { avg, dominant: MOODS[dominantKey].label, dominantKey, present: Object.keys(count) };
    }

    function renderLegend(present) {
      legendEl.innerHTML = '';
      present.forEach(m => {
        const item = document.createElement('span');
        item.className = 'chart-legend-item';
        const dot = document.createElement('span');
        dot.className = 'chart-legend-dot';
        dot.style.background = MOODS[m].color;
        item.appendChild(dot);
        item.appendChild(document.createTextNode(MOODS[m].label));
        legendEl.appendChild(item);
      });
    }

    function generate() {
      const sum = computeSummary();
      avgEl.textContent = sum.avg;
      domEl.textContent = sum.dominant;
      if (sum.dominantKey) {
        domEl.style.background = MOODS[sum.dominantKey].color;
        domEl.style.color = '#3a3a3a';
      }
      renderEmoji(sum.dominantKey);
      renderLegend(sum.present);
      drawChart();
      card.hidden = false;
      requestAnimationFrame(() => card.classList.add('is-visible'));
      showToast('情绪图卷已生成');
    }

    function exportChart() {
      const sum = computeSummary();
      const W = canvas.width;
      const headerH = 64, legendH = 40;
      const out = document.createElement('canvas');
      out.width = W;
      out.height = headerH + canvas.height + legendH;
      const c = out.getContext('2d');
      const bg = c.createLinearGradient(0, 0, 0, out.height);
      bg.addColorStop(0, '#FCFAF7');
      bg.addColorStop(1, '#F3F1EC');
      c.fillStyle = bg;
      c.fillRect(0, 0, out.width, out.height);
      c.fillStyle = '#2b2b2b';
      c.textAlign = 'left';
      c.textBaseline = 'middle';
      c.font = 'bold 16px -apple-system, "PingFang SC", sans-serif';
      c.fillText('本周情绪图卷', 24, 22);
      c.font = '12px -apple-system, "PingFang SC", sans-serif';
      c.fillStyle = '#6b6b70';
      c.fillText('平均情绪指数 ' + sum.avg + '   ·   最常出现 ' + sum.dominant, 24, 44);
      // 右上角情绪光球
      const emojiType = MOOD_TO_EMOJI[sum.dominantKey];
      if (emojiType) drawEmojiOnCanvas(c, W - 50, 32, 22, emojiType);
      c.drawImage(canvas, 0, headerH);
      let lx = 24;
      const ly = headerH + canvas.height + legendH / 2;
      c.font = '12px -apple-system, "PingFang SC", sans-serif';
      sum.present.forEach(m => {
        c.fillStyle = MOODS[m].color;
        c.beginPath();
        c.arc(lx + 5, ly, 5, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#6b6b70';
        c.textAlign = 'left';
        c.textBaseline = 'middle';
        const label = MOODS[m].label;
        c.fillText(label, lx + 14, ly);
        lx += 14 + c.measureText(label).width + 18;
      });
      const url = out.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = '本周情绪图卷.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('图卷已保存');
    }

    btnGen.addEventListener('click', generate);
    if (btnExport) btnExport.addEventListener('click', exportChart);
    if (btnClose) btnClose.addEventListener('click', () => {
      card.classList.remove('is-visible');
      setTimeout(() => { card.hidden = true; }, 400);
    });
  }

  // ===== 动态主题：将水波纹参数与当前主题联动 =====
  function initDynamicTheme() {
    if (!window.XJTheme || !currentTheme) return;
    window.XJTheme.applyRippleTheme(currentTheme);
  }

  // ===== 初始化 =====
  function init() {
    initDynamicTheme();
    initTabBar();
    initSheets();
    initMoodSelector();
    initCharCounter();
    initReceiveButton();
    initPickupQueue();
    initReleaseForm();
    initBreathingDots();
    initViewModeToggle();
    initMediaCover();
    initMediaCapture();
    initProfile();
    initPullToRefresh();
    initInfiniteScroll();
    initSettings();
    initWeeklyChart();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 暴露全局工具
  window.EmotionBox = { openSheet, closeSheet, showToast, vibrate, burstParticles };
})();
