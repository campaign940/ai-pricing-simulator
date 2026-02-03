import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Calculator, Target, BrainCircuit } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <Calculator className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-slate-800">AI Simulator</span>
            </div>
            <div className="flex gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <Calculator className="w-4 h-4" />
                Pricing
              </NavLink>
              <NavLink
                to="/marketing"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <Target className="w-4 h-4" />
                Marketing
              </NavLink>
              <NavLink
                to="/decision"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <BrainCircuit className="w-4 h-4" />
                Decision
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <Outlet />
    </div>
  );
}
