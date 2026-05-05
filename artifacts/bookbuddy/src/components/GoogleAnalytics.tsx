import { useEffect } from "react";
import { useLocation } from "wouter";

declare function gtag(...args: unknown[]): void;

export function GoogleAnalytics() {
  const [location] = useLocation();

  useEffect(() => {
    gtag("event", "page_view", {
      page_path: location,
    });
  }, [location]);

  return null;
}
