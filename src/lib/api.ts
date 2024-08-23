import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client'
import type { ApiRouter } from '../server'

export const api = createTRPCProxyClient<ApiRouter>({
    links: [loggerLink(), httpBatchLink({ url: '/api' })],
})
