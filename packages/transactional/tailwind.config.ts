import sharedConfig, { configWithoutExtensions } from "@shared/tailwind-config";
import type { Config } from "tailwindcss";

// Cant use sharedConfig because it has plugins that are not currently supported in the email library
// Note also processing of css variables does not work with this config
const config: Pick<Config, "theme"> = {
  ...configWithoutExtensions,
  theme: {
    ...configWithoutExtensions.theme,
    extend: {
      ...configWithoutExtensions.theme.extend,
      colors: {
        ...configWithoutExtensions.theme.extend.colors,
        faintBlue: "#C5DAFC",
        purple: "#5a48d4",
        lightPurple: "#978de2",
        darkPurple: "#3a2cad",
        energeticPurple: "#6366f1",
        green: "#22c55e",
        lightGreen: "#71dd8f",
        darkGreen: "#01ff39",
        lightBlue: "#C5DAFC",
        darkBlue: "#0e1553",
        skyBlue: "#4f8df6",
      },
    },
  },
};

export default config;
