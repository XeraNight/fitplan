import { createProxyMiddleware } from "http-proxy-middleware";

// Routing table (Technical Design §5.2). It grows each sprint:
// Sprint 2 adds session (/sessions, /progress, /analytics), Sprint 3 adds audit (/audit).
export const ROUTES = [{ service: "routine", prefixes: ["/exercises", "/routines"] }];

// A service may sleep on the free plan (~1 min to wake up), so wait up to 70 s.
const TIMEOUT_MS = 70_000;

export function buildProxies(config) {
  return ROUTES.flatMap(({ service, prefixes }) => {
    const proxy = createProxyMiddleware({
      target: config.services[service],
      changeOrigin: true,
      proxyTimeout: TIMEOUT_MS,
      on: {
        proxyReq(proxyReq, req) {
          // the service trusts these headers, so they are always set by the gateway itself
          proxyReq.setHeader("x-user-id", req.user.id);
          proxyReq.setHeader("x-internal-key", config.internalKey);
          proxyReq.removeHeader("authorization");
        },
        error(err, req, res) {
          console.error(`proxy to ${service} failed:`, err.message);
          if (res.headersSent) return res.end();
          res.status(503).json({
            error: { code: "SERVICE_UNAVAILABLE", message: `${service} service is unavailable` },
          });
        },
      },
    });
    // mounted under /api: Express removes "/api", the service receives e.g. /routines/123
    const handles = (path) => prefixes.some((p) => path === p || path.startsWith(`${p}/`));
    return [["/api", (req, res, next) => (handles(req.path) ? proxy(req, res, next) : next())]];
  });
}
