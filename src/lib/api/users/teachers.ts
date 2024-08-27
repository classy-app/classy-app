import { type CustomResponse, action, cache, json } from '@solidjs/router'
import { eq } from 'drizzle-orm'
import { safeParse } from 'valibot'

import { entities, teachers, users } from '~/models'
import db from '~/lib/db'
import { type TeacherInsert, TeacherInsertSchema } from '~/schemas/insert'

import {
    type DataOrErrorTuple,
    type EntityUser,
    generateSecurityFields,
    insertEntityAndUser,
    pickSharableFields,
} from './utils'

export type Teacher = ReturnType<typeof pickSharableFields<(typeof teachers)['$inferInsert'] & EntityUser, boolean>>

export const getTeacher = cache(async (id: string): Promise<DataOrErrorTuple<Teacher>> => {
    'use server'

    try {
        const teacher = await db.query.teachers.findFirst({
            where: eq(teachers.id, id),
            with: {
                user: { with: { entity: true } },
            },
        })

        if (!teacher) return [null, new Error('Teacher does not exist')]

        // TODO: Check auth token and include extra fields if needed
        return [
            pickSharableFields({
                ...teacher,
                ...teacher.user,
                ...teacher.user.entity,
            }),
            null,
        ]
    } catch (e) {
        console.error('Error while getting teacher:', e)
        return [null, new Error('Internal server error')]
    }
}, 'getTeacher')

// TODO: Protect this route
export const createTeacherAction = action(
    async (data: TeacherInsert): Promise<CustomResponse<DataOrErrorTuple<Teacher>>> => {
        'use server'

        try {
            const { success: parseSuccess, output: input } = safeParse(TeacherInsertSchema, data)
            if (!parseSuccess) return json([null, new Error('Malformed request')])

            const ogTeacher = await db.query.teachers.findFirst({ where: eq(teachers.id, input.id) })
            if (ogTeacher) return json([null, new Error('Teacher already exists')])

            const [entity, user] = await insertEntityAndUser({
                ...input,
                ...(await generateSecurityFields(input.password)),
                type: 'teacher',
            })

            const [teacher] = await db.insert(teachers).values({ id: input.id }).returning()
            if (!teacher) throw new Error('Database did not return the created teacher')

            return json(
                [
                    pickSharableFields({
                        ...teacher,
                        ...user,
                        ...entity,
                    }),
                    null,
                ],
                { revalidate: getTeacher.keyFor(teacher.id) },
            )
        } catch (e) {
            console.error('Error while creating teacher:', e)
            return json([null, new Error('Internal server error')])
        }
    },
)

// TODO: Protect this route
export const deleteTeacherAction = action(async (id: string): Promise<CustomResponse<DataOrErrorTuple<boolean>>> => {
    'use server'

    try {
        const teacher = await db.query.teachers.findFirst({ where: eq(teachers.id, id) })
        if (!teacher) return json([null, new Error('Teacher does not exist')])

        await db.delete(teachers).where(eq(teachers.id, id))
        await db.delete(users).where(eq(users.id, id))
        await db.delete(entities).where(eq(entities.id, id))

        return json([true, null], { revalidate: getTeacher.keyFor(id) })
    } catch (e) {
        console.error('Error while deleting teacher:', e)
        return json([null, new Error('Internal server error')])
    }
})
