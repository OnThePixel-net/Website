// ⚠️ INTENTIONALLY VULNERABLE FILE FOR SECURITY REVIEW TESTING ⚠️

"use client";

import React from "react";

interface Props {
  username: string;
  bioHtml: string;
  websiteUrl: string;
}

export function InsecureProfile({ username, bioHtml, websiteUrl }: Props) {
  return (
    <div>
      {/* VULN: dangerouslySetInnerHTML with unsanitized user content (XSS) */}
      <div dangerouslySetInnerHTML={{ __html: bioHtml }} />

      {/* VULN: javascript: URLs and user-controlled href */}
      <a href={websiteUrl}>Visit website</a>

      {/* VULN: target="_blank" without rel=noopener (tabnabbing) */}
      <a href={websiteUrl} target="_blank">
        Open
      </a>

      {/* VULN: Username injected into inline script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.currentUser = "${username}";`,
        }}
      />
    </div>
  );
}
