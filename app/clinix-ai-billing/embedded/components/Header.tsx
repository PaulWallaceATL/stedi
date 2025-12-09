import React, { useState, useRef, useEffect } from 'react';
import { ViewState } from '../types';

interface HeaderProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNav = (view: ViewState) => {
    setView(view);
    setIsDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-background-dark/95 backdrop-blur-sm px-6 py-3">
      <div className="flex items-center gap-8">
        <div 
          className="flex items-center gap-3 text-gray-900 dark:text-white cursor-pointer"
          onClick={() => setView(ViewState.DASHBOARD)}
        >
          <div className="text-primary">
            <span className="material-symbols-outlined text-3xl">spark</span>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Clinix AI Billing</h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:block relative">
             <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg">search</span>
             <input 
                className="form-input w-64 min-w-0 resize-none overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-transparent h-9 placeholder:text-gray-400 dark:placeholder:text-gray-500 pl-9 pr-4 text-sm" 
                placeholder="Search claims..." 
             />
        </div>

        <button 
          onClick={() => setView(ViewState.CLAIM_METHOD)}
          className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 transition-all"
        >
          <span className="truncate">New Claim</span>
        </button>

        <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>
        
        <div className="relative" ref={dropdownRef}>
            <button 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 border border-gray-200 dark:border-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 block" 
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB5Ogs0OHkaFrWGGEca-7YYj5iVvr68VPTcWAEv6okoAsA3BdraU6Ke0k4-vJSDxTfBvg83hZdSljrRjwmR7AAS5IRBMiYWBmf5baGmJeoYZSKqfIi47FJ6qlB0-AcQTJ3QhGcI7eSj9Kh6f1_-REjs2ebdQSVbjR1DYSrV3pZnDpmlK1_p7TFrEzy68t-QWRLAmvlRqYpUDpLKZw1o1xfVj-hOo555Jw9JS8U4o2k2JxnwKveTfOaIJI29omHZwP3MLGO8aweTytE")' }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            ></button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Dr. Sarah Miller</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Billing Admin</p>
                    </div>
                    
                    <button onClick={() => handleNav(ViewState.DASHBOARD)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">dashboard</span>
                        Dashboard
                    </button>
                    <button onClick={() => handleNav(ViewState.PRIORITIZATION)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                         <span className="material-symbols-outlined text-lg">sort</span>
                        Prioritization
                    </button>
                    <button onClick={() => handleNav(ViewState.DENIAL_MANAGER)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                         <span className="material-symbols-outlined text-lg">gavel</span>
                        Denials
                    </button>
                    <button onClick={() => handleNav(ViewState.SETTINGS)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">settings</span>
                        Settings
                    </button>
                    
                    <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                         <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">logout</span>
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};