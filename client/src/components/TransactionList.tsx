import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Pencil, Trash2, ArrowUpDown, Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { TransactionForm } from "./TransactionForm";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Transaction } from "../lib/store";
import { useFinanceStore } from "../lib/store";
import { useToast } from "../hooks/use-toast";
import { useTranslation } from "../lib/i18n";

interface TransactionListProps {
  transactions: Transaction[];
  onSort: (field: "date" | "amount") => void;
  sortField?: "date" | "amount";
  sortOrder?: "asc" | "desc";
}

export function TransactionList({
  transactions,
  onSort,
  sortField,
  sortOrder,
}: TransactionListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();
  const t = useTranslation();

  const { deleteTransaction, baseCurrency, exchangeRates, categories } =
    useFinanceStore();

  const handleDelete = (id: number | string) => {
    deleteTransaction(id);
    toast({
      title: t.transactionDeleted || "Transaction deleted",
      description:
        t.deleteSuccessMsg || "The record has been permanently removed.",
      variant: "destructive",
    });
  };

  const getEurValue = (amount: number, currency: string) => {
    if (currency === "EUR") return amount;
    const rate = exchangeRates[currency] || 1;
    return amount / rate;
  };

  const formatValue = (amount: number, currency: string) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="rounded-2xl border border-border/50 overflow-hidden bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[140px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("date")}
                className="font-semibold hover:bg-transparent p-0"
              >
                {t.date || "Date"}{" "}
                <ArrowUpDown
                  className={`ml-2 h-3 w-3 ${
                    sortField === "date" ? "opacity-100" : "opacity-40"
                  }`}
                />
              </Button>
            </TableHead>
            <TableHead className="w-[100px]">{t.typeLabel || "Type"}</TableHead>
            <TableHead>{t.descriptionLabel || "Description"}</TableHead>
            <TableHead>{t.categoryLabel || "Category"}</TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("amount")}
                className="font-semibold hover:bg-transparent p-0"
              >
                {t.amountLabel || "Original Amount"}{" "}
                <ArrowUpDown
                  className={`ml-2 h-3 w-3 ${
                    sortField === "amount" ? "opacity-100" : "opacity-40"
                  }`}
                />
              </Button>
            </TableHead>
            <TableHead className="text-right text-muted-foreground font-medium">
              {t.eurAmount || "Amount (EUR)"}
            </TableHead>
            <TableHead className="w-[100px] text-right">
              {t.actions || "Actions"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout" initial={false}>
            {transactions.length > 0 ? (
              transactions.map((tx) => {
                const rate = exchangeRates[tx.currency] || 1;
                const baseConvertedAmount = Number(tx.amount) / rate;
                const eurAmount = getEurValue(Number(tx.amount), tx.currency);
                const isDifferentFromBase = tx.currency !== baseCurrency;

                const categoryLabel =
                  t.categories?.[tx.category] ||
                  categories.find((c) => c.id === tx.category)?.label ||
                  tx.category;

                return (
                  <motion.tr
                    key={tx.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="text-muted-foreground text-xs">
                      {format(new Date(tx.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          tx.type === "income"
                            ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                        }
                      >
                        {tx.type === "income"
                          ? t.income || "Income"
                          : t.expense || "Expense"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {tx.description}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-xs text-secondary-foreground">
                        {categoryLabel}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span
                          className={`font-mono font-bold ${
                            tx.type === "income"
                              ? "text-green-600 dark:text-green-400"
                              : "text-foreground"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "-"}
                          {formatValue(Number(tx.amount), tx.currency)}
                        </span>
                        {isDifferentFromBase && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Info className="h-2 w-2" />
                            {formatValue(baseConvertedAmount, baseCurrency)}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-mono text-sm text-muted-foreground italic">
                      {formatValue(eurAmount, "EUR")}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <TransactionForm
                          transaction={tx}
                          open={editingId === tx.id}
                          onOpenChange={(open) =>
                            setEditingId(open ? (tx.id as number) : null)
                          }
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          }
                        />

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t.delete || "Delete Transaction"}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t.deleteConfirm ||
                                  "Are you sure? This cannot be undone."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">
                                {t.cancel || "Cancel"}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(tx.id)}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl"
                              >
                                {t.delete || "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  {t.noTransactions || "No transactions found."}
                </TableCell>
              </TableRow>
            )}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
