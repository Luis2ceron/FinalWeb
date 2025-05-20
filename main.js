// Juego de Memoria (Memorama) - JavaScript Puro

// Estado del juego
const gameState = {
  status: 'idle', // idle, playing, paused, finished
  moves: 0,
  matchedPairs: 0,
  totalPairs: 8,
  score: 0,
  timeElapsed: 0,
  timer: null,
  cards: [],
  flippedCards: [],
  settings: {
    difficulty: 'easy',
    cardSet: 'icons'
  },
  difficultySettings: {
    easy: { pairs: 8, columns: 4 },
    medium: { pairs: 12, columns: 6 },
    hard: { pairs: 18, columns: 6 }
  }
};

// Puntuaciones altas
let highScores = [];

// Sets de cartas
let cardSets = [];

// Elementos del DOM
const elements = {
  // Elementos del tablero de juego
  gameBoard: document.getElementById('game-board'),
  cardsContainer: document.getElementById('game-cards-container'),
  idleOverlay: document.getElementById('game-idle-overlay'),
  
  // Elementos de información del juego
  movesDisplay: document.getElementById('game-moves'),
  matchedPairsDisplay: document.getElementById('game-matched-pairs'),
  totalPairsDisplay: document.getElementById('game-total-pairs'),
  timeDisplay: document.getElementById('game-time'),
  
  // Botones de control del juego
  startButton: document.getElementById('btn-start'),
  startOverlayButton: document.getElementById('btn-start-overlay'),
  resetButton: document.getElementById('btn-reset'),
  settingsButton: document.getElementById('btn-settings'),
  
  // Elementos de puntuaciones altas
  highScoresTable: document.getElementById('high-scores-table'),
  highScoresEmpty: document.getElementById('high-scores-empty'),
  highScoreFilter: document.getElementById('high-score-filter'),
  clearScoresButton: document.getElementById('btn-clear-scores'),
  
  // Elementos de configuración del juego
  difficultyButtons: document.getElementById('difficulty-buttons'),
  cardSetsContainer: document.getElementById('card-sets-container'),
  
  // Modal de juego completado
  gameCompleteModal: document.getElementById('game-complete-modal'),
  resultMoves: document.getElementById('result-moves'),
  resultTime: document.getElementById('result-time'),
  resultScore: document.getElementById('result-score'),
  highScoreForm: document.getElementById('high-score-form'),
  playerNameInput: document.getElementById('player-name-input'),
  playAgainButton: document.getElementById('btn-play-again'),
  
  // Modal de configuración
  settingsModal: document.getElementById('settings-modal'),
  settingsDifficultyButtons: document.getElementById('settings-difficulty-buttons'),
  settingsCardSetsContainer: document.getElementById('settings-card-sets-container'),
  saveSettingsButton: document.getElementById('btn-save-settings'),
  
  // Modal de instrucciones
  instructionsModal: document.getElementById('instructions-modal'),
  instructionsButton: document.getElementById('btn-instructions'),
  
  // Elementos del pie de página
  settingsFooterButton: document.getElementById('btn-settings-footer'),
  
  // Botones de cierre de modal
  modalCloseButtons: document.querySelectorAll('.modal-close')
};

// Funciones auxiliares
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function calculateScore(moves, timeElapsed, difficulty) {
  // La puntuación base depende de la dificultad
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2
  };
  
  // Calcular puntuación - más puntos por menos movimientos y menos tiempo
  const baseScore = 1000 * difficultyMultiplier[difficulty];
  const movesPenalty = moves * 10;
  const timePenalty = timeElapsed * 2;
  
  // Cálculo final de la puntuación
  let score = baseScore - movesPenalty - timePenalty;
  
  // Asegurar que la puntuación no sea negativa
  return Math.max(score, 0);
}

function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Funcionalidad del juego
function startTimer() {
  gameState.timer = setInterval(() => {
    gameState.timeElapsed += 1;
    elements.timeDisplay.textContent = formatTime(gameState.timeElapsed);
  }, 1000);
}

function stopTimer() {
  if (gameState.timer) {
    clearInterval(gameState.timer);
    gameState.timer = null;
  }
}

function resetTimer() {
  stopTimer();
  gameState.timeElapsed = 0;
  elements.timeDisplay.textContent = formatTime(0);
}

