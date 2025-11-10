import { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, Users, Utensils } from 'lucide-react';
import { reservasService, mesasService } from '../../services/api.service';

const Reportes = () => {
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [reporteData, setReporteData] = useState(null);

  useEffect(() => {
    // Establecer fechas por defecto (última semana)
    const hoy = new Date();
    const hace7Dias = new Date(hoy);
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    
    setFechaInicio(hace7Dias.toISOString().split('T')[0]);
    setFechaFin(hoy.toISOString().split('T')[0]);
  }, []);

  const generarReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      alert('Por favor selecciona ambas fechas');
      return;
    }

    try {
      setLoading(true);
      
      // Obtener todas las reservas y mesas
      const [reservasRes, mesasRes] = await Promise.all([
        reservasService.getAll(),
        mesasService.getAll()
      ]);

      const reservas = reservasRes.data;
      const mesas = mesasRes.data;

      // Filtrar reservas por rango de fechas
      const reservasFiltradas = reservas.filter(r => {
        const fechaReserva = new Date(r.fecha_hora);
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        
        return fechaReserva >= inicio && fechaReserva <= fin;
      });

      // Calcular estadísticas
      const totalReservas = reservasFiltradas.length;
      const reservasConfirmadas = reservasFiltradas.filter(r => r.estado === 'confirmada').length;
      const reservasCompletadas = reservasFiltradas.filter(r => r.estado === 'completada').length;
      const reservasCanceladas = reservasFiltradas.filter(r => r.estado === 'cancelada').length;
      const reservasPendientes = reservasFiltradas.filter(r => r.estado === 'pendiente').length;

      // Ocupación por día
      const ocupacionPorDia = {};
      reservasFiltradas.forEach(r => {
        const fecha = new Date(r.fecha_hora).toLocaleDateString('es-ES');
        if (!ocupacionPorDia[fecha]) {
          ocupacionPorDia[fecha] = {
            total: 0,
            confirmadas: 0,
            completadas: 0,
            canceladas: 0,
            pendientes: 0
          };
        }
        ocupacionPorDia[fecha].total++;
        if (r.estado === 'confirmada') ocupacionPorDia[fecha].confirmadas++;
        if (r.estado === 'completada') ocupacionPorDia[fecha].completadas++;
        if (r.estado === 'cancelada') ocupacionPorDia[fecha].canceladas++;
        if (r.estado === 'pendiente') ocupacionPorDia[fecha].pendientes++;
      });

      // Mesas más utilizadas
      const mesasUtilizadas = {};
      reservasFiltradas.forEach(r => {
        const mesaNum = r.mesa?.numero || 'N/A';
        if (!mesasUtilizadas[mesaNum]) {
          mesasUtilizadas[mesaNum] = 0;
        }
        mesasUtilizadas[mesaNum]++;
      });

      // Convertir a array y ordenar
      const mesasPopulares = Object.entries(mesasUtilizadas)
        .map(([mesa, cantidad]) => ({ mesa, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10);

      // Tasa de ocupación promedio
      const diasEnRango = Math.ceil((new Date(fechaFin) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24)) + 1;
      const mesasActivas = mesas.filter(m => m.activa).length;
      const tasaOcupacionPromedio = mesasActivas > 0 
        ? ((totalReservas / (diasEnRango * mesasActivas)) * 100).toFixed(2)
        : 0;

      setReporteData({
        totalReservas,
        reservasConfirmadas,
        reservasCompletadas,
        reservasCanceladas,
        reservasPendientes,
        ocupacionPorDia,
        mesasPopulares,
        tasaOcupacionPromedio,
        diasEnRango
      });

    } catch (error) {
      console.error('Error al generar reporte:', error);
      alert('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = () => {
    if (!reporteData) return;

    let csv = 'Reporte de Ocupación\n\n';
    csv += `Período: ${fechaInicio} a ${fechaFin}\n\n`;
    csv += 'Resumen General\n';
    csv += `Total Reservas,${reporteData.totalReservas}\n`;
    csv += `Confirmadas,${reporteData.reservasConfirmadas}\n`;
    csv += `Completadas,${reporteData.reservasCompletadas}\n`;
    csv += `Canceladas,${reporteData.reservasCanceladas}\n`;
    csv += `Pendientes,${reporteData.reservasPendientes}\n`;
    csv += `Tasa de Ocupación Promedio,${reporteData.tasaOcupacionPromedio}%\n\n`;
    
    csv += 'Ocupación por Día\n';
    csv += 'Fecha,Total,Confirmadas,Completadas,Canceladas,Pendientes\n';
    Object.entries(reporteData.ocupacionPorDia).forEach(([fecha, datos]) => {
      csv += `${fecha},${datos.total},${datos.confirmadas},${datos.completadas},${datos.canceladas},${datos.pendientes}\n`;
    });

    csv += '\nMesas Más Populares\n';
    csv += 'Mesa,Cantidad de Reservas\n';
    reporteData.mesasPopulares.forEach(({ mesa, cantidad }) => {
      csv += `${mesa},${cantidad}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-ocupacion-${fechaInicio}-${fechaFin}.csv`;
    a.click();
  };

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-6">
      <div className="w-full max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-5 md:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="text-blue-600" size={32} />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">Reportes de Ocupación</h1>
              <p className="text-gray-600 text-sm">Analiza las tendencias de reservas y ocupación</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={generarReporte}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Generando...' : 'Generar Reporte'}
              </button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {reporteData && (
          <>
            {/* Estadísticas Generales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="text-blue-600" size={24} />
                  <h3 className="font-semibold text-gray-700">Total Reservas</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800">{reporteData.totalReservas}</p>
                <p className="text-sm text-gray-500 mt-1">En {reporteData.diasEnRango} días</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-5">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-green-600" size={24} />
                  <h3 className="font-semibold text-gray-700">Completadas</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">{reporteData.reservasCompletadas}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {reporteData.totalReservas > 0 ? ((reporteData.reservasCompletadas / reporteData.totalReservas) * 100).toFixed(1) : 0}% del total
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="text-amber-600" size={24} />
                  <h3 className="font-semibold text-gray-700">Tasa Ocupación</h3>
                </div>
                <p className="text-3xl font-bold text-amber-600">{reporteData.tasaOcupacionPromedio}%</p>
                <p className="text-sm text-gray-500 mt-1">Promedio del período</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Utensils className="text-purple-600" size={24} />
                  <h3 className="font-semibold text-gray-700">Mesa Popular</h3>
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  {reporteData.mesasPopulares[0]?.mesa || 'N/A'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {reporteData.mesasPopulares[0]?.cantidad || 0} reservas
                </p>
              </div>
            </div>

            {/* Botón Exportar */}
            <div className="mb-6">
              <button
                onClick={exportarCSV}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 flex items-center gap-2"
              >
                <Download size={20} />
                Exportar a CSV
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Ocupación por Día */}
              <div className="bg-white rounded-lg shadow-sm p-5 md:p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Ocupación por Día</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {Object.entries(reporteData.ocupacionPorDia).map(([fecha, datos]) => (
                    <div key={fecha} className="border-b border-gray-200 pb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-gray-700">{fecha}</span>
                        <span className="text-sm font-bold text-blue-600">{datos.total} reservas</span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                          ✓ {datos.confirmadas}
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          ✓ {datos.completadas}
                        </span>
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                          ⏱ {datos.pendientes}
                        </span>
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                          ✗ {datos.canceladas}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mesas Más Populares */}
              <div className="bg-white rounded-lg shadow-sm p-5 md:p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Mesas Más Populares</h2>
                <div className="space-y-3">
                  {reporteData.mesasPopulares.map(({ mesa, cantidad }, index) => {
                    const maxCantidad = reporteData.mesasPopulares[0]?.cantidad || 1;
                    const porcentaje = (cantidad / maxCantidad) * 100;
                    
                    return (
                      <div key={mesa} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                          {mesa}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-semibold text-gray-700">Mesa {mesa}</span>
                            <span className="text-sm text-gray-600">{cantidad} reservas</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${porcentaje}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Resumen de Estados */}
            <div className="bg-white rounded-lg shadow-sm p-5 md:p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen por Estado</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{reporteData.reservasConfirmadas}</p>
                  <p className="text-sm text-gray-600 mt-1">Confirmadas</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{reporteData.reservasCompletadas}</p>
                  <p className="text-sm text-gray-600 mt-1">Completadas</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{reporteData.reservasPendientes}</p>
                  <p className="text-sm text-gray-600 mt-1">Pendientes</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{reporteData.reservasCanceladas}</p>
                  <p className="text-sm text-gray-600 mt-1">Canceladas</p>
                </div>
              </div>
            </div>
          </>
        )}

        {!reporteData && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <BarChart3 size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Genera tu primer reporte</h3>
            <p className="text-gray-500">Selecciona un rango de fechas y haz clic en "Generar Reporte"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reportes;
