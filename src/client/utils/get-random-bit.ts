const BIT_THRESHOLD = 0.5;

function getRandomBit() {
  return Number(Math.random() < BIT_THRESHOLD);
}

export { getRandomBit };
