import { relations } from 'drizzle-orm'
import { pgEnum, pgTable } from 'drizzle-orm/pg-core'
import { createIdField, createLinkedIdField, idField } from './base'
import { users } from './entities'

export const notificationTypes = pgEnum('notification_type', [
    'system',
    'assignment',
    'resource',
    'submission',
    'comment',
    'chat_create',
    'chat_reply',
])

export const notifications = pgTable('notifications', {
    id: idField,
    contextParentId: createLinkedIdField('cpid'),
    contextChildId: createLinkedIdField('ccid'),
    type: notificationTypes('type').notNull(),
})

export const notificationRelations = relations(notifications, ({ many }) => ({
    notifees: many(users),
}))