function startGame() {
  // Establecer estado del juego a 'jugando'
  gameState.status = 'playing';
  gameState.moves = 0;
  gameState.matchedPairs = 0;
  gameState.flippedCards = [];
  
  // Actualizar UI
  elements.movesDisplay.textContent = '0';
  elements.matchedPairsDisplay.textContent = '0';
  elements.idleOverlay.classList.add('hidden');
  
  // Reiniciar y comenzar temporizador
  resetTimer();
  startTimer();
  
  // Generar y mezclar cartas
  generateCards();
}

function resetGame() {
  // Detener cualquier juego en curso
  stopTimer();
  
  // Reiniciar estado del juego
  gameState.status = 'idle';
  gameState.moves = 0;
  gameState.matchedPairs = 0;
  gameState.timeElapsed = 0;
  gameState.flippedCards = [];
  
  // Actualizar UI
  elements.movesDisplay.textContent = '0';
  elements.matchedPairsDisplay.textContent = '0';
  elements.timeDisplay.textContent = formatTime(0);
  elements.idleOverlay.classList.remove('hidden');
  
  // Limpiar tablero de juego
  elements.cardsContainer.innerHTML = '';
}

function endGame() {
  // Establecer estado del juego a 'finalizado'
  gameState.status = 'finished';
  
  // Detener temporizador
  stopTimer();
  
  // Calcular puntuación final
  gameState.score = calculateScore(
    gameState.moves,
    gameState.timeElapsed,
    gameState.settings.difficulty
  );
  
  // Actualizar modal de resultado
  elements.resultMoves.textContent = gameState.moves;
  elements.resultTime.textContent = formatTime(gameState.timeElapsed);
  elements.resultScore.textContent = gameState.score;
  
  // Mostrar modal de juego completado
  showModal(elements.gameCompleteModal);
}

