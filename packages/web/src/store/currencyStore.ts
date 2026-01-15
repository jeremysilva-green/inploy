/**
 * Currency state management with Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Currency } from '@inploy/shared';

interface CurrencyState {
  currency: Currency;
  exchangeRate: number;
  setCurrency: (currency: Currency) => void;
  setExchangeRate: (rate: number) => void;
  toggleCurrency: () => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: Currency.PYG,
      exchangeRate: 7300,

      setCurrency: (currency) => set({ currency }),

      setExchangeRate: (rate) => set({ exchangeRate: rate }),

      toggleCurrency: () =>
        set((state) => ({
          currency:
            state.currency === Currency.PYG ? Currency.USD : Currency.PYG,
        })),
    }),
    {
      name: 'inploy-currency-storage',
    }
  )
);
