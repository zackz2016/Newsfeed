import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        // 生成 sourcemap 以便调试
        sourcemap: true,
        // 分割代码以获得更好的缓存
        rollupOptions: {
            output: {
                manualChunks: {
                    'supabase': ['@supabase/supabase-js']
                }
            }
        }
    }
}) 