import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as models from '~/models'

const client = new pg.Client({
    connectionString: process.env.DATABASE_PATH,
})

await client.connect()

export const db = drizzle(client, { schema: models })

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DATABASE_PATH: string
        }
    }
}
