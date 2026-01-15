"use strict";
/**
 * Currency constants and utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertCurrency = exports.formatCurrency = exports.DEFAULT_EXCHANGE_RATE = exports.CURRENCY_NAMES = exports.CURRENCY_SYMBOLS = exports.Currency = void 0;
var Currency;
(function (Currency) {
    Currency["PYG"] = "PYG";
    Currency["USD"] = "USD";
})(Currency || (exports.Currency = Currency = {}));
exports.CURRENCY_SYMBOLS = {
    [Currency.PYG]: '₲',
    [Currency.USD]: '$',
};
exports.CURRENCY_NAMES = {
    [Currency.PYG]: 'Guaraníes',
    [Currency.USD]: 'US Dollars',
};
exports.DEFAULT_EXCHANGE_RATE = 7300; // PYG to USD
const formatCurrency = (amount, currency = Currency.PYG, locale = 'es-PY') => {
    const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: currency === Currency.PYG ? 0 : 2,
        maximumFractionDigits: currency === Currency.PYG ? 0 : 2,
    });
    return formatter.format(amount);
};
exports.formatCurrency = formatCurrency;
const convertCurrency = (amount, from, to, exchangeRate = exports.DEFAULT_EXCHANGE_RATE) => {
    if (from === to)
        return amount;
    if (from === Currency.PYG && to === Currency.USD) {
        return amount / exchangeRate;
    }
    if (from === Currency.USD && to === Currency.PYG) {
        return amount * exchangeRate;
    }
    return amount;
};
exports.convertCurrency = convertCurrency;
//# sourceMappingURL=currencies.js.map