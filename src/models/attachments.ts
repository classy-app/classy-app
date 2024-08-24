import { relations } from 'drizzle-orm'
import { pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core'
import { createLinkedIdField, idField, nameField } from './base'
import { contents } from './classes'

export const attachmentTypes = pgEnum('attachment_type', ['file', 'link'])

export const attachments = pgTable('attachments', {
    id: idField,
    name: nameField,
    contentId: createLinkedIdField('cid').references(() => contents.id),
    content: varchar('content', { length: 8000 }).notNull(),
    type: attachmentTypes('type').notNull(),
})

export const attachmentsRelations = relations(attachments, ({ one }) => ({
    content: one(contents, {
        fields: [attachments.contentId],
        references: [contents.id],
    }),
}))
