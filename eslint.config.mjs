import { defineConfig, globalIgnores } from "eslint/config";
export default defineConfig([
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-unused-vars": "off",
      "no-unreachable": "error",
    },
  },
  globalIgnores([".next/**", "dist/**", "out/**", "work/**", "next-env.d.ts"]),
]);
