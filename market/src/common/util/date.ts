export const toLoggingStyle = (date: Date) => {
  return date.toLocaleString("us", { timeZone: "Asia/Seoul" });
}

export const toISOYmdStr = (date: Date) => {
  return date.toISOString().slice(0, 10);
}