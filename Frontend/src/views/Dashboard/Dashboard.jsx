import { useState, useEffect } from 'react';
import { Calendar, Users, Utensils, TrendingUp, ArrowUp, Clock, CheckCircle, Bell, Circle } from 'lucide-react';
import { consultasService, mesasService, clientesService, reservasService } from '../../services/api.service';

const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalMesas: 0,
    totalClientes: 0,
    reservasHoy: 0,
    tasaOcupacion: 0,
  });
  const [reservasRecientes, setReservasRecientes] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [mesasRes, clientesRes, reservasRes] = await Promise.all([
        mesasService.getAll(),
        clientesService.getAll(),
        reservasService.getDelDia(),
      ]);

      // Filtrar solo mesas activas
      const mesasActivas = mesasRes.data.filter(m => m.activa);
      // Filtrar solo clientes activos
      const clientesActivos = clientesRes.data.filter(c => c.activo);
      // Filtrar reservas activas (no canceladas)
      const reservasActivas = reservasRes.data.filter(r => r.estado !== 'cancelada');

      const tasaOcupacion = mesasActivas.length > 0 
        ? ((reservasActivas.length / mesasActivas.length) * 100).toFixed(1)
        : 0;

      setStats({
        totalMesas: mesasActivas.length,
        totalClientes: clientesActivos.length,
        reservasHoy: reservasRes.data.length,
        tasaOcupacion,
      });
      
      setMesas(mesasActivas);
      setReservasRecientes(reservasRes.data.slice(0, 5));
      
      // Generar notificaciones de reservas nuevas/próximas
      const ahora = new Date();
      const proximasReservas = reservasRes.data.filter(r => {
        const fechaReserva = new Date(r.fecha_hora);
        const diffMinutos = (fechaReserva - ahora) / (1000 * 60);
        return diffMinutos > 0 && diffMinutos <= 60 && r.estado === 'confirmada';
      });
      
      setNotificaciones(proximasReservas.map(r => ({
        id: r.id,
        mensaje: `Reserva próxima: Mesa ${r.mesa?.numero} - ${r.cliente?.nombre} ${r.cliente?.apellido}`,
        tiempo: new Date(r.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        tipo: 'warning'
      })));
      
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Mesas Activas',
      value: stats.totalMesas,
      subtitle: 'Disponibles',
      icon: Utensils,
      color: 'text-cyan-600',
      bgColor: 'from-cyan-500 to-blue-500',
      lightBg: 'bg-cyan-50',
    },
    {
      title: 'Clientes Registrados',
      value: stats.totalClientes,
      subtitle: 'En el sistema',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'from-purple-500 to-pink-500',
      lightBg: 'bg-purple-50',
    },
    {
      title: 'Reservas Hoy',
      value: stats.reservasHoy,
      subtitle: 'Activas',
      icon: Calendar,
      color: 'text-amber-600',
      bgColor: 'from-amber-500 to-orange-500',
      lightBg: 'bg-amber-50',
    },
    {
      title: 'Tasa de Ocupación',
      value: `${stats.tasaOcupacion}%`,
      subtitle: 'Promedio',
      icon: TrendingUp,
      color: 'text-rose-600',
      bgColor: 'from-rose-500 to-red-500',
      lightBg: 'bg-rose-50',
    },
  ];

  const getEstadoBadge = (estado) => {
    const badges = {
      'confirmada': 'bg-green-100 text-green-700',
      'pendiente': 'bg-yellow-100 text-yellow-700',
      'cancelada': 'bg-red-100 text-red-700',
      'completada': 'bg-blue-100 text-blue-700',
    };
    return badges[estado] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600 flex items-center gap-2">
            <Clock size={16} />
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div 
                key={index} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className={`h-2 bg-gradient-to-r ${card.bgColor}`}></div>
                <div className="p-5 md:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${card.lightBg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={card.color} size={24} strokeWidth={2} />
                    </div>
                    <div className="flex items-center gap-1 text-green-600 text-xs md:text-sm font-medium">
                      <ArrowUp size={14} />
                      <span>+12%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">{card.title}</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{card.value}</p>
                    <p className="text-xs text-gray-400">{card.subtitle}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">
          {/* Reservas Recientes */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-lg p-5 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">Reservas de Hoy</h2>
              <span className="text-xs md:text-sm text-gray-500">{reservasRecientes.length} reservas</span>
            </div>
            
            {reservasRecientes.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <Calendar className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-sm md:text-base text-gray-500">No hay reservas para hoy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reservasRecientes.map((reserva) => (
                  <div 
                    key={reserva.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {reserva.mesa?.numero || 'N/A'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm md:text-base text-gray-800">
                          {reserva.cliente ? `${reserva.cliente.nombre} ${reserva.cliente.apellido}` : 'Cliente'}
                        </p>
                        <p className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                          <Clock size={14} />
                          {new Date(reserva.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-13 sm:ml-0">
                      <span className="text-xs md:text-sm text-gray-600">{reserva.numero_personas} personas</span>
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(reserva.estado)}`}>
                        {reserva.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Accesos Rápidos</h2>
            <div className="space-y-3">
              <button 
                onClick={() => onNavigate && onNavigate('reservas')}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-3 md:p-4 rounded-xl text-sm md:text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                + Nueva Reserva
              </button>
              <button 
                onClick={() => onNavigate && onNavigate('clientes')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-3 md:p-4 rounded-xl text-sm md:text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                + Nuevo Cliente
              </button>
              <button 
                onClick={() => onNavigate && onNavigate('mesas')}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white p-3 md:p-4 rounded-xl text-sm md:text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                + Nueva Mesa
              </button>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-3">Estadísticas Rápidas</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Reservas Confirmadas</span>
                    <span className="font-semibold text-green-600 flex items-center gap-1">
                      <CheckCircle size={16} />
                      {reservasRecientes.filter(r => r.estado === 'confirmada').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Pendientes</span>
                    <span className="font-semibold text-yellow-600">
                      {reservasRecientes.filter(r => r.estado === 'pendiente').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notificaciones y Mesas en Tiempo Real */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 mt-6">
          {/* Notificaciones */}
          {notificaciones.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="text-amber-600" size={24} />
                <h2 className="text-lg md:text-xl font-bold text-gray-800">Notificaciones</h2>
                <span className="ml-auto bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-semibold">
                  {notificaciones.length}
                </span>
              </div>
              <div className="space-y-2">
                {notificaciones.map((notif) => (
                  <div key={notif.id} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                    <Bell size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 font-medium">{notif.mensaje}</p>
                      <p className="text-xs text-gray-500 mt-1">Hora: {notif.tiempo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mesas en Tiempo Real */}
          <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Utensils className="text-blue-600" size={24} />
              <h2 className="text-lg md:text-xl font-bold text-gray-800">Mesas en Tiempo Real</h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
              {mesas.map((mesa) => {
                const reservaActual = reservasRecientes.find(r => 
                  r.mesa?.numero === mesa.numero && r.estado === 'confirmada'
                );
                const estaOcupada = !!reservaActual;
                
                return (
                  <div
                    key={mesa.numero}
                    className={`
                      aspect-square flex flex-col items-center justify-center rounded-xl p-2 md:p-3 transition-all duration-200
                      ${estaOcupada 
                        ? 'bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-400' 
                        : 'bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-400'
                      }
                    `}
                    title={estaOcupada ? `Ocupada - ${reservaActual.cliente?.nombre}` : 'Disponible'}
                  >
                    <Circle 
                      size={12} 
                      className={`mb-1 ${estaOcupada ? 'text-red-600 fill-red-600' : 'text-green-600 fill-green-600'}`}
                    />
                    <span className="text-lg md:text-xl font-bold text-gray-800">{mesa.numero}</span>
                    <span className="text-xs text-gray-600">{mesa.capacidad}p</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Circle size={12} className="text-green-600 fill-green-600" />
                <span className="text-gray-700">Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle size={12} className="text-red-600 fill-red-600" />
                <span className="text-gray-700">Ocupada</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
