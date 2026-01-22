import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "../../lib/i18n";
import { Header } from "../../components/Header";
import { TransactionList } from "../../components/TransactionList";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Search,
  SlidersHorizontal,
  ArrowLeft,
  Calendar as CalendarIcon,
  FilterX,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Link } from "wouter";
import { useFinanceStore } from "../../lib/store";
import { Summary } from "../../components/Summary";
import { Analytics } from "../../components/Analytics";
import {
  startOfMonth,
  endOfMonth,
  subDays,
  isWithinInterval,
  parseISO,
  startOfDay,
  endOfDay,
  isBefore,
} from "date-fns";

type DatePreset = "all" | "this-month" | "last-30-days" | "custom";

const ITEMS_PER_PAGE = 7;

export default function TransactionsPage() {
  const t = useTranslation();
  const { transactions, categories } = useFinanceStore();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"income" | "expense" | "all">(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [currentPage, setCurrentPage] = useState(1);

  const handleStartChange = (val: string) => {
    setCustomStart(val);
    if (customEnd && val && isBefore(parseISO(customEnd), parseISO(val))) {
      setCustomEnd(val);
    }
  };

  const handleEndChange = (val: string) => {
    if (customStart && val && isBefore(parseISO(val), parseISO(customStart))) {
      setCustomEnd(customStart);
    } else {
      setCustomEnd(val);
    }
  };

  const hasActiveFilters = useMemo(() => {
    return (
      search !== "" ||
      typeFilter !== "all" ||
      categoryFilter !== "all" ||
      datePreset !== "all"
    );
  }, [search, typeFilter, categoryFilter, datePreset]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, categoryFilter, datePreset, sortField, sortOrder]);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (typeFilter !== "all") {
      result = result.filter((tx) => tx.type === typeFilter);
    }

    if (categoryFilter !== "all") {
      result = result.filter((tx) => tx.category === categoryFilter);
    }

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.description.toLowerCase().includes(s) ||
          tx.category.toLowerCase().includes(s),
      );
    }

    if (datePreset !== "all") {
      let start: Date;
      let end: Date = endOfDay(new Date());

      if (datePreset === "this-month") {
        start = startOfMonth(new Date());
        end = endOfMonth(new Date());
      } else if (datePreset === "last-30-days") {
        start = startOfDay(subDays(new Date(), 30));
      } else if (datePreset === "custom" && customStart && customEnd) {
        start = startOfDay(parseISO(customStart));
        end = endOfDay(parseISO(customEnd));
      } else {
        start = new Date(0);
      }

      result = result.filter((tx) => {
        const txDate = new Date(tx.date);
        return isWithinInterval(txDate, { start, end });
      });
    }

    result.sort((a, b) => {
      const factor = sortOrder === "asc" ? 1 : -1;
      const valA =
        sortField === "amount" ? Number(a.amount) : new Date(a.date).getTime();
      const valB =
        sortField === "amount" ? Number(b.amount) : new Date(b.date).getTime();
      return (valA - valB) * factor;
    });

    return result;
  }, [
    transactions,
    search,
    typeFilter,
    categoryFilter,
    datePreset,
    customStart,
    customEnd,
    sortField,
    sortOrder,
  ]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const handleSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setDatePreset("all");
    setCustomStart("");
    setCustomEnd("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-10">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm" className="hover:bg-accent">
              <ArrowLeft className="mr-2 h-4 w-4" /> {t.back || "Back"}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            {t.transactions || "Transactions"}
          </h1>
        </div>

        <div className="grid gap-8 mb-8">
          <Summary transactions={filteredTransactions} />
          <Analytics transactions={filteredTransactions} />
        </div>

        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.searchPlaceholder}
                className="pl-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="w-full lg:w-[180px]">
              <Select
                value={typeFilter}
                onValueChange={(v: any) => setTypeFilter(v)}
              >
                <SelectTrigger className="bg-background">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={t.allTypes || "All Types"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t.filters?.allTypes || "All Types"}
                  </SelectItem>
                  <SelectItem value="income">{t.income || "Income"}</SelectItem>
                  <SelectItem value="expense">
                    {t.expense || "Expense"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full lg:w-[200px]">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-background">
                  <Tag className="mr-2 h-4 w-4" />
                  <SelectValue
                    placeholder={t.allCategories || "All Categories"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t.categories?.allCategories || "All Categories"}
                  </SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {t.categories?.[cat.id] || cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full lg:w-[180px]">
              <Select
                value={datePreset}
                onValueChange={(v: DatePreset) => setDatePreset(v)}
              >
                <SelectTrigger className="bg-background">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t.filters?.allTime || "All Time"}
                  </SelectItem>
                  <SelectItem value="this-month">
                    {t.filters?.thisMonth || "This Month"}
                  </SelectItem>
                  <SelectItem value="last-30-days">
                    {t.filters?.last30Days || "Last 30 Days"}
                  </SelectItem>
                  <SelectItem value="custom">
                    {t.filters?.dateRange || "Date Range"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <FilterX className="h-4 w-4" />
              </Button>
            )}
          </div>

          {datePreset === "custom" && (
            <div className="flex flex-wrap gap-4 p-4 bg-accent/30 rounded-xl border border-dashed border-primary/20 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground ml-1">
                  {t.filters?.startDate || "Start Date"}
                </label>
                <Input
                  type="date"
                  className="w-40 bg-background"
                  value={customStart}
                  onChange={(e) => handleStartChange(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground ml-1">
                  {t.filters?.endDate || "End Date"}
                </label>
                <Input
                  type="date"
                  className="w-40 bg-background"
                  min={customStart}
                  value={customEnd}
                  onChange={(e) => handleEndChange(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
            <TransactionList
              transactions={paginatedTransactions}
              onSort={handleSort}
              sortField={sortField}
              sortOrder={sortOrder}
            />

            {totalPages > 1 && (
              <div className="px-4 py-4 flex items-center justify-between border-t border-border/50 bg-muted/20">
                <p className="text-xs text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredTransactions.length,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {filteredTransactions.length}
                  </span>{" "}
                  results
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          className="h-8 w-8 p-0 text-xs"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ),
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
