import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, X, Eye } from 'lucide-react';
import { reservasService } from '../../services/api.service';

const Calendario = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reservasDelDia, setReservasDelDia] = useState([]);

  useEffect(() => {
    loadReservas();
  }, [currentDate]);

  const loadReservas = async () => {
    try {
      setLoading(true);
      const response = await reservasService.getAll();
      setReservas(response.data);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getReservasForDay = (day) => {
    const { year, month } = getDaysInMonth(currentDate);
    const targetDate = new Date(year, month, day);
    
    return reservas.filter(reserva => {
      const reservaDate = new Date(reserva.fecha_hora);
      return (
        reservaDate.getDate() === targetDate.getDate() &&
        reservaDate.getMonth() === targetDate.getMonth() &&
        reservaDate.getFullYear() === targetDate.getFullYear()
      );
    });
  };

  const handleDayClick = (day) => {
    const reservasDay = getReservasForDay(day);
    if (reservasDay.length > 0) {
      setSelectedDay(day);
      setReservasDelDia(reservasDay);
      setShowModal(true);
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'confirmada': 'bg-green-100 text-green-700',
      'pendiente': 'bg-yellow-100 text-yellow-700',
      'cancelada': 'bg-red-100 text-red-700',
      'completada': 'bg-blue-100 text-blue-700',
    };
    return badges[estado] || 'bg-gray-100 text-gray-700';
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    // Header con días de la semana
    weekDays.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="text-center font-semibold text-gray-600 py-3 text-sm md:text-base">
          {day}
        </div>
      );
    });

    // Espacios vacíos antes del primer día
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const reservasDay = getReservasForDay(day);
      const hasReservas = reservasDay.length > 0;
      const isToday = 
        day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={day}
          onClick={() => handleDayClick(day)}
          className={`
            min-h-[80px] md:min-h-[100px] p-2 border border-gray-200 rounded-lg transition-all duration-200
            ${hasReservas ? 'cursor-pointer hover:shadow-lg hover:scale-105 bg-gradient-to-br from-blue-50 to-cyan-50' : 'bg-white'}
            ${isToday ? 'ring-2 ring-blue-500' : ''}
          `}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-1">
              <span className={`text-sm md:text-base font-semibold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                {day}
              </span>
              {isToday && (
                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Hoy</span>
              )}
            </div>
            {hasReservas && (
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <CalendarIcon size={12} />
                  <span className="font-medium">{reservasDay.length} reserva{reservasDay.length > 1 ? 's' : ''}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {reservasDay.slice(0, 3).map((reserva, idx) => (
                    <div
                      key={idx}
                      className={`text-xs px-2 py-0.5 rounded-full ${getEstadoBadge(reserva.estado)}`}
                    >
                      {new Date(reserva.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  ))}
                  {reservasDay.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">+{reservasDay.length - 3}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-6">
      <div className="w-full max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-5 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-1">Calendario de Reservas</h1>
              <p className="text-gray-600 text-sm">Vista mensual de todas las reservas</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={previousMonth}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="text-center min-w-[200px]">
                <h2 className="text-xl font-bold text-gray-800">
                  {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </h2>
              </div>
              <button
                onClick={nextMonth}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Leyenda */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100"></div>
              <span className="text-sm text-gray-700">Confirmada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-100"></div>
              <span className="text-sm text-gray-700">Pendiente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100"></div>
              <span className="text-sm text-gray-700">Completada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100"></div>
              <span className="text-sm text-gray-700">Cancelada</span>
            </div>
          </div>
        </div>

        {/* Calendario */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {renderCalendar()}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Reservas del Día */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-2xl px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                Reservas del {selectedDay} de {currentDate.toLocaleDateString('es-ES', { month: 'long' })}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="space-y-4">
                {reservasDelDia.map((reserva) => (
                  <div
                    key={reserva.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {reserva.cliente ? `${reserva.cliente.nombre} ${reserva.cliente.apellido}` : 'Cliente'}
                        </h3>
                        <p className="text-sm text-gray-600">{reserva.cliente?.email}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(reserva.estado)}`}>
                        {reserva.estado}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock size={16} className="text-gray-400" />
                        <span>{new Date(reserva.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users size={16} className="text-gray-400" />
                        <span>{reserva.numero_personas} personas</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <CalendarIcon size={16} className="text-gray-400" />
                        <span>Mesa {reserva.mesa?.numero}</span>
                      </div>
                    </div>

                    {reserva.observaciones && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Observaciones:</span> {reserva.observaciones}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendario;
