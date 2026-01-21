import { Button } from "./ui/button";
import { useFinanceStore } from "../lib/store";
import { TransactionList } from "./TransactionList";
import { ArrowRight, History } from "lucide-react";
import { Link } from "wouter";

export default function RecentTransactions() {
  const { transactions } = useFinanceStore();

  const recentTransactions = transactions.slice(0, 5);
  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          Recent Activity
        </h2>
        <Link to="/transactions">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:bg-primary/5"
          >
            Full History <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <TransactionList transactions={recentTransactions} onSort={() => {}} />
    </div>
  );
}
