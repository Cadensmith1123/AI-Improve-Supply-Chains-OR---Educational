import { useEffect, useState } from 'react'
import type { SupplyRoute } from '../../data/routes'
import { createRouteSummaryPayload } from '../../utils/routeSummaryPayload'

type SummaryStatus = 'idle' | 'loading' | 'ready' | 'error'
type Placement = 'featured' | 'detail'

interface SummaryResponse {
  summary?: string
  error?: string
}

interface RouteSummaryProps {
  route: SupplyRoute
  placement: Placement
}

function renderSummary(summary: string) {
  return summary.split(/(\*\*[^*]+\*\*)/g).map((segment, index) => {
    if (segment.startsWith('**') && segment.endsWith('**')) {
      return <strong key={index}>{segment.slice(2, -2)}</strong>
    }
    return segment
  })
}

async function requestSummary(route: SupplyRoute) {
  const response = await fetch('/api/summarize-route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ route: createRouteSummaryPayload(route) }),
  })
  const result = await response.json() as SummaryResponse
  if (!response.ok || !result.summary) {
    throw new Error(result.error || 'Could not create a route summary. Try again.')
  }

  return result.summary
}

function RouteSummary({ route, placement }: RouteSummaryProps) {
  const [status, setStatus] = useState<SummaryStatus>(placement === 'detail' ? 'loading' : 'idle')
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (placement !== 'detail') return

    let isCurrent = true
    requestSummary(route)
      .then((result) => {
        if (isCurrent) {
          setSummary(result)
          setStatus('ready')
        }
      })
      .catch((requestError: unknown) => {
        if (isCurrent) {
          setError(requestError instanceof Error ? requestError.message : 'Could not create a route summary. Try again.')
          setStatus('error')
        }
      })

    return () => { isCurrent = false }
  }, [placement, route])

  const handleClick = async () => {
    if (status === 'loading') return

    setStatus('loading')
    setError('')
    try {
      setSummary(await requestSummary(route))
      setStatus('ready')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create a route summary. Try again.')
      setStatus('error')
    }
  }

  return (
    <section className={`route-summary route-summary-${placement}`} aria-label="Route summary">
      <header className="route-summary-heading">
        <p className="eyebrow">AI-ASSISTED ROUTE BRIEF</p>
        <h2>Route summary</h2>
        <p className="page-description">
          {placement === 'detail'
            ? 'A concise summary of the route and its available operating data.'
            : 'Generate a concise overview of this run and its available operating data.'}
        </p>
      </header>

      {placement === 'featured' || status === 'error' ? (
        <button
          className="summary-button"
          type="button"
          onClick={handleClick}
          disabled={status === 'loading'}
        >
          {status === 'loading'
            ? 'Summarizing route...'
            : status === 'ready'
              ? 'Refresh Summary'
              : status === 'error' ? 'Try Again' : 'Summarize Route'}
        </button>
      ) : status === 'loading' ? (
        <p className="summary-pending" role="status">Generating route summary...</p>
      ) : null}

      {error && <p className="summary-error" role="alert">{error}</p>}
      {status === 'ready' && <p className="route-summary-text" aria-live="polite">{renderSummary(summary)}</p>}
    </section>
  )
}

export default RouteSummary