function generateCards() {
  // Obtener el set de cartas apropiado y el número de pares
  const diffSetting = gameState.difficultySettings[gameState.settings.difficulty];
  gameState.totalPairs = diffSetting.pairs;
  
  // Actualizar display de pares totales
  elements.totalPairsDisplay.textContent = gameState.totalPairs;
  
  // Encontrar el set de cartas seleccionado
  const cardSet = cardSets.find(set => set.id === gameState.settings.cardSet) || cardSets[0];
  
  // Obtener íconos para la dificultad actual
  const icons = shuffle(cardSet.icons).slice(0, gameState.totalPairs);
  
  // Crear pares de cartas
  let cardPairs = [];
  icons.forEach(icon => {
    // Crear dos cartas con el mismo ícono (un par)
    cardPairs.push(
      { id: Date.now() + Math.random().toString(36).substring(2, 15), iconClass: icon.class, iconColor: icon.color, paired: false },
      { id: Date.now() + Math.random().toString(36).substring(2, 15), iconClass: icon.class, iconColor: icon.color, paired: false }
    );
  });
  
  // Mezclar las cartas
  gameState.cards = shuffle(cardPairs);
  
  // Ajustar columnas de la rejilla según la dificultad
  elements.cardsContainer.className = `cards-grid`;
  if (gameState.settings.difficulty === 'medium') {
    elements.cardsContainer.className = `cards-grid medium`;
  } else if (gameState.settings.difficulty === 'hard') {
    elements.cardsContainer.className = `cards-grid hard`;
  }
  
  // Limpiar cartas anteriores
  elements.cardsContainer.innerHTML = '';
  
  // Crear y añadir elementos de cartas al DOM
  gameState.cards.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.dataset.cardId = card.id;
    
    cardElement.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <span class="mdi mdi-cards"></span>
        </div>
        <div class="card-back">
          <span class="mdi ${card.iconClass}" style="color: var(--${card.iconColor})"></span>
        </div>
      </div>
    `;
    
    // Añadir evento de clic
    cardElement.addEventListener('click', () => handleCardClick(card, cardElement));
    
    // Añadir al contenedor
    elements.cardsContainer.appendChild(cardElement);
  });
}

function handleCardClick(card, cardElement) {
  // Ignorar clics si el juego no está en estado 'jugando' o la carta ya está volteada/emparejada
  if (
    gameState.status !== 'playing' || 
    gameState.flippedCards.length >= 2 || 
    card.paired || 
    gameState.flippedCards.some(c => c.id === card.id)
  ) {
    return;
  }
  
  // Voltear carta
  cardElement.classList.add('flipped');
  
  // Añadir a cartas volteadas
  gameState.flippedCards.push({
    id: card.id,
    element: cardElement,
    card
  });
  
  // Comprobar si tenemos un par
  if (gameState.flippedCards.length === 2) {
    // Incrementar movimientos
    gameState.moves++;
    elements.movesDisplay.textContent = gameState.moves;
    
    const [firstCard, secondCard] = gameState.flippedCards;
    
    // Comprobar si las cartas coinciden
    if (firstCard.card.iconClass === secondCard.card.iconClass) {
      // Las cartas coinciden
      gameState.matchedPairs++;
      elements.matchedPairsDisplay.textContent = gameState.matchedPairs;
      
      // Marcar cartas como emparejadas
      firstCard.card.paired = true;
      secondCard.card.paired = true;
      
      // Añadir animación de éxito
      firstCard.element.classList.add('pulse-success');
      secondCard.element.classList.add('pulse-success');
      
      // Actualizar borde de la carta
      firstCard.element.querySelector('.card-back').classList.add('border-success');
      secondCard.element.querySelector('.card-back').classList.add('border-success');
      
      // Limpiar array de cartas volteadas
      gameState.flippedCards = [];
      
      // Comprobar si el juego está completo
      if (gameState.matchedPairs === gameState.totalPairs) {
        // Juego completado
        endGame();
      }
    } else {
      // Las cartas no coinciden, voltearlas de nuevo después de un retraso
      setTimeout(() => {
        firstCard.element.classList.remove('flipped');
        secondCard.element.classList.remove('flipped');
        gameState.flippedCards = [];
      }, 1000);
    }
  }
}

// Funcionalidad de puntuaciones altas
function loadHighScores() {
  try {
    const savedScores = localStorage.getItem('memorama-high-scores');
    if (savedScores) {
      highScores = JSON.parse(savedScores);
    }
  } catch (error) {
    console.error('Error cargando puntuaciones altas:', error);
    highScores = [];
  }
  
  renderHighScores();
}

function saveHighScores() {
  try {
    localStorage.setItem('memorama-high-scores', JSON.stringify(highScores));
  } catch (error) {
    console.error('Error guardando puntuaciones altas:', error);
  }
}

function addHighScore(playerName, score, difficulty) {
  const newScore = {
    id: Date.now(),
    playerName: playerName.trim(),
    score,
    difficulty,
    date: new Date().toISOString()
  };
  
  // Añadir nueva puntuación y ordenar
  highScores.push(newScore);
  highScores.sort((a, b) => b.score - a.score);
  
  // Mantener solo las 20 puntuaciones más altas
  if (highScores.length > 20) {
    highScores = highScores.slice(0, 20);
  }
  
  // Guardar en localStorage
  saveHighScores();
  
  // Actualizar UI
  renderHighScores();
}

function deleteHighScore(scoreId) {
  highScores = highScores.filter(score => score.id !== scoreId);
  saveHighScores();
  renderHighScores();
}

function clearAllHighScores() {
  if (confirm('¿Estás seguro de que quieres eliminar todas las puntuaciones altas? Esto no se puede deshacer.')) {
    highScores = [];
    saveHighScores();
    renderHighScores();
  }
}

function renderHighScores(filterText = '') {
  // Filtrar puntuaciones si es necesario
  const filteredScores = filterText
    ? highScores.filter(score => 
        score.playerName.toLowerCase().includes(filterText.toLowerCase())
      )
    : highScores;
  
  // Limpiar lista actual
  elements.highScoresTable.innerHTML = '';
  
  // Mostrar estado vacío si no hay puntuaciones
  if (filteredScores.length === 0) {
    elements.highScoresEmpty.classList.remove('hidden');
    elements.highScoresTable.appendChild(elements.highScoresEmpty);
    return;
  }
  
  // Ocultar estado vacío
  elements.highScoresEmpty.classList.add('hidden');
  
  // Añadir puntuaciones a la tabla
  filteredScores.forEach(score => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${score.playerName}</td>
      <td>${score.difficulty.charAt(0).toUpperCase() + score.difficulty.slice(1)}</td>
      <td class="text-right">${score.score}</td>
      <td>
        <button class="btn-text danger delete-score" data-score-id="${score.id}" title="Eliminar puntuación">
          <span class="mdi mdi-delete"></span>
        </button>
      </td>
    `;
    
    // Añadir evento al botón de eliminar
    const deleteButton = row.querySelector('.delete-score');
    deleteButton.addEventListener('click', () => deleteHighScore(parseInt(score.id)));
    
    elements.highScoresTable.appendChild(row);
  });
}

function filterHighScores() {
  const filterText = elements.highScoreFilter.value;
  renderHighScores(filterText);
}

