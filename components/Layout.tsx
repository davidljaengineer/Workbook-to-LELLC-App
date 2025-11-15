
import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Module } from '../types';

interface LayoutProps {
  children: ReactNode;
  activeModule: Module;
  setActiveModule: (module: Module) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeModule, setActiveModule }) => {
  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 dark:bg-slate-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
};
