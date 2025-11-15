import React from 'react';
import { Module } from '../types';

interface SidebarProps {
  activeModule: Module;
  setActiveModule: (module: Module) => void;
}

const NavItem: React.FC<{
  module: Module;
  activeModule: Module;
  setActiveModule: (module: Module) => void;
  // FIX: Replaced JSX.Element with React.ReactElement to resolve namespace 'JSX' not found error.
  icon: React.ReactElement;
}> = ({ module, activeModule, setActiveModule, icon }) => {
  const isActive = activeModule === module;
  return (
    <li>
      <button
        onClick={() => setActiveModule(module)}
        className={`flex items-center p-2 text-base font-normal rounded-lg w-full text-left
                    ${isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
      >
        {icon}
        <span className="ml-3">{module}</span>
      </button>
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  const modules = Object.values(Module);

  // FIX: Replaced JSX.Element with React.ReactElement to resolve namespace 'JSX' not found error.
  const icons: { [key in Module]: React.ReactElement } = {
    [Module.INPUT]: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    [Module.IDF_CURVE]: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>,
    [Module.LOT_CALCULATOR]: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    [Module.COLLECTOR_STREET]: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
    [Module.WEIGHTED_C]: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M12 8h.01M15 8h.01M15 14h.01M18 17h.01M18 14h.01M18 11h.01M18 8h.01M6 17h.01M6 14h.01M6 11h.01M6 8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  };

  return (
    <aside className="w-64" aria-label="Sidebar">
      <div className="overflow-y-auto h-full py-4 px-3 bg-white dark:bg-slate-800 shadow-lg">
        <div className='mb-5 p-2'>
            <h2 className='text-2xl font-semibold text-slate-800 dark:text-slate-100'>Modules</h2>
        </div>
        <ul className="space-y-2">
          {modules.map(m => (
            <NavItem key={m} module={m} activeModule={activeModule} setActiveModule={setActiveModule} icon={icons[m]} />
          ))}
        </ul>
      </div>
    </aside>
  );
};