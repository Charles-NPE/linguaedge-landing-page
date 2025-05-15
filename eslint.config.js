
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "@typescript-eslint/eslint-plugin";
import a11y from "eslint-plugin-jsx-a11y";

export default [
  { ignores: ["dist"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "jsx-a11y": a11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...a11y.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "off",
    },
  }
];
