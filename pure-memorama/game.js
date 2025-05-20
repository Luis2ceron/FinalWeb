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

// Elementos del DOM
const elements = {
    // Elementos del tablero
    cardsContainer: document.getElementById('cards-container'),
    startOverlay: document.getElementById('start-overlay'),
    
    // Elementos de estadísticas
    movesDisplay: document.getElementById('moves'),
    pairsDisplay: document.getElementById('pairs'),
    totalPairsDisplay: document.getElementById('total-pairs'),
    timerDisplay: document.getElementById('timer'),
    
    // Botones de control
    startButton: document.getElementById('start-btn'),
    startOverlayButton: document.getElementById('start-overlay-btn'),
    resetButton: document.getElementById('reset-btn'),
    settingsButton: document.getElementById('settings-btn'),
    
    // Puntuaciones altas
    highScoresTable: document.getElementById('high-scores'),
    emptyScoresMessage: document.getElementById('empty-scores'),
    searchInput: document.getElementById('search-input'),
    clearScoresButton: document.getElementById('clear-scores-btn'),
    
    // Opciones del juego
    difficultyButtons: document.getElementById('difficulty-buttons'),
    cardSetsContainer: document.getElementById('card-sets'),
    
    // Modal de juego completado
    completeModal: document.getElementById('complete-modal'),
    resultMoves: document.getElementById('result-moves'),
    resultTime: document.getElementById('result-time'),
    resultScore: document.getElementById('result-score'),
    scoreForm: document.getElementById('score-form'),
    playerNameInput: document.getElementById('player-name'),
    playAgainButton: document.getElementById('play-again-btn'),
    
    // Modal de ajustes
    settingsModal: document.getElementById('settings-modal'),
    settingsDifficultyButtons: document.getElementById('settings-difficulty-buttons'),
    settingsCardSetsContainer: document.getElementById('settings-card-sets'),
    saveSettingsButton: document.getElementById('save-settings-btn'),
    
    // Modal de instrucciones
    instructionsModal: document.getElementById('instructions-modal'),
    instructionsButton: document.getElementById('instructions-btn'),
    
    // Botones adicionales
    footerSettingsButton: document.getElementById('footer-settings-btn'),
    
    // Botones de cierre de modal
    closeModalButtons: document.querySelectorAll('.close-modal')
};

