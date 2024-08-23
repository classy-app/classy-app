import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    dbCredentials: {
        url: 'file:./drizzle/db.sqlite',
    },
    dialect: 'sqlite',
    out: './drizzle',
    migrations: {
        prefix: 'timestamp',
    },
})
