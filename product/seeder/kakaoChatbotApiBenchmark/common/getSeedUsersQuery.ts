export const getSeedUsersQuery = (
  userCount: number
): string => {
  const q1 = `
INSERT INTO users
  (kakao_chatbot_user_key)
  VALUES`;

  const insertValues = new Array(userCount).fill(0).map((_, i) => {
    return `
    ('${i + 1}')`;
  }).join(',');
  console.log(`[getSeedUsersQuery] insert 할 users 레코드 갯수: `, userCount);

  return q1 + insertValues + ';';
};