// Funcionalidad de sets de cartas
async function loadCardSets() {
  try {
    const response = await fetch('cardSets.json');
    if (!response.ok) {
      throw new Error(`¡Error HTTP! estado: ${response.status}`);
    }
    cardSets = await response.json();
    
    // Establecer set de cartas por defecto si aún no está establecido
    if (!gameState.settings.cardSet) {
      gameState.settings.cardSet = cardSets[0]?.id || 'icons';
    }
    
    renderCardSets();
  } catch (error) {
    console.error('Error cargando sets de cartas:', error);
    // Recurrir a sets de cartas por defecto si la carga falla
    setDefaultCardSets();
    renderCardSets();
  }
}

function setDefaultCardSets() {
  // Sets de cartas de respaldo con Material Design Icons
  cardSets = [
    {
      id: "icons",
      name: "Iconos",
      description: "Set clásico de iconos",
      icons: [
        { class: "mdi-star", color: "secondary" },
        { class: "mdi-heart", color: "accent" },
        { class: "mdi-airplane", color: "primary" },
        { class: "mdi-baseball", color: "secondary" },
        { class: "mdi-cake", color: "accent" },
        { class: "mdi-music", color: "primary" },
        { class: "mdi-football", color: "secondary" },
        { class: "mdi-robot", color: "primary" },
        // ... más iconos
      ]
    },
    {
      id: "animals",
      name: "Animales",
      description: "Iconos de animales simpáticos",
      icons: [
        { class: "mdi-cat", color: "primary" },
        { class: "mdi-dog", color: "secondary" },
        { class: "mdi-rabbit", color: "accent" },
        { class: "mdi-cow", color: "primary" },
        { class: "mdi-duck", color: "secondary" },
        { class: "mdi-pig", color: "accent" },
        { class: "mdi-sheep", color: "primary" },
        { class: "mdi-fish", color: "secondary" },
        // ... más iconos
      ]
    }
  ];
}

function renderCardSets() {
  // Renderizar sets de cartas en la barra lateral
  elements.cardSetsContainer.innerHTML = '';
  cardSets.forEach(set => {
    const isActive = set.id === gameState.settings.cardSet;
    const setElement = document.createElement('div');
    setElement.className = `card-set-item ${isActive ? 'active' : ''}`;
    setElement.dataset.cardSetId = set.id;
    
    setElement.innerHTML = `
      <div class="card-set-name">${set.name}</div>
      <div class="card-set-description">${set.description}</div>
    `;
    
    setElement.addEventListener('click', () => selectCardSet(set.id));
    elements.cardSetsContainer.appendChild(setElement);
  });
  
  // Renderizar sets de cartas en el modal de configuración
  elements.settingsCardSetsContainer.innerHTML = '';
  cardSets.forEach(set => {
    const isActive = set.id === gameState.settings.cardSet;
    const setElement = document.createElement('div');
    setElement.className = `card-set-item ${isActive ? 'active' : ''}`;
    setElement.dataset.cardSetId = set.id;
    
    setElement.innerHTML = `
      <div class="card-set-name">${set.name}</div>
      <div class="card-set-description">${set.description}</div>
    `;
    
    setElement.addEventListener('click', (e) => {
      // Deseleccionar todos los demás
      elements.settingsCardSetsContainer.querySelectorAll('.card-set-item').forEach(el => {
        el.classList.remove('active');
      });
      // Seleccionar este
      e.currentTarget.classList.add('active');
    });
    
    elements.settingsCardSetsContainer.appendChild(setElement);
  });
}

