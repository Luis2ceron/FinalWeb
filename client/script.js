// Juego de Memoria (Memorama) - JavaScript Puro

// Datos del juego
const icons = [
    { class: 'mdi-star', color: 'var(--secondary)' },
    { class: 'mdi-heart', color: 'var(--accent)' },
    { class: 'mdi-bell', color: 'var(--primary)' },
    { class: 'mdi-music', color: 'var(--secondary)' },
    { class: 'mdi-cube', color: 'var(--accent)' },
    { class: 'mdi-car', color: 'var(--primary)' },
    { class: 'mdi-gift', color: 'var(--secondary)' },
    { class: 'mdi-cake', color: 'var(--accent)' },
    { class: 'mdi-airplane', color: 'var(--primary)' },
    { class: 'mdi-baseball', color: 'var(--secondary)' },
    { class: 'mdi-crown', color: 'var(--accent)' },
    { class: 'mdi-robot', color: 'var(--primary)' },
    { class: 'mdi-google', color: 'var(--secondary)' },
    { class: 'mdi-flash', color: 'var(--accent)' },
    { class: 'mdi-food-apple', color: 'var(--primary)' },
    { class: 'mdi-soccer', color: 'var(--secondary)' },
    { class: 'mdi-swim', color: 'var(--accent)' },
    { class: 'mdi-tennis', color: 'var(--primary)' }
];

// Estado del juego
const game = {
    // Configuración
    difficulty: 'easy',
    difficultySettings: {
        easy: { pairs: 8, grid: 4 },
        medium: { pairs: 12, grid: 6 },
        hard: { pairs: 18, grid: 6 }
    },
    // Estado
    status: 'idle', // idle, playing, finished
    moves: 0,
    pairs: 0,
    totalPairs: 8,
    cards: [],
    flippedCards: [],
    timer: null,
    time: 0,
    score: 0
};

// Puntuaciones altas
let highScores = [];

