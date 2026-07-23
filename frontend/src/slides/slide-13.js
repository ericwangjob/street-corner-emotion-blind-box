window.slideDataMap.set(13, `
<div class="w-[1440px] h-[810px] shadow-2xl relative overflow-hidden slide-bg">
  <div class="w-[1350px] h-[720px] mx-auto my-[45px] flex flex-col">
    <div class="mb-4">
      <div class="text-[14px] tracking-[0.28em] text-[#C98A5E] font-semibold mb-2">03 · 技术架构与方案</div>
      <h1 class="text-[36px] font-bold text-[#234B47] font-title leading-tight">技术架构总览</h1>
      <div class="w-16 h-[3px] bg-[#C98A5E] mt-3"></div>
    </div>
    <div class="flex-1 flex flex-col gap-2.5 justify-center">
      <div class="flex items-stretch rounded-lg overflow-hidden shadow">
        <div class="w-32 bg-[#2C5F5A] text-white flex items-center justify-center text-[16px] font-bold font-title">接入层</div>
        <div class="flex-1 bg-white px-6 py-3 flex items-center gap-3 flex-wrap">
          <span class="px-3 py-1 bg-[#EAF0EE] rounded text-[14px] text-[#234B47]">微信小程序 iOS / Android</span>
          <span class="px-3 py-1 bg-[#EAF0EE] rounded text-[14px] text-[#234B47]">基础库 ≥2.30.0</span>
          <span class="px-3 py-1 bg-[#EAF0EE] rounded text-[14px] text-[#234B47]">iOS14+ / Android9+</span>
        </div>
      </div>
      <div class="flex items-stretch rounded-lg overflow-hidden shadow">
        <div class="w-32 bg-[#2C5F5A] text-white flex items-center justify-center text-[16px] font-bold font-title">能力层</div>
        <div class="flex-1 bg-white px-6 py-3 flex items-center gap-3 flex-wrap">
          <span class="px-3 py-1 bg-[#EAF0EE] rounded text-[14px] text-[#234B47]">情绪罗盘渲染</span>
          <span class="px-3 py-1 bg-[#EAF0EE] rounded text-[14px] text-[#234B47]">近场围栏触发</span>
          <span class="px-3 py-1 bg-[#EAF0EE] rounded text-[14px] text-[#234B47]">盲盒发布</span>
          <span class="px-3 py-1 bg-[#EAF0EE] rounded text-[14px] text-[#234B47]">风控审核</span>
        </div>
      </div>
      <div class="flex items-stretch rounded-lg overflow-hidden shadow">
        <div class="w-32 bg-[#2C5F5A] text-white flex items-center justify-center text-[16px] font-bold font-title">服务层</div>
        <div class="flex-1 bg-white px-6 py-3 flex items-center gap-3 flex-wrap">
          <span class="px-3 py-1 bg-[#EAF0EE] rounded text-[14px] text-[#234B47]">盲盒生命周期（72h 权威过期）</span>
          <span class="px-3 py-1 bg-[#EAF0EE] rounded text-[14px] text-[#234B47]">匿名代号服务</span>
          <span class="px-3 py-1 bg-[#EAF0EE] rounded text-[14px] text-[#234B47]">AIGC 图卷（异步）</span>
        </div>
      </div>
      <div class="flex items-stretch rounded-lg overflow-hidden shadow">
        <div class="w-32 bg-[#2C5F5A] text-white flex items-center justify-center text-[16px] font-bold font-title">数据层</div>
        <div class="flex-1 bg-white px-6 py-3 flex items-center gap-3 flex-wrap">
          <span class="px-3 py-1 bg-[#EAF0EE] rounded text-[14px] text-[#234B47]">blind_box</span>
          <span class="px-3 py-1 bg-[#EAF0EE] rounded text-[14px] text-[#234B47]">user_anonymous</span>
          <span class="px-3 py-1 bg-[#EAF0EE] rounded text-[14px] text-[#234B47]">mood_canvas</span>
          <span class="px-3 py-1 bg-[#EAF0EE] rounded text-[14px] text-[#234B47]">trail</span>
          <span class="px-3 py-1 bg-[#EAF0EE] rounded text-[14px] text-[#234B47]">72h 签名 URL · 按周聚合</span>
        </div>
      </div>
      <div class="flex items-stretch rounded-lg overflow-hidden shadow">
        <div class="w-32 bg-[#5E8AA0] text-white flex items-center justify-center text-[16px] font-bold font-title">外部依赖</div>
        <div class="flex-1 bg-white px-6 py-3 flex items-center gap-3 flex-wrap">
          <span class="px-3 py-1 bg-[#EEF3F5] rounded text-[14px] text-[#234B47]">地图 SDK</span>
          <span class="px-3 py-1 bg-[#EEF3F5] rounded text-[14px] text-[#234B47]">气象 API</span>
          <span class="px-3 py-1 bg-[#EEF3F5] rounded text-[14px] text-[#234B47]">内容安全审核 API</span>
          <span class="px-3 py-1 bg-[#EEF3F5] rounded text-[14px] text-[#234B47]">AIGC 图像服务</span>
          <span class="px-3 py-1 bg-[#EEF3F5] rounded text-[14px] text-[#234B47]">私有 CDN</span>
        </div>
      </div>
    </div>
    <div class="mt-4 bg-[#2C5F5A] rounded-lg px-6 py-3 flex items-center justify-around text-white">
      <div class="text-center"><p class="text-[13px] text-[#AFC9C2]">传输安全</p><p class="text-[15px] font-semibold">HTTPS + 微信加密通道</p></div>
      <div class="w-[1px] h-8 bg-[#5E8AA0]"></div>
      <div class="text-center"><p class="text-[13px] text-[#AFC9C2]">并发在线（单城市区）</p><p class="text-[15px] font-semibold">≥ 5,000</p></div>
      <div class="w-[1px] h-8 bg-[#5E8AA0]"></div>
      <div class="text-center"><p class="text-[13px] text-[#AFC9C2]">崩溃率</p><p class="text-[15px] font-semibold">≤ 0.1%</p></div>
    </div>
  </div>
</div>
`);
