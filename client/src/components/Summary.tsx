import { Card, CardContent } from "./ui/card";
import { ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { Transaction, useFinanceStore } from "../lib/store";
import { useTranslation } from "../lib/i18n";

interface SummaryProps {
  transactions: Transaction[];
}

export function Summary({ transactions }: SummaryProps) {
  const { baseCurrency, exchangeRates } = useFinanceStore();
  const t = useTranslation();

  const getAmountInBase = (tx: Transaction) => {
    const rate = exchangeRates[tx.currency] || 1;
    return Number(tx.amount) / rate;
  };

  const totalIncome = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + getAmountInBase(tx), 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + getAmountInBase(tx), 0);

  const balance = totalIncome - totalExpense;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const formatValue = (val: number) => {
    return val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-3 mb-8"
    >
      <motion.div variants={item}>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/10 border-green-200/50 dark:border-green-800/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/10 rounded-full text-green-600 dark:text-green-400">
                <ArrowUpCircle className="h-8 w-8" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-muted-foreground">
                  {t.totalIncome || "Total Income"}
                </p>
                <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 truncate">
                  +{baseCurrency} {formatValue(totalIncome)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/10 border-red-200/50 dark:border-red-800/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-500/10 rounded-full text-red-600 dark:text-red-400">
                <ArrowDownCircle className="h-8 w-8" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-muted-foreground">
                  {t.totalExpenses || "Total Expenses"}{" "}
                </p>
                <h3 className="text-2xl font-bold text-red-700 dark:text-red-400 truncate">
                  -{baseCurrency} {formatValue(totalExpense)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/10 border-blue-200/50 dark:border-blue-800/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 rounded-full text-blue-600 dark:text-blue-400">
                <Wallet className="h-8 w-8" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-muted-foreground">
                  {t.balance || "Total Balance"}
                </p>
                <h3
                  className={`text-2xl font-bold truncate ${
                    balance >= 0 ? "text-foreground" : "text-red-600"
                  }`}
                >
                  {balance < 0 ? "-" : ""}
                  {baseCurrency} {formatValue(Math.abs(balance))}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