// Elementos del DOM
const elements = {
    // Tablero y estadísticas
    board: document.getElementById('game-board'),
    movesDisplay: document.getElementById('moves'),
    pairsDisplay: document.getElementById('pairs'),
    totalPairsDisplay: document.getElementById('total-pairs'),
    timerDisplay: document.getElementById('timer'),
    
    // Controles
    startBtn: document.getElementById('start-btn'),
    resetBtn: document.getElementById('reset-btn'),
    difficultyBtn: document.getElementById('difficulty-btn'),
    
    // Puntuaciones altas
    highScoresTable: document.getElementById('high-scores'),
    searchInput: document.getElementById('search-input'),
    clearScoresBtn: document.getElementById('clear-scores-btn'),
    
    // Modal de victoria
    winModal: document.getElementById('win-modal'),
    resultMovesDisplay: document.getElementById('result-moves'),
    resultTimeDisplay: document.getElementById('result-time'),
    resultScoreDisplay: document.getElementById('result-score'),
    scoreForm: document.getElementById('score-form'),
    playerNameInput: document.getElementById('player-name'),
    playAgainBtn: document.getElementById('play-again-btn'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    
    // Modal de dificultad
    difficultyModal: document.getElementById('difficulty-modal'),
    difficultyOptions: document.querySelectorAll('.difficulty-option'),
    closeDifficultyModalBtn: document.getElementById('close-difficulty-modal-btn')
};

// Funciones de utilidad
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
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

function calculateScore(moves, time, difficulty) {
    const difficultyMultiplier = {
        easy: 1,
        medium: 2,
        hard: 3
    };
    
    // Puntuación base según dificultad
    const baseScore = 1000 * difficultyMultiplier[difficulty];
    
    // Penalizaciones por movimientos y tiempo
    const movesPenalty = moves * 10;
    const timePenalty = time * 5;
    
    // Calcular puntuación final
    let score = baseScore - movesPenalty - timePenalty;
    
    // Asegurar que no sea negativa
    return Math.max(score, 0);
}

// Funciones del juego
function startTimer() {
    if (game.timer) clearInterval(game.timer);
    
    game.timer = setInterval(() => {
        game.time++;
        elements.timerDisplay.textContent = formatTime(game.time);
    }, 1000);
}

function stopTimer() {
    if (game.timer) {
        clearInterval(game.timer);
        game.timer = null;
    }
}

function resetTimer() {
    stopTimer();
    game.time = 0;
    elements.timerDisplay.textContent = formatTime(0);
}

function startGame() {
    // Reiniciar el juego
    resetGame();
    
    // Configurar el estado
    game.status = 'playing';
    
    // Generar cartas
    generateCards();
    
    // Iniciar temporizador
    startTimer();
}

function resetGame() {
    // Detener temporizador
    stopTimer();
    
    // Reiniciar estado
    game.status = 'idle';
    game.moves = 0;
    game.pairs = 0;
    game.flippedCards = [];
    game.time = 0;
    
    // Actualizar UI
    elements.movesDisplay.textContent = '0';
    elements.pairsDisplay.textContent = '0';
    elements.timerDisplay.textContent = '00:00';
    elements.board.innerHTML = '';
}

function endGame() {
    // Detener el juego
    game.status = 'finished';
    stopTimer();
    
    // Calcular puntuación
    game.score = calculateScore(game.moves, game.time, game.difficulty);
    
    // Actualizar modal
    elements.resultMovesDisplay.textContent = game.moves;
    elements.resultTimeDisplay.textContent = formatTime(game.time);
    elements.resultScoreDisplay.textContent = game.score;
    
    // Mostrar modal
    showWinModal();
}

function showWinModal() {
    elements.winModal.style.display = 'flex';
}

function closeWinModal() {
    elements.winModal.style.display = 'none';
}

function showDifficultyModal() {
    elements.difficultyModal.style.display = 'flex';
    
    // Marcar la dificultad actual como activa
    elements.difficultyOptions.forEach(option => {
        if (option.dataset.difficulty === game.difficulty) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

function closeDifficultyModal() {
    elements.difficultyModal.style.display = 'none';
}

function setDifficulty(difficulty) {
    game.difficulty = difficulty;
    game.totalPairs = game.difficultySettings[difficulty].pairs;
    elements.totalPairsDisplay.textContent = game.totalPairs;
    
    // Ajustar el tablero si el juego no ha comenzado
    if (game.status === 'idle') {
        elements.board.className = `game-board ${difficulty}`;
    }
    
    // Guardar la preferencia
    saveSettings();
    
    // Cerrar el modal
    closeDifficultyModal();
}

function generateCards() {
    // Configurar según dificultad
    const config = game.difficultySettings[game.difficulty];
    game.totalPairs = config.pairs;
    elements.totalPairsDisplay.textContent = game.totalPairs;
    
    // Ajustar el tablero según dificultad
    elements.board.className = `game-board ${game.difficulty}`;
    
    // Seleccionar íconos aleatorios según la cantidad de pares
    const gameIcons = shuffle(icons).slice(0, game.totalPairs);
    
    // Crear pares de cartas
    let cardPairs = [];
    gameIcons.forEach(icon => {
        // Crear dos cartas con el mismo ícono (un par)
        cardPairs.push(
            { id: generateId(), iconClass: icon.class, iconColor: icon.color, paired: false },
            { id: generateId(), iconClass: icon.class, iconColor: icon.color, paired: false }
        );
    });
    
    // Barajar las cartas
    game.cards = shuffle(cardPairs);
    
    // Crear elementos en el DOM
    elements.board.innerHTML = '';
    game.cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.id = card.id;
        
        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <i class="mdi mdi-help-circle-outline"></i>
                </div>
                <div class="card-back">
                    <i class="mdi ${card.iconClass}" style="color: ${card.iconColor}"></i>
                </div>
            </div>
        `;
        
        // Añadir evento de clic
        cardElement.addEventListener('click', () => handleCardClick(card, cardElement));
        
        // Añadir al tablero
        elements.board.appendChild(cardElement);
    });
}

function handleCardClick(card, cardElement) {
    // Ignorar clic si no estamos jugando o ya hay 2 cartas volteadas o esta carta ya está emparejada o volteada
    if (
        game.status !== 'playing' || 
        game.flippedCards.length >= 2 || 
        card.paired || 
        game.flippedCards.some(c => c.id === card.id)
    ) {
        return;
    }
    
    // Voltear la carta
    cardElement.classList.add('flipped');
    
    // Añadir a cartas volteadas
    game.flippedCards.push({
        id: card.id,
        element: cardElement,
        card
    });
    
    // Comprobar si tenemos un par
    if (game.flippedCards.length === 2) {
        // Incrementar movimientos
        game.moves++;
        elements.movesDisplay.textContent = game.moves;
        
        const [firstCard, secondCard] = game.flippedCards;
        
        // Comprobar si coinciden
        if (firstCard.card.iconClass === secondCard.card.iconClass) {
            // Las cartas coinciden
            game.pairs++;
            elements.pairsDisplay.textContent = game.pairs;
            
            // Marcar como emparejadas
            firstCard.card.paired = true;
            secondCard.card.paired = true;
            
            // Aplicar estilo de coincidencia
            firstCard.element.querySelector('.card-back').classList.add('matched');
            secondCard.element.querySelector('.card-back').classList.add('matched');
            
            // Añadir animación
            firstCard.element.classList.add('pulse-success');
            secondCard.element.classList.add('pulse-success');
            
            // Limpiar array de cartas volteadas
            game.flippedCards = [];
            
            // Comprobar si se completó el juego
            if (game.pairs === game.totalPairs) {
                setTimeout(() => {
                    endGame();
                }, 500);
            }
        } else {
            // Las cartas no coinciden, voltear después de un retraso
            setTimeout(() => {
                firstCard.element.classList.remove('flipped');
                secondCard.element.classList.remove('flipped');
                game.flippedCards = [];
            }, 1000);
        }
    }
}

// Funciones de puntuación alta
function loadHighScores() {
    try {
        const savedScores = localStorage.getItem('memorama-high-scores');
        if (savedScores) {
            highScores = JSON.parse(savedScores);
        }
    } catch (error) {
        console.error('Error cargando puntuaciones:', error);
        highScores = [];
    }
    
    renderHighScores();
}

function saveHighScores() {
    try {
        localStorage.setItem('memorama-high-scores', JSON.stringify(highScores));
    } catch (error) {
        console.error('Error guardando puntuaciones:', error);
    }
}

function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('memorama-settings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            game.difficulty = settings.difficulty || 'easy';
        }
    } catch (error) {
        console.error('Error cargando ajustes:', error);
    }
    
    // Actualizar el juego con los ajustes cargados
    game.totalPairs = game.difficultySettings[game.difficulty].pairs;
    elements.totalPairsDisplay.textContent = game.totalPairs;
    elements.board.className = `game-board ${game.difficulty}`;
}

function saveSettings() {
    try {
        localStorage.setItem('memorama-settings', JSON.stringify({
            difficulty: game.difficulty
        }));
    } catch (error) {
        console.error('Error guardando ajustes:', error);
    }
}

function addHighScore(playerName, score) {
    const newScore = {
        id: Date.now(),
        playerName: playerName.trim(),
        score,
        difficulty: game.difficulty,
        date: new Date().toISOString()
    };
    
    // Añadir puntuación y ordenar
    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    
    // Mantener solo las mejores 20 puntuaciones
    if (highScores.length > 20) {
        highScores = highScores.slice(0, 20);
    }
    
    // Guardar y actualizar UI
    saveHighScores();
    renderHighScores();
}

function renderHighScores(filterText = '') {
    // Filtrar puntuaciones
    const filteredScores = filterText
        ? highScores.filter(score => 
            score.playerName.toLowerCase().includes(filterText.toLowerCase())
          )
        : highScores;
    
    // Limpiar tabla
    elements.highScoresTable.innerHTML = '';
    
    // Mensaje si no hay puntuaciones
    if (filteredScores.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="4" style="text-align: center; padding: 20px;">No hay puntuaciones aún. ¡Juega para registrar la tuya!</td>`;
        elements.highScoresTable.appendChild(emptyRow);
        return;
    }
    
    // Renderizar puntuaciones
    filteredScores.forEach(score => {
        const row = document.createElement('tr');
        
        // Formatear dificultad con primera letra mayúscula
        const difficultyFormatted = score.difficulty.charAt(0).toUpperCase() + score.difficulty.slice(1);
        
        row.innerHTML = `
            <td>${score.playerName}</td>
            <td>${difficultyFormatted}</td>
            <td>${score.score}</td>
            <td>
                <button class="delete-score" data-id="${score.id}">
                    <i class="mdi mdi-delete"></i>
                </button>
            </td>
        `;
        
        // Añadir evento al botón de eliminar
        const deleteBtn = row.querySelector('.delete-score');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteHighScore(score.id);
        });
        
        elements.highScoresTable.appendChild(row);
    });
}

function deleteHighScore(id) {
    highScores = highScores.filter(score => score.id !== id);
    saveHighScores();
    renderHighScores(elements.searchInput.value);
}

function clearAllHighScores() {
    if (confirm('¿Estás seguro de que quieres eliminar todas las puntuaciones? Esta acción no se puede deshacer.')) {
        highScores = [];
        saveHighScores();
        renderHighScores();
    }
}

// Configuración de eventos
function setupEventListeners() {
    // Botones de juego
    elements.startBtn.addEventListener('click', startGame);
    elements.resetBtn.addEventListener('click', resetGame);
    elements.difficultyBtn.addEventListener('click', showDifficultyModal);
    
    // Modal de victoria
    elements.closeModalBtn.addEventListener('click', closeWinModal);
    elements.playAgainBtn.addEventListener('click', () => {
        closeWinModal();
        startGame();
    });
    
    // Modal de dificultad
    elements.closeDifficultyModalBtn.addEventListener('click', closeDifficultyModal);
    
    // Opciones de dificultad
    elements.difficultyOptions.forEach(option => {
        option.addEventListener('click', () => {
            setDifficulty(option.dataset.difficulty);
        });
    });
    
    // Formulario de puntuación
    elements.scoreForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const playerName = elements.playerNameInput.value.trim();
        if (playerName) {
            addHighScore(playerName, game.score);
            closeWinModal();
            elements.playerNameInput.value = '';
        }
    });
    
    // Búsqueda de puntuaciones
    elements.searchInput.addEventListener('input', () => {
        renderHighScores(elements.searchInput.value);
    });
    
    // Borrar puntuaciones
    elements.clearScoresBtn.addEventListener('click', clearAllHighScores);
}

// Inicialización
function init() {
    // Cargar ajustes
    loadSettings();
    
    // Cargar puntuaciones
    loadHighScores();
    
    // Configurar eventos
    setupEventListeners();
}

// Iniciar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', init);