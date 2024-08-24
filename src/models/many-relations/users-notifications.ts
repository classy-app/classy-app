import { relations } from 'drizzle-orm'
import { pgTable, primaryKey } from 'drizzle-orm/pg-core'
import { createIdField, createLinkedIdField, idField } from '../base'
import { users } from '../entities'
import { notifications } from '../notifications'

export const notificationsToUsers = pgTable(
    'relation__notifications_to_users',
    {
        id: createLinkedIdField('uid'),
        notificationId: createLinkedIdField('nid'),
    },
    t => ({
        pk: primaryKey({ columns: [t.id, t.notificationId] }),
    }),
)

export const notificationsToUsersrelations = relations(notificationsToUsers, ({ one }) => ({
    class: one(notifications, {
        fields: [notificationsToUsers.notificationId],
        references: [notifications.id],
    }),
    user: one(users, {
        fields: [notificationsToUsers.id],
        references: [users.id],
    }),
}))
