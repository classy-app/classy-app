import { type CustomResponse, action, json } from '@solidjs/router'
import { eq } from 'drizzle-orm'
import { bcrypt, bcryptVerify } from 'hash-wasm'
import { sign, verify } from 'paseto-ts/v4'

import db from '~/lib/db'
import { entities } from '~/models'

import type { DataOrErrorTuple } from './utils'
import type { Entity } from './utils'

export const createSessionAction = action(
    async (
        id: string,
        password: string,
    ): Promise<CustomResponse<DataOrErrorTuple<[token: string, sessionId: string]>>> => {
        'use server'

        try {
            const entity = await db.query.entities.findFirst({ where: eq(entities.id, id) })
            if (!entity) return json([null, new Error('Incorrect credentials')])

            const { authHash, secretKey } = entity
            const passwordMatches = await bcryptVerify({ hash: authHash, password })
            if (!passwordMatches) return json([null, new Error('Incorrect credentials')])

            const sid = crypto.getRandomValues(Buffer.alloc(32)).toString('base64url')
            const salt = crypto.getRandomValues(new Uint8Array(16))
            const token = `${Buffer.from(id).toString('base64url')};${sign(secretKey, { exp: '30 days', sid })}`

            await db.update(entities).set({
                sessionHash: (
                    await bcrypt({ password: sid, salt, costFactor: Number(process.env.BCRYPT_COST) })
                ).toString(),
            })

            return json([[token, sid], null])
        } catch (e) {
            console.error('Error while creating session:', e)
            return json([null, new Error('Internal server error')])
        }
    },
)

export const getSession = async (
    token: string,
): Promise<DataOrErrorTuple<{ entity: Entity; data: ReturnType<typeof verify> }>> => {
    'use server'

    const [b64Id, key] = token.split(';')
    if (!b64Id || !key) return [null, new Error('Unauthorized')]

    const id = Buffer.from(b64Id, 'base64url').toString()
    const entity = await db.query.entities.findFirst({ where: eq(entities.id, id) })
    if (!entity || !entity.sessionHash) return [null, new Error('Unauthorized')]

    // Verify the key
    const { publicKey } = entity
    const data = verify(publicKey, key)
    if (!data) return [null, new Error('Unauthorized')]

    // Verify session ID
    if (await bcryptVerify({ hash: entity.sessionHash, password: data.payload.sid })) return [{ entity, data }, null]
    return [null, new Error('Unauthorized')]
}
