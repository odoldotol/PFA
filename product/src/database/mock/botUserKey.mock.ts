export const mockBotUserKey = '7f56271308f3c6h8ad361b0bf302j4p28k122k3m245b48377boh1f7d9d78ab3f59';
export const mockBotUserKey2 = '49bbs5630ghy56e8v6sclyr67jengkvl861fom8fjfie9863527gyf6d5s46480yg8';

export function *generateMockBotUserKey(num: number) {
  if (num < 0) throw new Error('num must be positive');
  if (1000000 < num) throw new Error('num is too big. 1000000 is the limit');
  for (let i = 0; i < num; i++) {
    yield i.toString().padStart(66, 'G');
  }
}