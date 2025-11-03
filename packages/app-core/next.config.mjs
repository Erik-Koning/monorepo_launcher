import autoCert from "anchor-pki/auto-cert/integrations/next";
import path from "path";
import CopyPlugin from "copy-webpack-plugin";
import { createRequire } from "module";
import fs from "fs";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.NEXT_PUBLIC_STAGE)
  console.error("\n ***** NEXT_PUBLIC_STAGE is not set *****\nAre you sure you configured the environment variables correctly?\n");

/** @type {import('next').NextConfig} */
//const nextConfig = {};

//import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */
const nextConfig = {
  //To compile common first before app-core, ensures globals.css are found
  transpilePackages: ["@shared/common"],
  compiler: {
    //In prod or test environments, remove all console outputs except for info, warn, and error
    removeConsole: process.env.NODE_ENV.includes("prod") || process.env.NODE_ENV.includes("test") ? { exclude: ["info", "warn", "error"] } : false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
    dirs: ["app"], // Only run ESLint on the 'pages' and 'utils' directories during production builds (next build)
  },
  experimental: {
    //serverActions: true,
  },
  reactStrictMode: true,
  images: {
    unoptimized: true, //Upcoming: deployments on AWS does not support nextjs optimized images yet
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
        port: "",
        pathname: "/file/d/18ubSG3nbTFpy0J5nfmh2_hVne0wac6CI/preview",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
        port: "",
        pathname: "/file/d/1-c-wHRiDLgZQmTS-V811dXJ96nUmP94O/preview",
      },
      {
        protocol: "https",
        hostname: `${process.env.NEXT_PUBLIC_MARKETING_DOMAIN_NAME}`,
        port: "",
        pathname: "/wp-content/uploads/*",
      },
    ],
  },
  productionBrowserSourceMaps: true,
  turbopack: {
    rules: {
      // For pdf-lib and react-pdf pdf viewing.
      "*.node": {
        // This condition replicates the 'include' from the original webpack config,
        // ensuring the raw-loader only runs on files within these specific packages.
        condition: {
          any: [{ path: "**/node_modules/pdf-lib/**" }, { path: "**/node_modules/@react-pdf/**" }],
        },
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
    resolveAlias: {
      // Alias canvas to an empty module for react-pdf to work with Turbopack
      canvas: path.resolve(__dirname, "src/lib/mocks/empty-module.js"),
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "same-origin",
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "off",
          },
        ],
      },
    ];
  },
};

const withAutoCert = autoCert({
  enabledEnv: "", //set to development to enable auto-cert for local development
});

export default withAutoCert(nextConfig);
