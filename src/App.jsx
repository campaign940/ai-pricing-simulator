import { Routes, Route } from 'react-router-dom';
import { SimulatorProvider } from './context/SimulatorContext';
import Layout from './components/Layout';
import PricingSimulator from './pages/PricingSimulator';
import MarketingSimulator from './pages/MarketingSimulator';
import DecisionMaker from './pages/DecisionMaker';

export default function App() {
  return (
    <SimulatorProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PricingSimulator />} />
          <Route path="marketing" element={<MarketingSimulator />} />
          <Route path="decision" element={<DecisionMaker />} />
        </Route>
      </Routes>
    </SimulatorProvider>
  );
}
