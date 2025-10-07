## Monorepo

This project is a monorepo that contains the core application and the trust application.
The root package.json is used to install dependencies for all apps, project wide tooling, etc.

We use a Monorepo not because it is easy, but because we thought it would be easy.

### Benefits of a Monorepo

Logical Grouping: Application-specific code, configurations, and dependencies are intrinsically tied to their respective applications. Keeping them within their dedicated directories (e.g., src/app-core) logically groups related files together, making the project structure more organized and easier to navigate.

Build Context: You will typically run build and development commands from within each application's directory. Placing application-specific configurations and dependencies there makes it clear which resources belong to which application and simplifies command execution.

Clear Separation of Concerns: When you have multiple apps in your monorepo (e.g., app-core and app-trust), each app should have its own dedicated directory containing all its required resources, configurations, and dependencies. This ensures clear separation and avoids confusion about which resources belong to which application.

Easier for Developers: When developers work on a specific application, they expect to find all relevant code, configurations, and resources within that application's directory. This makes the codebase more intuitive and reduces cognitive load when switching between different parts of the project.

## Monorepo Structure

- app-core: Core application code, shared utilities, and configurations
- app-trust: Trust application code, shared utilities, and configurations
- common: Shared code between apps, such as components, utils, and types

### Monorepo Practices

- Use relative imports whenever possible
- Use named ts named exports for cross package imports
- Use a package for base types, configs etc. Example tailwind-config and typescript-config

### Monorepo package versioning

It is still TBD on a tool to manage library versions across different apps/packages. Conflicting react versions etc can cause bugs.

## Some Features

- Rate Limited API routes
- Protection of sensitive routes
- Google authentication
- Typescript
- A complete API key system to create & revoke user keys

- Radix UI Primitives
- Tailwind CSS
- Fonts with next/font
- Icons from Lucide
- Beautiful dark mode with next-themes

- Class merging with taiwind-merge
- Animation with tailwindcss-animate
- Conditional classes with clsx
- Variants with class-variance-authority

## Notable OpenSource Projects Used.

- [Shadcn UI Components](https://ui.shadcn.com/)

## Developed by

Erik Koning

## Warranty

None, use at your own risk. Adjust all code to your use case.

## Collaborative Development

Format code with prettier: https://www.educative.io/answers/how-to-set-up-prettier-and-automatic-formatting-on-vs-code

Ensure the following prettier settings are set for your ide:
"editor.defaultFormatter": "esbenp.prettier-vscode"
"editor.formatOnSave": true
"editor.formatOnSaveMode": "modifications"

## To deploy to AWS

We utilize SST as a frameowork to work with AWS Cloud Development Kit to provision our Infrastructure as code (IaC)
https://docs.sst.dev/start/nextjs

visit: https://console.sst.dev to see logs and get alerts

## Localhost HTTPS - useful for testing stripe

brew install anchordotdev/tap/anchor

## Best Practices

- Break components into their reusable chunks, if it seems likely you or someone on the team might want any sub part of a component utilized somewhere else it should be a component.
- Separation of concerns: Avoid prop-drilling, raise state to as close to its root component as possible. for shared state look for global state managers such as redux.
- Event handling abstractions: Prefer handleXXXXX functions which contain the logic of actions that sub components cause. Instead of passing state variables, and their setter functions.
- Use custom hooks for encapsulating commonly used logic,
- Component to component must be loosely coupled, pages to components obviously tightly coupled.
- use "useMemo" for expensive calculations (many nested loops, or large data to process). Be cautious of re-renders, and setting state often
- for complex states that behave in a state machine type manor, try to combine with a string type so there are not race conditions.
- Retain a single source of truth, a void duplicating data or logic. Filters and page numbers are good things to keep in the url
- Some points taken from: https://www.youtube.com/watch?v=5r25Y9Vg2P4

## Debugging

Not all console outputs are visible in all NODE_ENV's, view the next.config.mjs for which ones have which console outputs.
