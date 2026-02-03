import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Zap, TrendingUp, ShieldCheck, Cpu, Sliders, BarChart3, CreditCard, Repeat, Activity } from 'lucide-react';
import { useSimulator, MODELS } from '../context/SimulatorContext';

const STRATEGIES = {
  cheapest: {
    title: "최저가",
    subtitle: "Cost Efficiency",
    desc: "마진율 극대화",
    icon: <DollarSign className="w-5 h-5" />,
    color: 'green'
  },
  balanced: {
    title: "합리적 균형",
    subtitle: "Balanced",
    desc: "성능과 비용의 균형",
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'blue'
  },
  quality: {
    title: "최고 성능",
    subtitle: "High Quality",
    desc: "프리미엄 경험",
    icon: <Zap className="w-5 h-5" />,
    color: 'purple'
  },
};

const PRICING_TYPES = {
  onetime: {
    title: "일회성 결제",
    subtitle: "One-time / Lifetime",
    icon: <CreditCard className="w-5 h-5" />,
    warning: true,
    warningText: "AI 서비스에 비권장 - 변동비 리스크"
  },
  subscription: {
    title: "구독형",
    subtitle: "Subscription",
    icon: <Repeat className="w-5 h-5" />,
    recommended: true
  },
  usage: {
    title: "사용량 기반",
    subtitle: "Pay-as-you-go",
    icon: <Activity className="w-5 h-5" />,
  },
};

