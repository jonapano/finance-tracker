import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Transaction {
  id: number;
  amount: number;
  category: string;
  currency: string;
  description: string;
  type: "income" | "expense";
  date: string;
}

export interface Category {
  id: string;
  label: string;
}

interface FinanceStore {
  transactions: Transaction[];
  baseCurrency: string;
  exchangeRates: Record<string, number>;
  categories: Category[];

  addTransaction: (tx: Transaction) => void;
  updateTransaction: (
    id: number | string,
    updatedTx: Partial<Transaction>
  ) => void;
  deleteTransaction: (id: string | number) => void;

  setBaseCurrency: (currency: string) => void;
  setExchangeRates: (rates: Record<string, number>) => void;

  addCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      transactions: [],
      baseCurrency: "EUR",
      exchangeRates: {},
      categories: [
        { id: "food", label: "Food & Dining" },
        { id: "salary", label: "Salary" },
        { id: "rent", label: "Rent & Housing" },
        { id: "transport", label: "Transport" },
        { id: "utilities", label: "Utilities" },
        { id: "shopping", label: "Shopping" },
        { id: "entertainment", label: "Entertainment" },
      ],

      addTransaction: (tx) =>
        set((state) => ({ transactions: [tx, ...state.transactions] })),

      updateTransaction: (id, updatedTx) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updatedTx } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      setBaseCurrency: (baseCurrency) => set({ baseCurrency }),

      setExchangeRates: (exchangeRates) => set({ exchangeRates }),

      addCategory: (newCat) =>
        set((state) => {
          const exists = state.categories.some((c) => c.id === newCat.id);
          if (exists) return state;
          return { categories: [...state.categories, newCat] };
        }),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
    }),
    {
      name: "finance-storage",
      partialize: (state) => ({
        transactions: state.transactions,
        baseCurrency: state.baseCurrency,
        categories: state.categories,
      }),
    }
  )
);
