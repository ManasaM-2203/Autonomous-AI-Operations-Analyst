import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useBackendStream } from "@/hooks/use-backend-stream";

export default function WarningNotifier() {
  const navigate = useNavigate();
  const { latestWarningEventId } = useBackendStream();
  const lastShownRef = useRef<string | null>(null);

  useEffect(() => {
    if (!latestWarningEventId) return;
    if (lastShownRef.current === latestWarningEventId) return;

    lastShownRef.current = latestWarningEventId;

    toast(
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-bold uppercase tracking-wide">WARNING</span>
        </div>
        <p className="text-sm text-foreground">There might be a threat to the system.</p>
        <button
          type="button"
          onClick={() => {
            toast.dismiss();
            navigate("/incidents");
          }}
          className="text-sm font-semibold text-[#D4A017] hover:underline"
        >
          check---&gt;
        </button>
      </div>,
      {
        id: `warning-${latestWarningEventId}`,
        duration: Infinity,
        closeButton: true,
        className: "border border-warning/30 bg-card/95 text-card-foreground shadow-xl backdrop-blur",
      },
    );
  }, [latestWarningEventId, navigate]);

  return null;
}
