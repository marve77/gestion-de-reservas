import { Users, MapPin, CheckCircle } from 'lucide-react';

const MesaCard = ({ mesa, index, onClick }) => {
  return (
    <div
      onClick={() => onClick && onClick(mesa)}
      className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-5 hover:shadow-lg hover:scale-105 hover:border-emerald-400 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
          {mesa.numero !== undefined && mesa.numero !== null ? mesa.numero : 'N/A'}
        </div>
        <CheckCircle className="text-emerald-500 group-hover:text-emerald-600" size={24} strokeWidth={2.5} />
      </div>
      
      <h4 className="font-bold text-gray-800 mb-3 text-lg">
        Mesa #{mesa.numero !== undefined && mesa.numero !== null ? mesa.numero : 'Sin número'}
      </h4>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
            <Users size={14} className="text-emerald-600" />
          </div>
          <span>
            Capacidad: <strong className="text-emerald-700">{mesa.capacidad || 'Desconocida'}</strong> personas
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center">
            <MapPin size={14} className="text-teal-600" />
          </div>
          <span className="line-clamp-1" title={mesa.ubicacion || 'Ubicación no especificada'}>
            {mesa.ubicacion || 'Ubicación no especificada'}
          </span>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-emerald-200">
        <p className="text-xs text-emerald-600 font-semibold text-center group-hover:text-emerald-700">
          Click para reservar →
        </p>
      </div>
    </div>
  );
};

export default MesaCard;
