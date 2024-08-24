import { varchar } from 'drizzle-orm/pg-core'

// Snowflake IDs are u64s, whose max length is 20 characters
export const createIdField = (name: string) => varchar(name, { length: 20 }).notNull().primaryKey()
export const createLinkedIdField = (name: string) => createNullableLinkedIdField(name).notNull()
export const createNullableLinkedIdField = (name: string) => varchar(name, { length: 20 })

export const idField = createIdField('id')
// We limit the name arbitrarily to 200 characters
export const nameField = varchar('name', { length: 200 }).notNull()
