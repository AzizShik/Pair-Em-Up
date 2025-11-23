export function shuffleArray(array) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export function completeShuffle(matrix) {
  const flatArr = matrix.flat();

  const shuffledFlat = shuffleArray(flatArr);

  const res = [];
  const rows = matrix.length;
  const cols = matrix[0].length;

  for (let i = 0; i < rows; i++) {
    res.push(shuffledFlat.slice(i * cols, (i + 1) * cols));
  }

  return res;
}
