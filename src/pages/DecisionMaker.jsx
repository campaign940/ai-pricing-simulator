import React, { useState, useMemo } from 'react';
import {
  Lightbulb,
  Target,
  FileCode,
  BrainCircuit,
  PieChart,
  ClipboardList
} from 'lucide-react';
import { useSimulator, MODELS } from '../context/SimulatorContext';

export default function DecisionMaker() {
  const { params, updateParams, selectedModel, analysisResult, updateAnalysisResult } = useSimulator();

  const [productCode, setProductCode] = useState("");
  const [productPlan, setProductPlan] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateDecisions = () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const combinedInput = (productCode + " " + productPlan).toLowerCase();
      let complexity = "Low";
      let estimatedInput = 3000;
      let estimatedOutput = 1000;
      let usageType = "simple";

      if (combinedInput.includes("image") || combinedInput.includes("video") || combinedInput.includes("analyze") || combinedInput.includes("vision")) {
        complexity = "High";
        estimatedInput = 15000;
        estimatedOutput = 5000;
        usageType = "heavy";
      } else if (combinedInput.includes("stream") || combinedInput.includes("chat") || combinedInput.includes("conversation")) {
        complexity = "Mid";
        estimatedInput = 8000;
        estimatedOutput = 3000;
        usageType = "moderate";
      }

      // Context에 토큰 값 업데이트
      updateParams({
        avgInputTokens: estimatedInput,
        avgOutputTokens: estimatedOutput
      });

      const costPerUser = ((estimatedInput / 1000000) * selectedModel.input) + ((estimatedOutput / 1000000) * selectedModel.output);
      const monthlyCost = costPerUser * params.tasksPerUser * 30;

      const decisions = [
        {
          id: 1,
          title: "제 1안: 시장 침투형 (Aggressive Growth)",
          method: "구독형 (Monthly Subscription)",
          methodType: "subscription",
          price: Math.max(1, Math.ceil(monthlyCost * 2)),
          priceUnit: "$/월",
          freeTier: usageType === "heavy"
            ? "월 3회 무료 제공"
            : usageType === "moderate"
              ? "월 10회 무료 제공"
              : "월 20회 무료 제공",
          marginRate: "50%+",
          reason: "초기 사용자 확보를 위해 진입 장벽을 최소화한 정책입니다. 충분한 무료 구간을 통해 제품의 가치를 먼저 경험하게 한 뒤, 자연스러운 유료 전환을 유도합니다. 바이럴 마케팅과 구전 효과를 극대화할 수 있습니다.",
          pros: "빠른 사용자 증가, 데이터 확보 용이, 바이럴 효과",
          cons: "초기 적자 가능성, 낮은 인당 수익성, 무료 유저 이탈 리스크",
          recommended: false
        },
        {
          id: 2,
          title: "제 2안: 수익 극대화형 (Premium Value)",
          method: usageType === "heavy" ? "일회성 결제 (One-time)" : "프리미엄 구독형 (Tiered)",
          methodType: usageType === "heavy" ? "onetime" : "subscription",
          price: usageType === "heavy"
            ? Math.ceil(monthlyCost * 12 * 3)
            : Math.ceil(monthlyCost * 6),
          priceUnit: usageType === "heavy" ? "$ (1회)" : "$/월",
          freeTier: "무료 제공 없음 (3일 Trial만 제공)",
          marginRate: "80%+",
          reason: "제품의 독보적인 기능과 차별화된 가치를 강조하며 헤비 유저와 기업 고객을 타겟팅합니다. 높은 가격대를 통해 프리미엄 브랜드 이미지를 구축하고, 고비용 API 사용을 충분히 커버합니다.",
          pros: "높은 순이익률, 브랜드 가치 제고, 충성 고객 확보",
          cons: "높은 이탈률, 타겟 유저 한정, 경쟁사 대비 가격 저항",
          recommended: false
        },
        {
          id: 3,
          title: "제 3안: 합리적 확장형 (Scalable Hybrid)",
          method: "기본료 + 사용량 기반 (Hybrid)",
          methodType: "hybrid",
          basePrice: Math.max(1, Math.ceil(monthlyCost * 1.5)),
          usagePrice: (costPerUser * 1000 * 2.5).toFixed(4),
          price: `$${Math.max(1, Math.ceil(monthlyCost * 1.5))}/월 + $${(costPerUser * 1000 * 2.5).toFixed(4)}/1K req`,
          priceUnit: "하이브리드",
          freeTier: usageType === "heavy"
            ? "월 1,000 토큰 무료 포함"
            : usageType === "moderate"
              ? "월 5,000 토큰 무료 포함"
              : "월 10,000 토큰 무료 포함",
          marginRate: "65%+",
          reason: "가장 권장하는 안입니다. 기본료로 최소 운영비를 확보하면서, 사용량이 많은 유저에게 공정하게 과금하여 리스크를 분산합니다. 라이트 유저와 헤비 유저 모두를 포용할 수 있어 지속 가능성이 높습니다.",
          pros: "리스크 분산, 유저 사용량 최적화 유도, 확장성 우수",
          cons: "과금 체계 복잡, UI/UX 설명 필요, 예측 어려움",
          recommended: true
        }
      ];

      updateAnalysisResult({ decisions, complexity, costPerUser, monthlyCost, usageType });
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <BrainCircuit className="text-blue-600" /> AI Price Decision Maker
          </h1>
          <p className="text-slate-500 text-sm">제품 로직과 명세를 분석하여 최적의 수익 모델 3안을 제안합니다.</p>
        </header>

        {/* 연동된 파라미터 표시 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-xs font-bold text-blue-600 mb-2">Pricing 페이지에서 연동된 값</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-500 text-xs">DAU</span>
              <p className="font-bold">{params.dau.toLocaleString()}명</p>
            </div>
            <div>
              <span className="text-slate-500 text-xs">일일 작업수/유저</span>
              <p className="font-bold">{params.tasksPerUser}회</p>
            </div>
            <div>
              <span className="text-slate-500 text-xs">목표 마진율</span>
              <p className="font-bold">{params.targetMargin}%</p>
            </div>
            <div>
              <span className="text-slate-500 text-xs">분석 모델</span>
              <p className="font-bold text-blue-600">{selectedModel.name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-indigo-600">
                <Target size={20} /> 데이터 입력
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                    <FileCode size={14} /> 제품 코드 (Logic)
                  </label>
                  <textarea
                    className="w-full h-64 p-3 bg-slate-50 border rounded-xl text-[11px] font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="API 호출 로직이나 핵심 함수를 입력하세요..."
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                    <ClipboardList size={14} /> 제품 명세 (Spec)
                  </label>
                  <textarea
                    className="w-full h-40 p-3 bg-slate-50 border rounded-xl text-[11px] focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="제품의 기능 명세, 데이터 처리 방식, 주요 알고리즘을 설명하세요..."
                    value={productPlan}
                    onChange={(e) => setProductPlan(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">분석용 기준 모델</label>
                <select
                  value={params.selectedModelId}
                  onChange={(e) => updateParams({ selectedModelId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg text-sm outline-none cursor-pointer"
                >
                  {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              <button
                onClick={generateDecisions}
                disabled={isAnalyzing || (!productCode && !productPlan)}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                  isAnalyzing || (!productCode && !productPlan) ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg active:scale-95'
                }`}
              >
                {isAnalyzing ? "데이터 분석 중..." : "가격 정책 제안받기"}
              </button>
            </section>
          </div>

          {/* Result Section */}
          <div className="lg:col-span-2 space-y-6">
            {analysisResult ? (
              <>
                {/* Analysis Overview */}
                <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest block mb-1">Product Analysis</span>
                    <h2 className="text-2xl font-bold">로직 복잡도: {analysisResult.complexity}</h2>
                    <p className="text-indigo-100 text-xs mt-1">추정 인당 월 API 비용: ${analysisResult.monthlyCost.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-[10px] text-indigo-200 font-bold uppercase">Input Tokens</p>
                      <p className="text-xl font-bold">{params.avgInputTokens.toLocaleString()}</p>
                    </div>
                    <div className="text-center border-l border-indigo-400/50 pl-4">
                      <p className="text-[10px] text-indigo-200 font-bold uppercase">Output Tokens</p>
                      <p className="text-xl font-bold">{params.avgOutputTokens.toLocaleString()}</p>
                    </div>
                    <div className="text-center border-l border-indigo-400/50 pl-4">
                      <p className="text-[10px] text-indigo-200 font-bold uppercase">사용 패턴</p>
                      <p className="text-xl font-bold capitalize">{analysisResult.usageType}</p>
                    </div>
                  </div>
                </div>

                {/* The 3 Decisions */}
                <div className="space-y-4">
                  {analysisResult.decisions.map((decision) => (
                    <div
                      key={decision.id}
                      className={`bg-white p-6 rounded-2xl shadow-sm border-2 transition-all ${
                        decision.recommended
                          ? 'border-blue-400 ring-2 ring-blue-100'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-800">{decision.title}</h3>
                          {decision.recommended && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">
                              RECOMMENDED
                            </span>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          decision.methodType === 'subscription' ? 'bg-green-100 text-green-700' :
                          decision.methodType === 'onetime' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {decision.method}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">추천 과금액</p>
                          <p className="text-xl font-black text-blue-600">
                            {typeof decision.price === 'number'
                              ? `$${decision.price}`
                              : decision.price}
                          </p>
                          <p className="text-[10px] text-slate-400">{decision.priceUnit}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">무료 이용 구간</p>
                          <p className="text-sm font-bold text-slate-700">{decision.freeTier}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">기대 마진율</p>
                          <p className="text-xl font-bold text-green-600">{decision.marginRate}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className={`p-4 rounded-xl border ${
                          decision.recommended
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-yellow-50 border-yellow-100'
                        }`}>
                          <p className={`text-xs font-bold mb-1 flex items-center gap-2 ${
                            decision.recommended ? 'text-blue-800' : 'text-yellow-800'
                          }`}>
                            <Lightbulb size={14} /> 추천 사유
                          </p>
                          <p className={`text-xs leading-relaxed ${
                            decision.recommended ? 'text-blue-700' : 'text-yellow-700'
                          }`}>
                            {decision.reason}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-[11px]">
                          <div className="text-green-600">
                            <span className="font-bold block mb-1">✓ 장점</span>
                            {decision.pros}
                          </div>
                          <div className="text-red-600">
                            <span className="font-bold block mb-1">✗ 단점 / 주의사항</span>
                            {decision.cons}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
                  <h3 className="font-bold mb-3">종합 의견</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    분석 결과, 현재 제품의 복잡도는 <strong className="text-white">{analysisResult.complexity}</strong>이며,
                    추정 월 API 비용은 <strong className="text-white">${analysisResult.monthlyCost.toFixed(2)}</strong>입니다.
                    {analysisResult.usageType === 'heavy' && (
                      " 이미지/비디오 처리와 같은 고비용 작업이 포함되어 있어 프리미엄 가격 정책이 적합합니다."
                    )}
                    {analysisResult.usageType === 'moderate' && (
                      " 채팅/스트리밍 기능이 포함되어 있어 사용량에 따른 과금이 합리적입니다."
                    )}
                    {analysisResult.usageType === 'simple' && (
                      " 단순한 API 호출 패턴으로, 저렴한 구독형 모델로 시장 점유율 확대가 가능합니다."
                    )}
                    {" "}제 3안(하이브리드)을 기본으로 시작하여 시장 반응에 따라 조정하는 것을 권장합니다.
                  </p>
                </div>
              </>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <PieChart size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-400">분석 결과가 여기에 표시됩니다.</h3>
                <p className="text-sm text-slate-400 max-w-xs mt-2">제품 코드와 명세를 입력하고 분석 버튼을 눌러 비즈니스 모델을 제안받으세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
