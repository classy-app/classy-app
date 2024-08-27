import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/models/index.ts',
    dbCredentials: {
        url: process.env.DATABASE_PATH,
    },
    out: './drizzle',
    migrations: {
        prefix: 'timestamp',
    },
})
