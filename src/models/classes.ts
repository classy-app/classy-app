import { relations } from 'drizzle-orm'
import { date, integer, pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core'
import { attachments } from './attachments'
import { createLinkedIdField, createNullableLinkedIdField, idField, nameField } from './base'
import { students } from './entities'
import { studentsToClasses, teachersToClasses } from './many-relations/classes-students+teachers'
import { spaces } from './spaces'

/// CLASSES

export const classes = pgTable('classes', {
    id: idField,
    name: nameField,
})

export const classesRelations = relations(classes, ({ many }) => ({
    topics: many(topics),
    threads: many(threads),
    attendances: many(attendances),
    students: many(studentsToClasses),
    teachers: many(teachersToClasses),
}))

/// TOPICS

export const topics = pgTable('classes_topics', {
    id: idField,
    classId: createLinkedIdField('cid').references(() => classes.id),
    name: nameField,
})

export const topicsRelations = relations(topics, ({ one, many }) => ({
    class: one(classes, {
        fields: [topics.classId],
        references: [classes.id],
    }),
    assignments: many(assignments),
    resources: many(resources),
}))

/// CONTENTS

export const contentTypes = pgEnum('classes_content_type', ['assignment', 'resource', 'thread', 'post'])

export const contents = pgTable('classes_contents', {
    id: idField,
    name: nameField,
    body: varchar('description', { length: 8000 }),
    posted: date('posted').notNull().defaultNow(),
    edited: date('edited'),
    type: contentTypes('type').notNull(),
})

export const contentsRelations = relations(contents, ({ many }) => ({
    attachments: many(attachments),
}))

/// ASSIGNMENTS

export const assignments = pgTable('classes_assignments', {
    id: idField.references(() => contents.id),
    topicId: createNullableLinkedIdField('tid').references(() => topics.id),
    due: date('due').notNull(),
    score: integer('score').notNull(),
})

export const assignmentsRelations = relations(assignments, ({ one }) => ({
    topic: one(topics, {
        fields: [assignments.topicId],
        references: [topics.id],
    }),
    data: one(contents, {
        fields: [assignments.id],
        references: [contents.id],
    }),
}))

/// RESOURCES

export const resources = pgTable('classes_resources', {
    id: idField.references(() => contents.id),
    topicId: createNullableLinkedIdField('tid').references(() => topics.id),
})

export const resourcesRelations = relations(resources, ({ one }) => ({
    topic: one(topics, {
        fields: [resources.topicId],
        references: [topics.id],
    }),
    data: one(contents, {
        fields: [resources.id],
        references: [contents.id],
    }),
}))

/// THREADS

export const threads = pgTable('classes_threads', {
    id: idField.references(() => spaces.id),
})

export const threadsRelations = relations(threads, ({ one }) => ({
    space: one(spaces, {
        fields: [threads.id],
        references: [spaces.id],
    }),
}))

/// ATTENDANCES

export const attendances = pgTable('classes_attendances', {
    id: idField,
    classId: createLinkedIdField('cid').references(() => classes.id),
    date: date('date').notNull(),
    code: varchar('code', { length: 6 }).notNull(),
})

export const attendancesRelations = relations(attendances, ({ one }) => ({
    class: one(classes, {
        fields: [attendances.classId],
        references: [classes.id],
    }),
}))

/// SUBMISSIONS

export const submissions = pgTable('classes_submissions', {
    id: idField,
    assignmentId: createLinkedIdField('aid').references(() => assignments.id),
    studentId: createLinkedIdField('sid').references(() => students.id),
    submitted: date('submitted').notNull().defaultNow(),
    score: integer('score'),
})

export const submissionsRelations = relations(submissions, ({ one }) => ({
    assignment: one(assignments, {
        fields: [submissions.assignmentId],
        references: [assignments.id],
    }),
    student: one(students, {
        fields: [submissions.studentId],
        references: [students.id],
    }),
}))

/// CLASS ENTITIES

export const classStudents = pgTable('classes_students', {
    id: idField.references(() => students.id),
    classId: createLinkedIdField('cid').references(() => classes.id),
})

export const classStudentsRelations = relations(classStudents, ({ one, many }) => ({
    class: one(classes, {
        fields: [classStudents.classId],
        references: [classes.id],
    }),
    student: one(students, {
        fields: [classStudents.id],
        references: [students.id],
    }),
    assignments: many(assignments),
}))
