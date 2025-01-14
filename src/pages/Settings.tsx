import WordPressSettings from "@/components/settings/WordPressSettings";
import OpenAISettings from "@/components/settings/OpenAISettings";

export default function Settings() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <WordPressSettings />
      <OpenAISettings />
    </div>
  );
}