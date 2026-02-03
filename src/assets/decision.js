const { asOf, fxRateDefault, models } = window.PRICING_DATA;

const formatterKRW = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });
const formatterUSD = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });

const formatKRW = (value) => `${formatterKRW.format(value)}원`;
const formatUSD = (value) => `$${formatterUSD.format(value)}`;

const estimateComplexity = (text) => {
  const combined = text.toLowerCase();
  let complexity = "Low";
  let inputTokens = 3000;
  let outputTokens = 1000;

  if (combined.includes("image") || combined.includes("video") || combined.includes("analyze")) {
    complexity = "High";
    inputTokens = 15000;
    outputTokens = 5000;
  } else if (combined.includes("stream") || combined.includes("chat")) {
    complexity = "Mid";
    inputTokens = 8000;
    outputTokens = 3000;
  }

  return { complexity, inputTokens, outputTokens };
};

const getModelCostUSD = (model, inputTokens, outputTokens) => {
  return (inputTokens / 1_000_000) * model.input + (outputTokens / 1_000_000) * model.output;
};

const buildDecisions = (costKRW, costUSD, complexity) => {
  const packRequests = complexity === "High" ? 80 : complexity === "Mid" ? 100 : 120;
  const monthlyRequests = complexity === "High" ? 180 : complexity === "Mid" ? 250 : 320;

  const oneTimePriceKRW = costKRW * packRequests * 2.2;
  const monthlyPriceKRW = costKRW * monthlyRequests * 3.4;
  const usagePriceKRW = costKRW * 3.0;

  return [
    {
      id: 1,
      title: "1안: One-time Pack (시장 진입형)",
      method: "One-time",
      price: `${formatKRW(oneTimePriceKRW)} / pack`,
      priceNote: `${packRequests} requests 포함`,
      priceUSD: formatUSD((oneTimePriceKRW / fxRateDefault) || 0),
      freeTier: "무료 제공 없음",
      reason:
        "즉시 결제에 최적화된 패키지입니다. 간단한 니즈를 가진 유저에게 빠른 전환을 유도하고, 초기 현금 흐름을 확보합니다.",
      pros: "구매 결정이 빠름, 환불 리스크 낮음",
      cons: "반복 사용 유도 약함, LTV 성장 제한",
    },
    {
      id: 2,
      title: "2안: Monthly Subscription (성장형)",
      method: "Monthly",
      price: `${formatKRW(monthlyPriceKRW)} / month`,
      priceNote: `${monthlyRequests} requests / month`,
      priceUSD: formatUSD((monthlyPriceKRW / fxRateDefault) || 0),
      freeTier: "월 10회 무료 제공",
      reason:
        "반복 사용을 전제로 한 구독형 구조입니다. 무료 구간으로 체험을 제공하고, 사용량 증가에 따른 자연스러운 업그레이드를 유도합니다.",
      pros: "안정적인 반복 매출, 리텐션 기반 성장",
      cons: "초기 전환 장벽 존재, 이탈 관리 필요",
    },
    {
      id: 3,
      title: "3안: Usage-based (합리적 확장형)",
      method: "Usage",
      price: `${formatKRW(usagePriceKRW)} / request`,
      priceNote: "사용량 기반 과금",
      priceUSD: formatUSD((usagePriceKRW / fxRateDefault) || 0),
      freeTier: "월 5,000 토큰 무료",
      reason:
        "사용량에 맞춰 과금하기 때문에 공정성이 높고, 고사용자에서 수익을 극대화할 수 있습니다. 비용 리스크 분산에 효과적입니다.",
      pros: "비용-매출 정합성 높음, 확장성 우수",
      cons: "가격 이해도 설명 필요, 과금 UI 복잡",
    },
  ];
};

