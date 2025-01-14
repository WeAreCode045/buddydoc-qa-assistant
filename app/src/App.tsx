import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastProvider } from "@/providers/ToastProvider";
import Index from "@/pages/Index";
import Settings from "@/pages/Settings";

function App() {
  return (
    <Router>
      <ToastProvider />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;