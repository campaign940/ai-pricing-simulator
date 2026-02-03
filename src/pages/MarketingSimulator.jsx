import React, { useState, useMemo, useEffect } from 'react';
import {
  Calculator,
  Lightbulb,
  Rocket,
  Users,
  AlertCircle,
  TrendingUp,
  Target,
  Clock,
  Share2,
  Search,
  Instagram,
  Linkedin
} from 'lucide-react';
import { useSimulator, MODELS } from '../context/SimulatorContext';

export default function MarketingSimulator() {
  const { params, updateParams, selectedModel, analysisResult: decisionAnalysis, pricingResult } = useSimulator();

  const [pricingMethod, setPricingMethod] = useState('monthly');
  const [pricePerUser, setPricePerUser] = useState(0);
  const [targetNetMargin, setTargetNetMargin] = useState(20);

  // Pricing 페이지에서 연동된 토큰 값을 사용 (tasksPerUser * avgTokens)
  const inputTokensPerUser = params.avgInputTokens * params.tasksPerUser;
  const outputTokensPerUser = params.avgOutputTokens * params.tasksPerUser;

  const lifecycleData = useMemo(() => {
    const baseCost = ((inputTokensPerUser / 1000000) * selectedModel.input) + ((outputTokensPerUser / 1000000) * selectedModel.output);
    const months = [
      { name: '1개월 (초기)', multiplier: 1.5, label: 'Peak' },
      { name: '2개월', multiplier: 1.2, label: 'Drop' },
      { name: '3개월', multiplier: 0.75, label: 'Stable' },
      { name: '4개월', multiplier: 0.75, label: 'Stable' }
    ];

    return months.map(m => {
      const monthCost = baseCost * m.multiplier;
      let monthRevenue = pricingMethod === 'usage' ? monthCost * (1 + pricePerUser / 100) : pricePerUser;
      return { ...m, cost: monthCost, revenue: monthRevenue, profit: monthRevenue - monthCost };
    });
  }, [inputTokensPerUser, outputTokensPerUser, selectedModel, pricingMethod, pricePerUser]);

  const results = useMemo(() => {
    const avgMonthlyCost = lifecycleData.reduce((acc, curr) => acc + curr.cost, 0) / 4;
    const avgMonthlyRevenue = pricingMethod === 'usage' ? avgMonthlyCost * (1 + pricePerUser / 100) : pricePerUser;
    const avgMonthlyGrossProfit = avgMonthlyRevenue - avgMonthlyCost;

    const effectiveMonths = pricingMethod === 'onetime' ? 1 : params.retentionMonths;
    const ltv = avgMonthlyRevenue * effectiveMonths;
    const totalApiCostLtv = avgMonthlyCost * (pricingMethod === 'onetime' ? 12 : params.retentionMonths);

    const grossProfitLtv = ltv - totalApiCostLtv;
    const targetNetProfitLtv = ltv * (targetNetMargin / 100);

    const allowableCac = Math.max(0, grossProfitLtv - targetNetProfitLtv);
    const paybackPeriod = allowableCac / (avgMonthlyGrossProfit > 0 ? avgMonthlyGrossProfit : 0.001);

    const getChannels = (cac) => {
      if (cac <= 0) return [{ name: 'N/A', icon: <AlertCircle size={14}/>, desc: '마진율이 목표 이익률보다 낮아 마케팅 집행이 불가합니다.', efficiency: 'None' }];
      if (cac < 5) return [
        { name: 'SEO & Content', icon: <Search size={14}/>, desc: '유기적 유입 최적화 필요.', efficiency: 'High' },
        { name: 'Viral Loops', icon: <Rocket size={14}/>, desc: '프로덕트 내 초대 시스템.', efficiency: 'High' }
      ];
      if (cac < 30) return [
        { name: 'X / Threads', icon: <Share2 size={14}/>, desc: 'AI 타겟 인플루언서 마케팅.', efficiency: 'High' },
        { name: 'Meta Ads', icon: <Instagram size={14}/>, desc: '관심사 기반 타겟팅.', efficiency: 'Mid' }
      ];
      return [
        { name: 'Google Search', icon: <Search size={14}/>, desc: '고관여 키워드 광고.', efficiency: 'High' },
        { name: 'LinkedIn', icon: <Linkedin size={14}/>, desc: 'B2B 의사결정권자 타겟.', efficiency: 'High' }
      ];
    };

    return {
      avgMonthlyCost,
      avgMonthlyRevenue,
      avgMonthlyGrossProfit,
      ltv,
      grossProfitLtv,
      allowableCac,
      paybackPeriod,
      totalMarketingBudget: allowableCac * params.dau,
      channels: getChannels(allowableCac)
    };
  }, [lifecycleData, pricingMethod, pricePerUser, params.retentionMonths, targetNetMargin, params.dau]);

  const suggestions = useMemo(() => ({
    onetime: { finalPrice: Math.ceil(results.avgMonthlyCost * 12 * 4), label: '결제 가격 ($)' },
    monthly: { finalPrice: Math.ceil(results.avgMonthlyCost / (1 - 0.7)), label: '월 구독료 ($)' },
    usage: { finalPrice: 100, label: '원가 대비 마진율 (%)' }
  }), [results.avgMonthlyCost]);

  useEffect(() => {
    setPricePerUser(suggestions[pricingMethod].finalPrice);
  }, [pricingMethod, suggestions]);

  return (
    <div className="p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 border-b pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
              <Target className="text-blue-600" /> AI Marketing Budget Simulator
            </h1>
            <p className="text-slate-500 text-sm">사용량 기반 마진 및 마케팅 가용 비용 분석</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
             <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-widest">Selected Engine</span>
             <span className="text-sm font-bold text-blue-600">{selectedModel.name}</span>
          </div>
        </header>

        {/* 연동된 파라미터 표시 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-xs font-bold text-blue-600 mb-2">Pricing 페이지에서 연동된 값</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-slate-500 text-xs">DAU</span>
              <p className="font-bold">{params.dau.toLocaleString()}명</p>
            </div>
            <div>
              <span className="text-slate-500 text-xs">일일 Input Tokens</span>
              <p className="font-bold">{inputTokensPerUser.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-slate-500 text-xs">일일 Output Tokens</span>
              <p className="font-bold">{outputTokensPerUser.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-slate-500 text-xs">목표 마진율</span>
              <p className="font-bold">{params.targetMargin}%</p>
            </div>
            <div>
              <span className="text-slate-500 text-xs">모델</span>
              <p className="font-bold text-blue-600">{selectedModel.name}</p>
            </div>
          </div>
        </div>

        {/* Pricing 결과 연동 */}
        {pricingResult && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-xs font-bold text-green-600 mb-3">Pricing 페이지에서 연동된 추천 가격 정책</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 최저가 전략 */}
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-[10px] font-bold text-green-700 uppercase">최저가 전략</span>
                </div>
                <p className="text-lg font-bold text-green-700">${Math.ceil(pricingResult.subscription.cheapest)}/월</p>
                <p className="text-[10px] text-slate-500">{pricingResult.models.cheapest.name}</p>
              </div>
              {/* 균형 전략 */}
              <div className="bg-white rounded-lg p-3 border-2 border-blue-300 ring-2 ring-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-[10px] font-bold text-blue-700 uppercase">균형 전략 (권장)</span>
                </div>
                <p className="text-lg font-bold text-blue-700">${Math.ceil(pricingResult.subscription.balanced)}/월</p>
                <p className="text-[10px] text-slate-500">{pricingResult.models.balanced.name}</p>
              </div>
              {/* 고품질 전략 */}
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-[10px] font-bold text-purple-700 uppercase">고품질 전략</span>
                </div>
                <p className="text-lg font-bold text-purple-700">${Math.ceil(pricingResult.subscription.quality)}/월</p>
                <p className="text-[10px] text-slate-500">{pricingResult.models.quality.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Decision 분석 결과 연동 */}
        {decisionAnalysis && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
            <p className="text-xs font-bold text-indigo-600 mb-3">Decision 페이지에서 연동된 분석 결과</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <span className="text-slate-500 text-xs">로직 복잡도</span>
                <p className={`font-bold ${
                  decisionAnalysis.complexity === 'High' ? 'text-red-600' :
                  decisionAnalysis.complexity === 'Mid' ? 'text-yellow-600' : 'text-green-600'
                }`}>{decisionAnalysis.complexity}</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs">사용 패턴</span>
                <p className="font-bold capitalize">{decisionAnalysis.usageType}</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs">인당 API 비용</span>
                <p className="font-bold">${decisionAnalysis.costPerUser.toFixed(4)}</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs">월 비용</span>
                <p className="font-bold">${decisionAnalysis.monthlyCost.toFixed(2)}</p>
              </div>
            </div>
            {/* 추천 가격 정책 요약 */}
            <div className="bg-white rounded-lg p-3 border border-indigo-100">
              <p className="text-[10px] font-bold text-indigo-500 uppercase mb-2">추천 가격 정책 (제 3안 - 하이브리드)</p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">기본료</span>
                  <p className="font-bold text-indigo-700">
                    ${decisionAnalysis.decisions[2]?.basePrice || Math.ceil(decisionAnalysis.monthlyCost * 1.5)}/월
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">사용량 단가</span>
                  <p className="font-bold text-indigo-700">
                    ${decisionAnalysis.decisions[2]?.usagePrice || (decisionAnalysis.costPerUser * 1000 * 2.5).toFixed(4)}/1K req
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">무료 구간</span>
                  <p className="font-bold text-indigo-700">{decisionAnalysis.decisions[2]?.freeTier || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-600">
                <Users size={20} /> 마케팅 설정
              </h2>
              <div className="space-y-4">
                <div className="bg-slate-50 p-2 rounded-lg border">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">평균 유지 기간 (개월)</label>
                  <input
                    type="number"
                    value={params.retentionMonths}
                    onChange={(e) => updateParams({ retentionMonths: Number(e.target.value) })}
                    className="w-full bg-transparent border-none outline-none font-bold text-sm"
                  />
                </div>
                <select
                  value={params.selectedModelId}
                  onChange={(e) => updateParams({ selectedModelId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg text-sm"
                >
                  {MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-600">
                <Calculator size={20} /> 프라이싱 전략
              </h2>
              <div className="space-y-4">
                <div className="bg-slate-100 p-1 rounded-xl flex">
                  {['onetime', 'monthly', 'usage'].map(type => (
                    <button key={type} onClick={() => setPricingMethod(type)} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${pricingMethod === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                      {type === 'onetime' ? '일회성' : type === 'monthly' ? '구독형' : '사용량'}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{suggestions[pricingMethod].label}</label>
                  <input
                    type="number"
                    value={pricePerUser}
                    onChange={(e) => setPricePerUser(Number(e.target.value))}
                    className="w-full p-2 border-2 border-blue-200 rounded-lg font-bold text-blue-700 outline-none"
                  />
                  {pricingMethod === 'usage' && (
                    <p className="text-[10px] text-slate-400 mt-1">원가에 {pricePerUser}%의 마진을 붙여 청구합니다.</p>
                  )}
                </div>

                <div>
                  <label className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
                    목표 최종 순이익률 <span>{targetNetMargin}%</span>
                  </label>
                  <input type="range" min="0" max="80" step="5" value={targetNetMargin} onChange={(e) => setTargetNetMargin(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
               <Rocket className="absolute -right-4 -bottom-4 w-48 h-48 opacity-10 rotate-12" />
               <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <p className="text-blue-100 text-xs font-bold uppercase mb-1 tracking-wider">가용 유저당 마케팅비 (Max CAC)</p>
                    <h2 className="text-6xl font-black mb-2">${results.allowableCac.toLocaleString(undefined, {maximumFractionDigits: 1})}</h2>
                    {results.allowableCac <= 0 ? (
                      <div className="bg-red-500/30 p-2 rounded border border-red-400 mt-2 flex gap-2 items-center">
                        <AlertCircle size={14} />
                        <p className="text-[10px] font-bold">마진율을 높이거나 목표 이익을 낮춰야 합니다.</p>
                      </div>
                    ) : (
                      <p className="text-blue-100 text-xs opacity-80 leading-relaxed">
                        API 비용과 목표 이익을 제외하고 남은 마케팅 가용 예산입니다.
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col justify-center border-l border-blue-400/50 pl-8 space-y-4">
                    <div>
                      <p className="text-blue-100 text-[10px] font-bold uppercase mb-1 flex items-center gap-1"><Clock size={12}/> 마케팅비 회수</p>
                      <p className="text-2xl font-bold">{results.paybackPeriod > 100 ? '∞' : results.paybackPeriod.toFixed(1)}개월</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-[10px] font-bold uppercase mb-1 flex items-center gap-1"><TrendingUp size={12}/> 유저당 기대 총이익</p>
                      <p className="text-2xl font-bold">${results.grossProfitLtv.toLocaleString(undefined, {maximumFractionDigits: 1})}</p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">월 평균 원가</p>
                <p className="text-xl font-bold text-slate-800">${results.avgMonthlyCost.toFixed(2)}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">월 평균 매출</p>
                <p className="text-xl font-bold text-slate-800">${results.avgMonthlyRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">LTV (고객생애가치)</p>
                <p className="text-xl font-bold text-green-600">${results.ltv.toFixed(0)}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">총 마케팅 예산</p>
                <p className="text-xl font-bold text-blue-600">${results.totalMarketingBudget.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Target className="text-red-500" size={20} /> 마케팅 집행 전략
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.channels.map((ch, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${ch.efficiency === 'None' ? 'bg-red-50 border-red-100 opacity-60' : 'bg-slate-50 hover:border-blue-300'} transition-all`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">{ch.icon}</div>
                      <span className="text-xs font-bold text-slate-700">{ch.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight mb-4 h-8 overflow-hidden">{ch.desc}</p>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                      <span className="text-[10px] text-slate-400">효율</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ch.efficiency === 'High' ? 'bg-green-100 text-green-700' : ch.efficiency === 'Mid' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {ch.efficiency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-yellow-600">
                <Lightbulb size={18} /> 사용량 기반 프라이싱의 함정
              </h3>
              <div className="space-y-3 text-[11px] text-slate-600 leading-relaxed">
                <p>
                  사용량 기반 과금에서 <b>마진율(Markup)</b>이 <b>목표 순이익률</b>보다 낮으면 안 됩니다.
                  예를 들어, 원가에 20%를 붙여서 팔고(Markup 20%), 전체 매출의 20%를 순이익으로 남기려 한다면 마케팅 비용은 절대 나올 수 없습니다.
                </p>
                <div className="p-3 bg-slate-50 rounded-lg border">
                  <b>해결책:</b> 마케팅을 공격적으로 하려면 사용량 과금의 마진율을 원가의 <b>100%(2배)</b> 이상으로 책정하거나,
                  구독료 안에 일정 사용량을 포함시키는 <b>하이브리드 모델</b>을 고려하세요.
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
