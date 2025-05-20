// Aplicación principal para el juego Memorama
import { useEffect, useState } from 'react';
import { Route, Switch } from 'wouter';
import NotFound from './pages/not-found';

// Componente para rutas
function Router() {
  return (
    <Switch>
      <Route path="/" component={Memorama} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Componente principal del juego
function Memorama() {
  const [gameState, setGameState] = useState({
    status: 'idle', // idle, playing, paused, finished
    moves: 0,
    matchedPairs: 0,
    totalPairs: 8,
    cards: [],
    flippedCards: []
  });

  // Renderizar el juego con JavaScript puro
  useEffect(() => {
    // Esta función carga el juego implementado en JavaScript puro
    const script = document.createElement('script');
    script.src = '/script.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="memorama-container">
      {/* El contenido HTML será manejado por el script JavaScript puro */}
      <div id="memorama-app"></div>
    </div>
  );
}

// Componente App
function App() {
  return (
    <div className="app">
      <Router />
    </div>
  );
}

export default App;