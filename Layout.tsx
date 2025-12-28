
import React from 'react';
import { Home, Library, Settings, Puzzle, Search, LogOut, Bell, Zap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSearchClick: () => void;
  onNotificationsClick: () => void;
  unreadCount: number;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  onSearchClick, 
  onNotificationsClick,
  unreadCount 
}) => {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'discover', icon: Zap, label: 'Power Search' },
    { id: 'library', icon: Library, label: 'Biblioteca' },
    { id: 'addons', icon: Puzzle, label: 'Extensões' },
    { id: 'settings', icon: Settings, label: 'Ajustes' },
  ];

  // Mobile navigation usually features these 4 primary actions
  const mobileMenuItems = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'discover', icon: Zap, label: 'Busca' },
    { id: 'library', icon: Library, label: 'Biblioteca' },
    { id: 'settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0f0f0f] border-r border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <span className="text-black font-black text-xl">L</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-white uppercase">Lumina</h1>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={onSearchClick}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all mb-6 group"
          >
            <Search size={20} className="group-hover:text-yellow-500 transition-colors" />
            <span className="text-sm font-bold">Smart Search</span>
          </button>

          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-black text-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' 
                  : 'text-neutral-500 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              <span className="uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-neutral-800 space-y-4">
           <button 
             onClick={onNotificationsClick}
             className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-neutral-500 hover:text-white transition-all group"
           >
             <div className="flex items-center gap-4">
               <Bell size={20} className="group-hover:text-yellow-500" />
               <span className="text-xs font-black uppercase tracking-widest">Alertas</span>
             </div>
             {unreadCount > 0 && (
               <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full">{unreadCount}</span>
             )}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pb-20 md:pb-0">
        <header className="md:hidden flex items-center justify-between p-6 bg-black/50 backdrop-blur-md border-b border-neutral-800 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-sm">L</span>
            </div>
            <h1 className="font-black text-white uppercase tracking-tighter">Lumina</h1>
          </div>
          <button onClick={onNotificationsClick} className="relative p-2 text-neutral-400">
            <Bell size={24} />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black" />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {children}
        </div>

        {/* Mobile Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 md:hidden flex items-center justify-around p-2 bg-[#0f0f0f]/90 backdrop-blur-2xl border-t border-neutral-800 z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          {mobileMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1.5 py-2 px-4 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'text-yellow-500 scale-105' 
                  : 'text-neutral-500'
              }`}
            >
              <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === item.id ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
