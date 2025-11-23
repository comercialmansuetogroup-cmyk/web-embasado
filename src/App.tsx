import { useState } from 'react';
import AggregatedDashboard from './pages/AggregatedDashboard';
import Statistics from './pages/Statistics';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'statistics'>('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  if (currentView === 'statistics') {
    return (
      <Statistics
        onNavigateBack={() => setCurrentView('dashboard')}
        darkMode={darkMode}
      />
    );
  }

  return (
    <AggregatedDashboard
      onNavigateToStats={() => setCurrentView('statistics')}
    />
  );
}

export default App;
