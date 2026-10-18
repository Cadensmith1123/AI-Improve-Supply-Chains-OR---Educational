import react from '@vitejs/plugin-react'
import { loadEnv, defineConfig, type Plugin } from 'vite'
import { allowRouteSummaryRequest, RouteSummaryError, summarizeRoute } from './src/server/routeSummary.ts'

function routeSummaryDevApi(): Plugin {
  return {
    name: 'route-summary-dev-api',
    configureServer(server) {
      const environment = loadEnv(server.config.mode, process.cwd(), '')
      server.middlewares.use('/api/summarize-route', (request, response) => {
        if (request.method !== 'POST') {
          response.statusCode = 405
          response.setHeader('Allow', 'POST')
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ error: 'Use POST to summarize a route.' }))
          return
        }

        const forwardedFor = request.headers['x-forwarded-for']
        const forwardedAddress = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0]
        const clientId = forwardedAddress?.trim() || request.socket.remoteAddress || 'local'
        if (!allowRouteSummaryRequest(clientId)) {
          response.statusCode = 429
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ error: 'Too many summary requests. Wait a minute and try again.' }))
          return
        }

        void (async () => {
          try {
            const chunks: Buffer[] = []
            let bodySize = 0
            for await (const chunk of request) {
              const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
              bodySize += buffer.length
              if (bodySize > 12_000) {
                response.statusCode = 413
                response.setHeader('Content-Type', 'application/json')
                response.end(JSON.stringify({ error: 'Route data is too large to summarize.' }))
                return
              }
              chunks.push(buffer)
            }

            const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as { route?: unknown }
            const summary = await summarizeRoute(body.route, environment.OPENAI_API_KEY)
            response.statusCode = 200
            response.setHeader('Content-Type', 'application/json')
            response.end(JSON.stringify({ summary }))
          } catch (error) {
            const statusCode = error instanceof RouteSummaryError ? error.statusCode : 400
            const message = error instanceof Error ? error.message : 'Unable to summarize this route.'
            response.statusCode = statusCode
            response.setHeader('Content-Type', 'application/json')
            response.end(JSON.stringify({ error: message }))
          }
        })()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), routeSummaryDevApi()],
})
