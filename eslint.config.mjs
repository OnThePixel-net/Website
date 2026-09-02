// ESLint flat config. ESLint 10 no longer reads .eslintrc.json, and `next lint`
// was removed in Next 16 — the `lint` script therefore calls `eslint` directly.
//
// eslint-config-next 16 already ships flat configs (its `core-web-vitals`
// entry point exports a ready-made config array), so no FlatCompat bridge is
// needed here.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import tsParser from "@typescript-eslint/parser";
import drizzle from "eslint-plugin-drizzle";

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".open-next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  ...nextCoreWebVitals,

  {
    // eslint-config-next 16.3.4 still pulls eslint-plugin-react 7.37.5, whose
    // React auto-detection calls `context.getFilename()` — removed in ESLint
    // 10, so every react/* rule throws while loading. Pinning the version here
    // skips detection entirely. Keep in sync with the `react` dependency.
    settings: { react: { version: "19.2" } },
    rules: {
      // Carried over from the previous .eslintrc.json.
      "react/no-unescaped-entities": "off",
      "@next/next/no-page-custom-font": "off",

      // New in eslint-plugin-react-hooks 7 and an error in its recommended
      // config. Every hit in this repo is a deliberate "load once on mount"
      // or "resync from props when a dialog opens" effect; silencing them
      // properly means moving to Suspense / useSyncExternalStore, which is a
      // behaviour change, not a lint fix. Kept visible as a warning until
      // those components are reworked.
      "react-hooks/set-state-in-effect": "warn",
    },
  },

  {
    // Same story for plain JS: next's bundled babel parser returns a scope
    // manager without `addGlobals()`, which ESLint 10 requires. The repo's own
    // @typescript-eslint/parser handles .js/.mjs/.cjs just as well.
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: { parser: tsParser },
  },

  {
    // Drizzle is used in src/lib/db and the API routes. These two rules guard
    // against the single most destructive mistake in that stack: a `delete()`
    // or `update()` that forgot its `where()` and rewrites the whole table.
    // `drizzleObjectName` keeps the rules off unrelated `.delete()` calls
    // (Map, Set, …) — `db` is the local handle, `getDb()` the factory in
    // src/lib/db/index.ts.
    files: ["src/**/*.{ts,tsx}"],
    plugins: { drizzle },
    rules: {
      "drizzle/enforce-delete-with-where": [
        "error",
        { drizzleObjectName: ["db", "getDb"] },
      ],
      "drizzle/enforce-update-with-where": [
        "error",
        { drizzleObjectName: ["db", "getDb"] },
      ],
    },
  },
];

export default eslintConfig;
