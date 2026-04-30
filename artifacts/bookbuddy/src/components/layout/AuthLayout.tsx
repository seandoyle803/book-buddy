import { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
