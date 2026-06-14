import { NavLink } from 'react-router-dom';
import { Lightbulb, Image, FileText, BarChart3, RotateCcw, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { path: '/', label: '灵感广场', icon: Lightbulb },
  { path: '/materials', label: '素材库', icon: Image },
  { path: '/drafts', label: '活动草案', icon: FileText },
  { path: '/evaluation', label: '可行性评估', icon: BarChart3 },
  { path: '/review', label: '复盘页', icon: RotateCcw },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const currentUser = useAppStore((state) => state.currentUser);

  return (
    <div className="min-h-screen bg-deep-indigo-950 bg-grid">
      <div className="fixed inset-0 bg-gradient-radial from-neon-purple-500/5 via-transparent to-transparent pointer-events-none" />
      
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-deep-indigo-900/80 border-b border-neon-purple-500/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple-500 to-cyber-cyan-400 flex items-center justify-center glow-purple">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold font-display gradient-text tracking-wider">
                  IDEA LAB
                </h1>
                <p className="text-xs text-deep-indigo-300 -mt-1">游戏运营灵感管理</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-neon-purple-500/20 to-cyber-cyan-500/20 text-white border border-neon-purple-500/30'
                        : 'text-deep-indigo-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-deep-indigo-800/60 border border-neon-purple-500/20">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full"
                />
                <span className="text-sm font-medium text-deep-indigo-200 hidden sm:block">
                  {currentUser.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="md:hidden sticky top-16 z-40 backdrop-blur-xl bg-deep-indigo-900/80 border-b border-neon-purple-500/20">
        <div className="container mx-auto px-2 py-2">
          <div className="flex justify-between">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'text-cyber-cyan-400'
                      : 'text-deep-indigo-400'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
