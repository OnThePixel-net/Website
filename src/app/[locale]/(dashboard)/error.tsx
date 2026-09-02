"use client";

/**
 * The error boundary of the dashboard.
 *
 * The public site's boundary lives in the sibling (site) group and therefore
 * does not cover these routes; without this file a failing admin page would
 * fall through to Next's unstyled default. It shows the same screen, minus
 * the site chrome that the dashboard does not use.
 */
export { default } from "@/components/page/ErrorScreen";
