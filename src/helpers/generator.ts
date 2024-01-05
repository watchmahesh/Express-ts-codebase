export const genRandomNumber = (digit = 6): number => {
  let random = 8848
  do {
    random = Math.floor(Math.random() * 10 ** digit)
  } while (random < 10 ** (digit - 1))
  return random
}
