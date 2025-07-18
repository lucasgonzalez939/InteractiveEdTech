import { useState, useEffect } from 'react';
import GameLayout from '@/components/game-layout';
import { useGameState } from '@/hooks/use-game-state';
import { generateSequence, playSound } from '@/lib/game-utils'; // Ensure generateSequence is imported correctly
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Define the level at which the game switches to words
const WORD_LEVEL_START = 3; // Example: Start words from level 5

export default function LetterMemory() {
  const { gameState, updateScore, updateLevel, settings } = useGameState();
  const [currentSequence, setCurrentSequence] = useState('');
  const [displaySequence, setDisplaySequence] = useState('');
  const [userInput, setUserInput] = useState('');
  const [gamePhase, setGamePhase] = useState<'waiting' | 'showing' | 'input' | 'feedback'>('waiting');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [sequenceLength, setSequenceLength] = useState(3); // For letters, this is char count; for words, this is word count
  const [correctCount, setCorrectCount] = useState(0);
  const [currentGameLevel, setCurrentGameLevel] = useState(1);
  const [gameCompleted, setGameCompleted] = useState(false);

  // --- MISSING PIECE 1: New state for sequence type ---
  const [sequenceType, setSequenceType] = useState<'letters' | 'words'>('letters');

  const startSequence = () => {
    // --- MISSING PIECE 2: Determine if it's a word level or letter level ---
    const isWordLevel = currentGameLevel >= WORD_LEVEL_START;
    setSequenceType(isWordLevel ? 'words' : 'letters');

    // Generate sequence based on type
    const sequence = generateSequence(sequenceLength, currentGameLevel, isWordLevel ? 'words' : 'letters');
    setCurrentSequence(sequence);
    setDisplaySequence(sequence);
    setGamePhase('showing');
    setUserInput('');
    setIsCorrect(null);

    // --- MISSING PIECE 3: Dynamic show duration for words vs. letters ---
    const effectiveShowDuration = isWordLevel 
      ? 2000 + (sequence.split(' ').length * 1000) // 1 second per word + base
      : 1500 + (sequence.length * 500); // 0.5 seconds per letter + base

    setTimeout(() => {
      setDisplaySequence('???');
      setGamePhase('input');
    }, effectiveShowDuration);
  };

  const checkAnswer = () => {
    // Trim whitespace for words to ensure accurate comparison
    const correct = userInput.toUpperCase().trim() === currentSequence.trim(); 
    setIsCorrect(correct);
    setGamePhase('feedback');

    if (correct) {
      // --- MISSING PIECE 4: Score based on sequence type ---
      const points = sequenceType === 'words' 
        ? 20 * currentSequence.split(' ').length // 20 points per word
        : 10 * sequenceLength; // 10 points per letter
      updateScore(points);
      setCorrectCount(prev => prev + 1);
      if (settings.soundEnabled) {
        playSound(600, 0.3);
      }
    } else {
      if (settings.soundEnabled) {
        playSound(200, 0.5);
      }
    }

    setTimeout(() => {
      setGamePhase('waiting');
      if (correct) {
        // --- MISSING PIECE 5: Difficulty progression for letters and words ---
        const maxLetterLength = 8; // Max characters in letter sequence
        const maxWordCount = 4; // Max words in a word sequence

        if (correctCount > 0 && correctCount % 5 === 0) { // Every 5 correct answers
          if (sequenceType === 'letters') {
            // Increase letter sequence length up to maxLetterLength
            setSequenceLength(prev => Math.min(prev + 1, maxLetterLength));
          } else { // words
            // Increase word count up to maxWordCount
            setSequenceLength(prev => Math.min(prev + 1, maxWordCount)); 
          }

          // Advance game level if sequence length increased or if it's maxed but level not completed
          const currentMaxSeq = sequenceType === 'letters' ? maxLetterLength : maxWordCount;
          if (sequenceLength < currentMaxSeq || (sequenceLength === currentMaxSeq && currentGameLevel < 20)) {
            setCurrentGameLevel(prev => prev + 1);
            updateLevel(); // Update global game state level
          }
        }

        // Check if game is completed (e.g., 20 levels total)
        if (currentGameLevel >= 20) {
          setGameCompleted(true);
        }
      }
    }, 2000);
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (gamePhase === 'input' && event.key === 'Enter') {
      checkAnswer();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gamePhase, userInput, handleKeyPress]); // Added handleKeyPress to useEffect dependencies for stability

  // --- MISSING PIECE 6: useEffect for level transition from letters to words ---
  useEffect(() => {
    // When current game level reaches the word start level, switch type and reset count/length
    if (currentGameLevel === WORD_LEVEL_START && sequenceType === 'letters') {
      setSequenceLength(2); // Start with 2 words for the first word level
      setCorrectCount(0); // Reset correct count for new type progression
      setSequenceType('words'); // Explicitly set to words
    } else if (currentGameLevel < WORD_LEVEL_START && sequenceType === 'words') {
      // Handles cases where game might reset or level decreases below word start
      setSequenceLength(3); // Reset to initial letter length
      setCorrectCount(0);
      setSequenceType('letters');
    }
  }, [currentGameLevel, sequenceType]); // Dependencies to re-run effect when level or type changes

  return (
    <GameLayout
      gameTitle="Memoria de Letras"
      gameType="letterMemory"
      className="bg-gradient-to-br from-purple-400 to-pink-600"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* --- MISSING PIECE 7: Dynamic H2 title --- */}
            <h2 className="text-3xl font-fredoka text-dark mb-6">
              Memoriza {sequenceType === 'letters' ? 'las Letras' : 'las Palabras'}
            </h2>

            {/* Sequence Display */}
            <div className="bg-gray-100 rounded-xl p-6 mb-6 min-h-24 flex items-center justify-center">
              <div className="text-4xl font-bold text-dark tracking-wider">
                {displaySequence || 'Presiona "Mostrar Secuencia" para comenzar'}
              </div>
            </div>

            {/* Input Area */}
            <div className="mb-6">
              <Input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full p-4 text-2xl text-center border-2 border-gray-300 rounded-xl focus:border-sky focus:outline-none"
                // --- MISSING PIECE 8: Dynamic placeholder ---
                placeholder={sequenceType === 'letters' ? "Escribe las letras aquí..." : "Escribe las palabras aquí..."}
                disabled={gamePhase !== 'input'}
                // --- MISSING PIECE 9: Removed maxLength for words ---
                // maxLength={sequenceLength} // This line is removed to allow typing full words/sentences
              />
            </div>

            {/* Feedback */}
            {gamePhase === 'feedback' && (
              <div className={`mb-6 p-4 rounded-xl ${
                isCorrect ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
              }`}>
                <p className="text-xl font-bold">
                  {isCorrect ? '¡Correcto!' : `Incorrecto. La secuencia era: ${currentSequence}`}
                </p>
              </div>
            )}

            {/* Game Controls */}
            {!gameCompleted && (
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={startSequence}
                  disabled={gamePhase !== 'waiting'}
                  className="bg-sky hover:bg-sky/80 text-white px-6 py-3 rounded-full font-bold"
                >
                  {gamePhase === 'waiting' ? 'Mostrar Secuencia' : 'Mostrando...'}
                </Button>

                <Button
                  onClick={checkAnswer}
                  disabled={gamePhase !== 'input' || !userInput}
                  className="bg-success hover:bg-success/80 text-white px-6 py-3 rounded-full font-bold"
                >
                  Verificar
                </Button>
              </div>
            )}

            {/* Progress Info */}
            <div className="mt-6 text-sm text-gray-600">
              {/* --- MISSING PIECE 10: Dynamic progress info --- */}
              <p>Tipo de secuencia: {sequenceType === 'letters' ? 'Letras' : 'Palabras'}</p>
              <p>Longitud de secuencia: {sequenceLength} {sequenceType === 'letters' ? 'letras' : 'palabras'}</p>
              <p>Nivel del juego: {currentGameLevel}/20</p>
              <p>Secuencias correctas: {correctCount}</p>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-sky h-4 rounded-full transition-all duration-300"
                  style={{ width: `${(currentGameLevel / 20) * 100}%` }}
                />
              </div>
            </div>

            {/* Game Completed */}
            {gameCompleted && (
              <div className="mt-6 bg-success/20 text-success p-4 rounded-xl text-center">
                <h3 className="text-2xl font-fredoka mb-2">¡Juego Completado!</h3>
                <p>¡Felicidades! Has completado los 20 niveles del juego.</p>
                <div className="mt-4 space-x-4">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="bg-coral hover:bg-coral/80 text-white px-6 py-2 rounded-full font-bold"
                  >
                    Menú Principal
                  </button>
                  <button
                    onClick={() => {
                      setGameCompleted(false);
                      setCurrentGameLevel(1);
                      setCorrectCount(0);
                      setSequenceLength(3); // Reset to initial letter length
                      setGamePhase('waiting');
                      setUserInput('');
                      setIsCorrect(null);
                      setSequenceType('letters'); // --- MISSING PIECE 11: Reset sequenceType ---
                    }}
                    className="bg-sky hover:bg-sky/80 text-white px-6 py-2 rounded-full font-bold"
                  >
                    Jugar de Nuevo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}