/**
 * 街角情绪盲盒 — 主题切换（浅色 / 深色 / 跟随系统）
 *
 * 设计要点：
 *  - 深色模式通过 <html class="dark"> 触发，CSS 中以 `html.dark` 重写设计变量（带 !important，
 *    以覆盖 themes.js 写入 <html> 的内联变量）。
 *  - 选择持久化到 localStorage('xj_theme_mode')，刷新后保持。
 *  - 支持"跟随系统"：监听系统配色变化实时切换。
 *  - 切换时派发 `xj:themechange` 事件，供图表等按主题重绘（无缝切换）。
 *  - 首屏无闪烁由各页面 <head> 内联脚本提前设定 .dark 类保证，本脚本仅在 DOM 就绪后
 *    做"静默"对齐（不重复派发事件）。
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'xj_theme_mode'; // 'light' | 'dark' | 'system'
  var DARK_BG = '#15131F';
  var LIGHT_BG_FALLBACK = '#F8F6FC';

  function root() { return document.documentElement; }

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function getStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setStored(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {}
  }

  // 将存储值解析为实际要套用的视觉：'system' 按系统偏好决定
  function resolve(mode) {
    if (mode === 'dark') return 'dark';
    if (mode === 'light') return 'light';
    return systemPrefersDark() ? 'dark' : 'light';
  }

  function lightColor() {
    var v = (getComputedStyle(root()).getPropertyValue('--color-background') || '').trim();
    return v && v.charAt(0) === '#' ? v : LIGHT_BG_FALLBACK;
  }

  function apply(mode, opts) {
    opts = opts || {};
    var resolved = resolve(mode);
    var r = root();
    r.classList.toggle('dark', resolved === 'dark');
    r.setAttribute('data-theme-mode', mode || 'system');

    // 同步 meta theme-color，避免地址栏/状态栏在暗色下刺眼
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', resolved === 'dark' ? DARK_BG : lightColor());
    }

    // 同步设置页"主题外观"文案
    var labelMap = { light: '浅色', dark: '深色', system: '跟随系统' };
    var display = document.getElementById('theme-value');
    if (display) display.textContent = labelMap[mode] || labelMap.system;

    if (!opts.silent) {
      window.dispatchEvent(new CustomEvent('xj:themechange', {
        detail: { mode: mode, resolved: resolved }
      }));
    }
  }

  function syncRadios(mode) {
    var radios = document.querySelectorAll('input[data-radio="theme"]');
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].value === mode) radios[i].checked = true;
    }
  }

  function init() {
    var mode = getStored() || 'system';

    // 对齐（静默）：首屏已由 <head> 内联脚本设定，这里仅确保单选/文案/系统监听一致
    apply(mode, { silent: true });
    syncRadios(mode);

    // 绑定设置页单选项
    var themeRadios = document.querySelectorAll('input[data-radio="theme"]');
    for (var i = 0; i < themeRadios.length; i++) {
      themeRadios[i].addEventListener('change', function (e) {
        if (!e.target.checked) return;
        var m = e.target.value;
        setStored(m);
        apply(m);
        if (window.XJToast && typeof window.XJToast.show === 'function') {
          var labelMap = { light: '浅色', dark: '深色', system: '跟随系统' };
          window.XJToast.show('主题已切换为：' + (labelMap[m] || m));
        } else if (window.showToast && typeof window.showToast === 'function') {
          var lm = { light: '浅色', dark: '深色', system: '跟随系统' };
          window.showToast('主题已切换为：' + (lm[m] || m));
        }
      });
    }

    // 跟随系统：系统配色变化时实时切换（仅当模式为 system）
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var handler = function () {
        if ((getStored() || 'system') === 'system') apply('system');
      };
      if (mq.addEventListener) mq.addEventListener('change', handler);
      else if (mq.addListener) mq.addListener(handler); // 旧浏览器
    }

    // 首帧后再开启主题过渡，避免首屏闪烁
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(function () {
        root().classList.add('theme-anim');
      });
    } else {
      root().classList.add('theme-anim');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
