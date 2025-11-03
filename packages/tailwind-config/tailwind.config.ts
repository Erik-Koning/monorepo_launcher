import * as colors from "tailwindcss/colors";
import * as defaultTheme from "tailwindcss/defaultTheme";
import type { Config } from "tailwindcss";
import * as tailwindcssAnimate from "tailwindcss-animate";
import * as tailwindcssForms from "@tailwindcss/forms";
import * as tailwindcssTypography from "@tailwindcss/typography";

const { fontFamily } = defaultTheme;

export const configWithoutExtensions: Omit<Config, "content"> = {
  //mode: "jit",
  darkMode: ["class"],
  content: [],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
        aleo: ["var(--font-aleo)"],
        publicSans: ["var(--font-publicSans)"],
      },
      fontSize: {
        md: "0.90rem",
        sm: ".80rem",
        xxs: ".65rem", // You can adjust the size as needed
        menu: [
          "1.05rem",
          {
            lineHeight: "1.3rem",
            letterSpacing: "-0.01em",
            fontWeight: "500",
          },
        ],
      },
      fontWeight: {
        base: "380",
      },
      screens: {
        "2xl": "1360px",
        xs: "400px", //a pixel 7 is 416px wide ~916px tall
        xxs: "345px",
        start: "0px",
      },
      space: {
        "navbar-height": "var(--navbar-height)",
        "navbar-height-small": "var(--navbar-height-small)",
        "banner-height": "var(--banner-height)",
        "full-minus-navbar": "calc(100vh - var(--navbar-height))",
        "sideMenu-width": "var(--sideMenu-width)",
      },
      spacing: {
        "sideMenu-width": "var(--sideMenu-width)",
        "sideMenu-widthExpanded": "var(--sideMenu-widthExpanded)",
        "sideMenu-width-half": "calc(var(--sideMenu-width) / 2)",
        "sideMenu-widthExpanded-half": "calc(var(--sideMenu-widthExpanded) / 2)",
      },
      margin: {
        "navbar-height": "var(--navbar-height)",
        "navbar-height-small": "var(--navbar-height-small)",
        "banner-height": "var(--banner-height)",
        "full-minus-navbar": "calc(100vh - var(--navbar-height))",
      },
      padding: {
        "navbar-height": "var(--navbar-height)",
        "navbar-height-small": "var(--navbar-height-small)",
        "full-minus-navbar-small": "calc(100vh - var(--navbar-height-small))",
        "banner-height": "var(--banner-height)",
        "full-minus-navbar": "calc(100vh - var(--navbar-height))",
        "sideMenu-width": "var(--sideMenu-width)",
        "sideMenu-widthExpanded": "var(--sideMenu-widthExpanded)",
        "sideMenu-width-half": "calc(var(--sideMenu-width) / 2)",
        "sideMenu-widthExpanded-half": "calc(var(--sideMenu-widthExpanded) / 2)",
      },
      inset: {
        "navbar-height": "var(--navbar-height)",
        "navbar-height-small": "var(--navbar-height-small)",
        "full-minus-navbar-small": "calc(100vh - var(--navbar-height-small))",
        "banner-height": "var(--banner-height)",
        "navbar-banner-height": "calc(var(--navbar-height) + var(--banner-height))",
        "full-minus-navbar": "calc(100vh - var(--navbar-height))",
      },
      height: {
        "navbar-height": "var(--navbar-height)",
        "navbar-height-small": "var(--navbar-height-small)",
        "banner-height": "var(--banner-height)",
        "header-height": "var(--header-height)",
        "full-minus-navbar": "calc(100vh - var(--navbar-height))",
        "full-minus-navbar-small": "calc(100vh - var(--navbar-height-small))",
        "full-minus-navbar-banner": "calc(100vh - var(--navbar-height) - var(--banner-height))",
        "sideMenu-width": "var(--sideMenu-width)",
        "sideMenu-width-half": "calc(var(--sideMenu-width) / 2)",
        "sideMenu-widthExpanded-half": "calc(var(--sideMenu-widthExpanded) / 2)",
      },
      width: {
        "sideMenu-width": "var(--sideMenu-width)",
        "full-minus-sideMenu": "calc(100vw - var(--sideMenu-width))",
        "full-minus-sideMenuExpanded": "calc(100vw - var(--sideMenu-widthExpanded))",
        "sideMenu-width-half": "calc(var(--sideMenu-width) / 2)",
        "sideMenu-widthExpanded-half": "calc(var(--sideMenu-widthExpanded) / 2)",
      },
      backgroundImage: {
        "radial-gradient-blob-1": "radial-gradient(circle, rgba(255, 182, 193, 0.3) 30%, transparent 70%)",
        "radial-gradient-blob-2": "radial-gradient(circle, rgba(173, 216, 230, 0.5) 30%, transparent 70%)",
        "radial-gradient-blob-3": "radial-gradient(circle, rgba(144, 238, 144, 0.3) 0%, transparent 70%)",
      },
      colors: {
        flare: "var(--flare)",
        offBlack: "var(--offBlack)",
        outerspace: "#354445",
        skyBlue: "var(--skyBlue)",
        lightBlue: "#C5DAFC",
        darkBlue: "var(--darkBlue)",
        darkPurple: "var(--darkPurple)",
        energeticPurple: "var(--energeticPurple)",
        purple: "var(--purple)",
        lightPurple: "var(--lightPurple)",
        faintPurple: "var(--faintPurple)",
        ultraFaintPurple: "var(--ultraFaintPurple)",
        faintBlue: "var(--faintBlue)",
        faintGray: "var(--faintGray)",
        darkGray: "var(--darkGray)",
        darkGreen: "var(--darkGreen)",
        green: "var(--green)",
        greenEnergetic: "var(--greenEnergetic)",
        lightGreen: "var(--lightGreen)",
        muteGreen: "var(--muteGreen)",
        faintGreen: "var(--faintGreen)",
        background: {
          DEFAULT: "hsl(var(--background))",
          light: "hsl(var(--background-light))",
          faint: "hsl(var(--background-faint))",
          dark: "hsl(var(--background-dark))",
          blue: "hsl(var(--background-blue))",
          secondary: "hsl(var(--background-secondary))",
          securityCenter: "hsl(var(--background-security-center))",
        },
        text: {
          light: "hsl(var(--text-light))",
          dark: "hsl(var(--text-dark))",
          darkBlue: "var(--text-darkBlue)",
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          hovered: "var(--border-hovered)",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        danger: "hsl(var(--danger))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          light: "hsl(var(--primary-light))",
          dark: "hsl(var(--primary-dark))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          light: "hsl(var(--secondary-light))",
          dark: "var(--secondary-dark)",
          foreground: "hsl(var(--secondary-foreground))",
        },
        tertiary: {
          light: "hsl(var(--tertiary-light))",
          dark: "hsl(var(--tertiary-dark))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        "2xl": "1.5rem",
        xl: "1rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "2px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%, 75%": { transform: "translateX(-10px)" },
          "50%": { transform: "translateX(10px)" },
        },
        floatToCloud: {
          "0%, 100%": { transform: "translateY(0)" },
          "85%": { transform: "translateY(-9px)" },
        },
        fadeOut: {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeInDown: {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "70%": {
            opacity: "0.6",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideInFromTop: {
          "0%": { transform: "translateY(-200%)", opacity: "1" },
          "40%": { opacity: "1" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInFromBottom: {
          "0%": { transform: "translateY(200%)", opacity: "1" },
          "40%": { opacity: "1" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInFromLeft: {
          "0%": { transform: "translateX(-100%)", opacity: "1" },
          "40%": { opacity: "1" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInFromRight: {
          "0%": { transform: "translateX(100%)", opacity: "1" },
          "40%": { opacity: "1" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideOutToTop: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "40%": { opacity: "0.5" },
          "100%": { transform: "translateY(-100%)", opacity: "0" },
        },
        slideOutToBottom: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "40%": { opacity: "0.5" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        slideOutToLeft: {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "40%": { opacity: "0.5" },
          "100%": { transform: "translateX(-100%)", opacity: "0" },
        },
        slideOutToRight: {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "40%": { opacity: "0.5" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        slideLeft: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-80%)" },
        },
        "shine-infinite": {
          "0%": {
            transform: "skew(-12deg) translateX(-100%)",
          },
          "100%": {
            transform: "skew(-12deg) translateX(100%)",
          },
        },
        "shine-infinite-2": {
          "0%": {
            opacity: "0",
            transform: "translateX(-100%) translateY(-50%) rotate(30deg)",
          },
          "20%": {
            opacity: "0.8",
          },
          "80%": {
            opacity: "0.8",
          },
          "100%": {
            opacity: "0",
            transform: "translateX(100%) translateY(50%) rotate(30deg)",
          },
        },
        slideLeftSubtleSlow: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-3px)" },
        },
        slideLeftSubtleSlowUndo: {
          "0%": { transform: "translateX(-3px)" },
          "100%": { transform: "translateX(0)" },
        },
        slideRightSubtleSlow: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(3px)" },
        },
        rotate: {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
        "slow-ping": {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "80%, 100%": { transform: "scale(2)", opacity: "0" },
        },
      },
      animation: {
        fadeInDown: "fadeInDown 0.2s ease-in-out",
        "shine-infinite": "shine-infinite 2.7s ease-in-out infinite",
        "shine-infinite-2": "shine-infinite-2 1.5s ease-in-out infinite",
        "accordion-down": "accordion-down var(--accordion-duration, 0.2s) ease-out",
        "accordion-up": "accordion-up var(--accordion-duration, 0.2s) ease-out",
        shake: "shake 0.5s ease-in-out",
        floatToCloud: "floatToCloud 1s ease-in-out",
        fadeIn: "fadeIn 0.5s ease-in-out",
        fadeOut: "fadeOut 0.5s ease-in-out",
        slideInFromTop: "slideInFromTop 0.5s ease-in-out",
        slideInFromBottom: "slideInFromBottom 0.5s ease-in-out",
        slideInFromLeft: "slideInFromLeft 0.5s ease-in-out",
        slideInFromRight: "slideInFromRight 0.5s ease-in-out",
        slideOutToLeft: "slideOutToLeft 0.5s ease-in-out",
        slideOutToRight: "slideOutToRight 0.5s ease-in-out",
        slideOutToTop: "slideOutToTop 0.5s ease-in-out",
        slideOutToBottom: "slideOutToBottom 0.5s ease-in-out",
        slideLeft: "slideLeft 10s linear infinite",
        slideLeftSlow: "slideLeft 20s linear infinite",
        slideLeftSubtleSlow: "slideLeftSubtleSlow 0.4s ease-in-out forwards",
        slideLeftSubtleSlowUndo: "slideLeftSubtleSlowUndo 0.2s ease-in-out forwards",
        slideRightSubtleSlow: "slideRightSubtleSlow 0.4s ease-in-out forwards",
        rotate: "rotate 5s linear infinite",
        "slow-ping": "slow-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      transitionDuration: {
        0: "0ms",
        240: "240ms",
        2000: "2000ms",
      },
    },
  },
};

// We want each package to be responsible for its own content.
const config: Omit<Config, "content"> = {
  ...configWithoutExtensions,
  theme: {
    ...configWithoutExtensions.theme,
    extend: {
      ...configWithoutExtensions.theme.extend,
      colors: {
        ...colors,
        ...configWithoutExtensions.theme.extend.colors,
      },
    },
  },
  plugins: [
    (tailwindcssAnimate as any).default,
    //Tailwind globally applies styles with this plugin, we use the "class" strategy to avoid this, use form-[inputType] to apply styles
    (tailwindcssForms as any).default({
      strategy: "class",
    }),
    (tailwindcssTypography as any).default,
  ],
};
export default config;
