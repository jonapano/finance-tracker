import { useLanguageStore, useTranslation } from "../lib/i18n";
import { useTheme } from "../hooks/use-theme";
import { Button } from "./ui/button";
import { Moon, Sun, Globe, Wallet, RefreshCw, Coins } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useFinanceStore } from "../lib/store";
import { useEffect, useState } from "react";
import { useToast } from "../hooks/use-toast";

export function Header() {
  const { language, setLanguage } = useLanguageStore();
  const t = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const { baseCurrency, setBaseCurrency, setExchangeRates } = useFinanceStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const currencies = ["EUR", "USD", "GBP", "CAD", "JPY", "ALL"];

  const fetchRates = async (base: string, showToast = false) => {
    setIsSyncing(true);
    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
      const data = await response.json();
      if (data && data.rates) {
        setExchangeRates(data.rates);

        if (showToast) {
          toast({
            title: "Currency Updated",
            description: `Showing all balances in ${base}`,
          });
        }
      }
    } catch (error) {
      console.error("Forex Error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchRates(baseCurrency, false);
  }, []);

  const handleCurrencyChange = (newCurr: string) => {
    if (newCurr === baseCurrency) return;
    setBaseCurrency(newCurr);
    fetchRates(newCurr, true);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-foreground">
            {t.appName}
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-primary/20 bg-primary/5 min-w-[80px]"
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Coins className="h-4 w-4 text-primary" />
                )}
                <span className="font-bold text-xs">{baseCurrency}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {currencies.map((curr) => (
                <DropdownMenuItem
                  key={curr}
                  onClick={() => handleCurrencyChange(curr)}
                  className={`flex justify-between items-center ${
                    baseCurrency === curr ? "bg-accent font-bold" : ""
                  }`}
                >
                  {curr}
                  {baseCurrency === curr && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-16">
                <Globe className="mr-2 h-4 w-4" />
                {language.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("en")}>
                English (EN)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("sq")}>
                Shqip (SQ)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
