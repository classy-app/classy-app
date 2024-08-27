import { relations } from 'drizzle-orm'
import { pgTable, primaryKey } from 'drizzle-orm/pg-core'
import { createLinkedIdField } from '../base'
import { classes } from '../classes'
import { students, teachers } from '../entities'

export const studentsToClasses = pgTable(
    'relation__students_to_classes',
    {
        id: createLinkedIdField('sid'),
        classId: createLinkedIdField('cid'),
    },
    t => ({
        pk: primaryKey({ columns: [t.id, t.classId] }),
    }),
)

export const teachersToClasses = pgTable(
    'relation__teachers_to_classes',
    {
        id: createLinkedIdField('tid'),
        classId: createLinkedIdField('cid'),
    },
    t => ({
        pk: primaryKey({ columns: [t.id, t.classId] }),
    }),
)

export const studentsToClassesRelations = relations(studentsToClasses, ({ one }) => ({
    class: one(classes, {
        fields: [studentsToClasses.classId],
        references: [classes.id],
    }),
    student: one(students, {
        fields: [studentsToClasses.id],
        references: [students.id],
    }),
}))

export const teachersToClassesRelations = relations(teachersToClasses, ({ one }) => ({
    class: one(classes, {
        fields: [teachersToClasses.classId],
        references: [classes.id],
    }),
    student: one(teachers, {
        fields: [teachersToClasses.id],
        references: [teachers.id],
    }),
}))
