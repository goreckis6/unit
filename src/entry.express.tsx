import {
  createQwikCity,
  type PlatformNode,
} from "@builder.io/qwik-city/middleware/node";
import qwikCityPlan from "@qwik-city-plan";
import { manifest } from "@qwik-client-manifest";
import render from "./entry.ssr";
import express from "express";
import compression from "compression";

declare global {
  interface QwikCityPlatform extends PlatformNode {}
}

const { router, notFound, staticFile } = createQwikCity({
  render,
  qwikCityPlan,
  manifest,
});

const app = express();
app.use(compression());

// Static files
app.use(
  express.static("dist/client", {
    maxAge: "1y",
    immutable: true,
  })
);

// Qwik City router
app.use(router);
app.use(notFound);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`✅ SSR Server ready: http://${HOST}:${PORT}/`);
});
