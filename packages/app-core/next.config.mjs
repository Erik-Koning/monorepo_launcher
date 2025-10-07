import autoCert from "anchor-pki/auto-cert/integrations/next";
import path from "path";
import CopyPlugin from "copy-webpack-plugin";
import { createRequire } from "module";
import fs from "fs";

const require = createRequire(import.meta.url);

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
  webpack: (config, options) => {
    if (!process.env.NEXT_PUBLIC_ROOT_DOMAIN_URL) throw new Error("NEXT_PUBLIC_ROOT_DOMAIN_URL not set");

    const bottomTwoDirectories = process.cwd().split(path.sep).slice(-2).join(path.sep);

    //Print current working directory
    console.log("Webpack - Current working directory:", bottomTwoDirectories);

    console.log("Webpack - isServer: ", options.isServer);
    console.log("Webpack - isDev: ", options.dev);
    console.log("Webpack - isEdgeRuntime: ", config.isEdgeServer);

    //For SVG Icons and animations, breaks some images
    config.module.rules.push({
      //test: /\.svg$/,
      //use: [{ loader: "@svgr/webpack", options: { icon: true } }],
    });

    // For pdf-lib and react-pdf pdf viewing, raw-loader allows these binary modules to be included in the bundle as strings rather than trying to process them as JavaScript modules.
    config.module.rules.push({
      test: /\.node$/,
      use: "raw-loader",
      include: [path.resolve(process.cwd(), "node_modules/pdf-lib"), path.resolve(process.cwd(), "node_modules/@react-pdf")],
    });

    /*if (options.isServer) {
      config.externals = {
        ...config.externals,
        stripe: "commonjs stripe", // Exclude stripe from Webpack bundling
      };
    }*/

    if (options.isServer && false) {
      /* * * * * * * * * * *
       * copy the prisma client shared object(so) file for Linux so prisma can work efficiently to query the database.
       * * * * * * * * * * */
      // 1. Find the package.json for @prisma/client.
      const prismaClientPkgJsonPath = require.resolve("@prisma/client/package.json");
      console.log("prismaClientPkgJsonPath", prismaClientPkgJsonPath);
      // This gives you something like:
      // /your/project/node_modules/.pnpm/@prisma+client@6.3.1_.../node_modules/@prisma/client/package.json

      // 2. Get the directory of the @prisma/client package.
      const prismaClientDir = path.dirname(prismaClientPkgJsonPath);

      // 3. Get the directory of the node_modules directory two levels up.
      const prismaClientNodeModulesDir = path
        .dirname(prismaClientPkgJsonPath) // go up one directory
        .split(path.sep) // split path into segments
        .slice(0, -2) // remove last two segments
        .join(path.sep);

      // 4. Build the path to the native binary inside `.prisma/client`.
      const engineFileName = "libquery_engine-linux-arm64-openssl-3.0.x.so.node";
      const enginePath = path.join(prismaClientNodeModulesDir, ".prisma", "client", engineFileName);

      // Set PRISMA_QUERY_ENGINE_LIBRARY environment variable to the engine path
      //process.env.PRISMA_QUERY_ENGINE_LIBRARY = enginePath;

      /*
      if (fs.existsSync(enginePath)) {
        // Copy the file to the output root.
        config.plugins.push(
          new CopyPlugin({
            patterns: [
              {
                from: enginePath,
                to: "./", // copy to the output root (or adjust relative to your server bundle)
              },
            ],
          })
        );
      } else {
        console.error("Prisma engine file does not exist at:", enginePath);
        //exit the process
        process.exit(1);
      }
      */
    }

    // The stack trace line numbers might not match. Turning on sourcemaps when building your Next.js app can fix this. (https://docs.sst.dev/constructs/NextjsSite#logging)
    if (!options.dev) {
      config.devtool = "source-map";
    }

    config.resolve.alias.canvas = false; //for react-pdf
    return config;
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
