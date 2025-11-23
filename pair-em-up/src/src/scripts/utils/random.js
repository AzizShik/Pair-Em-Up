export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createChaoticGrid(size) {
  const matrix = [];
  const randomArr = [];

  while (randomArr.length < size) {
    randomArr.push(getRandomInt(1, 9));
  }

  for (let i = 0; i < randomArr.length; i += 9) {
    matrix.push(randomArr.slice(i, i + 9));
  }

  return matrix;
}
