import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import LetterRain from "@/pages/games/letter-rain";
import LetterMemory from "@/pages/games/letter-memory";
import KeyboardMaze from "@/pages/games/keyboard-maze";
import KeyBarrier from "@/pages/games/key-barrier";
import MouseMaze from "@/pages/games/mouse-maze";
import DragDrop from "@/pages/games/drag-drop";
import Drawing from "@/pages/games/drawing";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/games/letter-rain" component={LetterRain} />
      <Route path="/games/letter-memory" component={LetterMemory} />
      <Route path="/games/keyboard-maze" component={KeyboardMaze} />
      <Route path="/games/key-barrier" component={KeyBarrier} />
      <Route path="/games/mouse-maze" component={MouseMaze} />
      <Route path="/games/drag-drop" component={DragDrop} />
      <Route path="/games/drawing" component={Drawing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
