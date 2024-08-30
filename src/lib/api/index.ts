export * from './users/admins'
export * from './users/students'
export * from './users/teachers'
export * from './users/sessions'

// export const createApiRoute =
//     <P extends { [k: string]: string }, S extends BaseSchemaAsync | undefined>(
//         handler: (
//             event: APIEvent & {
//                 data: S extends BaseSchemaAsync ? Output<S> : unknown
//                 params: P
//             },
//             // biome-ignore lint/suspicious/noExplicitAny: This doesn't really matter
//         ) => Promise<any>,
//         schema: S,
//     ) =>
//     async (event: APIEvent) => {
//         try {
//             const json = await event.request.json()
//             const data = await (schema ? parseAsync(schema, json) : json)

//             return await handler({ ...event, data, params: event.params as P })
//         } catch {
//             return new Response('Bad Request', { status: 400 })
//         }
//     }
