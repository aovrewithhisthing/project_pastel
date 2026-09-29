/**
 * Input sanitization utility to prevent Stored XSS and content injection attacks.
 */

// Basic HTML entity encoding for high-risk characters
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

/**
 * Escapes unsafe HTML characters to prevent XSS payloads from executing in browser contexts.
 */
export function escapeHtml(str: string): string {
  if (!str) return "";
  return str.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Strips dangerous HTML tags (<script>, <iframe>, <object>, <embed>, event handlers)
 * while preserving safe plain-text or multi-line content.
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return "";
  
  // 1. Remove script tags and their inner content
  let cleaned = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // 2. Remove other executable/embed tags
  cleaned = cleaned.replace(/<\/?(iframe|object|embed|applet|meta|link|style)\b[^>]*>/gi, "");
  
  // 3. Remove inline JavaScript event handlers like onclick=, onerror=, onload=
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi, "");
  
  // 4. Neutralize javascript: or data: URLs in attributes
  cleaned = cleaned.replace(/href\s*=\s*["']?\s*(javascript|data):[^"'>\s]*/gi, "href=\"#\"");
  
  return cleaned.trim();
}
