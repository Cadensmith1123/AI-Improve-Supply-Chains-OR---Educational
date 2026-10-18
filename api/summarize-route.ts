
import type { IncomingMessage, ServerResponse } from 'node:http'

import {
  allowRouteSummaryRequest,
  RouteSummaryError,
  summarizeRoute,
} from '../src/server/routeSummary.js'

interface SummaryRequest extends IncomingMessage {
  body?: unknown
}

interface SummaryResponse extends ServerResponse {
  status: (statusCode: number) => SummaryResponse
  json: (body: unknown) => SummaryResponse
}

function clientIdFromRequest(request: SummaryRequest): string {
  const forwardedFor = request.headers['x-forwarded-for']

  const forwardedAddress = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0]

  return (
    forwardedAddress?.trim() ||
    request.socket.remoteAddress ||
    'unknown'
  )
}

export default async function handler(
  request: SummaryRequest,
  response: SummaryResponse
) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')

    return response.status(405).json({
      error: 'Use POST to summarize a route.',
    })
  }

  if (!allowRouteSummaryRequest(clientIdFromRequest(request))) {
    return response.status(429).json({
      error: 'Too many summary requests. Wait a minute and try again.',
    })
  }

  const body = request.body as
    | { route?: unknown }
    | undefined

  try {
    const summary = await summarizeRoute(
      body?.route,
      process.env.OPENAI_API_KEY
    )

    return response.status(200).json({
      summary,
    })
  } catch (error) {
    const statusCode =
      error instanceof RouteSummaryError
        ? error.statusCode
        : 500

    const message =
      error instanceof Error
        ? error.message
        : 'Unable to summarize this route.'

    return response.status(statusCode).json({
      error: message,
    })
  }
}
