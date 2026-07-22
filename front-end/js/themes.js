/**
 * 街角情绪盲盒 — 动态时段主题配置
 * 根据访问时间（清晨/午后/傍晚/深夜）随机切换配色，
 * 并联动水波纹、呼吸光点、背景光晕等视觉参数。
 */
(function () {
  'use strict';

  const TIME_SLOTS = [
    { name: 'morning', label: '清晨', hours: [5, 6, 7, 8, 9, 10] },
    { name: 'afternoon', label: '午后', hours: [11, 12, 13, 14, 15, 16] },
    { name: 'evening', label: '傍晚', hours: [17, 18, 19, 20] },
    { name: 'night', label: '深夜', hours: [21, 22, 23, 0, 1, 2, 3, 4] }
  ];

  const THEME_POOL = [
    {
      id: 'morning-warm',
      slot: 'morning',
      label: '清晨',
      vars: {
        '--color-primary': '#F2BFA3',
        '--color-primary-hover': '#ECA984',
        '--color-primary-active': '#E09068',
        '--color-primary-subtle': 'rgba(242, 191, 163, 0.16)',
        '--color-secondary': '#FADCC4',
        '--color-accent-pink': '#F5C8D8',
        '--color-accent-blue': '#B8D4F0',
        '--color-accent-mint': '#C8E6DA',
        '--color-background': '#FCF7F2',
        '--color-background-warm': '#FCF3EA',
        '--shadow-color-primary': 'rgba(200, 140, 100, 0.12)',
        '--shadow-color-deep': 'rgba(160, 100, 70, 0.16)',
        '--shadow-color-glow': 'rgba(242, 191, 163, 0.28)',
        '--bg-orb-1': 'rgba(242, 191, 163, 0.28)',
        '--bg-orb-2': 'rgba(245, 200, 216, 0.22)',
        '--bg-orb-3': 'rgba(184, 212, 240, 0.20)',
        '--ripple-bg-start': 'rgba(242, 191, 163, 0.28)',
        '--ripple-bg-end': 'rgba(242, 191, 163, 0.06)',
        '--ripple-ring-1': 'rgba(242, 191, 163, 0.18)',
        '--ripple-ring-2': 'rgba(245, 200, 216, 0.20)',
        '--ripple-ring-3': 'rgba(184, 212, 240, 0.18)',
        '--dot-color-1': '#F2BFA3',
        '--dot-color-2': '#F5C8D8',
        '--dot-color-3': '#B8D4F0',
        '--dot-color-4': '#C8E6DA'
      },
      ripple: { speed: 1.05, radiusOffset: 2, opacityMultiplier: 1 }
    },
    {
      id: 'morning-fresh',
      slot: 'morning',
      label: '清晨',
      vars: {
        '--color-primary': '#A8D8C8',
        '--color-primary-hover': '#8FCCB8',
        '--color-primary-active': '#75C0A8',
        '--color-primary-subtle': 'rgba(168, 216, 200, 0.16)',
        '--color-secondary': '#D4EFE6',
        '--color-accent-pink': '#F5C8D8',
        '--color-accent-blue': '#B8D4F0',
        '--color-accent-mint': '#C8E6DA',
        '--color-background': '#F2FAF7',
        '--color-background-warm': '#F0F9F4',
        '--shadow-color-primary': 'rgba(100, 160, 140, 0.12)',
        '--shadow-color-deep': 'rgba(70, 120, 100, 0.16)',
        '--shadow-color-glow': 'rgba(168, 216, 200, 0.28)',
        '--bg-orb-1': 'rgba(168, 216, 200, 0.28)',
        '--bg-orb-2': 'rgba(184, 212, 240, 0.22)',
        '--bg-orb-3': 'rgba(245, 200, 216, 0.20)',
        '--ripple-bg-start': 'rgba(168, 216, 200, 0.28)',
        '--ripple-bg-end': 'rgba(168, 216, 200, 0.06)',
        '--ripple-ring-1': 'rgba(168, 216, 200, 0.18)',
        '--ripple-ring-2': 'rgba(184, 212, 240, 0.20)',
        '--ripple-ring-3': 'rgba(245, 200, 216, 0.18)',
        '--dot-color-1': '#A8D8C8',
        '--dot-color-2': '#B8D4F0',
        '--dot-color-3': '#F5C8D8',
        '--dot-color-4': '#C8E6DA'
      },
      ripple: { speed: 0.95, radiusOffset: -2, opacityMultiplier: 0.9 }
    },
    {
      id: 'afternoon-sky',
      slot: 'afternoon',
      label: '午后',
      vars: {
        '--color-primary': '#8BBCE8',
        '--color-primary-hover': '#6FA8E0',
        '--color-primary-active': '#5394D8',
        '--color-primary-subtle': 'rgba(139, 188, 232, 0.16)',
        '--color-secondary': '#F8D9B0',
        '--color-accent-pink': '#F5C8D8',
        '--color-accent-blue': '#A8CCE8',
        '--color-accent-mint': '#C8E8DE',
        '--color-background': '#F2F7FC',
        '--color-background-warm': '#FAF7F2',
        '--shadow-color-primary': 'rgba(100, 140, 180, 0.12)',
        '--shadow-color-deep': 'rgba(70, 100, 140, 0.16)',
        '--shadow-color-glow': 'rgba(139, 188, 232, 0.28)',
        '--bg-orb-1': 'rgba(139, 188, 232, 0.28)',
        '--bg-orb-2': 'rgba(248, 217, 176, 0.22)',
        '--bg-orb-3': 'rgba(200, 232, 222, 0.20)',
        '--ripple-bg-start': 'rgba(139, 188, 232, 0.28)',
        '--ripple-bg-end': 'rgba(139, 188, 232, 0.06)',
        '--ripple-ring-1': 'rgba(139, 188, 232, 0.18)',
        '--ripple-ring-2': 'rgba(248, 217, 176, 0.20)',
        '--ripple-ring-3': 'rgba(200, 232, 222, 0.18)',
        '--dot-color-1': '#8BBCE8',
        '--dot-color-2': '#F8D9B0',
        '--dot-color-3': '#C8E8DE',
        '--dot-color-4': '#F5C8D8'
      },
      ripple: { speed: 1.1, radiusOffset: 4, opacityMultiplier: 1.05 }
    },
    {
      id: 'afternoon-lavender',
      slot: 'afternoon',
      label: '午后',
      vars: {
        '--color-primary': '#C4B8E8',
        '--color-primary-hover': '#B0A0E0',
        '--color-primary-active': '#9C88D8',
        '--color-primary-subtle': 'rgba(196, 184, 232, 0.16)',
        '--color-secondary': '#F8D9B0',
        '--color-accent-pink': '#F5C8D8',
        '--color-accent-blue': '#B8D4F0',
        '--color-accent-mint': '#C8E8DE',
        '--color-background': '#F6F4FC',
        '--color-background-warm': '#FAF7F2',
        '--shadow-color-primary': 'rgba(130, 110, 170, 0.12)',
        '--shadow-color-deep': 'rgba(100, 80, 140, 0.16)',
        '--shadow-color-glow': 'rgba(196, 184, 232, 0.28)',
        '--bg-orb-1': 'rgba(196, 184, 232, 0.28)',
        '--bg-orb-2': 'rgba(248, 217, 176, 0.22)',
        '--bg-orb-3': 'rgba(184, 212, 240, 0.20)',
        '--ripple-bg-start': 'rgba(196, 184, 232, 0.28)',
        '--ripple-bg-end': 'rgba(196, 184, 232, 0.06)',
        '--ripple-ring-1': 'rgba(196, 184, 232, 0.18)',
        '--ripple-ring-2': 'rgba(248, 217, 176, 0.20)',
        '--ripple-ring-3': 'rgba(184, 212, 240, 0.18)',
        '--dot-color-1': '#C4B8E8',
        '--dot-color-2': '#F8D9B0',
        '--dot-color-3': '#B8D4F0',
        '--dot-color-4': '#F5C8D8'
      },
      ripple: { speed: 0.9, radiusOffset: -3, opacityMultiplier: 0.95 }
    },
    {
      id: 'evening-sunset',
      slot: 'evening',
      label: '傍晚',
      vars: {
        '--color-primary': '#E8A9A0',
        '--color-primary-hover': '#E08F84',
        '--color-primary-active': '#D87568',
        '--color-primary-subtle': 'rgba(232, 169, 160, 0.16)',
        '--color-secondary': '#F8C9B0',
        '--color-accent-pink': '#F5C8D8',
        '--color-accent-blue': '#D8E1E9',
        '--color-accent-mint': '#D8E2DC',
        '--color-background': '#FCF5F3',
        '--color-background-warm': '#FCF3ED',
        '--shadow-color-primary': 'rgba(180, 120, 110, 0.12)',
        '--shadow-color-deep': 'rgba(140, 90, 80, 0.16)',
        '--shadow-color-glow': 'rgba(232, 169, 160, 0.28)',
        '--bg-orb-1': 'rgba(232, 169, 160, 0.28)',
        '--bg-orb-2': 'rgba(245, 200, 216, 0.22)',
        '--bg-orb-3': 'rgba(216, 225, 233, 0.20)',
        '--ripple-bg-start': 'rgba(232, 169, 160, 0.28)',
        '--ripple-bg-end': 'rgba(232, 169, 160, 0.06)',
        '--ripple-ring-1': 'rgba(232, 169, 160, 0.18)',
        '--ripple-ring-2': 'rgba(245, 200, 216, 0.20)',
        '--ripple-ring-3': 'rgba(216, 225, 233, 0.18)',
        '--dot-color-1': '#E8A9A0',
        '--dot-color-2': '#F5C8D8',
        '--dot-color-3': '#D8E1E9',
        '--dot-color-4': '#D8E2DC'
      },
      ripple: { speed: 1.15, radiusOffset: 6, opacityMultiplier: 1.1 }
    },
    {
      id: 'evening-rose',
      slot: 'evening',
      label: '傍晚',
      vars: {
        '--color-primary': '#D8A8C8',
        '--color-primary-hover': '#CC8FB8',
        '--color-primary-active': '#C076A8',
        '--color-primary-subtle': 'rgba(216, 168, 200, 0.16)',
        '--color-secondary': '#F5D4E4',
        '--color-accent-pink': '#F5C8D8',
        '--color-accent-blue': '#D8E1E9',
        '--color-accent-mint': '#D8E2DC',
        '--color-background': '#FCF5F8',
        '--color-background-warm': '#FCF3F5',
        '--shadow-color-primary': 'rgba(160, 110, 140, 0.12)',
        '--shadow-color-deep': 'rgba(120, 80, 100, 0.16)',
        '--shadow-color-glow': 'rgba(216, 168, 200, 0.28)',
        '--bg-orb-1': 'rgba(216, 168, 200, 0.28)',
        '--bg-orb-2': 'rgba(245, 212, 228, 0.22)',
        '--bg-orb-3': 'rgba(216, 225, 233, 0.20)',
        '--ripple-bg-start': 'rgba(216, 168, 200, 0.28)',
        '--ripple-bg-end': 'rgba(216, 168, 200, 0.06)',
        '--ripple-ring-1': 'rgba(216, 168, 200, 0.18)',
        '--ripple-ring-2': 'rgba(245, 212, 228, 0.20)',
        '--ripple-ring-3': 'rgba(216, 225, 233, 0.18)',
        '--dot-color-1': '#D8A8C8',
        '--dot-color-2': '#F5D4E4',
        '--dot-color-3': '#D8E1E9',
        '--dot-color-4': '#D8E2DC'
      },
      ripple: { speed: 1.0, radiusOffset: 0, opacityMultiplier: 0.95 }
    },
    {
      id: 'night-lavender',
      slot: 'night',
      label: '深夜',
      vars: {
        '--color-primary': '#A9A9D8',
        '--color-primary-hover': '#8F8FCC',
        '--color-primary-active': '#7575C0',
        '--color-primary-subtle': 'rgba(169, 169, 216, 0.16)',
        '--color-secondary': '#C9C9E8',
        '--color-accent-pink': '#D8D8F0',
        '--color-accent-blue': '#B8D4F0',
        '--color-accent-mint': '#C9D8D4',
        '--color-background': '#F0F0F8',
        '--color-background-warm': '#F2F2F8',
        '--shadow-color-primary': 'rgba(110, 110, 150, 0.12)',
        '--shadow-color-deep': 'rgba(80, 80, 120, 0.16)',
        '--shadow-color-glow': 'rgba(169, 169, 216, 0.28)',
        '--bg-orb-1': 'rgba(169, 169, 216, 0.28)',
        '--bg-orb-2': 'rgba(184, 212, 240, 0.22)',
        '--bg-orb-3': 'rgba(201, 216, 212, 0.20)',
        '--ripple-bg-start': 'rgba(169, 169, 216, 0.28)',
        '--ripple-bg-end': 'rgba(169, 169, 216, 0.06)',
        '--ripple-ring-1': 'rgba(169, 169, 216, 0.18)',
        '--ripple-ring-2': 'rgba(184, 212, 240, 0.20)',
        '--ripple-ring-3': 'rgba(201, 216, 212, 0.18)',
        '--dot-color-1': '#A9A9D8',
        '--dot-color-2': '#B8D4F0',
        '--dot-color-3': '#C9D8D4',
        '--dot-color-4': '#D8D8F0'
      },
      ripple: { speed: 0.85, radiusOffset: -4, opacityMultiplier: 0.85 }
    },
    {
      id: 'night-midnight',
      slot: 'night',
      label: '深夜',
      vars: {
        '--color-primary': '#8BB0D8',
        '--color-primary-hover': '#6F9CCC',
        '--color-primary-active': '#5388C0',
        '--color-primary-subtle': 'rgba(139, 176, 216, 0.16)',
        '--color-secondary': '#B8D4F0',
        '--color-accent-pink': '#D8D8F0',
        '--color-accent-blue': '#A8CCE8',
        '--color-accent-mint': '#C9D8D4',
        '--color-background': '#EDF1F8',
        '--color-background-warm': '#F0F3F8',
        '--shadow-color-primary': 'rgba(100, 120, 160, 0.12)',
        '--shadow-color-deep': 'rgba(70, 90, 120, 0.16)',
        '--shadow-color-glow': 'rgba(139, 176, 216, 0.28)',
        '--bg-orb-1': 'rgba(139, 176, 216, 0.28)',
        '--bg-orb-2': 'rgba(184, 212, 240, 0.22)',
        '--bg-orb-3': 'rgba(201, 216, 212, 0.20)',
        '--ripple-bg-start': 'rgba(139, 176, 216, 0.28)',
        '--ripple-bg-end': 'rgba(139, 176, 216, 0.06)',
        '--ripple-ring-1': 'rgba(139, 176, 216, 0.18)',
        '--ripple-ring-2': 'rgba(184, 212, 240, 0.20)',
        '--ripple-ring-3': 'rgba(201, 216, 212, 0.18)',
        '--dot-color-1': '#8BB0D8',
        '--dot-color-2': '#A8CCE8',
        '--dot-color-3': '#C9D8D4',
        '--dot-color-4': '#D8D8F0'
      },
      ripple: { speed: 0.9, radiusOffset: -2, opacityMultiplier: 0.8 }
    }
  ];

  const STORAGE_KEY = 'xj_last_theme_id';

  function getCurrentTimeSlot() {
    const hour = new Date().getHours();
    return TIME_SLOTS.find(slot => slot.hours.includes(hour)) || TIME_SLOTS[0];
  }

  function pickTheme() {
    const slot = getCurrentTimeSlot();
    const candidates = THEME_POOL.filter(t => t.slot === slot.name);
    let lastId = '';
    try { lastId = localStorage.getItem(STORAGE_KEY) || ''; } catch (e) {}
    const filtered = candidates.filter(t => t.id !== lastId);
    const pool = filtered.length ? filtered : candidates;
    const theme = pool[Math.floor(Math.random() * pool.length)];
    try { localStorage.setItem(STORAGE_KEY, theme.id); } catch (e) {}
    return { ...theme, slotLabel: slot.label };
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
    root.setAttribute('data-active-theme', theme.id);
    root.setAttribute('data-time-slot', theme.slot);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme.vars['--color-background']);

    const greeting = document.getElementById('time-greeting');
    if (greeting) greeting.textContent = theme.slotLabel;

    // 每次刷新随机化光晕色相，使色调不再单调
    applyToneVariation();
  }

  // 水波纹 6 层基准配置：速率更舒缓、延迟错落成流、透明度随半径递减（大气透视），
  // 起始/终止缩放递进，整体呈现安静而深远的扩散节奏。主题 ripple 参数（speed/offset/opacity）叠加其上。
  const RING_BASE = [
    { duration: 11.0, delay: 0.0,  startScale: 0.42, endScale: 1.70, startOpacity: 0.30, inset: 4 },
    { duration: 12.5, delay: 1.7,  startScale: 0.38, endScale: 1.95, startOpacity: 0.26, inset: 9 },
    { duration: 14.0, delay: 3.4,  startScale: 0.34, endScale: 2.20, startOpacity: 0.22, inset: 14 },
    { duration: 15.5, delay: 5.1,  startScale: 0.30, endScale: 2.45, startOpacity: 0.18, inset: 19 },
    { duration: 17.0, delay: 6.8,  startScale: 0.27, endScale: 2.70, startOpacity: 0.14, inset: 24 },
    { duration: 18.5, delay: 8.5,  startScale: 0.24, endScale: 2.95, startOpacity: 0.10, inset: 29 }
  ];

  function applyRippleTheme(theme) {
    const canvas = document.querySelector('.compass-canvas');
    if (!canvas) return;

    const cfg = theme.ripple || {};
    const speed = cfg.speed || 1;
    const radiusOffset = cfg.radiusOffset || 0;
    const opacityMultiplier = cfg.opacityMultiplier || 1;

    // 仅驱动水波纹环（背景光晕由 CSS breathe + 外层 .compass-glow 色相漂移负责）
    const rings = Array.from(canvas.querySelectorAll('.compass-ripple--ring'));
    rings.forEach((el, i) => {
      const b = RING_BASE[i] || RING_BASE[RING_BASE.length - 1];
      el.style.animationDuration = `${(b.duration * speed).toFixed(2)}s`;
      el.style.animationDelay = `${(b.delay * speed).toFixed(2)}s`;
      el.style.inset = `${Math.max(0, Math.min(45, b.inset + radiusOffset * 0.6)).toFixed(1)}%`;
      el.style.setProperty('--ripple-start-scale', b.startScale.toFixed(2));
      el.style.setProperty('--ripple-end-scale', b.endScale.toFixed(2));
      el.style.setProperty('--ripple-start-opacity', Math.max(0.06, Math.min(1, b.startOpacity * opacityMultiplier)).toFixed(3));
    });
  }

  // 每次刷新随机化光晕色相：基准偏移 ±16°、漂移幅度 6–12°、漂移周期 20–30s，
  // 让页面色调每次打开都略有不同，避免单调。
  function applyToneVariation() {
    const root = document.documentElement;
    const base = (Math.random() * 32 - 16).toFixed(1);   // -16° ~ +16°
    const drift = (Math.random() * 6 + 6).toFixed(1);    // 6° ~ 12°
    const dur = (Math.random() * 10 + 20).toFixed(1);    // 20s ~ 30s
    root.style.setProperty('--glow-hue-base', base + 'deg');
    root.style.setProperty('--glow-hue-drift', drift + 'deg');
    root.style.setProperty('--glow-drift-duration', dur + 's');
  }

  window.XJTheme = { TIME_SLOTS, THEME_POOL, getCurrentTimeSlot, pickTheme, applyTheme, applyRippleTheme, applyToneVariation };
})();
