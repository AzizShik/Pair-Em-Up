import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer';
import sortMediaQueries from 'postcss-sort-media-queries';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  return {
    root: resolve(__dirname, 'src'),
    publicDir: resolve(__dirname, 'src/public'),
    base: mode === 'production' ? '/pair-em-up/' : '/',
    // base: '/',
    server: {
      port: 8080,
      open: true,
    },
    css: {
      devSourcemap: true,
      postcss: {
        plugins: [autoprefixer(), sortMediaQueries()],
      },
      preprocessorOptions: {
        scss: {},
      },
    },
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: resolve(__dirname, 'src/assetss/icons/*.*'),
            dest: resolve(__dirname, 'dist/assetss/icons/'),
          },
        ],
      }),
    ],
    build: {
      outDir: resolve(__dirname, 'dist/pair-em-up/'),
      emptyOutDir: true,
      minify: false,
      cssMinify: false,
      sourcemap: true,
      rollupOptions: {
        input: resolve(__dirname, 'src/index.html'),
        output: {
          entryFileNames: 'js/[name].js',
          chunkFileNames: 'js/[name].js',
          assetFileNames: ({ name }) => {
            if (/\.(css|scss)$/.test(name ?? '')) {
              return 'css/[name][extname]';
            }

            if (/\.(jpe?g|png|webp|avif|gif)$/.test(name ?? '')) {
              return 'assets/images/[name][extname]';
            }

            if (/\.(woff|woff2)$/.test(name ?? '')) {
              return 'assets/fonts/[name][extname]';
            }

            if (/\.svg$/.test(name ?? '')) {
              return 'assets/icons/[name][extname]';
            }

            if (/\.mp3$/.test(name ?? '')) {
              return 'assets/notes/[name][extname]';
            }

            return 'assets/[ext]/[name][extname]';
          },
        },
      },
    },
  };
});
