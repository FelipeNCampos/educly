import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useQuizSounds } from "@/hooks/useQuizSounds";
import { useTranslation } from "react-i18next";
import { Check, RotateCcw, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface WordSearchProps {
  title: string;
  words: string[];
  gridSize?: number;
  onComplete: () => void;
}

const generateGrid = (words: string[], size: number): string[][] => {
  const grid: string[][] = Array(size).fill(null).map(() => 
    Array(size).fill('')
  );
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
  ];
  
  const placedWords: {word: string, positions: [number, number][]}[] = [];
  
  for (const word of words) {
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 100) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const maxRow = size - (dir[0] * word.length);
      const maxCol = size - (dir[1] * word.length);
      
      if (maxRow < 0 || maxCol < 0) {
        attempts++;
        continue;
      }
      
      const startRow = Math.floor(Math.random() * maxRow);
      const startCol = Math.floor(Math.random() * maxCol);
      
      let canPlace = true;
      const positions: [number, number][] = [];
      
      for (let i = 0; i < word.length; i++) {
        const row = startRow + (dir[0] * i);
        const col = startCol + (dir[1] * i);
        const currentCell = grid[row][col];
        
        if (currentCell !== '' && currentCell !== word[i].toUpperCase()) {
          canPlace = false;
          break;
        }
        positions.push([row, col]);
      }
      
      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          const [row, col] = positions[i];
          grid[row][col] = word[i].toUpperCase();
        }
        placedWords.push({ word: word.toUpperCase(), positions });
        placed = true;
      }
      attempts++;
    }
  }
  
  // Fill empty cells with random letters
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === '') {
        grid[row][col] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }
  
  return grid;
};

export const WordSearch = ({ title, words, gridSize = 8, onComplete }: WordSearchProps) => {
  const { t } = useTranslation();
  const { playCorrect, playIncorrect } = useQuizSounds();
  
  const normalizedWords = useMemo(() => words.map(w => w.toUpperCase()), [words]);
  
  const [grid] = useState(() => generateGrid(normalizedWords, gridSize));
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<[number, number] | null>(null);
  const [currentSelection, setCurrentSelection] = useState<[number, number][]>([]);
  const [completed, setCompleted] = useState(false);
  
  const getCellKey = (row: number, col: number) => `${row}-${col}`;
  
  const getSelectedWord = useCallback((cells: [number, number][]) => {
    return cells.map(([row, col]) => grid[row][col]).join('');
  }, [grid]);
  
  const handleCellMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    setSelectionStart([row, col]);
    setCurrentSelection([[row, col]]);
  };
  
  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isSelecting || !selectionStart) return;
    
    const [startRow, startCol] = selectionStart;
    const dRow = row - startRow;
    const dCol = col - startCol;
    
    // Only allow straight lines (horizontal, vertical, diagonal)
    const isHorizontal = dRow === 0;
    const isVertical = dCol === 0;
    const isDiagonal = Math.abs(dRow) === Math.abs(dCol);
    
    if (!isHorizontal && !isVertical && !isDiagonal) return;
    
    const cells: [number, number][] = [];
    const stepRow = dRow === 0 ? 0 : dRow > 0 ? 1 : -1;
    const stepCol = dCol === 0 ? 0 : dCol > 0 ? 1 : -1;
    const steps = Math.max(Math.abs(dRow), Math.abs(dCol));
    
    for (let i = 0; i <= steps; i++) {
      cells.push([startRow + (stepRow * i), startCol + (stepCol * i)]);
    }
    
    setCurrentSelection(cells);
  };
  
  const handleMouseUp = () => {
    if (!isSelecting) return;
    
    const word = getSelectedWord(currentSelection);
    const reversedWord = word.split('').reverse().join('');
    
    if (normalizedWords.includes(word) || normalizedWords.includes(reversedWord)) {
      const foundWord = normalizedWords.includes(word) ? word : reversedWord;
      
      if (!foundWords.has(foundWord)) {
        playCorrect();
        const newFoundWords = new Set(foundWords);
        newFoundWords.add(foundWord);
        setFoundWords(newFoundWords);
        
        const newSelectedCells = new Set(selectedCells);
        currentSelection.forEach(([r, c]) => newSelectedCells.add(getCellKey(r, c)));
        setSelectedCells(newSelectedCells);
        
        if (newFoundWords.size === normalizedWords.length) {
          setCompleted(true);
        }
      }
    } else if (currentSelection.length > 1) {
      playIncorrect();
    }
    
    setIsSelecting(false);
    setSelectionStart(null);
    setCurrentSelection([]);
  };
  
  const handleReset = () => {
    setSelectedCells(new Set());
    setFoundWords(new Set());
    setCompleted(false);
  };
  
  const isInCurrentSelection = (row: number, col: number) => {
    return currentSelection.some(([r, c]) => r === row && c === col);
  };
  
  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        {t('lesson.wordSearch.instructions', 'Encontre as palavras escondidas arrastando sobre as letras!')}
      </p>
      
      {/* Words to find */}
      <div className="flex flex-wrap gap-2 mb-4">
        {normalizedWords.map((word) => (
          <span
            key={word}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-all",
              foundWords.has(word)
                ? "bg-success/20 text-success line-through"
                : "bg-primary/10 text-primary"
            )}
          >
            {word}
          </span>
        ))}
      </div>
      
      {/* Grid */}
      <div 
        className="inline-grid gap-1 p-2 bg-muted/30 rounded-lg select-none touch-none"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchEnd={handleMouseUp}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const key = getCellKey(rowIndex, colIndex);
            const isFound = selectedCells.has(key);
            const isSelecting = isInCurrentSelection(rowIndex, colIndex);
            
            return (
              <div
                key={key}
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center",
                  "text-sm sm:text-base font-bold rounded cursor-pointer transition-all",
                  "select-none",
                  isFound 
                    ? "bg-success text-white" 
                    : isSelecting
                    ? "bg-primary text-white scale-110"
                    : "bg-card hover:bg-primary/20 text-foreground"
                )}
                onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                onTouchStart={() => handleCellMouseDown(rowIndex, colIndex)}
              >
                {cell}
              </div>
            );
          })
        )}
      </div>
      
      {/* Progress */}
      <div className="mt-4 text-sm text-muted-foreground">
        {foundWords.size} / {normalizedWords.length} {t('lesson.wordSearch.found', 'palavras encontradas')}
      </div>
      
      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {completed ? (
          <Button onClick={onComplete} className="w-full h-12">
            <Check className="w-4 h-4 mr-2" />
            {t('common.continue')}
          </Button>
        ) : (
          <Button variant="outline" onClick={handleReset} className="w-full h-12">
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('lesson.wordSearch.reset', 'Recomeçar')}
          </Button>
        )}
      </div>
    </div>
  );
};
