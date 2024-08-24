import { relations } from 'drizzle-orm'
import { pgTable, primaryKey } from 'drizzle-orm/pg-core'
import { createIdField, createLinkedIdField, idField } from '../base'
import { assignments } from '../classes'
import { students } from '../entities'

export const studentsToAssignments = pgTable(
    'relation__students_to_assignments',
    {
        id: createLinkedIdField('sid'),
        assignmentId: createLinkedIdField('aid'),
    },
    t => ({
        pk: primaryKey({ columns: [t.id, t.assignmentId] }),
    }),
)

export const studentsToAssignmentsRelations = relations(studentsToAssignments, ({ one }) => ({
    assignment: one(assignments, {
        fields: [studentsToAssignments.assignmentId],
        references: [assignments.id],
    }),
    student: one(students, {
        fields: [studentsToAssignments.id],
        references: [students.id],
    }),
}))
