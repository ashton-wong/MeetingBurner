import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Dashboard from "@/pages/Dashboard";
import SetupMeeting from "@/pages/SetupMeeting";
import ActiveMeeting from "@/pages/ActiveMeeting";
import NotFound from "@/pages/not-found";
import MeetingResults from "@/pages/MeetingResults";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/setup" component={SetupMeeting} />
  <Route path="/active" component={ActiveMeeting} />
  <Route path="/results" component={MeetingResults} />
  <Route path="/results/:id" component={MeetingResults} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Header />
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
