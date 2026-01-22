import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { useLanguageStore } from "./lib/i18n";
import AddTransactionPage from "./pages/AddTransactionPage/AddTransactionPage";
import NotFound from "./pages/not-found";
import TransactionsPage from "./pages/TransactionsPage/TransactionsPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AddTransactionPage} />
      <Route path="/transactions" component={TransactionsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const fetchTranslations = useLanguageStore(
    (state) => state.fetchTranslations,
  );

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
