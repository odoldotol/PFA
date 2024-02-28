export const getLogStyleStr = (date: Date): string => {
  return date.toLocaleString("us", { timeZone: "Asia/Seoul" });
};

/**
 * 
 * @param timeZone 'Asia/Seoul', 'America/New_York', ... , default is 'utc'
 */
export const getISOYmdStr = (
  date: Date,
  timeZone: string = 'utc'
): string => {
  return new Intl.DateTimeFormat('en-GB', {timeZone}).format(date)
  .split('/')
  .reverse()
  .join('-');
};

/**
 * @returns 0 or Positive integer
 */
export const calculateRemainingMs = (date: Date): number => {
  const result = date.getTime() - new Date().getTime();
  return 0 < result ? result : 0;
}

/**
 * @returns 0 or Positive integer
 */
export const calculateElapsedMs = (date: Date): number => {
  const result = new Date().getTime() - date.getTime();
  return 0 < result ? result : 0;
}