import WordPressSettings from "../components/settings/WordPressSettings";
import OpenAISettings from "../components/settings/OpenAISettings";
import { Button } from "../components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Home
        </Button>
      </div>
      <WordPressSettings />
      <OpenAISettings />
    </div>
  );
}