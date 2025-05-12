import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This ensures that the server redirects any 404 responses back to index.html
    // allowing React Router to handle the routing on the client side
    historyApiFallback: true,
  },
})