const renderSummary = ({ complexity, inputTokens, outputTokens, costUSD, costKRW }) => {
  const summary = document.getElementById("decision-summary");
  summary.innerHTML = `
    <div>
      <p class="eyebrow">Product Analysis</p>
      <h2>로직 복잡도: ${complexity}</h2>
      <p class="muted">추정 요청당 API 비용: ${formatKRW(costKRW)} (${formatUSD(costUSD)})</p>
    </div>
    <div class="summary-row">
      <div>
        <p class="label">Input Tokens</p>
        <h4>${formatterKRW.format(inputTokens)}</h4>
      </div>
      <div>
        <p class="label">Output Tokens</p>
        <h4>${formatterKRW.format(outputTokens)}</h4>
      </div>
    </div>
  `;
};

const renderCards = (decisions) => {
  const container = document.getElementById("decision-cards");
  container.innerHTML = decisions
    .map(
      (decision) => `
        <div class="decision-card">
          <div class="decision-head">
            <h3>${decision.title}</h3>
            <span class="pill">${decision.method}</span>
          </div>
          <div class="decision-metrics">
            <div class="decision-metric">
              <p class="label">추천 과금액</p>
              <p class="metric-value">${decision.price}</p>
              <p class="muted">${decision.priceUSD}</p>
              <p class="muted">${decision.priceNote}</p>
            </div>
            <div class="decision-metric">
              <p class="label">무료 이용 구간</p>
              <p class="metric-value">${decision.freeTier}</p>
            </div>
            <div class="decision-metric">
              <p class="label">추천 포인트</p>
              <p class="metric-value">${decision.pros}</p>
            </div>
          </div>
          <div class="decision-reason">
            <p class="label">추천 사유</p>
            <p class="muted">${decision.reason}</p>
          </div>
          <div class="decision-proscons">
            <div>
              <p class="label">장점</p>
              <p class="muted">${decision.pros}</p>
            </div>
            <div>
              <p class="label">주의사항</p>
              <p class="muted">${decision.cons}</p>
            </div>
          </div>
        </div>
      `,
    )
    .join("");
};

const initDecisionMaker = () => {
  const codeEl = document.getElementById("decision-code");
  const specEl = document.getElementById("decision-spec");
  const modelEl = document.getElementById("decision-model");
  const runBtn = document.getElementById("decision-run");
  const emptyEl = document.getElementById("decision-empty");
  const resultEl = document.getElementById("decision-result");

  models.forEach((model) => {
    const option = document.createElement("option");
    option.value = model.key;
    option.textContent = `${model.name} · ${model.provider} (${model.tier})`;
    modelEl.appendChild(option);
  });

  modelEl.value = models.find((model) => model.tier === "Balanced")?.key || models[0]?.key;

  const toggleButton = (isAnalyzing = false) => {
    const hasInput = Boolean(codeEl.value.trim() || specEl.value.trim());
    runBtn.disabled = !hasInput || isAnalyzing;
    runBtn.textContent = isAnalyzing ? "데이터 분석 중..." : "가격 정책 제안받기";
  };

  const runAnalysis = () => {
    toggleButton(true);
    const estimate = estimateComplexity(`${codeEl.value} ${specEl.value}`);
    const model = models.find((m) => m.key === modelEl.value) || models[0];
    const costUSD = getModelCostUSD(model, estimate.inputTokens, estimate.outputTokens);
    const costKRW = costUSD * fxRateDefault;

    setTimeout(() => {
      renderSummary({ ...estimate, costUSD, costKRW });
      renderCards(buildDecisions(costKRW, costUSD, estimate.complexity));
      emptyEl.classList.add("hidden");
      resultEl.classList.remove("hidden");
      toggleButton(false);
    }, 900);
  };

  runBtn.addEventListener("click", runAnalysis);
  codeEl.addEventListener("input", () => toggleButton(false));
  specEl.addEventListener("input", () => toggleButton(false));
  modelEl.addEventListener("change", () => toggleButton(false));

  toggleButton(false);
};

const initMeta = () => {
  const asOfEl = document.getElementById("decision-as-of");
  if (asOfEl) {
    asOfEl.textContent = `Last updated: ${asOf} · Pricing as of ${asOf}`;
  }
};

initDecisionMaker();
initMeta();
