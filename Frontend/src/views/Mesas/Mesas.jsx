import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Utensils } from 'lucide-react';
import { mesasService } from '../../services/api.service';

const Mesas = () => {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMesa, setEditingMesa] = useState(null);
  const [formData, setFormData] = useState({
    numero: '',
    capacidad: '',
    ubicacion: '',
    activa: true,
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMesas();
  }, []);

  const loadMesas = async () => {
    try {
      setLoading(true);
      const response = await mesasService.getAll();
      setMesas(response.data);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
      alert('Error al cargar las mesas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMesa) {
        await mesasService.update(editingMesa.numero, formData);
        alert('Mesa actualizada exitosamente');
      } else {
        await mesasService.create(formData);
        alert('Mesa creada exitosamente');
      }
      handleCloseModal();
      loadMesas();
    } catch (error) {
      console.error('Error al guardar mesa:', error);
      alert(error.response?.data?.message || 'Error al guardar la mesa');
    }
  };

  const handleEdit = (mesa) => {
    setEditingMesa(mesa);
    setFormData(mesa);
    setShowModal(true);
  };

  const handleDelete = async (numero) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta mesa?')) {
      try {
        await mesasService.delete(numero);
        alert('Mesa eliminada exitosamente');
        loadMesas();
      } catch (error) {
        console.error('Error al eliminar mesa:', error);
        alert(error.response?.data?.message || 'Error al eliminar la mesa');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMesa(null);
    setFormData({
      numero: '',
      capacidad: '',
      ubicacion: '',
      activa: true,
    });
  };

  const filteredMesas = mesas.filter((mesa) =>
    mesa.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mesa.numero.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-full bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-1">Gestión de Mesas</h1>
              <p className="text-gray-600 text-sm">Administra las mesas del restaurante</p>
            </div>
            <button 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 font-medium whitespace-nowrap"
              onClick={() => setShowModal(true)}
            >
              <Plus size={20} />
              Nueva Mesa
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-sm">
            <div className="text-xl text-gray-600 animate-pulse">Cargando mesas...</div>
          </div>
        ) : filteredMesas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Utensils size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay mesas disponibles</h3>
            <p className="text-gray-500">Comienza agregando una nueva mesa</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMesas.map((mesa) => (
              <div 
                key={mesa.numero} 
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-l-4 ${
                  mesa.activa ? 'border-green-500' : 'border-red-500'
                }`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary">Mesa #{mesa.numero}</h3>
                      <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        mesa.activa 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {mesa.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-24">Capacidad:</span>
                      <span className="font-medium text-gray-900">{mesa.capacidad} personas</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-24">Ubicación:</span>
                      <span className="font-medium text-gray-900">{mesa.ubicacion}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button 
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-md flex items-center justify-center gap-1 transition-colors duration-200 text-sm font-medium"
                      onClick={() => handleEdit(mesa)}
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button 
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-md flex items-center justify-center gap-1 transition-colors duration-200 text-sm font-medium"
                      onClick={() => handleDelete(mesa.numero)}
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

      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-t-2xl px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingMesa ? 'Editar Mesa' : 'Nueva Mesa'}
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
                  Número de Mesa <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  disabled={!!editingMesa}
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                  placeholder="Ej: 1, 2, 3..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Capacidad <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={formData.capacidad}
                  onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                  placeholder="Número de personas"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ubicación <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                  placeholder="Ej: Terraza, Salón principal, VIP..."
                />
              </div>

              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <input
                  type="checkbox"
                  id="activa"
                  checked={formData.activa}
                  onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                />
                <label htmlFor="activa" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                  Mesa Activa
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  {editingMesa ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mesas;
