export const getLogStyleStr = (date: Date) => {
  return date.toLocaleString("en-GB", { timeZone: "Asia/Seoul" });
}

export const getISOYmdStr = (date: Date) => {
  return date.toISOString().slice(0, 10);
}