export default function PricingSimulator() {
  const { params, updateParams, updatePricingResult } = useSimulator();
  const [allStrategies, setAllStrategies] = useState(null);

  const getTopModelForStrategy = (strategy) => {
    let sorted;
    if (strategy === 'cheapest') {
      sorted = [...MODELS].sort((a, b) => (a.input + a.output) - (b.input + b.output));
    } else if (strategy === 'quality') {
      sorted = [...MODELS].sort((a, b) => b.quality - a.quality);
    } else {
      sorted = [...MODELS].sort((a, b) => {
        const scoreA = a.quality / (a.input + a.output);
        const scoreB = b.quality / (b.input + b.output);
        return scoreB - scoreA;
      });
    }
    return sorted[0];
  };

  const calculateAllStrategies = () => {
    const patternMultiplier = params.usagePattern === 'heavy_start' ? 1.3 : 1.0;
    const dailyInteractions = params.dau * params.tasksPerUser;
    const monthlyInteractions = dailyInteractions * 30;

    const results = {};

    ['cheapest', 'balanced', 'quality'].forEach((strategy) => {
      const model = getTopModelForStrategy(strategy);

      const monthlyInputCost = (monthlyInteractions * params.avgInputTokens * patternMultiplier / 1000000) * model.input;
      const monthlyOutputCost = (monthlyInteractions * params.avgOutputTokens * patternMultiplier / 1000000) * model.output;
      const totalMonthlyCost = monthlyInputCost + monthlyOutputCost;
      const costPerUser = totalMonthlyCost / params.dau;

      const subscriptionPrice = costPerUser / (1 - (params.targetMargin / 100));
      const onetimePrice = (costPerUser * params.expectedLifetimeMonths * 1.2) / (1 - (params.targetMargin / 100));
      const costPerInteraction = (params.avgInputTokens * model.input + params.avgOutputTokens * model.output) / 1000000;
      const usagePrice = (costPerInteraction * 1000) / (1 - (params.targetMargin / 100));

      results[strategy] = {
        model,
        totalMonthlyCost,
        costPerUser,
        prices: {
          onetime: onetimePrice,
          subscription: subscriptionPrice,
          usage: usagePrice,
        }
      };
    });

    const strategyData = {
      data: results,
      patternMultiplier
    };

    setAllStrategies(strategyData);

    // Context에 Pricing 결과 저장
    updatePricingResult({
      strategies: results,
      patternMultiplier,
      recommendedStrategy: 'balanced',
      recommendedPricing: 'subscription',
      subscription: {
        cheapest: results.cheapest.prices.subscription,
        balanced: results.balanced.prices.subscription,
        quality: results.quality.prices.subscription,
      },
      models: {
        cheapest: results.cheapest.model,
        balanced: results.balanced.model,
        quality: results.quality.model,
      }
    });
  };

  useEffect(() => {
    calculateAllStrategies();
  }, [params]);

  const getColorClasses = (color) => {
    const colors = {
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800' },
    };
    return colors[color];
  };

  return (
    <div className="text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <header className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
            <Calculator className="text-blue-600" />
            AI Product Pricing Simulator
          </h1>
          <p className="text-slate-500 mt-2">
            B2C AI 서비스의 가격 방식별 최적의 모델과 가격을 비교하세요.
          </p>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-gray-500" /> 파라미터 설정
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">DAU</label>
              <input
                type="number"
                value={params.dau}
                onChange={(e) => updateParams({ dau: parseInt(e.target.value) || 0 })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">일일 작업수/유저</label>
              <input
                type="number"
                value={params.tasksPerUser}
                onChange={(e) => updateParams({ tasksPerUser: parseInt(e.target.value) || 0 })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Input Tokens</label>
              <input
                type="number"
                value={params.avgInputTokens}
                onChange={(e) => updateParams({ avgInputTokens: parseInt(e.target.value) || 0 })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Output Tokens</label>
              <input
                type="number"
                value={params.avgOutputTokens}
                onChange={(e) => updateParams({ avgOutputTokens: parseInt(e.target.value) || 0 })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">목표 마진율</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={params.targetMargin}
                  onChange={(e) => updateParams({ targetMargin: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <span className="text-sm text-slate-500">%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">예상 사용기간 (일회성용)</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={params.expectedLifetimeMonths}
                  onChange={(e) => updateParams({ expectedLifetimeMonths: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <span className="text-sm text-slate-500">개월</span>
              </div>
            </div>
          </div>
        </div>

        {allStrategies && Object.entries(PRICING_TYPES).map(([pricingKey, pricingInfo]) => (
          <div key={pricingKey} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className={`p-4 border-b ${pricingInfo.warning ? 'bg-red-50 border-red-200' : pricingInfo.recommended ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${pricingInfo.warning ? 'bg-red-100 text-red-600' : pricingInfo.recommended ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-600'}`}>
                    {pricingInfo.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{pricingInfo.title}</h3>
                    <p className="text-sm text-slate-500">{pricingInfo.subtitle}</p>
                  </div>
                </div>
                {pricingInfo.recommended && (
                  <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    RECOMMENDED
                  </span>
                )}
                {pricingInfo.warning && (
                  <span className="bg-red-100 text-red-700 text-xs font-medium px-3 py-1 rounded-full">
                    {pricingInfo.warningText}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {['cheapest', 'balanced', 'quality'].map((strategyKey) => {
                const strategy = STRATEGIES[strategyKey];
                const data = allStrategies.data[strategyKey];
                const colorClasses = getColorClasses(strategy.color);

                return (
                  <div key={strategyKey} className="p-5">
                    <div className={`${colorClasses.bg} ${colorClasses.border} border rounded-xl p-3 mb-4`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={colorClasses.text}>{strategy.icon}</span>
                        <span className={`font-bold ${colorClasses.text}`}>{strategy.title}</span>
                      </div>
                      <p className="text-xs text-slate-500">{strategy.desc}</p>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Cpu className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-slate-800">{data.model.name}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {data.model.provider} · 품질 {data.model.quality}/100
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">월 원가/유저</span>
                        <span className="font-mono text-slate-600">${data.costPerUser.toFixed(2)}</span>
                      </div>
                      <div className={`${colorClasses.bg} ${colorClasses.border} border rounded-lg p-3`}>
                        <div className="text-xs text-slate-500 mb-1">
                          {pricingKey === 'onetime' && '권장 판매가 (1회)'}
                          {pricingKey === 'subscription' && '권장 구독료 (월)'}
                          {pricingKey === 'usage' && '권장 단가 (1K req)'}
                        </div>
                        <div className={`text-2xl font-bold ${colorClasses.text}`}>
                          ${pricingKey === 'usage'
                            ? data.prices[pricingKey].toFixed(4)
                            : Math.ceil(data.prices[pricingKey])}
                          {pricingKey === 'subscription' && <span className="text-sm font-normal">/월</span>}
                        </div>
                      </div>

                      {(() => {
                        const price = data.prices[pricingKey];
                        let monthlyRevenue, monthlyCost, monthlyProfit, marginRate;

                        if (pricingKey === 'onetime') {
                          monthlyRevenue = (price * params.dau) / params.expectedLifetimeMonths;
                          monthlyCost = data.totalMonthlyCost;
                        } else if (pricingKey === 'subscription') {
                          monthlyRevenue = price * params.dau;
                          monthlyCost = data.totalMonthlyCost;
                        } else {
                          const monthlyInteractions = params.dau * params.tasksPerUser * 30;
                          monthlyRevenue = (price / 1000) * monthlyInteractions;
                          monthlyCost = data.totalMonthlyCost;
                        }

                        monthlyProfit = monthlyRevenue - monthlyCost;
                        marginRate = (monthlyProfit / monthlyRevenue) * 100;

                        return (
                          <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-500">예상 월 매출</span>
                              <span className="font-semibold text-slate-700">
                                ${monthlyRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">예상 월 비용</span>
                              <span className="font-mono text-red-500">
                                -${monthlyCost.toLocaleString(undefined, {maximumFractionDigits: 0})}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">예상 월 수익</span>
                              <span className={`font-bold ${monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${monthlyProfit.toLocaleString(undefined, {maximumFractionDigits: 0})}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                              <span className="text-slate-500">마진율</span>
                              <span className={`font-bold px-2 py-0.5 rounded ${marginRate >= 50 ? 'bg-green-100 text-green-700' : marginRate >= 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                {marginRate.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> 비용 절감 솔루션
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded-xl border">
              <strong className="block text-slate-800 mb-1">Context Caching</strong>
              <p className="text-slate-500 text-xs">긴 시스템 프롬프트나 문서는 캐싱하여 Input 비용 최대 50-90% 절감</p>
            </div>
            <div className="bg-white p-4 rounded-xl border">
              <strong className="block text-slate-800 mb-1">Model Routing</strong>
              <p className="text-slate-500 text-xs">단순 질문은 저가 모델, 복잡한 질문은 고성능 모델로 분기 처리</p>
            </div>
            <div className="bg-white p-4 rounded-xl border">
              <strong className="block text-slate-800 mb-1">Fine-tuning (LoRA)</strong>
              <p className="text-slate-500 text-xs">작은 모델을 파인튜닝하여 프롬프트 길이를 줄이고 성능 확보</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
            <BarChart3 className="w-6 h-6" />
            가격 정책 Best Practice
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="font-bold text-yellow-300 mb-2">초기 스타트업</div>
              <p className="opacity-90">
                <strong>구독형 + 최저가 모델</strong>로 시작하여 유저 확보 후 점진적으로 프리미엄 티어 추가
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="font-bold text-yellow-300 mb-2">B2B / 엔터프라이즈</div>
              <p className="opacity-90">
                <strong>사용량 기반 + 고품질 모델</strong>로 대규모 고객의 다양한 사용 패턴에 대응
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="font-bold text-yellow-300 mb-2">일회성 결제 주의</div>
              <p className="opacity-90">
                AI 서비스는 변동비가 영구 발생하므로 <strong>Lifetime Deal은 피하세요</strong>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
