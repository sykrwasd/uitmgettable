// utils/gtag.ts
export const GA_TRACKING_ID = "G-LTZX9KYVLN";

// Log generic events
export const event = ({
  action,
  params,
}: {
  action: string;
  params?: { [key: string]: any };
}) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", action, params);
  }
};
