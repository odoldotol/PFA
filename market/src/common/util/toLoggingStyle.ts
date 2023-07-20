export const toLoggingStyle = (date: Date) => {
  return date.toLocaleString("us", { timeZone: "Asia/Seoul" });
}