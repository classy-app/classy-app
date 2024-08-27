// TODO: Protect these routes

import { type CustomResponse, action, cache, json } from '@solidjs/router'
import { eq } from 'drizzle-orm'
import { safeParse } from 'valibot'

import { admins, entities } from '~/models'
import { type AdminInsert, AdminInsertSchema } from '~/schemas/insert'
import db from '~/lib/db'

import { type Entity, generateSecurityFields, pickSharableFields, type DataOrErrorTuple } from './utils'

export type Admin = ReturnType<typeof pickSharableFields<typeof admins['$inferInsert'] & Entity, true>>

export const getAdmin = cache(async (id: string): Promise<DataOrErrorTuple<Admin>> => {
    'use server'

    try {
        const admin = await db.query.admins.findFirst({ where: eq(admins.id, id), with: { entity: true } })
        if (!admin) return [null, new Error('Admin does not exist')]

        // TODO: Check auth token and include extra fields if needed
        return [
            pickSharableFields({
                ...admin,
                ...admin.entity,
            }),
            null,
        ]
    } catch (e) {
        console.error('Error while getting admin:', e)
        return [null, new Error('Internal server error')]
    }
}, 'getAdmin')

export const createAdminAction = action(async (data: AdminInsert): Promise<DataOrErrorTuple<CustomResponse<Admin>>> => {
    'use server'

    try {
        const { success: parseSuccess, output: input } = safeParse(AdminInsertSchema, data)
        if (!parseSuccess) return [null, new Error('Malformed request')]

        const ogAdmin = await db.query.admins.findFirst({ where: eq(admins.id, input.id) })
        if (ogAdmin) return [null, new Error('Admin already exists')]

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

        return [
            json(
                pickSharableFields({
                    ...admin,
                    ...entity,
                }),
                { revalidate: getAdmin.keyFor(admin.id) },
            ),
            null,
        ]
    } catch (e) {
        console.error('Error while creating student:', e)
        return [null, new Error('Internal server error')]
    }
})

export const deleteAdminAction = action(async (id: string): Promise<DataOrErrorTuple<CustomResponse<boolean>>> => {
    'use server'

    try {
        const admin = await db.query.admins.findFirst({ where: eq(admins.id, id) })
        if (!admin) return [null, new Error('Admin does not exist')]

        await db.delete(admins).where(eq(admins.id, id))
        await db.delete(entities).where(eq(entities.id, id))

        return [json(true, { revalidate: getAdmin.keyFor(id) }), null]
    } catch (e) {
        console.error('Error while deleting admin:', e)
        return [null, new Error('Internal server error')]
    }
})