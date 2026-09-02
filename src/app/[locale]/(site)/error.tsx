"use client";

/**
 * The error boundary of the public site. It renders inside (site)/layout.tsx,
 * so a failed page still shows the header and the footer, exactly as it did
 * when this boundary sat in the root layout.
 */
export { default } from "@/components/page/ErrorScreen";
