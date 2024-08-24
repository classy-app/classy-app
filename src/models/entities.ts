import { relations } from 'drizzle-orm'
import { pgEnum, pgTable, text, varchar } from 'drizzle-orm/pg-core'
import { idField, nameField } from './base'
import { assignments } from './classes'
import { studentsToClasses, teachersToClasses } from './many-relations/classes-students+teachers'
import { notifications } from './notifications'

export const entityTypes = pgEnum('entity_type', ['admin', 'student', 'teacher'])

/**
 * Base user model for all users of the application, including admins
 */
export const entities = pgTable('entities', {
    id: idField,
    name: nameField,
    // Emails are limited to 256 characters with the < and >
    email: varchar('email', { length: 254 }).notNull(),
    // Max length of a phone number is 15 characters
    phone: varchar('phone', { length: 15 }).notNull(),
    // TODO: Add max length for avatar and sessions
    avatar: text('avatar'),
    // TODO: Include more information by making a table for sessions
    // sessions: text('sessions').array().notNull().default([]),
    twoFactorSecret: varchar('secret', { length: 20 }),
    type: entityTypes('type').notNull(),
})

/**
 * Users of the application interacting with the app's frontend, eg. teachers and students
 */
export const users = pgTable('users', {
    id: idField.references(() => entities.id),
})

export const usersRelations = relations(users, ({ one, many }) => ({
    entity: one(entities, {
        fields: [users.id],
        references: [entities.id],
    }),
    notifications: many(notifications),
}))

export const admins = pgTable('admins', {
    id: idField.references(() => entities.id),
})

export const adminRelations = relations(admins, ({ one }) => ({
    entity: one(entities, {
        fields: [admins.id],
        references: [entities.id],
    }),
}))

export const students = pgTable('students', {
    id: idField.references(() => users.id),
})

export const studentsRelations = relations(students, ({ one, many }) => ({
    classes: many(studentsToClasses),
    assignments: many(assignments),
    user: one(users, {
        fields: [students.id],
        references: [users.id],
    }),
}))

export const teachers = pgTable('teachers', {
    id: idField.references(() => users.id),
})

export const teachersRelations = relations(teachers, ({ one, many }) => ({
    classes: many(teachersToClasses),
    user: one(users, {
        fields: [teachers.id],
        references: [users.id],
    }),
}))
