import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { format } from "date-fns";
import { Transaction } from "../lib/store";
import { useFinanceStore } from "../lib/store";

interface AnalyticsProps {
  transactions: Transaction[];
}

const COLORS = [
  "#2563EB",
  "#16A34A",
  "#DC2626",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
];

export function Analytics({ transactions }: AnalyticsProps) {
  const { baseCurrency, exchangeRates } = useFinanceStore();
  const hasData = transactions.length > 0;

  const getAmountInBase = (tx: Transaction) => {
    const rate = exchangeRates[tx.currency] || 1;
    return Number(tx.amount) / rate;
  };

  // Process data for category pie chart
  const categoryData = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, curr) => {
        const amountInBase = getAmountInBase(curr);
        const existing = acc.find((item) => item.name === curr.category);
        if (existing) {
          existing.value += amountInBase;
        } else {
          acc.push({ name: curr.category, value: amountInBase });
        }
        return acc;
      },
      [] as { name: string; value: number }[],
    )
    .sort((a, b) => b.value - a.value);

  // Process data for monthly income vs expense
  const monthlyData = transactions
    .reduce(
      (acc, curr) => {
        const month = format(new Date(curr.date), "MMM");
        const amountInBase = getAmountInBase(curr);
        const existing = acc.find((item) => item.name === month);

        if (existing) {
          if (curr.type === "income") existing.income += amountInBase;
          else existing.expense += amountInBase;
        } else {
          acc.push({
            name: month,
            income: curr.type === "income" ? amountInBase : 0,
            expense: curr.type === "expense" ? amountInBase : 0,
          });
        }
        return acc;
      },
      [] as { name: string; income: number; expense: number }[],
    )
    .slice(-6);

  return (
    <Card className="mb-8 border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold font-display text-primary">
          Financial Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-2 border-2 border-dashed rounded-xl border-muted">
            <p className="text-muted-foreground font-medium">
              No financial data yet
            </p>
          </div>
        ) : (
          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="categories">Expenses by Category</TabsTrigger>
              <TabsTrigger value="trends">Income vs Expenses</TabsTrigger>
            </TabsList>

            <TabsContent
              value="categories"
              className="h-[320px] w-full outline-none"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      `${baseCurrency} ${value.toLocaleString()}`
                    }
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      backgroundColor: "hsl(var(--card))",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent
              value="trends"
              className="h-[320px] w-full outline-none"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--muted)/0.3)"
                  />
                  <XAxis
                    dataKey="name"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${baseCurrency}${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                    formatter={(value: number) =>
                      `${baseCurrency} ${value.toLocaleString()}`
                    }
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      backgroundColor: "hsl(var(--card))",
                    }}
                  />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#16A34A"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="expense"
                    name="Expenses"
                    fill="#DC2626"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
