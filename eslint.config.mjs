import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  // Must come last: disables ESLint rules that conflict with Prettier.
  eslintConfigPrettier,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      // Third-party agent skills installed project-locally; not our code.
      ".claude/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
