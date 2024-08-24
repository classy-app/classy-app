import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/models/index.ts',
    dbCredentials: {
        url: 'postgres://postgres:postgres@localhost:5432/drizzle',
    },
    out: './drizzle',
    migrations: {
        prefix: 'timestamp',
    },
})
