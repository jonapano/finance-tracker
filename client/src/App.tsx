import { Switch, Route } from "wouter";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
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
  return (
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
  );
}

export default App;
