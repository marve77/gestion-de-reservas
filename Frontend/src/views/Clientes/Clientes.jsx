import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, User, Mail, Phone, History, Calendar, Star } from 'lucide-react';
import { clientesService } from '../../services/api.service';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [historialCliente, setHistorialCliente] = useState(null);
  const [historialReservas, setHistorialReservas] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    activo: true,
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const response = await clientesService.getAll();
      setClientes(response.data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      alert('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCliente) {
        await clientesService.update(editingCliente.id, formData);
        alert('Cliente actualizado exitosamente');
      } else {
        await clientesService.create(formData);
        alert('Cliente creado exitosamente');
      }
      handleCloseModal();
      loadClientes();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      alert(error.response?.data?.message || 'Error al guardar el cliente');
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setFormData(cliente);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await clientesService.delete(id);
        alert('Cliente eliminado exitosamente');
        loadClientes();
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        alert(error.response?.data?.message || 'Error al eliminar el cliente');
      }
    }
  };

  const handleVerHistorial = async (cliente) => {
    try {
      setHistorialCliente(cliente);
      const response = await clientesService.getHistorial(cliente.id);
      console.log('Respuesta del historial:', response.data);
      
      // El backend devuelve un objeto con la estructura { cliente, estadisticas, historial }
      // Necesitamos extraer el array de historial
      const historial = response.data.historial || response.data.reservas || response.data || [];
      setHistorialReservas(Array.isArray(historial) ? historial : []);
      setShowHistorial(true);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      alert('Error al cargar el historial de reservas');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCliente(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      activo: true,
    });
  };

  const handleCloseHistorial = () => {
    setShowHistorial(false);
    setHistorialCliente(null);
    setHistorialReservas([]);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadClientes();
      return;
    }
    try {
      setLoading(true);
      const response = await clientesService.searchByName(searchTerm);
      setClientes(response.data);
    } catch (error) {
      console.error('Error al buscar:', error);
      alert('Error al buscar clientes');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-6">
      <div className="w-full max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-5 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-1">Gestión de Clientes</h1>
              <p className="text-gray-600 text-sm">Administra la base de datos de clientes</p>
            </div>
            <button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all duration-200 font-medium whitespace-nowrap"
              onClick={() => setShowModal(true)}
            >
              <Plus size={20} />
              Nuevo Cliente
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-lg text-gray-600">Cargando clientes...</p>
            </div>
          </div>
        ) : clientes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <User size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay clientes disponibles</h3>
            <p className="text-gray-500">Comienza agregando un nuevo cliente</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {clientes.map((cliente) => (
              <div 
                key={cliente.id} 
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-l-4 ${
                  cliente.activo ? 'border-purple-500' : 'border-gray-400'
                }`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {cliente.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{cliente.nombre} {cliente.apellido}</h3>
                        <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          cliente.activo 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {cliente.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-gray-700 truncate">{cliente.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-gray-700">{cliente.telefono}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm bg-amber-50 p-2 rounded-lg">
                      <Star size={14} className="text-amber-500 fill-amber-500" />
                      <span className="text-gray-700 font-semibold">{cliente.puntos || 0} puntos</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button 
                      className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-600 px-3 py-2 rounded-md flex items-center justify-center gap-1 transition-colors duration-200 text-sm font-medium"
                      onClick={() => handleVerHistorial(cliente)}
                    >
                      <History size={16} />
                      Historial
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button 
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-md flex items-center justify-center gap-1 transition-colors duration-200 text-sm font-medium"
                      onClick={() => handleEdit(cliente)}
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button 
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-md flex items-center justify-center gap-1 transition-colors duration-200 text-sm font-medium"
                      onClick={() => handleDelete(cliente.id)}
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-2xl px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="Nombre del cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="Apellido del cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="1234-5678"
                />
              </div>

              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-5 h-5 text-purple-500 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="activo" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                  Cliente Activo
                </label>
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors duration-200 font-medium shadow-md"
                >
                  {editingCliente ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Historial */}
      {showHistorial && historialCliente && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={handleCloseHistorial}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-2xl px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Historial de Reservas</h2>
                <p className="text-sm opacity-90">{historialCliente.nombre}</p>
              </div>
              <button 
                onClick={handleCloseHistorial}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {historialReservas.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500">Este cliente no tiene reservas registradas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historialReservas.map((reserva) => (
                    <div 
                      key={reserva.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {reserva.mesa?.numero || 'N/A'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Mesa #{reserva.mesa?.numero}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Calendar size={14} />
                            {new Date(reserva.fecha_hora).toLocaleDateString('es-ES')} - {new Date(reserva.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{reserva.numero_personas} personas</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(reserva.estado)}`}>
                          {reserva.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
