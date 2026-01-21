import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { RadioGroup } from "./ui/radio-group";
import { useToast } from "../hooks/use-toast";
import { useState, useEffect } from "react";
import { Plus, Loader2, Check, X, Trash2 } from "lucide-react";
import { Transaction } from "../lib/store";
import { useFinanceStore } from "../lib/store";

const transactionFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.string().min(1, "Amount is required"),
  type: z.string().min(1, "Type is required"),
  category: z.string().min(1, "Category is required"),
  currency: z.string().min(1, "Currency is required"),
  date: z.date(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  transaction?: Transaction;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function TransactionForm({
  transaction,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: TransactionFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;

  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  const {
    categories,
    addCategory,
    deleteCategory,
    addTransaction,
    updateTransaction,
  } = useFinanceStore();

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [currencies, setCurrencies] = useState<string[]>([
    "EUR",
    "USD",
    "GBP",
    "ALL",
  ]);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false);

  useEffect(() => {
    async function fetchCurrencies() {
      setIsLoadingCurrencies(true);
      try {
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await response.json();
        if (data && data.rates) {
          setCurrencies(Object.keys(data.rates).sort());
        }
      } catch (error) {
        console.error("Failed to fetch currencies:", error);
      } finally {
        setIsLoadingCurrencies(false);
      }
    }
    fetchCurrencies();
  }, []);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: "",
      amount: "",
      type: "expense",
      category: "food",
      currency: "EUR",
      date: new Date(),
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        form.reset({
          description: transaction.description || "",
          amount: String(transaction.amount),
          type: transaction.type as "income" | "expense",
          category: transaction.category,
          currency: (transaction as any).currency || "EUR",
          date: new Date(transaction.date),
        });
      } else {
        form.reset({
          description: "",
          amount: "",
          type: "expense",
          category: "food",
          currency: "EUR",
          date: new Date(),
        });
      }
    }
  }, [isOpen, transaction, form]);

  const handleAddCustomCategory = () => {
    if (!newCategoryName.trim()) return;

    const id = newCategoryName.toLowerCase().trim().replace(/\s+/g, "-");

    addCategory({ id, label: newCategoryName.trim() });

    form.setValue("category", id);

    setNewCategoryName("");
    setIsCreatingCategory(false);
  };

  const onSubmit = async (data: TransactionFormValues) => {
    setIsPending(true);
    try {
      const transactionData = {
        description: data.description,
        amount: parseFloat(data.amount),
        currency: data.currency,
        type: data.type,
        category: data.category,
        date: data.date.toISOString(),
      };

      if (transaction) {
        updateTransaction(transaction.id, transactionData as any);
        toast({
          title: "Updated",
          description: "Transaction saved successfully.",
        });
      } else {
        addTransaction({ ...transactionData, id: Date.now() } as Transaction);
        toast({
          title: "Success",
          description: "Transaction created successfully.",
        });
      }

      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="lg"
            className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Transaction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-display text-primary">
            {transaction ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-4"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div onClick={() => field.onChange("income")}>
                        <label
                          className={`flex flex-col items-center justify-between rounded-xl border-2 p-4 hover:cursor-pointer transition-all ${
                            field.value === "income"
                              ? "border-green-500 text-green-600 bg-green-500/5"
                              : "border-muted"
                          }`}
                        >
                          <span className="text-lg font-bold">Income</span>
                        </label>
                      </div>
                      <div onClick={() => field.onChange("expense")}>
                        <label
                          className={`flex flex-col items-center justify-between rounded-xl border-2 p-4 hover:cursor-pointer transition-all ${
                            field.value === "expense"
                              ? "border-red-500 text-red-600 bg-red-500/5"
                              : "border-muted"
                          }`}
                        >
                          <span className="text-lg font-bold">Expense</span>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        {...field}
                        className="text-lg font-mono font-medium focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Currency{" "}
                      {isLoadingCurrencies && (
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      )}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="focus:ring-primary">
                          <SelectValue placeholder="USD" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((code) => (
                          <SelectItem key={code} value={code}>
                            {code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Monthly Grocery"
                      {...field}
                      className="focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  {isCreatingCategory ? (
                    <div className="flex gap-2 animate-in slide-in-from-left-2 duration-200">
                      <Input
                        autoFocus
                        placeholder="New category name..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddCustomCategory()
                        }
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={handleAddCustomCategory}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsCreatingCategory(false)}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <Select
                      onValueChange={(v) =>
                        v === "create-new"
                          ? setIsCreatingCategory(true)
                          : field.onChange(v)
                      }
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="focus:ring-primary">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => {
                          const isSelected = field.value === cat.id;
                          const isConfirming = deletingCatId === cat.id;

                          return (
                            <div
                              key={cat.id}
                              className="relative flex items-center group px-1"
                            >
                              <SelectItem
                                value={cat.id}
                                className={`flex-1 transition-all cursor-pointer pl-2 pr-16 ${isSelected ? "bg-primary/10 text-primary border-primary font-bold" : "border-l-4 border-transparent"}`}
                              >
                                {cat.label}
                              </SelectItem>
                              <div className="absolute right-2 flex items-center gap-1 z-50">
                                {isConfirming ? (
                                  <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-green-600"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        deleteCategory(cat.id);
                                        if (field.value === cat.id)
                                          field.onChange("");
                                        setDeletingCatId(null);
                                      }}
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-muted-foreground hover:bg-muted"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setDeletingCatId(null);
                                      }}
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="absolute right-2 z-50">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button
                                          type="button"
                                          className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                          }}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        className="w-48 p-3 shadow-xl border-destructive/20 z-[100]"
                                        side="left"
                                        align="center"
                                        onOpenAutoFocus={(e) =>
                                          e.preventDefault()
                                        }
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                        }}
                                      >
                                        <div className="space-y-3">
                                          <p className="text-xs font-medium leading-none text-center">
                                            Are you sure?
                                          </p>
                                          <div className="flex gap-2">
                                            <Button
                                              size="sm"
                                              variant="destructive"
                                              className="h-7 flex-1 text-[11px]"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                deleteCategory(cat.id);
                                                if (field.value === cat.id)
                                                  field.onChange("");
                                                toast({
                                                  title: "Deleted",
                                                  description:
                                                    "Category removed.",
                                                });
                                              }}
                                            >
                                              Delete
                                            </Button>
                                          </div>
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <SelectSeparator />
                        <SelectItem
                          value="create-new"
                          className="text-primary font-bold"
                        >
                          <span className="flex items-center gap-2">
                            <Plus className="h-3 w-3" /> Add a new category
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="min-w-[150px]"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Save Transaction"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
