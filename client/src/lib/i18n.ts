import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "en" | "sq";

interface Translation {
  appName: string;
  addTransaction: string;
  editTransaction: string;
  heroTitle: string;
  heroSubtitle: string;
  totalIncome: string;
  totalExpenses: string;
  balance: string;
  date: string;
  description: string;
  category: string;
  amount: string;
  currency: string;
  type: string;
  actions: string;
  income: string;
  expense: string;
  save: string;
  cancel: string;
  delete: string;
  deleteConfirm: string;
  searchPlaceholder: string;
  noTransactions: string;
  categories: {
    food: string;
    transport: string;
    utilities: string;
    entertainment: string;
    salary: string;
    freelance: string;
    other: string;
  };
  filters: {
    all: string;
    income: string;
    expense: string;
  };
}

export const translations: Record<Language, Translation> = {
  en: {
    appName: "FinTrack",
    addTransaction: "Add Transaction",
    editTransaction: "Edit Transaction",
    heroTitle: "Master Your Money",
    heroSubtitle:
      "Track every penny, visualize your spending, and take control of your financial future.",
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    balance: "Current Balance",
    date: "Date",
    description: "Description",
    category: "Category",
    amount: "Amount",
    currency: "Currency",
    type: "Type",
    actions: "Actions",
    income: "Income",
    expense: "Expense",
    save: "Save Transaction",
    cancel: "Cancel",
    delete: "Delete",
    deleteConfirm: "Are you sure you want to delete this transaction?",
    searchPlaceholder: "Search transactions...",
    noTransactions: "No transactions yet. Start by adding one!",
    categories: {
      food: "Food & Dining",
      transport: "Transportation",
      utilities: "Bills & Utilities",
      entertainment: "Entertainment",
      salary: "Salary",
      freelance: "Freelance",
      other: "Other",
    },
    filters: {
      all: "All Types",
      income: "Income Only",
      expense: "Expenses Only",
    },
  },
  sq: {
    appName: "FinTrack",
    addTransaction: "Shto Transaksion",
    editTransaction: "Ndrysho Transaksionin",
    heroTitle: "Menaxho Paratë Tuaja",
    heroSubtitle:
      "Gjurmoni çdo qindarkë, vizualizoni shpenzimet dhe merrni kontrollin e së ardhmes suaj financiare.",
    totalIncome: "Të Ardhurat",
    totalExpenses: "Shpenzimet",
    balance: "Bilanci Aktual",
    date: "Data",
    description: "Përshkrimi",
    category: "Kategoria",
    amount: "Shuma",
    currency: "Monedha",
    type: "Lloji",
    actions: "Veprime",
    income: "Të Ardhura",
    expense: "Shpenzim",
    save: "Ruaj",
    cancel: "Anulo",
    delete: "Fshi",
    deleteConfirm: "A jeni i sigurt që dëshironi të fshini këtë transaksion?",
    searchPlaceholder: "Kërko transaksione...",
    noTransactions: "Ende asnjë transaksion. Filloni duke shtuar një!",
    categories: {
      food: "Ushqim",
      transport: "Transport",
      utilities: "Fatura & Shërbime",
      entertainment: "Argëtim",
      salary: "Rroga",
      freelance: "Freelance",
      other: "Tjetër",
    },
    filters: {
      all: "Të Gjitha",
      income: "Vetëm Të Ardhurat",
      expense: "Vetëm Shpenzimet",
    },
  },
};

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "language-storage",
    }
  )
);

export const useTranslation = () => {
  const language = useLanguageStore((state) => state.language);
  return translations[language];
};
