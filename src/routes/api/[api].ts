import type { APIEvent } from '@solidjs/start/server'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { apiRouter } from '../../server/index'

const handler = (event: APIEvent) =>
    fetchRequestHandler({
        endpoint: '/api',
        req: event.request,
        router: apiRouter,
        createContext: () => event,
    })

export const GET = handler
export const POST = handler
