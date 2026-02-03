const { asOf, qualityAsOf, fxRateDefault, tokenSizes, margins, models } = window.PRICING_DATA;

let fxRate = fxRateDefault;

const formatterKRW = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 2,
});

const formatterUSD = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
});

const formatKRW = (value) => `${formatterKRW.format(value)}원`;
const formatUSD = (value) => `$${formatterUSD.format(value)}`;

const costPerRequestUSD = (model, inTokens, outTokens) => {
  if (!model || model.input == null || model.output == null) {
    return null;
  }
  return (inTokens / 1_000_000) * model.input + (outTokens / 1_000_000) * model.output;
};

const costPerRequestKRW = (model, inTokens, outTokens) => {
  const usd = costPerRequestUSD(model, inTokens, outTokens);
  return usd == null ? null : usd * fxRate;
};

const populateModelSelect = (select) => {
  models.forEach((model) => {
    const option = document.createElement("option");
    option.value = model.key;
    option.textContent = `${model.name} · ${model.provider} (${model.tier})`;
    select.appendChild(option);
  });
};

const populateMarginSelect = (select) => {
  margins.forEach((margin) => {
    const option = document.createElement("option");
    option.value = margin.value;
    option.textContent = margin.label;
    select.appendChild(option);
  });
};

const normalizePercentages = (values) => {
  const safe = values.map((value) => Math.max(Number(value) || 0, 0));
  const total = safe.reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    const equal = Math.round(100 / safe.length);
    const normalized = safe.map(() => equal);
    normalized[0] = 100 - equal * (safe.length - 1);
    return normalized;
  }
  const normalized = safe.map((value) => (value / total) * 100);
  const rounded = normalized.map((value) => Math.round(value));
  const diff = 100 - rounded.reduce((sum, value) => sum + value, 0);
  rounded[0] += diff;
  return rounded;
};

const renderTokenPriceTable = () => {
  const tbody = document.querySelector("#token-price-table tbody");
  tbody.innerHTML = "";

  models.forEach((model) => {
    const row = document.createElement("tr");
    const quality = model.qualityScore
      ? `${model.qualityScore}${model.qualityModel ? ` (${model.qualityModel})` : ""}`
      : "—";
    row.innerHTML = `
      <td>${model.provider}</td>
      <td>${model.name}</td>
      <td>${model.tier}</td>
      <td>${formatUSD(model.input)}</td>
      <td>${formatUSD(model.output)}</td>
      <td class="small">${quality}</td>
    `;
    tbody.appendChild(row);
  });
};

