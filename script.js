document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const gameBoard = document.getElementById('game-board');
    const startButton = document.getElementById('start-game');
    const difficultySelect = document.getElementById('difficulty');
    const cardSetSelect = document.getElementById('card-set');
    const attemptsDisplay = document.getElementById('attempts');
    const matchesDisplay = document.getElementById('matches');
    const timeDisplay = document.getElementById('time');
    const highScoresList = document.getElementById('high-scores-list');
    const searchPlayerInput = document.getElementById('search-player');
    const clearScoresButton = document.getElementById('clear-scores');
    const gameOverModal = document.getElementById('game-over-modal');
    const finalScoreDisplay = document.getElementById('final-score');
    const saveScoreForm = document.getElementById('save-score-form');
    const playerNameInput = document.getElementById('player-name');
    const closeModalButton = document.getElementById('close-modal');
    const uploadForm = document.getElementById('upload-form');
    const cardNameInput = document.getElementById('card-name');
    const cardImageUrlInput = document.getElementById('card-image-url');
    const customCardsPreview = document.getElementById('custom-cards-preview');
    const createCustomSetBtn = document.getElementById('create-custom-set');

    // Estado del juego
    let gameState = {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        attempts: 0,
        gameStarted: false,
        timer: null,
        seconds: 0,
        currentCardSet: null,
        totalPairs: 0
    };

    // Cartas y sets personalizados
    let customCards = [];
    let customCardsSet = JSON.parse(localStorage.getItem('customCardsSet')) || [];
    let cardSets = [];

    // Inicializar el juego
    initGame();

    // Funciones
    function initGame() {
        loadCardSets()
            .then(sets => {
                cardSets = sets;
                populateCardSetSelect();
                loadHighScores();
                setupEventListeners();
                addDeleteButtonToCustomSets();
            })
            .catch(error => {
                console.error('Error loading card sets:', error);
                // Usar un set de cartas por defecto si falla la carga
                cardSets = [{
                    id: 'default',
                    name: 'Default',
                    cards: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(letter => ({
                        id: letter.toLowerCase(),
                        image: letter
                    }))
                }];
                populateCardSetSelect();
                loadHighScores();
                setupEventListeners();
                addDeleteButtonToCustomSets();
            });
    }

    async function loadCardSets() {
        try {
            const response = await fetch('card-sets.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const sets = await response.json();
            // Combinar con sets personalizados guardados
            const allSets = [...sets, ...customCardsSet];
            return allSets;
        } catch (error) {
            console.error('Error loading card sets:', error);
            // Usar un set de cartas por defecto si falla la carga
            return [{
                id: 'default',
                name: 'Default',
                cards: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(letter => ({
                    id: letter.toLowerCase(),
                    image: letter
                }))
            }];
        }
    }

    function populateCardSetSelect() {
        cardSetSelect.innerHTML = '';
        cardSets.forEach(set => {
            const option = document.createElement('option');
            option.value = set.id;
            option.textContent = set.name;
            cardSetSelect.appendChild(option);
        });
    }

    function setupEventListeners() {
        startButton.addEventListener('click', startGame);
        clearScoresButton.addEventListener('click', clearAllHighScores);
        searchPlayerInput.addEventListener('input', filterHighScores);
        saveScoreForm.addEventListener('submit', saveHighScore);
        closeModalButton.addEventListener('click', closeModal);
        uploadForm.addEventListener('submit', handleUpload);
        createCustomSetBtn.addEventListener('click', createCustomSet);
    }

    function handleUpload(e) {
        e.preventDefault();
        
        const name = cardNameInput.value.trim();
        const imageUrl = cardImageUrlInput.value.trim();
        
        if (!name || !imageUrl) {
            alert('Por favor completa todos los campos');
            return;
        }
        
        // Validar URL de imagen
        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
        const urlLower = imageUrl.toLowerCase();
        if (!allowedExtensions.some(ext => urlLower.endsWith(ext))) {
            alert('URL de imagen no soportada. Por favor ingresa una URL que termine en PNG, JPG, JPEG, GIF o WEBP.');
            return;
        }
        
        const card = {
            id: `custom-${Date.now()}`,
            name: name,
            image: imageUrl
        };
        
        customCards.push(card);
        renderCustomCardsPreview();
        
        // Resetear el formulario
        uploadForm.reset();
    }

    function renderCustomCardsPreview() {
        customCardsPreview.innerHTML = '';
        
        customCards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'custom-card-preview';
            
            const img = document.createElement('img');
            img.src = card.image;
            img.alt = card.name;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-custom-card';
            deleteBtn.textContent = 'X';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteCustomCard(index);
            });
            
            cardElement.appendChild(img);
            cardElement.appendChild(deleteBtn);
            customCardsPreview.appendChild(cardElement);
        });
    }

    function deleteCustomCard(index) {
        customCards.splice(index, 1);
        renderCustomCardsPreview();
    }

    function createCustomSet() {
        if (customCards.length < 4) {
            alert('Necesitas al menos 4 cartas para crear un set');
            return;
        }
        
        const customSet = {
            id: 'custom-' + Date.now(),
            name: 'Personalizado ' + (customCardsSet.length + 1),
            cards: customCards.map(card => ({
                id: card.id,
                name: card.name,
                image: card.image
            }))
        };
        
        // Guardar el set en localStorage
        customCardsSet = [...customCardsSet, customSet];
        localStorage.setItem('customCardsSet', JSON.stringify(customCardsSet));
        
        // Actualizar la lista de sets disponibles
        loadCardSets().then(sets => {
            cardSets = sets;
            populateCardSetSelect();
            addDeleteButtonToCustomSets();
        });
        
        // Resetear las cartas temporales
        customCards = [];
        customCardsPreview.innerHTML = '';
        
        alert(`Set personalizado "${customSet.name}" creado con éxito!`);
    }

    function addDeleteButtonToCustomSets() {
        const options = cardSetSelect.options;
        
        for (let i = 0; i < options.length; i++) {
            if (options[i].value.startsWith('custom-')) {
                options[i].dataset.deletable = true;
            }
        }
        
        cardSetSelect.addEventListener('dblclick', function(e) {
            const selectedOption = this.options[this.selectedIndex];
            
            if (selectedOption.dataset.deletable && confirm('¿Eliminar este set personalizado?')) {
                const setId = selectedOption.value;
                
                // Eliminar de localStorage
                customCardsSet = customCardsSet.filter(set => set.id !== setId);
                localStorage.setItem('customCardsSet', JSON.stringify(customCardsSet));
                
                // Actualizar dropdown
                loadCardSets().then(sets => {
                    cardSets = sets;
                    populateCardSetSelect();
                    addDeleteButtonToCustomSets();
                });
            }
        });
    }

    function startGame() {
        // Detener el juego actual si hay uno en curso
        if (gameState.timer) {
            clearInterval(gameState.timer);
        }

        // Reiniciar el estado del juego
        gameState = {
            cards: [],
            flippedCards: [],
            matchedPairs: 0,
            attempts: 0,
            gameStarted: false,
            timer: null,
            seconds: 0,
            currentCardSet: cardSets.find(set => set.id === cardSetSelect.value),
            totalPairs: 0
        };

        // Actualizar la interfaz
        attemptsDisplay.textContent = '0';
        matchesDisplay.textContent = '0';
        timeDisplay.textContent = '00:00';

        // Determinar el número de pares según la dificultad
        const difficulty = difficultySelect.value;
        let pairs;
        switch (difficulty) {
            case 'easy':
                pairs = 4;
                break;
            case 'medium':
                pairs = 6;
                break;
            case 'hard':
                pairs = 9;
                break;
            default:
                pairs = 6;
        }

        // Asegurarnos de no pedir más pares de los disponibles
        const availableCards = gameState.currentCardSet.cards;
        pairs = Math.min(pairs, availableCards.length);
        gameState.totalPairs = pairs;

        // Crear el mazo de cartas
        const selectedCards = availableCards.slice(0, pairs);
        gameState.cards = [...selectedCards, ...selectedCards];
        gameState.cards = shuffleArray(gameState.cards);

        // Renderizar el tablero
        renderGameBoard();
    }

    function renderGameBoard() {
        gameBoard.innerHTML = '';
        
        // Configurar el grid según el número de cartas
        const totalCards = gameState.cards.length;
        let cols;
        
        if (totalCards <= 8) {
            cols = 4;
        } else if (totalCards <= 16) {
            cols = 4;
        } else {
            cols = 6;
        }
        
        gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        gameState.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.index = index;
            cardElement.dataset.id = card.id;

            const backElement = document.createElement('div');
            backElement.className = 'back';
            backElement.textContent = '?';

            const frontElement = document.createElement('div');
            frontElement.className = 'front';

            // Renderizar la imagen de la carta
            if (card.image) {
                const cardImage = card.image.trim();
                
                // Verificar si es un emoji (caracteres cortos)
                if (cardImage.length <= 2 || isEmoji(cardImage)) {
                    frontElement.textContent = cardImage;
                }
                // Si es una URL o ruta de imagen
                else if (cardImage.match(/^https?:\/\//) || 
                         cardImage.match(/\.(png|jpg|jpeg|gif|webp)(\?.*)?$/i)) {
                    const img = document.createElement('img');
                    img.src = cardImage;
                    img.alt = card.name || card.id;
                    img.onerror = function() {
                        // Si la imagen falla, mostrar un texto alternativo
                        this.parentNode.textContent = card.name || '?';
                    };
                    frontElement.appendChild(img);
                }
                // Si es un posible código base64
                else if (cardImage.startsWith('data:image')) {
                    const img = document.createElement('img');
                    img.src = cardImage;
                    img.alt = card.name || card.id;
                    frontElement.appendChild(img);
                }
                // Si no es nada de lo anterior, mostrar el texto
                else {
                    frontElement.textContent = card.name || cardImage;
                }
            } else {
                frontElement.textContent = card.name || '?';
            }

            cardElement.appendChild(backElement);
            cardElement.appendChild(frontElement);

            cardElement.addEventListener('click', () => flipCard(index));
            gameBoard.appendChild(cardElement);
        });
    }
    
    // Función auxiliar para detectar emojis
    function isEmoji(str) {
        const regex = /[\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{303D}\u{00A9}\u{00AE}\u{2122}\u{23F3}\u{24C2}\u{23E9}-\u{23EF}\u{25AA}-\u{25AB}\u{25FB}-\u{25FE}\u{25B6}\u{25C0}\u{2934}-\u{2935}\u{2B05}-\u{2B07}]/u;
        return regex.test(str);
    }

    function flipCard(index) {
        // No hacer nada si la carta ya está volteada o emparejada
        const cardElement = gameBoard.children[index];
        if (cardElement.classList.contains('flipped') || 
            cardElement.classList.contains('matched') || 
            gameState.flippedCards.length >= 2) {
            return;
        }

        // Iniciar el juego y el temporizador si es la primera jugada
        if (!gameState.gameStarted) {
            gameState.gameStarted = true;
            startTimer();
        }

        // Voltear la carta
        cardElement.classList.add('flipped');
        gameState.flippedCards.push({ index, id: gameState.cards[index].id });

        // Comprobar si hay un par
        if (gameState.flippedCards.length === 2) {
            gameState.attempts++;
            attemptsDisplay.textContent = gameState.attempts;

            const [firstCard, secondCard] = gameState.flippedCards;
            
            if (firstCard.id === secondCard.id) {
                // Par encontrado
                gameState.matchedPairs++;
                matchesDisplay.textContent = gameState.matchedPairs;

                // Marcar como emparejadas
                gameBoard.children[firstCard.index].classList.add('matched');
                gameBoard.children[secondCard.index].classList.add('matched');

                // Limpiar las cartas volteadas
                gameState.flippedCards = [];

                // Comprobar si el juego ha terminado
                if (gameState.matchedPairs === gameState.totalPairs) {
                    endGame();
                }
            } else {
                // No es un par, voltear de nuevo después de un breve retraso
                setTimeout(() => {
                    gameBoard.children[firstCard.index].classList.remove('flipped');
                    gameBoard.children[secondCard.index].classList.remove('flipped');
                    gameState.flippedCards = [];
                }, 1000);
            }
        }
    }

    function startTimer() {
        gameState.seconds = 0;
        gameState.timer = setInterval(() => {
            gameState.seconds++;
            const minutes = Math.floor(gameState.seconds / 60);
            const seconds = gameState.seconds % 60;
            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    function endGame() {
        clearInterval(gameState.timer);
        
        // Mostrar el modal de fin de juego
        const minutes = Math.floor(gameState.seconds / 60);
        const seconds = gameState.seconds % 60;
        finalScoreDisplay.textContent = `¡Completaste el juego en ${gameState.attempts} intentos y ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} minutos!`;
        gameOverModal.style.display = 'flex';
    }

    function closeModal() {
        gameOverModal.style.display = 'none';
        playerNameInput.value = '';
    }

    function saveHighScore(e) {
        e.preventDefault();
        
        const playerName = playerNameInput.value.trim();
        if (!playerName) {
            alert('Por favor ingresa tu nombre');
            return;
        }

        const newScore = {
            name: playerName,
            attempts: gameState.attempts,
            time: gameState.seconds,
            date: new Date().toISOString(),
            difficulty: difficultySelect.value,
            cardSet: cardSetSelect.options[cardSetSelect.selectedIndex].text
        };

        saveScoreToLocalStorage(newScore)
            .then(() => {
                loadHighScores();
                closeModal();
            })
            .catch(error => {
                console.error('Error saving score:', error);
                alert('Hubo un error al guardar tu puntuación');
            });
    }

    function saveScoreToLocalStorage(score) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let highScores = JSON.parse(localStorage.getItem('memoramaHighScores')) || [];
                highScores.push(score);
                
                // Ordenar por intentos (menor es mejor) y luego por tiempo (menor es mejor)
                highScores.sort((a, b) => {
                    if (a.attempts !== b.attempts) {
                        return a.attempts - b.attempts;
                    }
                    return a.time - b.time;
                });
                
                // Mantener solo las 10 mejores puntuaciones
                highScores = highScores.slice(0, 10);
                
                localStorage.setItem('memoramaHighScores', JSON.stringify(highScores));
                resolve();
            }, 300);
        });
    }

    function loadHighScores() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const highScores = JSON.parse(localStorage.getItem('memoramaHighScores')) || [];
                displayHighScores(highScores);
                resolve();
            }, 300);
        });
    }

    function displayHighScores(scores) {
        highScoresList.innerHTML = '';
        
        if (scores.length === 0) {
            const item = document.createElement('li');
            item.textContent = 'No hay puntuaciones registradas';
            highScoresList.appendChild(item);
            return;
        }
        
        scores.forEach((score, index) => {
            const item = document.createElement('li');
            
            const minutes = Math.floor(score.time / 60);
            const seconds = score.time % 60;
            const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            const scoreInfo = document.createElement('span');
            scoreInfo.innerHTML = `<strong>${score.name}</strong> - ${score.attempts} intentos, ${timeStr} (${score.difficulty}, ${score.cardSet})`;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'X';
            deleteBtn.className = 'delete-score';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteHighScore(index);
            });
            
            item.appendChild(scoreInfo);
            item.appendChild(deleteBtn);
            highScoresList.appendChild(item);
        });
    }

    function deleteHighScore(index) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let highScores = JSON.parse(localStorage.getItem('memoramaHighScores')) || [];
                if (index >= 0 && index < highScores.length) {
                    highScores.splice(index, 1);
                    localStorage.setItem('memoramaHighScores', JSON.stringify(highScores));
                    loadHighScores();
                }
                resolve();
            }, 300);
        });
    }

    function clearAllHighScores() {
        if (confirm('¿Estás seguro de que quieres borrar todas las puntuaciones?')) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    localStorage.removeItem('memoramaHighScores');
                    loadHighScores();
                    resolve();
                }, 300);
            });
        }
    }

    function filterHighScores() {
        const searchTerm = searchPlayerInput.value.trim().toLowerCase();
        const highScores = JSON.parse(localStorage.getItem('memoramaHighScores')) || [];
        
        if (!searchTerm) {
            displayHighScores(highScores);
            return;
        }
        
        const filteredScores = highScores.filter(score => 
            score.name.toLowerCase().includes(searchTerm)
        );
        
        displayHighScores(filteredScores);
    }

    // Función auxiliar para mezclar un array
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
});