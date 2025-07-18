
export function createSolvableMaze(rows: number, cols: number): number[][] {
  // Initialize maze grid with all walls (1)
  const maze: number[][] = Array.from({ length: rows }, () => Array(cols).fill(1));

  // Define directions for carving paths (dx, dy)
  const directions = [
    { dx: 0, dy: -2 }, // Up
    { dx: 0, dy: 2 },  // Down
    { dx: -2, dy: 0 }, // Left
    { dx: 2, dy: 0 }   // Right
  ];

  // Helper function to shuffle an array (Fisher-Yates)
  function shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Recursive Backtracker (Depth-First Search)
  function carvePassages(cx: number, cy: number) {
    maze[cy][cx] = 0; // Mark current cell as a path (0)

    const shuffledDirections = [...directions];
    shuffle(shuffledDirections); // Randomize the order of directions

    for (const { dx, dy } of shuffledDirections) {
      const nx = cx + dx;
      const ny = cy + dy;

      // Check bounds and if the next cell is a wall (unvisited)
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] === 1) {
        // Carve path between current cell and next cell
        maze[cy + dy / 2][cx + dx / 2] = 0;

        // Recursively carve from the next cell
        carvePassages(nx, ny);
      }
    }
  }

  // Start carving from a random odd coordinate (to ensure a proper grid structure for carving)
  // Player typically starts at (1,1), so we can start carving from there or a nearby cell
  // For a 10x10 maze, (1,1) is a good starting point for a path.
  carvePassages(1, 1); 

  // Ensure start and end points are always paths
  maze[1][1] = 0; // Player start
  maze[rows - 3][cols - 3] = 0; // Goal position (mazeSize - 3, mazeSize - 3)

  return maze;
}

export function checkCollision(rect1: DOMRect, rect2: DOMRect): boolean {
  return !(rect1.right < rect2.left || 
           rect1.left > rect2.right || 
           rect1.bottom < rect2.top || 
           rect1.top > rect2.bottom);
}

export function getRandomColor(): string {
  const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#F97316'];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function playSound(frequency: number, duration: number) {
  if (typeof window !== 'undefined' && window.AudioContext) {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }
}


export function generateRandomWord(): string {
  const words = [
    'CASA', 'PERRO', 'GATO', 'AGUA', 'FUEGO', 'TIERRA', 'AIRE', 'SOL', 'LUNA', 'ESTRELLA',
    'ARBOL', 'FLOR', 'LIBRO', 'MESA', 'SILLA', 'PUERTA', 'VENTANA', 'COCHE', 'BICI', 'AVION',
    'PÁJARO', 'PECES', 'MANOS', 'PIES', 'OJOS', 'BOCA', 'NARIZ', 'PELO', 'AMOR', 'FELIZ',
     "TAMBIEN",    // Acentuación, M antes de B
    "AVION",      // Acentuación
    "HABIA",      // H intermedia, acentuación
    "IBA",        // B/V confusión
    "AHI",        // H intermedia, acentuación (para "ahí" de lugar)
    "HAY",        // H inicial (para "haber")
    "AY",         // Sin H (interjección)
    "HACER",      // H inicial
    "ECHAR",      // No lleva H (de lanzar)
    "HECHO",      // H inicial (de hacer)
    "ECHO",       // No lleva H (de echar)
    "VAYA",       // B/V confusión (de ir)
    "BAYA",       // B/V confusión (fruto)
    "VALLA",      // B/V confusión (cerca)
    "AQUI",       // Acentuación
    "PORQUE",     // Uso común
    "POR QUE",    // Uso común (separado)
    "SABER",      // B/V confusión
    "CASA",       // S/Z confusión
    "CAZA",       // S/Z confusión (de cazar)
    "VEZ",        // Z final (sustantivo)
    "VES",        // S final (de ver)
    "LLENDO",     // ERROR COMÚN (la correcta es YENDO) - could be used to highlight error
    "YENDO",      // Forma correcta
    "EXPLICAR",   // X/S/C confusión
    "EXAMEN",     // X/S/C confusión
    "GRAVE",      // B/V confusión
    "SIEMPRE",    // M antes de P
    "GRACIAS",    // C/S confusión
    "QUIZAS",     // Z/S confusión, acentuación
    "TRAJE",      // G/J confusión (de traer)
    "COGER",      // G/J confusión
    "JIRAFA",     // G/J confusión
    "HERMANO",    // H inicial
    "OREJA",      // J/G confusión
    "GENTE",      // G/J confusión
    "CIELO",      // C/S/Z confusión
    "LAPIZ",      // Z/S confusión, acentuación
    "ORDEN"       // N final (no "ordenar")
  ];
  return words[Math.floor(Math.random() * words.length)];
}

export function generateRandomLetter(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

// --- MODIFIED: List of commonly misspelled Spanish words ---


// --- MODIFIED: generateSequence to handle letters or words ---
export function generateSequence(length: number, gameLevel: number, type: 'letters' | 'words' = 'letters'): string {
  let sequence = '';
  if (type === 'letters') {
    for (let i = 0; i < length; i++) {
      sequence += generateRandomLetter();
    }
  } else { // type === 'words'
    // Create a mutable copy and shuffle it
    const shuffledWords = [...spanishWords];
    for (let i = shuffledWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
    }

    // Concatenate words with a space
    for (let i = 0; i < length; i++) {
      if (shuffledWords[i]) { // Ensure word exists (handle cases where length > available words)
        sequence += shuffledWords[i];
        if (i < length - 1) {
          sequence += ' '; // Add space between words
        }
      } else {
        // Fallback or handle error if trying to generate more words than available
        console.warn(`Not enough unique words for sequence length ${length}. Using filler.`);
        sequence += generateRandomLetter() + generateRandomLetter() + generateRandomLetter(); // Fallback to random letters if ran out of words
        if (i < length - 1) {
          sequence += ' ';
        }
      }
    }
  }
  return sequence;
}