// Funciones de utilidad
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function calculateScore(moves, timeElapsed, difficulty) {
    // Puntuación base según dificultad
    const difficultyMultiplier = {
        easy: 1,
        medium: 1.5,
        hard: 2
    };
    
    // Calcular puntuación - más puntos por menos movimientos y menos tiempo
    const baseScore = 1000 * difficultyMultiplier[difficulty];
    const movesPenalty = moves * 10;
    const timePenalty = timeElapsed * 2;
    
    // Puntuación final
    let score = baseScore - movesPenalty - timePenalty;
    
    // Asegurar que no sea negativa
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

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Funciones del juego
function startTimer() {
    gameState.timer = setInterval(() => {
        gameState.timeElapsed += 1;
        elements.timerDisplay.textContent = formatTime(gameState.timeElapsed);
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
    elements.timerDisplay.textContent = formatTime(0);
}

function startGame() {
    // Establecer estado a 'jugando'
    gameState.status = 'playing';
    gameState.moves = 0;
    gameState.matchedPairs = 0;
    gameState.flippedCards = [];
    
    // Actualizar UI
    elements.movesDisplay.textContent = '0';
    elements.pairsDisplay.textContent = '0';
    elements.startOverlay.classList.add('hidden');
    
    // Reiniciar y comenzar temporizador
    resetTimer();
    startTimer();
    
    // Generar y mezclar cartas
    generateCards();
}

function resetGame() {
    // Detener cualquier juego en curso
    stopTimer();
    
    // Reiniciar estado
    gameState.status = 'idle';
    gameState.moves = 0;
    gameState.matchedPairs = 0;
    gameState.timeElapsed = 0;
    gameState.flippedCards = [];
    
    // Actualizar UI
    elements.movesDisplay.textContent = '0';
    elements.pairsDisplay.textContent = '0';
    elements.timerDisplay.textContent = formatTime(0);
    elements.startOverlay.classList.remove('hidden');
    
    // Limpiar tablero
    elements.cardsContainer.innerHTML = '';
}

function endGame() {
    // Establecer estado a 'finalizado'
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
    
    // Mostrar modal
    showModal(elements.completeModal);
}

function generateCards() {
    // Obtener configuración para la dificultad actual
    const diffSetting = gameState.difficultySettings[gameState.settings.difficulty];
    gameState.totalPairs = diffSetting.pairs;
    
    // Actualizar display de pares totales
    elements.totalPairsDisplay.textContent = gameState.totalPairs;
    
    // Encontrar el set de cartas seleccionado
    const cardSet = CARD_SETS.find(set => set.id === gameState.settings.cardSet) || CARD_SETS[0];
    
    // Obtener íconos para la dificultad actual
    const icons = shuffle(cardSet.icons).slice(0, gameState.totalPairs);
    
    // Crear pares de cartas
    let cardPairs = [];
    icons.forEach(icon => {
        // Crear dos cartas con el mismo ícono (un par)
        cardPairs.push(
            { id: generateId(), iconClass: icon.class, iconColor: icon.color, paired: false },
            { id: generateId(), iconClass: icon.class, iconColor: icon.color, paired: false }
        );
    });
    
    // Mezclar las cartas
    gameState.cards = shuffle(cardPairs);
    
    // Ajustar columnas de la rejilla según la dificultad
    elements.cardsContainer.className = 'cards-grid';
    if (gameState.settings.difficulty !== 'easy') {
        elements.cardsContainer.className = `cards-grid ${gameState.settings.difficulty}`;
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
                    <span class="mdi ${card.iconClass}" style="color: ${card.iconColor}"></span>
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
            elements.pairsDisplay.textContent = gameState.matchedPairs;
            
            // Marcar cartas como emparejadas
            firstCard.card.paired = true;
            secondCard.card.paired = true;
            
            // Añadir animación de éxito
            firstCard.element.classList.add('pulse-success');
            secondCard.element.classList.add('pulse-success');
            
            // Actualizar estilo de las cartas emparejadas
            firstCard.element.querySelector('.card-back').classList.add('matched');
            secondCard.element.querySelector('.card-back').classList.add('matched');
            
            // Limpiar array de cartas volteadas
            gameState.flippedCards = [];
            
            // Comprobar si el juego está completo
            if (gameState.matchedPairs === gameState.totalPairs) {
                // Juego completado
                setTimeout(() => {
                    endGame();
                }, 500);
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
    
    // Limpiar tabla actual
    elements.highScoresTable.innerHTML = '';
    
    // Mostrar/ocultar mensaje de vacío
    if (filteredScores.length === 0) {
        elements.emptyScoresMessage.classList.remove('hidden');
    } else {
        elements.emptyScoresMessage.classList.add('hidden');
        
        // Añadir puntuaciones a la tabla
        filteredScores.forEach(score => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${score.playerName}</td>
                <td>${score.difficulty.charAt(0).toUpperCase() + score.difficulty.slice(1)}</td>
                <td class="align-right">${score.score}</td>
                <td>
                    <button class="text-btn danger delete-score" data-score-id="${score.id}" title="Eliminar puntuación">
                        <span class="mdi mdi-delete"></span>
                    </button>
                </td>
            `;
            
            // Añadir evento al botón de eliminar
            const deleteButton = row.querySelector('.delete-score');
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteHighScore(parseInt(score.id));
            });
            
            elements.highScoresTable.appendChild(row);
        });
    }
}

// Funcionalidad de opciones del juego
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
    renderCardSets();
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

function renderCardSets() {
    // Renderizar sets de cartas en la barra lateral
    elements.cardSetsContainer.innerHTML = '';
    CARD_SETS.forEach(set => {
        const isActive = set.id === gameState.settings.cardSet;
        const setElement = document.createElement('div');
        setElement.className = `card-set ${isActive ? 'active' : ''}`;
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
    CARD_SETS.forEach(set => {
        const isActive = set.id === gameState.settings.cardSet;
        const setElement = document.createElement('div');
        setElement.className = `card-set ${isActive ? 'active' : ''}`;
        setElement.dataset.cardSetId = set.id;
        
        setElement.innerHTML = `
            <div class="card-set-name">${set.name}</div>
            <div class="card-set-description">${set.description}</div>
        `;
        
        setElement.addEventListener('click', (e) => {
            // Deseleccionar todos los demás
            elements.settingsCardSetsContainer.querySelectorAll('.card-set').forEach(el => {
                el.classList.remove('active');
            });
            // Seleccionar este
            e.currentTarget.classList.add('active');
        });
        
        elements.settingsCardSetsContainer.appendChild(setElement);
    });
}

function selectCardSet(cardSetId) {
    gameState.settings.cardSet = cardSetId;
    saveSettings();
    renderCardSets();
}

// Funcionalidad de modales
function showModal(modalElement) {
    // Ocultar otros modales
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('visible');
    });
    
    // Mostrar este modal
    modalElement.classList.add('visible');
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('visible');
    });
}

// Configurar eventos
function setupEventListeners() {
    // Botones de inicio y reinicio
    elements.startButton.addEventListener('click', startGame);
    elements.startOverlayButton.addEventListener('click', startGame);
    elements.resetButton.addEventListener('click', resetGame);
    
    // Búsqueda y filtrado de puntuaciones
    elements.searchInput.addEventListener('input', () => {
        renderHighScores(elements.searchInput.value);
    });
    
    // Botón de borrar puntuaciones
    elements.clearScoresButton.addEventListener('click', clearAllHighScores);
    
    // Formulario de puntuación alta
    elements.scoreForm.addEventListener('submit', (e) => {
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
    elements.footerSettingsButton.addEventListener('click', () => showModal(elements.settingsModal));
    
    // Botón de instrucciones
    elements.instructionsButton.addEventListener('click', () => showModal(elements.instructionsModal));
    
    // Botones de cierre de modal
    elements.closeModalButtons.forEach(button => {
        button.addEventListener('click', closeModals);
    });
    
    // Cerrar modal al hacer clic en overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', closeModals);
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
        const selectedCardSetItem = elements.settingsCardSetsContainer.querySelector('.card-set.active');
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
}

// Inicialización
function init() {
    // Cargar puntuaciones altas desde localStorage
    loadHighScores();
    
    // Cargar ajustes desde localStorage
    loadSettings();
    
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