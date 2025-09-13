/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply CORS headers to all API routes
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.NODE_ENV === "production"
                ? process.env.NEXT_PUBLIC_APP_URL ||
                  "https://your-app.vercel.app"
                : "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
        ],
      },
      {
        // Security headers for all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://browser.sentry-cdn.com https://lumberjack.razorpay.com https://js.stripe.com https://*.clerk.accounts.dev https://clerk.com https://*.clerk.com",
              "worker-src 'self' blob:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com https://assets.ngrok.com https://cdn.ngrok.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https: wss: https://lumberjack.razorpay.com https://api.razorpay.com https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com",
              "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://js.stripe.com https://*.ngrok-free.dev",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      {
        // Suppress ngrok warning for external iframe sources
        source: "/scanner",
        headers: [
          {
            key: "ngrok-skip-browser-warning",
            value: "true",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
