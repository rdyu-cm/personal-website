export type DatePrecision = "year" | "month" | "day";

export const formatBehavioralDate = (date: Date, precision: DatePrecision) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const pad = (value: number) => String(value).padStart(2, "0");
  const datetime =
    precision === "year"
      ? String(year)
      : precision === "month"
        ? `${year}-${pad(month)}`
        : `${year}-${pad(month)}-${pad(day)}`;
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "UTC",
    year: "numeric",
  };
  if (precision !== "year") options.month = "long";
  if (precision === "day") options.day = "numeric";

  return {
    visible: new Intl.DateTimeFormat("en-US", options).format(date),
    datetime,
  };
};
