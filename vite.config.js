import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-rewrite-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url) return next()
          const [pathname, search] = req.url.split('?')
          const query = search ? '?' + search : ''
          
          if (pathname === '/timeline') {
            req.url = '/timeline.html' + query
          } else if (pathname === '/about') {
            req.url = '/about.html' + query
          } else if (pathname === '/events') {
            req.url = '/events.html' + query
          } else if (pathname === '/contact') {
            req.url = '/contact.html' + query
          } else if (pathname === '/login') {
            req.url = '/login.html' + query
          }
          next()
        })
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        timeline: resolve(__dirname, 'timeline.html'),
        about: resolve(__dirname, 'about.html'),
        events: resolve(__dirname, 'events.html'),
        contact: resolve(__dirname, 'contact.html'),
        login: resolve(__dirname, 'login.html')
      }
    }
  }
})
