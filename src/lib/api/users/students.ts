import { type CustomResponse, action, cache, json } from '@solidjs/router'
import { eq } from 'drizzle-orm'
import { safeParse } from 'valibot'

import { entities, students, users } from '~/models'
import db from '~/lib/db'
import { type StudentInsert, StudentInsertSchema } from '~/schemas/insert'

import {
    type DataOrErrorTuple,
    type EntityUser,
    generateSecurityFields,
    insertEntityAndUser,
    pickSharableFields,
} from './utils'

export type Student = ReturnType<typeof pickSharableFields<typeof students['$inferInsert'] & EntityUser, boolean>>

export const getStudent = cache(async (id: string): Promise<DataOrErrorTuple<Student>> => {
    'use server'

    try {
        const student = await db.query.students.findFirst({
            where: eq(students.id, id),
            with: {
                user: { with: { entity: true } },
            },
        })

        if (!student) return [null, new Error('Student does not exist')]

        // TODO: Check auth token and include extra fields if needed
        return [
            pickSharableFields({
                ...student,
                ...student.user,
                ...student.user.entity,
            }),
            null,
        ]
    } catch (e) {
        console.error('Error while getting student:', e)
        return [null, new Error('Internal server error')]
    }
}, 'getStudent')

// TODO: Protect this route
export const createStudentAction = action(
    async (data: StudentInsert): Promise<DataOrErrorTuple<CustomResponse<Student>>> => {
        'use server'

        try {
            const { success: parseSuccess, output: input } = safeParse(StudentInsertSchema, data)
            if (!parseSuccess) return [null, new Error('Malformed request')]

            const ogStudent = await db.query.students.findFirst({ where: eq(students.id, input.id) })
            if (ogStudent) return [null, new Error('Student already exists')]

            const [entity, user] = await insertEntityAndUser({
                ...input,
                ...(await generateSecurityFields(input.password)),
                type: 'student',
            })

            const [student] = await db.insert(students).values({ id: input.id }).returning()
            if (!student) throw new Error('Database did not return the created student')

            return [
                json(
                    pickSharableFields({
                        ...student,
                        ...user,
                        ...entity,
                    }),
                    { revalidate: getStudent.keyFor(student.id) },
                ),
                null,
            ]
        } catch (e) {
            console.error('Error while creating student:', e)
            return [null, new Error('Internal server error')]
        }
    },
)

// TODO: Protect this route
export const deleteStudentAction = action(async (id: string): Promise<DataOrErrorTuple<CustomResponse<boolean>>> => {
    'use server'

    try {
        const student = await db.query.students.findFirst({ where: eq(students.id, id) })
        if (!student) return [null, new Error('Student does not exist')]

        await db.delete(students).where(eq(students.id, id))
        await db.delete(users).where(eq(users.id, id))
        await db.delete(entities).where(eq(entities.id, id))

        return [json(true, { revalidate: getStudent.keyFor(id) }), null]
    } catch (e) {
        console.error('Error while deleting student:', e)
        return [null, new Error('Internal server error')]
    }
})
