import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sanityClient } from "./sanity";

export type Language = "en" | "sq";

interface TranslationItem {
  key: string;
  en: string;
  sq: string;
  group?: string;
}

interface LanguageStore {
  language: Language;
  translations: any;
  setLanguage: (lang: Language) => void;
  fetchTranslations: () => Promise<void>;
}

const getLangFromUrl = (): Language => {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get("lang");
  return lang === "sq" ? "sq" : "en";
};

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: getLangFromUrl(),
      translations: {},
      setLanguage: (lang) => {
        const url = new URL(window.location.href);
        url.searchParams.set("lang", lang);
        window.history.pushState({}, "", url);
        set({ language: lang });
      },

      fetchTranslations: async () => {
        try {
          const query = `*[_type == "translation"]{ key, en, sq, group }`;
          const data = (await (sanityClient.fetch as any)(
            query,
          )) as TranslationItem[];

          const formatted: any = {
            en: { categories: {}, filters: {} },
            sq: { categories: {}, filters: {} },
          };

          if (data && Array.isArray(data)) {
            data.forEach((item: TranslationItem) => {
              const targetEn = item.en || "";
              const targetSq = item.sq || "";
              const group = item.group;

              if (group === "categories") {
                formatted.en.categories[item.key] = targetEn;
                formatted.sq.categories[item.key] = targetSq;
              } else if (group === "filters") {
                formatted.en.filters[item.key] = targetEn;
                formatted.sq.filters[item.key] = targetSq;
              } else {
                formatted.en[item.key] = targetEn;
                formatted.sq[item.key] = targetSq;
              }
            });
          }

          console.log("3. Final Formatted Object:", formatted);
          set({ translations: formatted });
        } catch (error) {
          console.error("Sanity fetch error:", error);
        }
      },
    }),
    {
      name: "language-storage",
    },
  ),
);

export const useTranslation = () => {
  const { language, translations } = useLanguageStore();

  if (!translations || !translations[language]) {
    return {};
  }

  return translations[language];
};
