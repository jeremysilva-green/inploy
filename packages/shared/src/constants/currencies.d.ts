/**
 * Currency constants and utilities
 */
export declare enum Currency {
    PYG = "PYG",
    USD = "USD"
}
export declare const CURRENCY_SYMBOLS: {
    readonly PYG: "₲";
    readonly USD: "$";
};
export declare const CURRENCY_NAMES: {
    readonly PYG: "Guaraníes";
    readonly USD: "US Dollars";
};
export declare const DEFAULT_EXCHANGE_RATE = 7300;
export declare const formatCurrency: (amount: number, currency?: Currency, locale?: string) => string;
export declare const convertCurrency: (amount: number, from: Currency, to: Currency, exchangeRate?: number) => number;
