import { type CustomResponse, action, cache, json } from '@solidjs/router'
import { eq } from 'drizzle-orm'
import { safeParse } from 'valibot'

import db from '~/lib/db'
import { admins, entities } from '~/models'
import { type AdminInsert, AdminInsertSchema } from '~/schemas/insert'

import { getSession } from './sessions'
import { type DataOrErrorTuple, type Entity, generateSecurityFields, pickSharableFields } from './utils'

export type Admin = ReturnType<typeof pickSharableFields<(typeof admins)['$inferInsert'] & Entity, true>>

export const getAdmin = cache(async (token: string, id: string): Promise<DataOrErrorTuple<Admin>> => {
    'use server'

    try {
        const [session, error] = await getSession(token)
        if (error) return [null, error]
        if (session.entity.type !== 'admin') return [null, new Error('Unauthorized')]

        const admin = await db.query.admins.findFirst({ where: eq(admins.id, id), with: { entity: true } })
        if (!admin) return [null, new Error('Admin does not exist')]

        return [
            pickSharableFields(
                {
                    ...admin,
                    ...admin.entity,
                },
                true,
            ),
            null,
        ]
    } catch (e) {
        console.error('Error while getting admin:', e)
        return [null, new Error('Internal server error')]
    }
}, 'getAdmin')

export const createAdminAction = action(
    async (token: string, data: AdminInsert): Promise<CustomResponse<DataOrErrorTuple<Admin>>> => {
        'use server'

        try {
            const [session, error] = await getSession(token)
            if (error) return json([null, error])
            if (session.entity.type !== 'admin') return json([null, new Error('Unauthorized')])

            const { success: parseSuccess, output: input } = safeParse(AdminInsertSchema, data)
            if (!parseSuccess) return json([null, new Error('Malformed request')])

            const ogAdmin = await db.query.admins.findFirst({ where: eq(admins.id, input.id) })
            if (ogAdmin) return json([null, new Error('Admin already exists')])

            const [entity] = await db
                .insert(entities)
                .values({
                    ...input,
                    ...(await generateSecurityFields(input.password)),
                    type: 'admin',
                })
                .returning()

            if (!entity) throw new Error('Database did not return the created entity')

            const [admin] = await db.insert(admins).values({ id: input.id }).returning()
            if (!admin) throw new Error('Database did not return the created admin')

            return json(
                [
                    pickSharableFields(
                        {
                            ...admin,
                            ...entity,
                        },
                        true,
                    ),
                    null,
                ],
                { revalidate: getAdmin.keyFor(token, admin.id) },
            )
        } catch (e) {
            console.error('Error while creating student:', e)
            return json([null, new Error('Internal server error')])
        }
    },
)

export const deleteAdminAction = action(
    async (token: string, id: string): Promise<CustomResponse<DataOrErrorTuple<boolean>>> => {
        'use server'

        try {
            const [session, error] = await getSession(token)
            if (error) return json([null, error])
            if (session.entity.type !== 'admin') return json([null, new Error('Unauthorized')])

            const admin = await db.query.admins.findFirst({ where: eq(admins.id, id) })
            if (!admin) return json([null, new Error('Admin does not exist')])

            await db.delete(admins).where(eq(admins.id, id))
            await db.delete(entities).where(eq(entities.id, id))

            return json([true, null], { revalidate: getAdmin.keyFor(token, id) })
        } catch (e) {
            console.error('Error while deleting admin:', e)
            return json([null, new Error('Internal server error')])
        }
    },
)
