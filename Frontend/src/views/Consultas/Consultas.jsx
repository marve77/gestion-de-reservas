import { useState } from 'react';
import { Calendar, Search, CheckCircle, XCircle, ArrowRight, Users, MapPin } from 'lucide-react';
import { consultasService } from '../../services/api.service';
import MesaCard from '../../components/MesaCard/MesaCard';

const Consultas = () => {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [numeroPersonas, setNumeroPersonas] = useState('');
  const [loading, setLoading] = useState(false);
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleBuscarDisponibilidad = async () => {
    if (!fecha || !hora || !numeroPersonas) {
      alert('Por favor selecciona fecha, hora y número de personas');
      return;
    }

    try {
      setLoading(true);
      const response = await consultasService.disponibilidadMesas(fecha, hora);
      console.log('Respuesta del backend:', response.data);
      
      // Filtrar mesas disponibles por capacidad si es necesario
      let mesasDisponiblesFiltradas = response.data.mesas_disponibles || [];
      
      // Si el usuario especificó número de personas, filtrar por capacidad
      if (numeroPersonas) {
        const numPersonas = parseInt(numeroPersonas);
        mesasDisponiblesFiltradas = mesasDisponiblesFiltradas.filter(
          mesa => mesa.capacidad >= numPersonas
        );
      }
      
      const disponibilidadData = {
        ...response.data,
        hayDisponibilidad: mesasDisponiblesFiltradas.length > 0,
        mesasDisponibles: mesasDisponiblesFiltradas,
        totalMesasDisponibles: mesasDisponiblesFiltradas.length
      };
      
      console.log('Datos procesados:', disponibilidadData);
      setDisponibilidad(disponibilidadData);
      setShowResults(true);
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Error al consultar disponibilidad:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error al consultar disponibilidad. Verifica la conexión con el backend.';
      alert(errorMessage);
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleIrAReservas = () => {
    // Esta función será manejada por el componente padre (App.jsx)
    window.dispatchEvent(new CustomEvent('navigate-to-reservas'));
  };

  const handleMesaClick = (mesa) => {
    // Crear evento personalizado con los datos de la consulta y la mesa seleccionada
    const reservaData = {
      mesa_numero: mesa.numero,
      fecha: fecha,
      hora: hora,
      numero_personas: numeroPersonas,
      fecha_hora: `${fecha}T${hora}:00`
    };
    
    // Disparar evento para navegar a reservas con los datos precargados
    window.dispatchEvent(new CustomEvent('navigate-to-reservas-with-data', { 
      detail: reservaData 
    }));
  };

  const limpiarBusqueda = () => {
    setFecha('');
    setHora('');
    setNumeroPersonas('');
    setDisponibilidad(null);
    setShowResults(false);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="w-full max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Consultas</h1>
          <p className="text-sm md:text-base text-gray-600">
            Verifica la disponibilidad de mesas para una fecha y hora específica
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Calendar className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Consultar Disponibilidad</h2>
              <p className="text-sm text-gray-600">Selecciona fecha y hora para verificar mesas disponibles</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={getTodayDate()}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hora <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Número de Personas <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={numeroPersonas}
                onChange={(e) => setNumeroPersonas(e.target.value)}
                min="1"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 font-medium"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleBuscarDisponibilidad}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Buscar
                  </>
                )}
              </button>
              {showResults && (
                <button
                  onClick={limpiarBusqueda}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors duration-200"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Información de ayuda */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <div className="text-blue-500 mt-0.5">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-sm text-blue-800 font-medium mb-1">Horario de atención</p>
                <p className="text-sm text-blue-700">
                  El restaurante atiende de <strong>8:00 AM a 10:00 PM</strong>, de lunes a sábado.
                  Los domingos permanecemos cerrados.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {showResults && disponibilidad && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className={`rounded-2xl shadow-lg p-6 md:p-8 ${
              disponibilidad.hayDisponibilidad 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                : 'bg-gradient-to-r from-red-500 to-orange-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {disponibilidad.hayDisponibilidad ? (
                    <CheckCircle className="text-white" size={48} strokeWidth={2.5} />
                  ) : (
                    <XCircle className="text-white" size={48} strokeWidth={2.5} />
                  )}
                  <div className="text-white">
                    <h3 className="text-2xl md:text-3xl font-bold mb-1">
                      {disponibilidad.hayDisponibilidad ? '¡Hay disponibilidad!' : 'Sin disponibilidad'}
                    </h3>
                    <p className="text-white/90 text-sm md:text-base">
                      {disponibilidad.hayDisponibilidad 
                        ? `${disponibilidad.totalMesasDisponibles || disponibilidad.mesasDisponibles?.length || 0} mesa(s) disponible(s) para ${numeroPersonas} persona(s)`
                        : 'No hay mesas disponibles para la fecha, hora y número de personas seleccionados'
                      }
                    </p>
                  </div>
                </div>
                {/* Removed 'Hacer Reserva' button */}
              </div>
              {/* Removed 'Hacer Reserva' button */}
            </div>

            {/* Available Tables */}
            {disponibilidad.hayDisponibilidad && disponibilidad.mesasDisponibles && disponibilidad.mesasDisponibles.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Mesas Disponibles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {disponibilidad.mesasDisponibles.map((mesa, index) => (
                    <MesaCard 
                      key={mesa.numero || index} 
                      mesa={mesa} 
                      index={index}
                      onClick={handleMesaClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Información adicional */}
            {!disponibilidad.hayDisponibilidad && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Sugerencias</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-bold">1</span>
                    </div>
                    <p className="text-gray-700">Intenta con una hora diferente del mismo día</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-bold">2</span>
                    </div>
                    <p className="text-gray-700">Considera reservar para otro día</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-bold">3</span>
                    </div>
                    <p className="text-gray-700">Contáctanos directamente para opciones especiales</p>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!showResults && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-emerald-600" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Selecciona una fecha y hora
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Completa los campos de fecha y hora arriba, luego haz clic en "Buscar" para verificar la disponibilidad de mesas
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consultas;
