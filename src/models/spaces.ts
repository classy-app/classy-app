// TODO: thread extends spaces
// TODO: private chats extends spaces

import { relations } from 'drizzle-orm'
import { pgTable, varchar } from 'drizzle-orm/pg-core'
import { idField } from './base'
import { users } from './entities'

export const spaces = pgTable('spaces', {
    id: idField,
})

export const spacesRelations = relations(spaces, ({ many }) => ({
    messages: many(messages),
}))

export const messages = pgTable('spaces_messages', {
    id: idField,
    body: varchar('body', { length: 8000 }),
    spaceId: idField,
    authorId: idField,
})

export const messagesRelations = relations(messages, ({ one }) => ({
    space: one(spaces, {
        fields: [messages.spaceId],
        references: [spaces.id],
    }),
    author: one(users, {
        fields: [messages.authorId],
        references: [users.id],
    }),
}))
