import { FlaskConical } from "lucide-react";

/** Small honest "demo data" chip used where a screen simulates future behavior. */
export function DemoNote({ children = "Demo data — this action is simulated" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-teal/25 bg-teal/5 px-2 py-1 text-xs font-medium text-teal-800">
      <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}
