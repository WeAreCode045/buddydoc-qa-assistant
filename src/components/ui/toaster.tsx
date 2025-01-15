import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div
      className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
    >
      {toasts.map(({ id, title, description, action, type }) => (
        <div
          key={id}
          className={cn(
            "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
            type === "error" && "border-red-500 bg-red-50",
            type === "success" && "border-green-500 bg-green-50",
            !type && "border-gray-200 bg-white"
          )}
        >
          <div className="flex flex-col gap-1">
            {title && <div className="text-sm font-medium">{title}</div>}
            {description && (
              <div className="text-sm opacity-90">{description}</div>
            )}
          </div>
          {action}
        </div>
      ))}
    </div>
  );
}