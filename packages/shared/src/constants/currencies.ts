/**
 * Currency constants and utilities
 */

export enum Currency {
  PYG = 'PYG',
  USD = 'USD',
}

export const CURRENCY_SYMBOLS = {
  [Currency.PYG]: '₲',
  [Currency.USD]: '$',
} as const;

export const CURRENCY_NAMES = {
  [Currency.PYG]: 'Guaraníes',
  [Currency.USD]: 'US Dollars',
} as const;

export const DEFAULT_EXCHANGE_RATE = 7300; // PYG to USD

export const formatCurrency = (
  amount: number,
  currency: Currency = Currency.PYG,
  locale: string = 'es-PY'
): string => {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === Currency.PYG ? 0 : 2,
    maximumFractionDigits: currency === Currency.PYG ? 0 : 2,
  });

  return formatter.format(amount);
};

export const convertCurrency = (
  amount: number,
  from: Currency,
  to: Currency,
  exchangeRate: number = DEFAULT_EXCHANGE_RATE
): number => {
  if (from === to) return amount;

  if (from === Currency.PYG && to === Currency.USD) {
    return amount / exchangeRate;
  }

  if (from === Currency.USD && to === Currency.PYG) {
    return amount * exchangeRate;
  }

  return amount;
};
