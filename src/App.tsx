import { useState } from 'react';
import Dashboard from './pages/Dashboard';
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
    <Dashboard
      onNavigateToStats={() => setCurrentView('statistics')}
    />
  );
}

export default App;
