import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { parse } from 'toml';
import path from 'path';
import { readFileSync } from 'fs';

export default defineConfig(() => {
  const appConfig = parse(readFileSync(process.env.CONFIG_PATH ?? './config.toml', 'utf-8'));

  return {
    plugins: [solidPlugin()],
    server: {
      port: 3000,
    },
    build: {
      target: 'esnext',
    },
    define: {
      __DOMAIN__: `"${appConfig.application.domain}"`,
      __ENVIRONMENT__: `"${appConfig.application.environment}"`,
      __API_DOMAIN__: `"${appConfig.application.api_domain}"`,
      __API_ROOT_DOMAIN__: `"${appConfig.application.api_root_domain}"`,
      __TURNSTILE_SITEKEY__: `"${appConfig.integration.turnstile.site_key}"`,
      __IS_DEMO_MODE__: `${appConfig.application.is_demo_mode}`
    },
    resolve: {
      alias: {
        'src': path.resolve(__dirname, 'src'),
      }
    },
    optimizeDeps: {
      // Add both @codemirror/state and @codemirror/view to included deps for optimization
      include: ["@codemirror/state", "@codemirror/view"],
    },
  }
});
