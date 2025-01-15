import { useToast } from "@/hooks/use-toast";

const Toaster = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-0 right-0 p-4">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <div className="toast-content">
            {toast.message}
          </div>
          <button onClick={() => removeToast(toast.id)}>Close</button>
        </div>
      ))}
    </div>
  );
};

export default Toaster;