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