const renderCostTable = () => {
  const tbody = document.querySelector("#cost-table tbody");
  tbody.innerHTML = "";

  models.forEach((model) => {
    const small = costPerRequestKRW(model, tokenSizes.small.inTokens, tokenSizes.small.outTokens);
    const medium = costPerRequestKRW(model, tokenSizes.medium.inTokens, tokenSizes.medium.outTokens);
    const large = costPerRequestKRW(model, tokenSizes.large.inTokens, tokenSizes.large.outTokens);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${model.provider}</td>
      <td>${model.name}</td>
      <td>${model.tier}</td>
      <td>${small == null ? "TBD" : formatKRW(small)}</td>
      <td>${medium == null ? "TBD" : formatKRW(medium)}</td>
      <td>${large == null ? "TBD" : formatKRW(large)}</td>
    `;
    tbody.appendChild(row);
  });
};

const renderVolumeStats = (modelKey, sizeKey) => {
  const model = models.find((item) => item.key === modelKey);
  const size = tokenSizes[sizeKey];
  const base = costPerRequestKRW(model, size.inTokens, size.outTokens);
  const volumes = [1_000, 10_000, 100_000];

  const container = document.getElementById("volume-output");
  container.innerHTML = "";

  if (base == null) {
    container.innerHTML = "<p class=\"muted\">가격 데이터가 아직 없습니다.</p>";
    return;
  }

  volumes.forEach((count) => {
    const stat = document.createElement("div");
    stat.className = "stat";
    stat.innerHTML = `
      <p>${formatterKRW.format(count)} requests / month</p>
      <h4>${formatKRW(base * count)}</h4>
    `;
    container.appendChild(stat);
  });
};

const renderMarginStats = (modelKey, sizeKey) => {
  const model = models.find((item) => item.key === modelKey);
  const size = tokenSizes[sizeKey];
  const base = costPerRequestKRW(model, size.inTokens, size.outTokens);
  const container = document.getElementById("margin-output");
  container.innerHTML = "";

  if (base == null) {
    container.innerHTML = "<p class=\"muted\">가격 데이터가 아직 없습니다.</p>";
    return;
  }

  margins.forEach((margin) => {
    const stat = document.createElement("div");
    stat.className = "stat";
    const price = base / (1 - margin.value);
    stat.innerHTML = `
      <p>Margin ${margin.label}</p>
      <h4>${formatKRW(price)} / request</h4>
    `;
    container.appendChild(stat);
  });
};

const renderB2cSimulator = () => {
  const modelSelect = document.getElementById("b2c-model");
  const inTokensInput = document.getElementById("b2c-in-tokens");
  const outTokensInput = document.getElementById("b2c-out-tokens");
  const marginSelect = document.getElementById("b2c-margin");
  const packInput = document.getElementById("b2c-pack");
  const monthlyInput = document.getElementById("b2c-monthly");

  const model = models.find((item) => item.key === modelSelect.value);
  const inTokens = Math.max(Number(inTokensInput.value) || 0, 0);
  const outTokens = Math.max(Number(outTokensInput.value) || 0, 0);
  const margin = Number(marginSelect.value);
  const pack = Math.max(Number(packInput.value) || 0, 1);
  const monthly = Math.max(Number(monthlyInput.value) || 0, 1);

  const costUSD = costPerRequestUSD(model, inTokens, outTokens);
  const costKRW = costUSD == null ? null : costUSD * fxRate;
  const priceUSD = costUSD == null ? null : costUSD / (1 - margin);
  const priceKRW = priceUSD == null ? null : priceUSD * fxRate;
  const packRevenueKRW = priceKRW * pack;
  const packCostKRW = costKRW * pack;
  const packMarginKRW = packRevenueKRW - packCostKRW;
  const packMarginRate = packRevenueKRW ? (packMarginKRW / packRevenueKRW) * 100 : 0;
  const monthlyRevenueKRW = priceKRW * monthly;
  const monthlyCostKRW = costKRW * monthly;
  const monthlyMarginKRW = monthlyRevenueKRW - monthlyCostKRW;
  const monthlyMarginRate = monthlyRevenueKRW ? (monthlyMarginKRW / monthlyRevenueKRW) * 100 : 0;
  const usageRevenueKRW = priceKRW;
  const usageCostKRW = costKRW;
  const usageMarginKRW = usageRevenueKRW - usageCostKRW;
  const usageMarginRate = usageRevenueKRW ? (usageMarginKRW / usageRevenueKRW) * 100 : 0;

  const summary = document.getElementById("b2c-cost-summary");
  if (costUSD == null) {
    summary.innerHTML = "<p class=\"muted\">가격 데이터를 확인할 수 없습니다.</p>";
    return;
  }

  summary.innerHTML = `
    <div class="summary-row">
      <div>
        <p class="label">Cost / request</p>
        <h4>${formatKRW(costKRW)}</h4>
        <p class="muted">${formatUSD(costUSD)}</p>
      </div>
      <div>
        <p class="label">Price / request</p>
        <h4>${formatKRW(priceKRW)}</h4>
        <p class="muted">${formatUSD(priceUSD)}</p>
      </div>
      <div>
        <p class="label">Margin Target</p>
        <h4>${Math.round(margin * 100)}%</h4>
        <p class="muted">Gross margin target</p>
      </div>
    </div>
  `;

  const output = document.getElementById("b2c-output");
  output.innerHTML = `
    <div class="pricing-card">
      <h4>One-time Pack</h4>
      <p class="muted">${formatterKRW.format(pack)} requests 포함</p>
      <p class="price">${formatKRW(priceKRW * pack)}</p>
      <p class="muted">${formatUSD(priceUSD * pack)}</p>
      <div class="note-stack">
        <p class="muted">• 예상 매출 ${formatKRW(packRevenueKRW)}</p>
        <p class="muted">• 예상 마진 ${formatKRW(packMarginKRW)} · ${packMarginRate.toFixed(1)}%</p>
      </div>
    </div>
    <div class="pricing-card">
      <h4>Monthly Subscription</h4>
      <p class="muted">${formatterKRW.format(monthly)} requests / month</p>
      <p class="price">${formatKRW(priceKRW * monthly)}</p>
      <p class="muted">${formatUSD(priceUSD * monthly)}</p>
      <div class="note-stack">
        <p class="muted">• 예상 매출 ${formatKRW(monthlyRevenueKRW)}</p>
        <p class="muted">• 예상 마진 ${formatKRW(monthlyMarginKRW)} · ${monthlyMarginRate.toFixed(1)}%</p>
      </div>
    </div>
    <div class="pricing-card">
      <h4>Usage-based</h4>
      <p class="muted">Per request</p>
      <p class="price">${formatKRW(priceKRW)}</p>
      <p class="muted">${formatUSD(priceUSD)} · 1k req = ${formatKRW(priceKRW * 1_000)}</p>
      <div class="note-stack">
        <p class="muted">• 예상 매출 ${formatKRW(usageRevenueKRW)}</p>
        <p class="muted">• 예상 마진 ${formatKRW(usageMarginKRW)} · ${usageMarginRate.toFixed(1)}%</p>
      </div>
    </div>
  `;
};

const QUALITY_FLOOR = 1450;

const getRecommendationSet = (inTokens, outTokens) => {
  const scored = models
    .map((model) => {
      const costUSD = costPerRequestUSD(model, inTokens, outTokens);
      return {
        ...model,
        costUSD,
      };
    })
    .filter((model) => model.costUSD != null);

  const cheapest = scored.reduce((min, model) => (model.costUSD < min.costUSD ? model : min), scored[0]);

  const qualityPool = scored.filter((model) => model.qualityScore != null);
  const bestQuality = qualityPool.length
    ? qualityPool.reduce((max, model) => (model.qualityScore > max.qualityScore ? model : max), qualityPool[0])
    : null;

  const reasonablePool = qualityPool.filter((model) => model.qualityScore >= QUALITY_FLOOR);
  const valueCandidates = reasonablePool.length ? reasonablePool : qualityPool;

  const bestValue = valueCandidates.length
    ? valueCandidates.reduce((best, model) => {
        const valueScore = model.qualityScore / model.costUSD;
        return valueScore > best.valueScore ? { ...model, valueScore } : best;
      }, { ...valueCandidates[0], valueScore: valueCandidates[0].qualityScore / valueCandidates[0].costUSD })
    : null;

  return { cheapest, bestQuality, bestValue };
};

const renderRecommendationCard = (title, model, inTokens, outTokens, margin, pack, monthly) => {
  if (!model) {
    return `
      <div class="recommend-card">
        <h4>${title}</h4>
        <p class="muted">해당 모델 데이터를 찾을 수 없습니다.</p>
      </div>
    `;
  }

  const costUSD = costPerRequestUSD(model, inTokens, outTokens);
  const priceUSD = costUSD / (1 - margin);
  const priceKRW = priceUSD * fxRate;

  return `
    <div class="recommend-card">
      <h4>${title}</h4>
      <p class="muted">${model.name} · ${model.provider}</p>
      <p class="price">${formatKRW(priceKRW)} / request</p>
      <p class="muted">Cost ${formatUSD(costUSD)} · LMArena ${model.qualityScore ?? "—"}</p>
      <p class="muted">One-time ${formatKRW(priceKRW * pack)} · Monthly ${formatKRW(priceKRW * monthly)}</p>
    </div>
  `;
};

const renderRecommendations = () => {
  const inTokens = Math.max(Number(document.getElementById("b2c-in-tokens").value) || 0, 0);
  const outTokens = Math.max(Number(document.getElementById("b2c-out-tokens").value) || 0, 0);
  const margin = Number(document.getElementById("b2c-margin").value);
  const pack = Math.max(Number(document.getElementById("b2c-pack").value) || 0, 1);
  const monthly = Math.max(Number(document.getElementById("b2c-monthly").value) || 0, 1);

  const { cheapest, bestQuality, bestValue } = getRecommendationSet(inTokens, outTokens);

  const container = document.getElementById("recommendation-output");
  container.innerHTML = [
    renderRecommendationCard("가장 싼 가격 방법", cheapest, inTokens, outTokens, margin, pack, monthly),
    renderRecommendationCard("가장 퀄리티 좋은 가격 방법", bestQuality, inTokens, outTokens, margin, pack, monthly),
    renderRecommendationCard("가장 합리적인 가격 방법", bestValue, inTokens, outTokens, margin, pack, monthly),
  ].join("");

  const bestSolution = document.getElementById("best-solution");
  if (!bestValue || !bestQuality || !cheapest) {
    bestSolution.innerHTML = "<p class=\"muted\">추천 모델을 계산할 수 없습니다.</p>";
    return;
  }

  bestSolution.innerHTML = `
    <h4>Best Pricing Solution (Startup Launch)</h4>
    <p class="muted">기본은 합리적 모델로 월정액 + 초과 사용량 과금, 프리미엄은 최고 퀄리티 모델로 업셀.</p>
    <ul>
      <li>기본 플랜: ${bestValue.name} (${bestValue.provider}) 기반 월정액 + overage</li>
      <li>프리미엄 플랜: ${bestQuality.name} (${bestQuality.provider}) 전용 라우팅</li>
      <li>대량/자동화: ${cheapest.name} (${cheapest.provider})로 비용 최적화</li>
    </ul>
  `;
};

const renderRoutingMix = () => {
  const inTokens = Math.max(Number(document.getElementById("b2c-in-tokens").value) || 0, 0);
  const outTokens = Math.max(Number(document.getElementById("b2c-out-tokens").value) || 0, 0);
  const margin = Number(document.getElementById("b2c-margin").value);
  const pack = Math.max(Number(document.getElementById("b2c-pack").value) || 0, 1);
  const monthly = Math.max(Number(document.getElementById("b2c-monthly").value) || 0, 1);

  const modelA = models.find((item) => item.key === document.getElementById("route-model-a").value);
  const modelB = models.find((item) => item.key === document.getElementById("route-model-b").value);
  const modelC = models.find((item) => item.key === document.getElementById("route-model-c").value);

  const weights = normalizePercentages([
    document.getElementById("route-weight-a").value,
    document.getElementById("route-weight-b").value,
    document.getElementById("route-weight-c").value,
  ]);

  document.getElementById("route-weight-a").value = weights[0];
  document.getElementById("route-weight-b").value = weights[1];
  document.getElementById("route-weight-c").value = weights[2];

  const costA = costPerRequestUSD(modelA, inTokens, outTokens) || 0;
  const costB = costPerRequestUSD(modelB, inTokens, outTokens) || 0;
  const costC = costPerRequestUSD(modelC, inTokens, outTokens) || 0;

  const blendedUSD =
    (costA * weights[0]) / 100 + (costB * weights[1]) / 100 + (costC * weights[2]) / 100;
  const blendedKRW = blendedUSD * fxRate;
  const priceUSD = blendedUSD / (1 - margin);
  const priceKRW = priceUSD * fxRate;

  const { cheapest, bestQuality, bestValue } = getRecommendationSet(inTokens, outTokens);

  const output = document.getElementById("routing-output");
  output.innerHTML = `
    <div class="summary-row">
      <div>
        <p class="label">Blended Cost</p>
        <h4>${formatKRW(blendedKRW)}</h4>
        <p class="muted">${formatUSD(blendedUSD)}</p>
      </div>
      <div>
        <p class="label">Blended Price</p>
        <h4>${formatKRW(priceKRW)}</h4>
        <p class="muted">${formatUSD(priceUSD)}</p>
      </div>
      <div>
        <p class="label">Pack / Monthly</p>
        <h4>${formatKRW(priceKRW * pack)}</h4>
        <p class="muted">Monthly ${formatKRW(priceKRW * monthly)}</p>
      </div>
    </div>
    <p class="muted">Weights는 합계 100%로 자동 정규화됩니다.</p>
    <p class="muted">
      추천 라우팅: 합리 ${bestValue?.name ?? "—"} 70% · 최고 ${bestQuality?.name ?? "—"} 20% · 최저 ${
        cheapest?.name ?? "—"
      } 10%
    </p>
  `;
};

const initSelectors = () => {
  const volumeModel = document.getElementById("volume-model");
  const volumeSize = document.getElementById("volume-size");
  const marginModel = document.getElementById("margin-model");
  const marginSize = document.getElementById("margin-size");

  populateModelSelect(volumeModel);
  populateModelSelect(marginModel);

  const updateVolume = () => renderVolumeStats(volumeModel.value, volumeSize.value);
  const updateMargin = () => renderMarginStats(marginModel.value, marginSize.value);

  volumeModel.addEventListener("change", updateVolume);
  volumeSize.addEventListener("change", updateVolume);
  marginModel.addEventListener("change", updateMargin);
  marginSize.addEventListener("change", updateMargin);

  updateVolume();
  updateMargin();
};

const initB2cControls = () => {
  const modelSelect = document.getElementById("b2c-model");
  const inTokensInput = document.getElementById("b2c-in-tokens");
  const outTokensInput = document.getElementById("b2c-out-tokens");
  const marginSelect = document.getElementById("b2c-margin");

  populateModelSelect(modelSelect);
  populateMarginSelect(marginSelect);

  inTokensInput.value = tokenSizes.medium.inTokens;
  outTokensInput.value = tokenSizes.medium.outTokens;
  marginSelect.value = margins[1].value;

  document.getElementById("b2c-pack").value = 100;
  document.getElementById("b2c-monthly").value = 300;

  const update = () => {
    renderB2cSimulator();
    renderRecommendations();
    renderRoutingMix();
  };

  modelSelect.addEventListener("change", update);
  inTokensInput.addEventListener("input", update);
  outTokensInput.addEventListener("input", update);
  marginSelect.addEventListener("change", update);
  document.getElementById("b2c-pack").addEventListener("input", update);
  document.getElementById("b2c-monthly").addEventListener("input", update);

  update();
};

const initRoutingMix = () => {
  const modelA = document.getElementById("route-model-a");
  const modelB = document.getElementById("route-model-b");
  const modelC = document.getElementById("route-model-c");

  populateModelSelect(modelA);
  populateModelSelect(modelB);
  populateModelSelect(modelC);

  const { cheapest, bestQuality, bestValue } = getRecommendationSet(
    tokenSizes.medium.inTokens,
    tokenSizes.medium.outTokens,
  );

  modelA.value = bestValue?.key ?? models[0]?.key;
  modelB.value = bestQuality?.key ?? models[0]?.key;
  modelC.value = cheapest?.key ?? models[0]?.key;

  document.getElementById("route-weight-a").value = 70;
  document.getElementById("route-weight-b").value = 20;
  document.getElementById("route-weight-c").value = 10;

  const update = () => renderRoutingMix();

  modelA.addEventListener("change", update);
  modelB.addEventListener("change", update);
  modelC.addEventListener("change", update);
  document.getElementById("route-weight-a").addEventListener("input", update);
  document.getElementById("route-weight-b").addEventListener("input", update);
  document.getElementById("route-weight-c").addEventListener("input", update);

  update();
};

const initFxRate = () => {
  const fxInput = document.getElementById("fx-rate");
  fxInput.value = fxRateDefault;
  fxInput.addEventListener("input", () => {
    fxRate = Number(fxInput.value) || fxRateDefault;
    renderCostTable();
    renderB2cSimulator();
    renderRecommendations();
    renderRoutingMix();
    renderVolumeStats(document.getElementById("volume-model").value, document.getElementById("volume-size").value);
    renderMarginStats(document.getElementById("margin-model").value, document.getElementById("margin-size").value);
  });
};

const initMeta = () => {
  const asOfEl = document.getElementById("as-of");
  if (asOfEl) {
    asOfEl.textContent = `Last updated: ${asOf} · Pricing as of ${asOf} · LMArena as of ${qualityAsOf}`;
  }
};

renderTokenPriceTable();
renderCostTable();
initSelectors();
initB2cControls();
initRoutingMix();
initFxRate();
initMeta();
