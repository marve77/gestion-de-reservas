import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './views/Dashboard/Dashboard';
import Mesas from './views/Mesas/Mesas';
import Clientes from './views/Clientes/Clientes';
import Reservas from './views/Reservas/Reservas';
import Consultas from './views/Consultas/Consultas';
import Calendario from './views/Calendario/Calendario';
import Reportes from './views/Reportes/Reportes';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [reservaPreloadData, setReservaPreloadData] = useState(null);

  // Limpiar datos precargados cuando se cambia de vista
  const handleNavigate = (view) => {
    if (view !== 'reservas') {
      setReservaPreloadData(null);
    }
    setCurrentView(view);
  };

  useEffect(() => {
    // Escuchar evento para navegar a reservas desde consultas
    const handleNavigateToReservas = () => {
      setReservaPreloadData(null);
      setCurrentView('reservas');
    };

    // Escuchar evento para navegar a reservas con datos precargados
    const handleNavigateToReservasWithData = (event) => {
      setReservaPreloadData(event.detail);
      setCurrentView('reservas');
    };

    // Limpiar datos precargados después de guardar reserva
    const handleReservaSaved = () => {
      setReservaPreloadData(null);
    };

    window.addEventListener('navigate-to-reservas', handleNavigateToReservas);
    window.addEventListener('navigate-to-reservas-with-data', handleNavigateToReservasWithData);
    window.addEventListener('reserva-saved', handleReservaSaved);
    
    return () => {
      window.removeEventListener('navigate-to-reservas', handleNavigateToReservas);
      window.removeEventListener('navigate-to-reservas-with-data', handleNavigateToReservasWithData);
      window.removeEventListener('reserva-saved', handleReservaSaved);
    };
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'calendario':
        return <Calendario />;
      case 'mesas':
        return <Mesas />;
      case 'clientes':
        return <Clientes />;
      case 'reservas':
        return <Reservas preloadData={reservaPreloadData} />;
      case 'consultas':
        return <Consultas />;
      case 'reportes':
        return <Reportes />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onNavigate={handleNavigate} currentView={currentView} />
      <main className="flex-1 overflow-auto">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
