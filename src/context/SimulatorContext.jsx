import React, { createContext, useContext, useState } from 'react';

const SimulatorContext = createContext();

export const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', input: 2.50, output: 10.00, quality: 95, type: 'quality' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', input: 3.00, output: 15.00, quality: 97, type: 'quality' },
  { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', input: 1.25, output: 5.00, quality: 92, type: 'quality' },
  { id: 'gpt-4o-mini', name: 'GPT-4o-mini', provider: 'OpenAI', input: 0.15, output: 0.60, quality: 80, type: 'balanced' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', input: 0.25, output: 1.25, quality: 78, type: 'balanced' },
  { id: 'gemini-1-5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', input: 0.075, output: 0.30, quality: 82, type: 'cheapest' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', input: 0.14, output: 0.28, quality: 88, type: 'cheapest' },
  { id: 'qwen-turbo', name: 'Qwen-Turbo', provider: 'Alibaba', input: 0.12, output: 0.36, quality: 75, type: 'cheapest' },
];

export function SimulatorProvider({ children }) {
  const [params, setParams] = useState({
    dau: 1000,
    avgInputTokens: 500,
    avgOutputTokens: 300,
    tasksPerUser: 10,
    targetMargin: 70,
    usagePattern: 'heavy_start',
    expectedLifetimeMonths: 12,
    retentionMonths: 6,
    selectedModelId: 'gpt-4o',
  });

  // Decision 분석 결과 저장
  const [analysisResult, setAnalysisResult] = useState(null);

  // Pricing 계산 결과 저장
  const [pricingResult, setPricingResult] = useState(null);

  const updateParams = (updates) => {
    setParams(prev => ({ ...prev, ...updates }));
  };

  const updateAnalysisResult = (result) => {
    setAnalysisResult(result);
  };

  const updatePricingResult = (result) => {
    setPricingResult(result);
  };

  const selectedModel = MODELS.find(m => m.id === params.selectedModelId) || MODELS[0];

  return (
    <SimulatorContext.Provider value={{
      params,
      updateParams,
      selectedModel,
      MODELS,
      analysisResult,
      updateAnalysisResult,
      pricingResult,
      updatePricingResult
    }}>
      {children}
    </SimulatorContext.Provider>
  );
}

export function useSimulator() {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error('useSimulator must be used within SimulatorProvider');
  }
  return context;
}
