import { useTranslation } from "../../lib/i18n";
import { Header } from "../../components/Header";
import { TransactionForm } from "../../components/TransactionForm";
import { TrendingDown, Sparkles, Globe2 } from "lucide-react";
import { motion } from "framer-motion";
import { useFinanceStore } from "../../lib/store";
import { Card, CardContent } from "../../components/ui/card";
import RecentTransactions from "../../components/RecentTransactions";

export default function AddTransactionPage() {
  const t = useTranslation();
  const { transactions, baseCurrency, exchangeRates } = useFinanceStore();

  const today = new Date().toDateString();
  const spentToday = transactions
    .filter(
      (tx) =>
        new Date(tx.date).toDateString() === today && tx.type === "expense",
    )
    .reduce(
      (acc, tx) => acc + Number(tx.amount) / (exchangeRates[tx.currency] || 1),
      0,
    );

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <section className="mb-12 text-center md:text-left md:flex md:items-end md:justify-between">
          <div className="mb-6 md:mb-0 max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 font-display"
            >
              {t.heroTitle || "Master Your Money"}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground"
            >
              {t.heroSubtitle || "Track every penny, visualize your spending and take control of your financial future."}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-3 justify-center md:justify-end"
          >
            <TransactionForm />
          </motion.div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <RecentTransactions />

          <div className="space-y-6">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-none">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-primary" />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase tracking-wider"
                  >
                    {t.today || "Today"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t.spentToday || "Spent Today"} ({baseCurrency})
                </p>
                <h3 className="text-3xl font-bold">
                  {new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: baseCurrency,
                  }).format(spentToday)}
                </h3>
              </CardContent>
            </Card>

            <section className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 px-1">
                <Globe2 className="h-5 w-5 text-muted-foreground" />
                {t.liveRates || "Live Rates"} (1 {baseCurrency})
              </h3>
              <div className="grid gap-2">
                {["USD", "EUR", "ALL", "GBP"]
                  .filter((c) => c !== baseCurrency)
                  .map((curr) => (
                    <div
                      key={curr}
                      className="flex items-center justify-between p-3 bg-card border rounded-xl"
                    >
                      <span className="text-sm font-bold text-muted-foreground">
                        {curr}
                      </span>
                      <span className="font-mono text-sm font-bold">
                        {(exchangeRates[curr] || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
              </div>
            </section>

            <div className="p-4 rounded-xl border border-dashed border-border bg-muted/30">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t.tip || "Your conversions are based on real-time mid-market rates. Always remember to check bank fees if transferring between currencies!"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Badge({ children, variant, className }: any) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium border ${className}`}
    >
      {children}
    </span>
  );
}
