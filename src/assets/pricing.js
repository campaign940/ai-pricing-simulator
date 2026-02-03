const { asOf, qualityAsOf, fxRateDefault, tokenSizes, margins, models } = window.PRICING_DATA;

const FX_RATE = fxRateDefault;

const formatter = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 2,
});

const formatKRW = (value) => `${formatter.format(value)}원`;

const costPerRequestKRW = (model, sizeKey) => {
  const size = tokenSizes[sizeKey];
  const usd = (size.inTokens / 1_000_000) * model.input + (size.outTokens / 1_000_000) * model.output;
  return usd * FX_RATE;
};

const populateModelSelect = (select) => {
  models.forEach((model) => {
    const option = document.createElement("option");
    option.value = model.key;
    option.textContent = `${model.name} · ${model.provider} (${model.tier})`;
    select.appendChild(option);
  });
};

const renderCostTable = () => {
  const tbody = document.querySelector("#pricing-cost-table tbody");
  tbody.innerHTML = "";

  models.forEach((model) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${model.provider}</td>
      <td>${model.name}</td>
      <td>${model.tier}</td>
      <td>${formatKRW(costPerRequestKRW(model, "small"))}</td>
      <td>${formatKRW(costPerRequestKRW(model, "medium"))}</td>
      <td>${formatKRW(costPerRequestKRW(model, "large"))}</td>
    `;
    tbody.appendChild(row);
  });
};

const renderVolumeStats = (modelKey, sizeKey, margin) => {
  const model = models.find((item) => item.key === modelKey);
  const base = costPerRequestKRW(model, sizeKey);
  const price = base / (1 - margin);
  const volumes = [1_000, 10_000, 100_000];

  const container = document.getElementById("pricing-volume-output");
  container.innerHTML = "";

  volumes.forEach((count) => {
    const stat = document.createElement("div");
    stat.className = "stat";
    stat.innerHTML = `
      <p>${formatter.format(count)} requests / month</p>
      <h4>${formatKRW(price * count)}</h4>
    `;
    container.appendChild(stat);
  });
};

const initSelectors = () => {
  const modelSelect = document.getElementById("pricing-model");
  const sizeSelect = document.getElementById("pricing-size");
  const marginSelect = document.getElementById("pricing-margin");

  populateModelSelect(modelSelect);

  const updateStats = () => {
    renderVolumeStats(modelSelect.value, sizeSelect.value, Number(marginSelect.value));
  };

  modelSelect.addEventListener("change", updateStats);
  sizeSelect.addEventListener("change", updateStats);
  marginSelect.addEventListener("change", updateStats);

  updateStats();
};

const initMeta = () => {
  const asOfEl = document.getElementById("pricing-as-of");
  if (asOfEl) {
    asOfEl.textContent = `Last updated: ${asOf} · Pricing as of ${asOf} · LMArena as of ${qualityAsOf}`;
  }
};

renderCostTable();
initSelectors();
initMeta();
