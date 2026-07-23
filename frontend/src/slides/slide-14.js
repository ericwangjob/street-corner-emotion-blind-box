window.slideDataMap.set(14, `
<div class="w-[1440px] h-[810px] shadow-2xl relative overflow-hidden slide-bg">
  <div class="w-[1350px] h-[720px] mx-auto my-[45px] flex flex-col">
    <div class="mb-5">
      <div class="text-[14px] tracking-[0.28em] text-[#C98A5E] font-semibold mb-2">03 · 技术架构与方案</div>
      <h1 class="text-[36px] font-bold text-[#234B47] font-title leading-tight">关键技术方案与选型</h1>
      <div class="w-16 h-[3px] bg-[#C98A5E] mt-3"></div>
    </div>
    <div class="flex-1 flex flex-col gap-3 justify-center">
      <div class="bg-white rounded-lg shadow px-5 py-3.5 flex items-center gap-5">
        <div class="w-10 h-10 rounded bg-[#2C5F5A] text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
        <div class="flex-1"><h3 class="text-[18px] font-bold text-[#234B47] font-title">LBS 围栏</h3><p class="text-[14px] text-[#5A6664] leading-snug">前台步行启用高精度 GPS（5s/次），辅以网络定位兜底与围栏容差。</p></div>
        <div class="text-[13px] text-[#2C5F5A] bg-[#EAF0EE] px-3 py-1.5 rounded whitespace-nowrap">3s 停留确认</div>
      </div>
      <div class="bg-white rounded-lg shadow px-5 py-3.5 flex items-center gap-5">
        <div class="w-10 h-10 rounded bg-[#2C5F5A] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
        <div class="flex-1"><h3 class="text-[18px] font-bold text-[#234B47] font-title">混合定位与功耗</h3><p class="text-[14px] text-[#5A6664] leading-snug">默认低功耗网络定位，仅前台触发高精度，规避后台耗电与隐私争议。</p></div>
        <div class="text-[13px] text-[#2C5F5A] bg-[#EAF0EE] px-3 py-1.5 rounded whitespace-nowrap">最小必要触发</div>
      </div>
      <div class="bg-white rounded-lg shadow px-5 py-3.5 flex items-center gap-5">
        <div class="w-10 h-10 rounded bg-[#2C5F5A] text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
        <div class="flex-1"><h3 class="text-[18px] font-bold text-[#234B47] font-title">内容风控</h3><p class="text-[14px] text-[#5A6664] leading-snug">文本同步审核 + 图片异步审核；审核不可用时本地敏感词兜底、先发后审。</p></div>
        <div class="text-[13px] text-[#2C5F5A] bg-[#EAF0EE] px-3 py-1.5 rounded whitespace-nowrap">多级降级</div>
      </div>
      <div class="bg-white rounded-lg shadow px-5 py-3.5 flex items-center gap-5">
        <div class="w-10 h-10 rounded bg-[#2C5F5A] text-white flex items-center justify-center font-bold flex-shrink-0">4</div>
        <div class="flex-1"><h3 class="text-[18px] font-bold text-[#234B47] font-title">72h 自然消散</h3><p class="text-[14px] text-[#5A6664] leading-snug">服务端权威时间过期清理，到期自动移除并释放存储与在架压力。</p></div>
        <div class="text-[13px] text-[#2C5F5A] bg-[#EAF0EE] px-3 py-1.5 rounded whitespace-nowrap">服务端权威</div>
      </div>
      <div class="bg-white rounded-lg shadow px-5 py-3.5 flex items-center gap-5">
        <div class="w-10 h-10 rounded bg-[#C98A5E] text-white flex items-center justify-center font-bold flex-shrink-0">5</div>
        <div class="flex-1"><h3 class="text-[18px] font-bold text-[#234B47] font-title">AIGC 水彩图卷</h3><p class="text-[14px] text-[#5A6664] leading-snug">仅对有行为用户异步批量生成（≤30s/人），失败留白兜底，控制成本。</p></div>
        <div class="text-[13px] text-[#C98A5E] bg-[#F6EDE4] px-3 py-1.5 rounded whitespace-nowrap">异步批量</div>
      </div>
    </div>
  </div>
</div>
`);
