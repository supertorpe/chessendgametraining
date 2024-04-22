import { defineConfig, loadEnv } from 'vite';
import { splitVendorChunkPlugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { resolve } from 'path'

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
  return defineConfig({
    build: {
      sourcemap: true,
      outDir: '../docs',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          gdrive: resolve(__dirname, 'gdrive/index.html'),
        },
      },
    },
    plugins: [
      splitVendorChunkPlugin(),
      {
        name: "configure-response-headers",
        configureServer: (server) => {
          server.middlewares.use((req, res, next) => {
            res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
            if(req.url.includes('/gdrive/')) {
              res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
            } else {
              res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            }
            next();
          });
        },
      },
      viteStaticCopy({
        targets: [
          {
            src: 'node_modules/stockfish/src/stockfish*',
            dest: 'assets/stockfish/'
          },
          {
            src: 'node_modules/stockfish11/src/stockfish.asm.js',
            dest: 'assets/stockfish/'
          }
        ]
      }),
      VitePWA({
        devOptions: {
          enabled: true,
        },
        injectRegister: 'auto',
        registerType: 'autoUpdate',
        manifestFilename: 'manifest.json',
        includeAssets: ['*', '*/*', '*/*/*', '*/*/*/*'],
        manifest: {
          name: 'Chess Endgame Trainer',
          short_name: 'Chess Endgame Trainer',
          description: 'Chess Endgame Trainer',
          display: 'standalone',
          background_color: '#000000',
          theme_color: '#000000',
          icons: [
            {
              src: 'assets/icons/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'assets/icons/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'assets/icons/pwa-maskable-icon-336x336.png',
              sizes: '336x336',
              type: 'image/png',
              purpose: 'maskable',
            }
          ],
          "screenshots": [
            {
              "src": "assets/screenshots/screenshot_1.png",
              "sizes": "360x740",
              "type": "image/png",
              "form_factor": "narrow",
              "label": "Home"
            },
            {
              "src": "assets/screenshots/screenshot_2.png",
              "sizes": "360x740",
              "type": "image/png",
              "form_factor": "narrow",
              "label": "Menu"
            },
            {
              "src": "assets/screenshots/screenshot_3.png",
              "sizes": "360x740",
              "type": "image/png",
              "form_factor": "narrow",
              "label": "Menu"
            },
            {
              "src": "assets/screenshots/screenshot_4.png",
              "sizes": "360x740",
              "type": "image/png",
              "form_factor": "narrow",
              "label": "List"
            },
            {
              "src": "assets/screenshots/screenshot_5.png",
              "sizes": "360x740",
              "type": "image/png",
              "form_factor": "narrow",
              "label": "Game"
            },
            {
              "src": "assets/screenshots/screenshot_6.png",
              "sizes": "360x740",
              "type": "image/png",
              "form_factor": "narrow",
              "label": "Settings"
            },
            {
              "src": "assets/screenshots/screenshot_1.png",
              "sizes": "360x740",
              "type": "image/png",
              "form_factor": "wide",
              "label": "Home"
            },
            {
              "src": "assets/screenshots/screenshot_2.png",
              "sizes": "360x740",
              "type": "image/png",
              "form_factor": "wide",
              "label": "Menu"
            },
            {
              "src": "assets/screenshots/screenshot_3.png",
              "sizes": "360x740",
              "type": "image/png",
              "form_factor": "wide",
              "label": "Menu"
            },
            {
              "src": "assets/screenshots/screenshot_4.png",
              "sizes": "360x740",
              "type": "image/png",
              "form_factor": "wide",
              "label": "List"
            },
            {
              "src": "assets/screenshots/screenshot_5.png",
              "sizes": "360x740",
              "type": "image/png",
              "form_factor": "wide",
              "label": "Game"
            },
            {
              "src": "assets/screenshots/screenshot_6.png",
              "sizes": "360x740",
              "type": "image/png",
              "form_factor": "wide",
              "label": "Settings"
            }
          ]
        }
      })
    ]
  })
}