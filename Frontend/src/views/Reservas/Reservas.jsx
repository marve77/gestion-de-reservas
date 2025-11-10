import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Calendar, Clock, Users, XCircle, CheckCircle } from 'lucide-react';
import { reservasService, mesasService, clientesService } from '../../services/api.service';

const Reservas = ({ preloadData }) => {
  const [reservas, setReservas] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReserva, setEditingReserva] = useState(null);
  const [formData, setFormData] = useState({
    cliente_id: '',
    mesa_numero: '',
    fecha_hora: '',
    numero_personas: '',
    estado: 'pendiente',
    observaciones: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // Efecto para manejar datos precargados desde Consultas
  useEffect(() => {
    if (preloadData && Object.keys(preloadData).length > 0) {
      setFormData({
        cliente_id: '',
        mesa_numero: preloadData.mesa_numero || '',
        fecha_hora: preloadData.fecha_hora || '',
        numero_personas: preloadData.numero_personas || '',
        estado: 'pendiente',
        observaciones: `Reserva generada desde consulta para ${preloadData.numero_personas || ''} persona(s)`,
      });
      setShowModal(true);
    }
  }, [preloadData]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reservasRes, mesasRes, clientesRes] = await Promise.all([
        reservasService.getAll(),
        mesasService.getAll(),
        clientesService.getAll(),
      ]);
      setReservas(reservasRes.data);
      setMesas(mesasRes.data);
      setClientes(clientesRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        cliente_id: parseInt(formData.cliente_id),
        mesa_numero: parseInt(formData.mesa_numero),
        numero_personas: parseInt(formData.numero_personas),
      };

      if (editingReserva) {
        await reservasService.update(editingReserva.id, dataToSend);
        alert('Reserva actualizada exitosamente');
      } else {
        await reservasService.create(dataToSend);
        alert('Reserva creada exitosamente');
      }
      handleCloseModal();
      loadData();
      
      // Limpiar datos precargados después de crear/editar
      window.dispatchEvent(new CustomEvent('reserva-saved'));
    } catch (error) {
      console.error('Error al guardar reserva:', error);
      alert(error.response?.data?.message || 'Error al guardar la reserva');
    }
  };

  const handleEdit = (reserva) => {
    setEditingReserva(reserva);
    setFormData({
      cliente_id: reserva.cliente?.id || '',
      mesa_numero: reserva.mesa?.numero || '',
      fecha_hora: new Date(reserva.fecha_hora).toISOString().slice(0, 16),
      numero_personas: reserva.numero_personas,
      estado: reserva.estado,
      observaciones: reserva.observaciones || '',
    });
    setShowModal(true);
  };

  const handleCancelar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      try {
        await reservasService.cancel(id);
        alert('Reserva cancelada exitosamente');
        loadData();
      } catch (error) {
        console.error('Error al cancelar reserva:', error);
        alert(error.response?.data?.message || 'Error al cancelar la reserva');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      try {
        await reservasService.delete(id);
        alert('Reserva eliminada exitosamente');
        loadData();
      } catch (error) {
        console.error('Error al eliminar reserva:', error);
        alert(error.response?.data?.message || 'Error al eliminar la reserva');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReserva(null);
    setFormData({
      cliente_id: '',
      mesa_numero: '',
      fecha_hora: '',
      numero_personas: '',
      estado: 'pendiente',
      observaciones: '',
    });
  };

  const filteredReservas = reservas.filter((reserva) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      reserva.cliente?.nombre.toLowerCase().includes(searchLower) ||
      reserva.mesa?.numero.toString().includes(searchLower) ||
      reserva.estado.toLowerCase().includes(searchLower)
    );
  });

  const getEstadoBadge = (estado) => {
    const badges = {
      'confirmada': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      'pendiente': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      'cancelada': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      'completada': { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
    };
    return badges[estado] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: Calendar };
  };

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-6">
      <div className="w-full max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-5 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-1">Gestión de Reservas</h1>
              <p className="text-gray-600 text-sm">Administra todas las reservaciones del restaurante</p>
            </div>
            <button 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all duration-200 font-medium whitespace-nowrap"
              onClick={() => setShowModal(true)}
            >
              <Plus size={20} />
              Nueva Reserva
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, mesa o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-lg text-gray-600">Cargando reservas...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Mesa</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Fecha y Hora</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Personas</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservas.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <Calendar className="mx-auto text-gray-300 mb-3" size={48} />
                        <p className="text-gray-500">No hay reservas disponibles</p>
                      </td>
                    </tr>
                  ) : (
                    filteredReservas.map((reserva) => {
                      const estadoInfo = getEstadoBadge(reserva.estado);
                      const IconEstado = estadoInfo.icon;
                      return (
                        <tr key={reserva.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                                {reserva.cliente?.nombre.charAt(0).toUpperCase() || 'N'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {reserva.cliente?.nombre || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {reserva.cliente?.email || ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">Mesa #{reserva.mesa?.numero || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{reserva.mesa?.ubicacion || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(reserva.fecha_hora).toLocaleDateString('es-ES', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(reserva.fecha_hora).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-sm text-gray-900">
                              <Users size={16} className="text-gray-400" />
                              {reserva.numero_personas}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${estadoInfo.bg} ${estadoInfo.text}`}>
                              <IconEstado size={14} />
                              {reserva.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(reserva)}
                                className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                                title="Editar"
                              >
                                <Edit size={18} />
                              </button>
                              {reserva.estado !== 'cancelada' && (
                                <button
                                  onClick={() => handleCancelar(reserva.id)}
                                  className="text-orange-600 hover:text-orange-900 p-2 hover:bg-orange-50 rounded transition-colors"
                                  title="Cancelar"
                                >
                                  <XCircle size={18} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(reserva.id)}
                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-2xl px-6 py-4 flex justify-between items-center sticky top-0">
              <h2 className="text-xl font-bold">
                {editingReserva ? 'Editar Reserva' : 'Nueva Reserva'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Banner informativo cuando hay datos precargados */}
              {preloadData && !editingReserva && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <CheckCircle className="text-emerald-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-emerald-800 mb-1">
                        ¡Mesa seleccionada desde consultas!
                      </h4>
                      <p className="text-sm text-emerald-700">
                        Mesa #{preloadData.mesa_numero} para {preloadData.numero_personas} persona(s) 
                        el {new Date(preloadData.fecha_hora).toLocaleDateString('es-ES')} a las{' '}
                        {new Date(preloadData.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.
                        Solo falta seleccionar el cliente.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cliente <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.cliente_id}
                    onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.filter(c => c.activo).map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} - {cliente.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mesa <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.mesa_numero}
                    onChange={(e) => setFormData({ ...formData, mesa_numero: e.target.value })}
                    disabled={preloadData && !editingReserva}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                      preloadData && !editingReserva ? 'bg-emerald-50 border-emerald-300 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">Seleccionar mesa</option>
                    {mesas.filter(m => m.activa).map(mesa => (
                      <option key={mesa.numero} value={mesa.numero}>
                        Mesa #{mesa.numero} - {mesa.ubicacion} ({mesa.capacidad} personas)
                      </option>
                    ))}
                  </select>
                  {preloadData && !editingReserva && (
                    <p className="mt-1 text-xs text-emerald-600">✓ Mesa precargada desde consulta</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha y Hora <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.fecha_hora}
                    onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
                    disabled={preloadData && !editingReserva}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                      preloadData && !editingReserva ? 'bg-emerald-50 border-emerald-300 cursor-not-allowed' : ''
                    }`}
                  />
                  {preloadData && !editingReserva && (
                    <p className="mt-1 text-xs text-emerald-600">✓ Fecha y hora precargadas desde consulta</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número de Personas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.numero_personas}
                    onChange={(e) => setFormData({ ...formData, numero_personas: e.target.value })}
                    disabled={preloadData && !editingReserva}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                      preloadData && !editingReserva ? 'bg-emerald-50 border-emerald-300 cursor-not-allowed' : ''
                    }`}
                    placeholder="Cantidad de personas"
                  />
                  {preloadData && !editingReserva && (
                    <p className="mt-1 text-xs text-emerald-600">✓ Número de personas precargado desde consulta</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Observaciones (Opcional)
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Observaciones o solicitudes especiales..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-colors duration-200 font-medium shadow-md"
                >
                  {editingReserva ? 'Actualizar' : 'Crear Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservas;
