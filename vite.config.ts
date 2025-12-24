import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

// Load environment variables locally
dotenv.config()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/sentria-health/',
  server: {
    proxy: {
      '/api/uhn': {
        target: 'http://fhirtest.uhn.ca/baseR4',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/uhn/, ''),
        secure: false
      },
      '/api/hap': {
        target: 'https://fhir-r4.sandbox.hap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hap/, '')
      },
      '/api/synthea': {
        target: 'https://syntheticmass.mitre.org/v1/fhir',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/synthea/, '')
      },
      // SECURE BOX PROXY (Simulate Serverless locally)
      '/api/box-data': {
        target: 'https://api.box.com/2.0/folders/0/items',
        changeOrigin: true,
        rewrite: () => '',
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Inject Token from .env
            if (process.env.BOX_DEVELOPER_TOKEN) {
              proxyReq.setHeader('Authorization', `Bearer ${process.env.BOX_DEVELOPER_TOKEN}`);
            }
          });
        }
      },
      // PYTHON BACKEND PROXY
      '/api/ai': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ai/, '')
      }
    }
  }
})

