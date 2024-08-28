import { action, json, type CustomResponse } from '@solidjs/router'
import type { DataOrErrorTuple } from './utils'
import { eq } from 'drizzle-orm'
import db from '~/lib/db'
import { entities } from '~/models'
import { bcryptVerify } from 'hash-wasm'
import { sign, verify } from 'paseto-ts/v4'
import type { Entity } from './utils'

export const createSessionAction = action(
    async (id: string, password: string): Promise<CustomResponse<DataOrErrorTuple<string>>> => {
        'use server'

        try {
            const entity = await db.query.entities.findFirst({ where: eq(entities.id, id) })
            if (!entity) return json([null, new Error('Incorrect credentials')])

            const { authHash, secretKey } = entity
            const passwordMatches = await bcryptVerify({ hash: authHash, password })
            if (!passwordMatches) return json([null, new Error('Incorrect credentials')])

            const token = `${Buffer.from(id).toString('base64url')};${sign(secretKey, { exp: '30 days' })}`
            return json([token, null])
        } catch (e) {
            console.error('Error while creating session:', e)
            return json([null, new Error('Internal server error')])
        }
    },
)

export const getEntityFromToken = async (
    token: string,
): Promise<DataOrErrorTuple<{ entity: Entity; data: ReturnType<typeof verify> }>> => {
    'use server'

    const [b64Id, signature] = token.split(';')
    if (!b64Id || !signature) return [null, new Error('Unauthorized')]
    const id = Buffer.from(b64Id, 'base64url').toString()
    const entity = await db.query.entities.findFirst({ where: eq(entities.id, id) })
    if (!entity) return [null, new Error('Unauthorized')]

    const { publicKey } = entity
    const data = verify(publicKey, signature)
    if (!data) return [null, new Error('Unauthorized')]

    return [{ entity, data }, null]
}
