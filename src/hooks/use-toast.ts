import { toast as sonnerToast } from "sonner";

export function toast(props: { title?: string; description?: string; variant?: "default" | "destructive" }) {
  sonnerToast(props.title, {
    description: props.description,
  });
}

export const useToast = () => {
  return {
    toast,
  };
};