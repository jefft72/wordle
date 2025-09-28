/**
 * WORDLE CLONE - STUDENT IMPLEMENTATION
 * 
 * Complete the functions below to create a working Wordle game.
 * Each function has specific requirements and point values.
 * 
 * GRADING BREAKDOWN:
 * - Core Game Functions (60 points): initializeGame, handleKeyPress, submitGuess, checkLetter, updateGameState
 * - Advanced Features (30 points): updateKeyboardColors, processRowReveal, showEndGameModal, validateInput
 */

// ========================================
// CORE GAME FUNCTIONS (60 POINTS TOTAL)
// ========================================

/**
 * Initialize a new game
 * POINTS: 10
 * 
 * TODO: Complete this function to:
 * - Reset all game state variables
 * - Get a random word from the word list
 * - Clear the game board
 * - Hide any messages or modals
 */

function initializeGame() {
    currentWord = WordleWords.getRandomWord().toUpperCase();
    currentGuess = '';
    currentRow = 0;
    gameOver = false;
    gameWon = false;

    resetBoard();
    hideModal();

}

/**
 * Handle keyboard input
 * POINTS: 15
 * 
 * TODO: Complete this function to:
 * - Process letter keys (A-Z)
 * - Handle ENTER key for word submission
 * - Handle BACKSPACE for letter deletion
 * - Update the display when letters are added/removed
 */
function handleKeyPress(key) {
    if (gameOver) return;

    key = String(key || '').toUpperCase();

    if (/^[A-Z]$/.test(key)) {
        if (!validateInput(key, currentGuess)) return;
        if (currentGuess.length >= WORD_LENGTH) return;
        const tile = getTile(currentRow, currentGuess.length);
        currentGuess += key;
        updateTileDisplay(tile, key);
        return;
    }

    if (key === 'ENTER') {
        if (isGuessComplete()) {
            submitGuess();
        }
        return;
    }

    if (key === 'BACKSPACE') {
        if (!validateInput(key, currentGuess)) return;
        const lastIndex = currentGuess.length - 1;
        if (lastIndex < 0) return;
        const tile = getTile(currentRow, lastIndex);
        currentGuess = currentGuess.slice(0, -1);
        updateTileDisplay(tile, '');
        return;
    }
}

/**
 * Submit and process a complete guess
 * POINTS: 20
 * 
 * TODO: Complete this function to:
 * - Validate the guess is a real word
 * - Check each letter against the target word
 * - Update tile colors and keyboard
 * - Handle win/lose conditions
 */
function submitGuess() {
    if (!isGuessComplete() || gameOver) return;

    const guess = currentGuess.toUpperCase();
    const target = currentWord.toUpperCase();

    if (!WordleWords.isValidWord(guess)) {
        shakeRow(currentRow);
        showMessage("Not in word list!", 'error');
        return;
    }

    const results = [];
    for (let i = 0; i < WORD_LENGTH; i++) {
        results.push(checkLetter(guess[i], i, target, guess));
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = getTile(currentRow, i);
        setTileState(tile, results[i]);
    }

    flipRowTiles(currentRow, results, () => {
        updateKeyboardColors(currentGuess, results);
        processRowReveal(currentRow, results);

        const isCorrect = guess === target;
        updateGameState(isCorrect);

        if (!gameOver) {
            currentRow++;
            currentGuess = '';
        }
    });
}

/**
 * Check a single letter against the target word
 * POINTS: 10
 * 
 * TODO: Complete this function to:
 * - Return 'correct' if letter matches position exactly
 * - Return 'present' if letter exists but wrong position
 * - Return 'absent' if letter doesn't exist in target
 * - Handle duplicate letters correctly (this is the tricky part!)
 */
function checkLetter(guessLetter, position, targetWord, guessWord) {
    guessLetter = guessLetter.toUpperCase();
    targetWord = targetWord.toUpperCase();
    guessWord = guessWord.toUpperCase();

    if (targetWord[position] === guessLetter) {
        return 'correct';
    }

    if (!targetWord.includes(guessLetter)) {
        return 'absent';
    }

    const letter = guessLetter;
    
    let yellowNeeded = 0;
    for (let i = 0; i < targetWord.length; i++) {
        if (targetWord[i] === letter) {
            let alreadyCorrect = false;
            for (let j = 0; j < guessWord.length; j++) {
                if (guessWord[j] === letter && targetWord[j] === letter && j === i) {
                    alreadyCorrect = true;
                    break;
                }
            }
            if (!alreadyCorrect) {
                yellowNeeded++;
            }
        }
    }

    let yellowUsed = 0;
    for (let i = 0; i < position; i++) {
        if (guessWord[i] === letter && 
            targetWord[i] !== letter && 
            targetWord.includes(letter)) {
            yellowUsed++;
        }
    }

    if (yellowUsed < yellowNeeded) {
        return 'present';
    }

    return 'absent';
}
/* 
 * Update game state after a guess
 * POINTS: 5
 */

/*
 * TODO: Complete this function to:
 * - Check if player won (guess matches target)
 * - Check if player lost (used all attempts)
 * - Show appropriate end game modal
 */

function updateGameState(isCorrect) {

    if (isCorrect) {
        gameWon = true;
        gameOver = true;
        showEndGameModal(true, currentWord);
    }
    // TODO: Handle lose condition  
    // HINT: Check if currentRow >= MAX_GUESSES - 1
    else if (currentRow >= MAX_GUESSES - 1) {
        gameOver = true;
        showEndGameModal(false, currentWord);
    }
}

// ========================================
// ADVANCED FEATURES (30 POINTS TOTAL)
// ========================================

/**
 * Update keyboard key colors based on guessed letters
 * POINTS: 10
 * 
 * TODO: Complete this function to:
 * - Update each key with appropriate color
 * - Maintain color priority (green > yellow > gray)
 * - Don't downgrade key colors
 */
function updateKeyboardColors(guess, results) {
    for (let i = 0; i < guess.length; i++) {
        updateKeyboardKey(guess[i], results[i]);
    }
}

/**
 * Process row reveal (simplified - no animations needed)
 * POINTS: 5 (reduced from 15 since animations removed)
 * 
 * TODO: Complete this function to:
 * - Check if all letters were correct
 * - Trigger celebration if player won this round
 */
function processRowReveal(rowIndex, results) {
    if (results.every(result => result === 'correct')) {
        celebrateRow(rowIndex);
    }
}

/**
 * Show end game modal with results
 * POINTS: 10
 * 
 * TODO: Complete this function to:
 * - Display appropriate win/lose message
 * - Show the target word
 * - Update game statistics
 */
function showEndGameModal(won, targetWord) {
    updateStats(won);
    showModal(won, targetWord, currentRow + 1);
}

/**
 * Validate user input before processing
 * POINTS: 5
 * 
 * TODO: Complete this function to:
 * - Check if game is over
 * - Validate letter keys (only if guess not full)
 * - Validate ENTER key (only if guess complete)
 * - Validate BACKSPACE key (only if letters to remove)
 */
function validateInput(key, currentGuess) {

    if (gameOver) {
        return false;
    }

    if (/^[A-Z]$/.test(key)) {
        return currentGuess.length < WORD_LENGTH;
    }

    else if (key === 'ENTER') {
        return currentGuess.length === WORD_LENGTH;
    }

    else if (key === 'BACKSPACE') {
        return currentGuess.length > 0;
    }
    return false;
}
