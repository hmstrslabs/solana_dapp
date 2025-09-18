import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            globals: {
                Buffer: true,
                global: true,
                process: true,
            },
            protocolImports: true,
        }),
    ],
    define: {
        global: 'globalThis',
        'process.env': {},
    },
    resolve: {
        alias: {
            'process/': 'process/browser.js',
            'process': 'process/browser.js',
            'stream': 'readable-stream',
            'buffer': 'buffer',
            'util': 'util',
        }
    },
    server: {
        port: 3000,
        open: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        commonjsOptions: {
            transformMixedEsModules: true,
        },
        rollupOptions: {
            external: [
                /^@trezor\/.*/, 'rpc-websockets'
            ],
            plugins: [
                nodePolyfills(),
            ],
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    solana: [
                        '@solana/web3.js',
                        '@solana/wallet-adapter-react',
                        '@solana/wallet-adapter-react-ui',
                        '@solana/wallet-adapter-wallets',
                    ],
                },
            },
        },
    },
    optimizeDeps: {
        include: [
            '@solana/web3.js',
            '@solana/wallet-adapter-react',
            '@solana/wallet-adapter-react-ui',
            '@solana/wallet-adapter-wallets',
            'bs58',
            'buffer',
            'process/browser.js',
        ],
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
        },
    },
});