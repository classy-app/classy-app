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
import { getEntityFromToken } from './sessions'

export type Student = ReturnType<typeof pickSharableFields<(typeof students)['$inferInsert'] & EntityUser, boolean>>

export const getStudent = cache(async (token: string, id: string): Promise<DataOrErrorTuple<Student>> => {
    'use server'

    try {
        const [session, error] = await getEntityFromToken(token)
        if (error) return [null, error]

        const student = await db.query.students.findFirst({
            where: eq(students.id, id),
            with: {
                user: { with: { entity: true } },
            },
        })

        if (!student) return [null, new Error('Student does not exist')]

        return [
            pickSharableFields({
                ...student,
                ...student.user,
                ...student.user.entity,
            }, session.entity.id === id || session.entity.type === 'teacher' || session.entity.type === 'admin'),
            null,
        ]
    } catch (e) {
        console.error('Error while getting student:', e)
        return [null, new Error('Internal server error')]
    }
}, 'getStudent')

export const createStudentAction = action(
    async (token: string, data: StudentInsert): Promise<CustomResponse<DataOrErrorTuple<Student>>> => {
        'use server'

        try {
            const [session, error] = await getEntityFromToken(token)
            if (error) return json([null, error])
            if (session.entity.type !== 'admin') return json([null, new Error('Unauthorized')])

            const { success: parseSuccess, output: input } = safeParse(StudentInsertSchema, data)
            if (!parseSuccess) return json([null, new Error('Malformed request')])

            const ogStudent = await db.query.students.findFirst({ where: eq(students.id, input.id) })
            if (ogStudent) return json([null, new Error('Student already exists')])

            const [entity, user] = await insertEntityAndUser({
                ...input,
                ...(await generateSecurityFields(input.password)),
                type: 'student',
            })

            const [student] = await db.insert(students).values({ id: input.id }).returning()
            if (!student) throw new Error('Database did not return the created student')

            return json(
                [
                    pickSharableFields({
                        ...student,
                        ...user,
                        ...entity,
                    }, true),
                    null,
                ],
                { revalidate: getStudent.keyFor(token, student.id) },
            )
        } catch (e) {
            console.error('Error while creating student:', e)
            return json([null, new Error('Internal server error')])
        }
    },
)

export const deleteStudentAction = action(async (token: string, id: string): Promise<CustomResponse<DataOrErrorTuple<boolean>>> => {
    'use server'

    try {
        const [session, error] = await getEntityFromToken(token)
        if (error) return json([null, error])
        if (session.entity.type !== 'admin') return json([null, new Error('Unauthorized')])

        const student = await db.query.students.findFirst({ where: eq(students.id, id) })
        if (!student) return json([null, new Error('Student does not exist')])

        await db.delete(students).where(eq(students.id, id))
        await db.delete(users).where(eq(users.id, id))
        await db.delete(entities).where(eq(entities.id, id))

        return json([true, null], { revalidate: getStudent.keyFor(token, id) })
    } catch (e) {
        console.error('Error while deleting student:', e)
        return json([null, new Error('Internal server error')])
    }
})
