const LEADCONNECTOR_SCRIPT_ID = "leadconnector-chat-widget";

const WIDGET_SELECTORS = [
  'script[src*="leadconnectorhq.com"]',
  'script[src*="msgsndr.com"]',
  'iframe[src*="leadconnectorhq.com"]',
  'iframe[src*="msgsndr.com"]',
  'iframe[src*="chat-widget"]',
  '[id*="leadconnector"]',
  '[id*="chat-widget"]',
  '[class*="leadconnector"]',
  '[class*="lc_text-widget"]',
  "chat-widget",
].join(",");

declare global {
  interface Window {
    leadConnector?: {
      chatWidget?: {
        closeWidget?: () => void;
      };
    };
  }
}

export function destroyLeadConnectorWidget() {
  try {
    window.leadConnector?.chatWidget?.closeWidget?.();
  } catch {
    // Widget may already be gone.
  }

  document.getElementById(LEADCONNECTOR_SCRIPT_ID)?.remove();

  document
    .querySelectorAll(WIDGET_SELECTORS)
    .forEach((el) => el.remove());

  delete window.leadConnector;
}

export { LEADCONNECTOR_SCRIPT_ID };