// Cargar ajustes
function loadSettings() {
  try {
    const savedSettings = localStorage.getItem('memorama-settings');
    if (savedSettings) {
      gameState.settings = JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Error cargando ajustes:', error);
  }
  
  updateDifficultyButtons();
}

function saveSettings() {
  try {
    localStorage.setItem('memorama-settings', JSON.stringify(gameState.settings));
  } catch (error) {
    console.error('Error guardando ajustes:', error);
  }
}

function updateDifficultyButtons() {
  // Actualizar botones de dificultad en la barra lateral
  elements.difficultyButtons.querySelectorAll('button').forEach(button => {
    if (button.dataset.difficulty === gameState.settings.difficulty) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
  
  // Actualizar botones de dificultad en el modal de configuración
  elements.settingsDifficultyButtons.querySelectorAll('button').forEach(button => {
    if (button.dataset.difficulty === gameState.settings.difficulty) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

function setDifficulty(difficulty) {
  gameState.settings.difficulty = difficulty;
  saveSettings();
  updateDifficultyButtons();
  
  // Si el juego está en estado 'idle', actualizar el display de pares totales
  if (gameState.status === 'idle') {
    const diffSetting = gameState.difficultySettings[difficulty];
    gameState.totalPairs = diffSetting.pairs;
    elements.totalPairsDisplay.textContent = gameState.totalPairs;
  }
}

function selectCardSet(cardSetId) {
  gameState.settings.cardSet = cardSetId;
  saveSettings();
  renderCardSets();
}

// Modales
function showModal(modalElement) {
  // Ocultar otros modales
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('active');
  });
  
  // Mostrar este modal
  modalElement.classList.remove('hidden');
  setTimeout(() => {
    modalElement.classList.add('active');
  }, 10);
}

function closeModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  });
}

// Configurar oyentes de eventos
function setupEventListeners() {
  // Botones de inicio y reinicio
  elements.startButton.addEventListener('click', startGame);
  elements.startOverlayButton.addEventListener('click', startGame);
  elements.resetButton.addEventListener('click', resetGame);
  
  // Botones de puntuaciones altas
  elements.clearScoresButton.addEventListener('click', clearAllHighScores);
  elements.highScoreFilter.addEventListener('input', filterHighScores);
  
  // Formulario de puntuación alta
  elements.highScoreForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const playerName = elements.playerNameInput.value.trim();
    if (playerName) {
      addHighScore(playerName, gameState.score, gameState.settings.difficulty);
      closeModals();
      elements.playerNameInput.value = '';
    }
  });
  
  // Botón de jugar de nuevo
  elements.playAgainButton.addEventListener('click', () => {
    closeModals();
    resetGame();
    startGame();
  });
  
  // Botones de configuración
  elements.settingsButton.addEventListener('click', () => showModal(elements.settingsModal));
  elements.settingsFooterButton.addEventListener('click', () => showModal(elements.settingsModal));
  
  // Botón de instrucciones
  elements.instructionsButton.addEventListener('click', () => showModal(elements.instructionsModal));
  
  // Botones de cierre de modal
  elements.modalCloseButtons.forEach(button => {
    button.addEventListener('click', closeModals);
  });
  
  // Botones de dificultad en la barra lateral
  elements.difficultyButtons.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      setDifficulty(button.dataset.difficulty);
    });
  });
  
  // Botones de dificultad en el modal de configuración
  elements.settingsDifficultyButtons.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', (e) => {
      // Deseleccionar todos los demás
      elements.settingsDifficultyButtons.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('active');
      });
      // Seleccionar este
      e.currentTarget.classList.add('active');
    });
  });
  
  // Guardar configuración
  elements.saveSettingsButton.addEventListener('click', () => {
    // Obtener dificultad seleccionada
    const selectedDiffBtn = elements.settingsDifficultyButtons.querySelector('button.active');
    if (selectedDiffBtn) {
      gameState.settings.difficulty = selectedDiffBtn.dataset.difficulty;
    }
    
    // Obtener set de cartas seleccionado
    const selectedCardSetItem = elements.settingsCardSetsContainer.querySelector('.card-set-item.active');
    if (selectedCardSetItem) {
      gameState.settings.cardSet = selectedCardSetItem.dataset.cardSetId;
    }
    
    // Guardar configuración
    saveSettings();
    
    // Actualizar UI
    updateDifficultyButtons();
    renderCardSets();
    
    // Si el juego está en estado 'idle', actualizar el display de pares totales
    if (gameState.status === 'idle') {
      const diffSetting = gameState.difficultySettings[gameState.settings.difficulty];
      gameState.totalPairs = diffSetting.pairs;
      elements.totalPairsDisplay.textContent = gameState.totalPairs;
    }
    
    // Cerrar modal
    closeModals();
  });
  
  // Manejar clics fuera de modales para cerrarlos
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModals();
      }
    });
  });
}

// Función de inicialización
async function init() {
  // Cargar puntuaciones altas desde localStorage
  loadHighScores();
  
  // Cargar ajustes desde localStorage
  loadSettings();
  
  // Cargar sets de cartas
  await loadCardSets();
  
  // Configurar oyentes de eventos
  setupEventListeners();
  
  // Actualizar UI para reflejar la configuración actual
  updateDifficultyButtons();
  
  const diffSetting = gameState.difficultySettings[gameState.settings.difficulty];
  gameState.totalPairs = diffSetting.pairs;
  elements.totalPairsDisplay.textContent = gameState.totalPairs;
}

// Iniciar el juego cuando se cargue la página
document.addEventListener('DOMContentLoaded', init);