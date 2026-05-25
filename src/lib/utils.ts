import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatCurrency = (
  amount: number,
  currency: string = "ETB",
  locale: string = "en-US",
): string => {
  // Handle invalid inputs
  if (isNaN(amount)) {
    console.error("Invalid amount provided to formatCurrency");
    return `0.00 Br`;
  }

  // Currency configuration
  const currencyMap: Record<
    string,
    { symbol: string; position: "before" | "after"; space?: boolean }
  > = {
    ETB: { symbol: "Br", position: "after", space: true },
    USD: { symbol: "$", position: "before", space: false },
    EUR: { symbol: "€", position: "before", space: false },
    GBP: { symbol: "£", position: "before", space: false },
  };

  // Format the number part
  const formattedNumber = amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const config = currencyMap[currency];

  if (config) {
    const space = config.space ? " " : "";
    if (config.position === "before") {
      return `${config.symbol}${formattedNumber}`;
    } else {
      return `${formattedNumber}${space}${config.symbol}`;
    }
  }

  // Fallback for unknown currencies
  return `${currency} ${formattedNumber}`;
};
