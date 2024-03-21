export const mockAppleTicker = 'AAPL';
export const mockSamsungTicker = '005930.KS';

export const mockNotExistsTicker = 'NOTEXISTSTICKER';

export function *generateMockTicker(num: number) {
  if (num < 0) throw new Error('num must be positive');
  if (1000000 < num) throw new Error('num is too big. 1000000 is the limit');
  for (let i = 0; i < num; i++) {
    yield `${i.toString().padStart(6, '0')}.GN`;
  }
}