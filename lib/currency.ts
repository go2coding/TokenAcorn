export type Currency = "USD" | "CNY";

const EXCHANGE_RATE = 7.2;

export function convertPrice(
  priceUSD: number,
  targetCurrency: Currency
): number {
  if (targetCurrency === "USD") {
    return priceUSD;
  }
  return priceUSD * EXCHANGE_RATE;
}

export function formatPrice(price: number, currency: Currency): string {
  if (currency === "USD") {
    return `$${price.toFixed(price < 0.01 ? 4 : 2)}`;
  }
  return `¥${(price * EXCHANGE_RATE).toFixed(2)}`;
}

export function formatPricePerMillion(
  price: number,
  currency: Currency
): string {
  const formatted = formatPrice(price, currency);
  return `${formatted}/M`;
}
