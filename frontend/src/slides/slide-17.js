window.slideDataMap.set(17, `
<div class="w-[1440px] h-[810px] shadow-2xl relative overflow-hidden slide-bg">
  <div class="w-[1350px] h-[720px] mx-auto my-[45px] flex flex-col">
    <div class="mb-5">
      <div class="text-[14px] tracking-[0.28em] text-[#C98A5E] font-semibold mb-2">04 · 项目实施计划与里程碑</div>
      <h1 class="text-[36px] font-bold text-[#234B47] font-title leading-tight">风险识别与应对</h1>
      <div class="w-16 h-[3px] bg-[#C98A5E] mt-3"></div>
    </div>
    <div class="bg-white rounded-lg shadow overflow-hidden flex-1">
      <table class="w-full h-full text-left">
        <thead>
          <tr class="bg-[#2C5F5A] text-white text-[15px]">
            <th class="p-4 w-[26%]">风险项</th>
            <th class="p-4 w-[10%] text-center">等级</th>
            <th class="p-4 w-[24%]">影响</th>
            <th class="p-4">应对策略</th>
          </tr>
        </thead>
        <tbody class="text-[14px]">
          <tr class="border-b border-[#ECE7DE]">
            <td class="p-4 font-semibold text-[#234B47]">LBS 围栏精度不足（GPS 漂移）</td>
            <td class="p-4 text-center"><span class="px-3 py-1 rounded-full bg-[#B5654E] text-white text-[13px] font-semibold">高</span></td>
            <td class="p-4 text-[#5A6664]">误触 / 漏触</td>
            <td class="p-4 text-[#4A5654]">3s 停留确认 + 网络定位兜底 + 围栏容差</td>
          </tr>
          <tr class="border-b border-[#ECE7DE] bg-[#FAF8F5]">
            <td class="p-4 font-semibold text-[#234B47]">后台定位耗电 / 隐私争议</td>
            <td class="p-4 text-center"><span class="px-3 py-1 rounded-full bg-[#C98A5E] text-white text-[13px] font-semibold">中</span></td>
            <td class="p-4 text-[#5A6664]">卸载 / 合规风险</td>
            <td class="p-4 text-[#4A5654]">仅前台步行启用，混合定位</td>
          </tr>
          <tr class="border-b border-[#ECE7DE]">
            <td class="p-4 font-semibold text-[#234B47]">AIGC 成本与延迟</td>
            <td class="p-4 text-center"><span class="px-3 py-1 rounded-full bg-[#C98A5E] text-white text-[13px] font-semibold">中</span></td>
            <td class="p-4 text-[#5A6664]">图卷延迟 / 超支</td>
            <td class="p-4 text-[#4A5654]">仅行为用户生成、异步批量、限分辨率</td>
          </tr>
          <tr class="border-b border-[#ECE7DE] bg-[#FAF8F5]">
            <td class="p-4 font-semibold text-[#234B47]">内容审核误杀（温情文案）</td>
            <td class="p-4 text-center"><span class="px-3 py-1 rounded-full bg-[#C98A5E] text-white text-[13px] font-semibold">中</span></td>
            <td class="p-4 text-[#5A6664]">创作意愿下降</td>
            <td class="p-4 text-[#4A5654]">本地敏感词兜底 + 人工复核申诉</td>
          </tr>
          <tr>
            <td class="p-4 font-semibold text-[#234B47]">弱网发布失败</td>
            <td class="p-4 text-center"><span class="px-3 py-1 rounded-full bg-[#C98A5E] text-white text-[13px] font-semibold">中</span></td>
            <td class="p-4 text-[#5A6664]">体验中断</td>
            <td class="p-4 text-[#4A5654]">本地草稿 + 自动重试</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 bg-[#EAF0EE] border-l-4 border-[#2C5F5A] px-6 py-3 rounded">
      <p class="text-[15px] text-[#234B47]"><span class="font-bold">总策略：</span>最小必要 + 前台触发；外部依赖全降级；一期严守 Non-Goals；指标先建基线、随数据迭代。</p>
    </div>
  </div>
</div>
`);
