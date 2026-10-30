import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Activity,
  Binary,
  Microchip,
  Gauge,
  Sparkles,
  BookOpen,
  FolderGit2,
  FileText,
  Settings,
  Zap,
} from 'lucide-react';

export type NavSection =
  | 'dashboard'
  | 'designer'
  | 'analog'
  | 'digital'
  | 'embedded'
  | 'instruments'
  | 'ai_assistant'
  | 'experiments'
  | 'projects'
  | 'records'
  | 'settings';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
}

interface NavItem {
  id: NavSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
  { id: 'designer', label: '2. Circuit Designer', icon: Zap, badge: 'CAD' },
  { id: 'analog', label: '3. Analog Electronics', icon: Activity },
  { id: 'digital', label: '4. Digital Electronics', icon: Binary },
  { id: 'embedded', label: '5. Embedded Systems', icon: Cpu, badge: 'MCU' },
  { id: 'instruments', label: '6. Virtual Instruments', icon: Gauge },
  { id: 'ai_assistant', label: '7. AI Circuit Assistant', icon: Sparkles, badge: 'Gemini' },
  { id: 'experiments', label: '8. Experiment Library', icon: BookOpen },
  { id: 'projects', label: '9. My Projects', icon: FolderGit2 },
  { id: 'records', label: '10. Lab Records', icon: FileText },
  { id: 'settings', label: '11. Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentSection, onSelectSection }) => {
  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col shrink-0 select-none z-20">
      <div className="p-3 border-b border-slate-800">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
          Laboratory Navigation
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isActive
                      ? 'bg-cyan-500/30 text-cyan-300'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between">
        <span>ECE SIMULAB v2.0</span>
        <span className="text-emerald-400 font-semibold">● ONLINE</span>
      </div>
    </aside>
  );
};
