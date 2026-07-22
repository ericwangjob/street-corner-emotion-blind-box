/**
 * 街角情绪盲盒 — 可视化编辑引擎（注入式）
 * 仅在 URL 含 edit=1 或收到父窗消息时激活，不影响正常打开。
 * 支持：文本/按钮/导航/徽章/卡片文字 contenteditable、
 *       图片点击替换、输入框值与 placeholder 编辑、
 *       改动保存（localStorage）、应用已存改动、序列化导出为干净 HTML。
 */
(function () {
  'use strict';

  const EDITABLE_SELECTOR = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p',
    'span', 'a', 'button', 'li', 'label',
    '.tab-item', '.badge', '.top-pill',
    '.text-nano', '.text-caption', '.text-body', '.text-body-lg', '.text-h2', '.text-h3',
    '.mood-option'
  ].join(',');

  const EXCLUDE_SELECTOR = [
    '.tab-indicator', '.breathing-dot', '.audio-wave', '.wave-bar',
    '.ptr-spinner', '.media-fallback', '.chart-legend-dot',
    '.compass-canvas', '.compass-ripple', '.audio-play'
  ].join(',');

  const STYLE_ID = 'ui-edit-style';
  const FILE_INPUT_CLASS = 'ui-edit-file-input';

  let editing = false;
  let saveTimer = null;
  let currentImg = null;
  let fileInput = null;
  let storeKey = '';

  function pageName() {
    const path = (window.location.pathname.split('/').pop() || 'index.html');
    return path;
  }

  function storeKeyFor(name) {
    return 'uiedit::' + name;
  }

  function readStore() {
    try {
      return JSON.parse(localStorage.getItem(storeKey) || '{}');
    } catch (e) { return {}; }
  }

  function writeStore(data) {
    try { localStorage.setItem(storeKey, JSON.stringify(data)); } catch (e) {}
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const data = collectEdits();
      writeStore(data);
    }, 400);
  }

  function collectEdits() {
    const data = { text: {}, images: {}, values: {}, placeholders: {} };
    document.querySelectorAll('[data-edit-id]').forEach(el => {
      const id = el.getAttribute('data-edit-id');
      const tag = el.tagName.toLowerCase();
      if (tag === 'img') {
        data.images[id] = el.getAttribute('src');
      } else if (tag === 'input' || tag === 'textarea') {
        if (tag === 'input') data.values[id] = el.value;
        if (el.placeholder) data.placeholders[id] = el.placeholder;
      } else {
        data.text[id] = el.innerHTML;
      }
    });
    return data;
  }

  function shouldEditText(el) {
    if (el.closest('svg')) return false;
    if (el.closest(EXCLUDE_SELECTOR)) return false;
    if (el.classList.contains('ui-edit-style')) return false;
    // 排除纯装饰空元素（保留 input/textarea 由单独逻辑处理）
    if ((el.tagName === 'SPAN' || el.tagName === 'P' || el.tagName === 'LABEL' || el.tagName === 'LI' || el.tagName === 'A') &&
        !el.textContent.trim()) {
      return false;
    }
    return true;
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const css = `
      .ui-editing [data-edit-id] {
        outline: 1.5px dashed rgba(150, 120, 220, 0.55);
        outline-offset: 2px;
        border-radius: 6px;
      }
      .ui-editing [data-edit-id]:hover {
        outline-color: rgba(120, 90, 200, 0.95);
        background: rgba(184, 169, 232, 0.10);
      }
      .ui-editing img[data-edit-id] {
        cursor: pointer;
      }
      .ui-editing img[data-edit-id]:hover {
        box-shadow: 0 0 0 3px rgba(184, 169, 232, 0.6);
      }
      .ui-editing a[data-edit-id],
      .ui-editing button[data-edit-id] { cursor: text; }
      .ui-editing .tab-item { cursor: text; }
      .ui-edit-file-input { position: fixed; left: -9999px; top: -9999px; }
    `;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function ensureFileInput() {
    if (fileInput) return fileInput;
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.className = FILE_INPUT_CLASS;
    document.body.appendChild(fileInput);
    fileInput.addEventListener('change', onFilePicked);
    return fileInput;
  }

  function onFilePicked(e) {
    const file = e.target.files && e.target.files[0];
    if (!file || !currentImg) return;
    const reader = new FileReader();
    reader.onload = function () {
      const dataUrl = reader.result;
      currentImg.setAttribute('src', dataUrl);
      // 处理 media-cover 的加载状态
      const cover = currentImg.closest('.media-cover');
      if (cover) {
        cover.classList.remove('is-error');
        cover.classList.add('is-loaded');
        currentImg.classList.remove('is-error');
        currentImg.style.opacity = '1';
      }
      scheduleSave();
    };
    reader.readAsDataURL(file);
    fileInput.value = '';
    currentImg = null;
  }

  function enableEdit() {
    if (editing) return;
    editing = true;

    // 固定为设计系统默认主题（移除运行时随机主题 inline 变量），确保与原稿一致、可复现
    document.documentElement.removeAttribute('style');

    document.documentElement.classList.add('ui-editing');
    injectStyle();

    storeKey = storeKeyFor(pageName());
    const saved = readStore();

    // 1) 文本 / 按钮 / 导航 / 徽章 / 卡片文字
    let idx = 0;
    document.querySelectorAll(EDITABLE_SELECTOR).forEach(el => {
      if (!shouldEditText(el)) return;
      const id = 'e' + (idx++);
      el.setAttribute('data-edit-id', id);
      el.setAttribute('contenteditable', 'true');
      el.addEventListener('input', scheduleSave);
      el.addEventListener('blur', scheduleSave);
      // 应用已存文本
      if (saved.text && saved.text[id] != null) {
        el.innerHTML = saved.text[id];
      }
    });

    // 2) 图片
    document.querySelectorAll('img').forEach(img => {
      if (img.closest(EXCLUDE_SELECTOR)) return;
      const id = 'img' + (idx++);
      img.setAttribute('data-edit-id', id);
      img.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        currentImg = img;
        ensureFileInput().click();
      });
      if (saved.images && saved.images[id] != null) {
        img.setAttribute('src', saved.images[id]);
        const cover = img.closest('.media-cover');
        if (cover) { cover.classList.add('is-loaded'); }
      }
    });

    // 3) 输入框（值可直接输入；双击编辑 placeholder）
    document.querySelectorAll('input, textarea').forEach(el => {
      const type = el.getAttribute('type');
      if (type === 'hidden' || type === 'radio' || type === 'checkbox' || type === 'file') return;
      const id = 'f' + (idx++);
      el.setAttribute('data-edit-id', id);
      el.disabled = false;
      el.readOnly = false;
      el.setAttribute('contenteditable', 'false');
      el.addEventListener('input', scheduleSave);
      el.addEventListener('dblclick', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const next = window.prompt('编辑占位提示文字（placeholder）：', el.placeholder || '');
        if (next !== null) {
          el.setAttribute('placeholder', next);
          scheduleSave();
        }
      });
      if (saved.values && saved.values[id] != null) {
        el.value = saved.values[id];
      }
      if (saved.placeholders && saved.placeholders[id] != null) {
        el.setAttribute('placeholder', saved.placeholders[id]);
      }
    });

    // 4) 拦截链接跳转与表单提交，专注编辑
    document.addEventListener('click', interceptNav, true);
    document.addEventListener('submit', interceptSubmit, true);

    notifyParent('UI_READY', { page: pageName() });
  }

  function disableEdit() {
    if (!editing) return;
    writeStore(collectEdits()); // 退出编辑前保存最新改动
    editing = false;
    document.documentElement.classList.remove('ui-editing');
    document.querySelectorAll('[data-edit-id]').forEach(el => {
      el.removeAttribute('data-edit-id');
      el.removeAttribute('contenteditable');
      el.removeEventListener('input', scheduleSave);
      el.removeEventListener('blur', scheduleSave);
    });
    document.removeEventListener('click', interceptNav, true);
    document.removeEventListener('submit', interceptSubmit, true);
  }

  function interceptNav(e) {
    const a = e.target.closest('a');
    if (a) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function interceptSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function resetEdits() {
    try { localStorage.removeItem(storeKey); } catch (e) {}
    window.location.reload();
  }

  function cleanForExport() {
    const clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll('script[src="js/editor-injected.js"]').forEach(s => s.remove());
    clone.querySelectorAll('style#' + STYLE_ID).forEach(s => s.remove());
    clone.querySelectorAll('input.' + FILE_INPUT_CLASS).forEach(s => s.remove());
    clone.classList.remove('ui-editing');
    clone.removeAttribute('style'); // 恢复设计系统默认主题
    clone.querySelectorAll('[data-edit-id]').forEach(el => el.removeAttribute('data-edit-id'));
    clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
    // 移除运行时内联主题变量（data-active-theme 等），保持干净
    clone.removeAttribute('data-active-theme');
    clone.removeAttribute('data-time-slot');
    return '<!DOCTYPE html>\n' + clone.outerHTML;
  }

  function exportHTML() {
    if (!editing) enableEdit(); // 确保最新改动已应用到 DOM
    const html = cleanForExport();
    notifyParent('UI_EXPORT_RESULT', { page: pageName(), html: html });
  }

  function notifyParent(type, payload) {
    try {
      window.parent.postMessage(Object.assign({ type: type, source: 'ui-editor' }, payload || {}), '*');
    } catch (e) {}
  }

  // ===== 消息通信（来自编辑器外壳 editor.html）=====
  function onMessage(e) {
    const msg = e.data;
    if (!msg || msg.source === 'ui-editor') return; // 忽略自身回传
    switch (msg.type) {
      case 'UI_EDIT_ENABLE':
        enableEdit();
        break;
      case 'UI_EDIT_DISABLE':
        disableEdit();
        break;
      case 'UI_EXPORT':
        exportHTML();
        break;
      case 'UI_RESET':
        resetEdits();
        break;
      default:
        break;
    }
  }

  window.addEventListener('message', onMessage);

  // 关闭 / 刷新前保存最新改动，避免丢失
  window.addEventListener('beforeunload', function () {
    if (editing) writeStore(collectEdits());
  });

  // ===== 自动激活：URL 含 edit=1 时 =====
  function boot() {
    storeKey = storeKeyFor(pageName());
    if (window.location.search.indexOf('edit=1') !== -1) {
      enableEdit();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // 暴露全局（便于调试 / 直接调用）
  window.UIEdit = { enableEdit, disableEdit, exportHTML, resetEdits };
})();
