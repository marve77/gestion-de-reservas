import { useState } from 'react';
import { 
  Home, 
  Utensils, 
  Users, 
  Calendar, 
  CalendarDays,
  BarChart3,
  FileText,
  Menu, 
  X 
} from 'lucide-react';

const Sidebar = ({ onNavigate, currentView }) => {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'calendario', label: 'Calendario', icon: CalendarDays },
    { id: 'mesas', label: 'Mesas', icon: Utensils },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'reservas', label: 'Reservas', icon: Calendar },
    { id: 'consultas', label: 'Consultas', icon: BarChart3 },
    { id: 'reportes', label: 'Reportes', icon: FileText },
  ];

  return (
    <aside className={`h-full bg-gradient-to-b from-[#1e3a5f] to-[#0f2744] text-white transition-all duration-300 shadow-2xl flex-shrink-0 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h1 className={`text-2xl font-bold transition-all duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 w-0'
          }`}>
            Restaurant Manager
          </h1>
          <button 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-3 transition-all duration-200 hover:bg-white/10 border-l-4 ${
                  isActive 
                    ? 'bg-white/20 border-[#ffd700] text-[#ffd700] font-semibold' 
                    : 'border-transparent text-white/80 hover:text-white'
                }`}
                title={!isOpen ? item.label : ''}
              >
                <Icon size={20} className="flex-shrink-0" />
                {isOpen && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          {isOpen && (
            <p className="text-xs text-white/60 text-center">
              © 2025 Restaurant Manager
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
