import { createRouter, createRoute, createRootRoute } from "@tanstack/react-router";
import RootLayout from "./__root";
import LandingPage from "./index.tsx";
import BugsPage from "./bugs-page.tsx";
import HowItWorksPage from "./how-it-works.tsx";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const bugsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bugs",
  component: BugsPage,
});

const howItWorksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/how-it-works",
  component: HowItWorksPage,
});

const routeTree = rootRoute.addChildren([indexRoute, bugsRoute, howItWorksRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export { router };
