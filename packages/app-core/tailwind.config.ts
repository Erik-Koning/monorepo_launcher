import type { Config } from "tailwindcss";
import sharedConfig from "@shared/tailwind-config";

const config: Pick<Config, "content" | "presets"> = {
  content: ["../common/src/**/*.{js,ts,jsx,tsx}", "../common/src/**/*.css", "./src/**/*.{js,ts,jsx,tsx}", "./src/**/*.css"], // Include CSS files in src directory
  presets: [sharedConfig],
};

export default config;
