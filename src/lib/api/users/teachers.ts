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
import { getEntityFromToken } from './sessions'

export type Teacher = ReturnType<typeof pickSharableFields<(typeof teachers)['$inferInsert'] & EntityUser, boolean>>

export const getTeacher = cache(async (token: string, id: string): Promise<DataOrErrorTuple<Teacher>> => {
    'use server'

    try {
        const [session, error] = await getEntityFromToken(token)
        if (error) return [null, error]

        const teacher = await db.query.teachers.findFirst({
            where: eq(teachers.id, id),
            with: {
                user: { with: { entity: true } },
            },
        })

        if (!teacher) return [null, new Error('Teacher does not exist')]

        return [
            pickSharableFields({
                ...teacher,
                ...teacher.user,
                ...teacher.user.entity,
            }, session.entity.id === id || session.entity.type === 'admin'),
            null,
        ]
    } catch (e) {
        console.error('Error while getting teacher:', e)
        return [null, new Error('Internal server error')]
    }
}, 'getTeacher')

export const createTeacherAction = action(
    async (token: string, data: TeacherInsert): Promise<CustomResponse<DataOrErrorTuple<Teacher>>> => {
        'use server'

        try {
            const [session, error] = await getEntityFromToken(token)
            if (error) return json([null, error])
            if (session.entity.type !== 'admin') return json([null, new Error('Unauthorized')])
            
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
                { revalidate: getTeacher.keyFor(token, teacher.id) },
            )
        } catch (e) {
            console.error('Error while creating teacher:', e)
            return json([null, new Error('Internal server error')])
        }
    },
)

export const deleteTeacherAction = action(async (token: string, id: string): Promise<CustomResponse<DataOrErrorTuple<boolean>>> => {
    'use server'

    try {
        const [session, error] = await getEntityFromToken(token)
        if (error) return json([null, error])
        if (session.entity.type !== 'admin') return json([null, new Error('Unauthorized')])

        const teacher = await db.query.teachers.findFirst({ where: eq(teachers.id, id) })
        if (!teacher) return json([null, new Error('Teacher does not exist')])

        await db.delete(teachers).where(eq(teachers.id, id))
        await db.delete(users).where(eq(users.id, id))
        await db.delete(entities).where(eq(entities.id, id))

        return json([true, null], { revalidate: getTeacher.keyFor(token, id) })
    } catch (e) {
        console.error('Error while deleting teacher:', e)
        return json([null, new Error('Internal server error')])
    }
})
