import { defineConfig } from 'vite';
import { splitVendorChunkPlugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  build: {
    sourcemap: true,
    outDir: 'docs'
  },
  plugins: [
    splitVendorChunkPlugin(),
    {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
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
      manifestFilename: 'manifest.json',
      includeAssets: ['*','*/*','*/*/*','*/*/*/*'],
      manifest: {
        name: 'Chess Endgame Trainer',
        short_name: 'chessendtrain',
        description: 'Chess Endgame Trainer',
        theme_color: '#ffffff',
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
            src: 'assets/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          }
        ]
      }
    })
  ],
});
