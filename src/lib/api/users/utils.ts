import { includeKeys } from 'filter-obj'
import { bcrypt } from 'hash-wasm'
import { generateKeys } from 'paseto-ts/v4'

import db from '~/lib/db'
import { entities, users } from '~/models'

export type SafeEntity<T extends Entity> = ReturnType<typeof pickSharableFields<T>>
export type Entity = (typeof entities)['$inferInsert']
export type EntityUser = (typeof users)['$inferInsert'] & (typeof entities)['$inferInsert']
export type DataOrErrorTuple<T, E extends Error = Error> = [T, null] | [null, E]

export const generateSecurityFields = async (password: string) => {
    'use server'

    const salt = new Uint8Array(16)
    crypto.getRandomValues(salt)
    const authHash = await bcrypt({ password, costFactor: Number(process.env.BCRYPT_COST), salt })
    const { publicKey, secretKey } = generateKeys('public')
    return { authHash, publicKey, secretKey }
}

export const pickSharableFields = <O extends Entity, B extends boolean = false>(
    input: O,
    authorized: B = false as B,
) => {
    const fields: Array<keyof O> = ['id', 'name', 'avatar', 'type']
    if (authorized) fields.push('phone', 'email')
    return includeKeys(input, fields) as Pick<O, 'id' | 'name' | 'avatar' | 'type'> &
        Partial<Pick<O, 'phone' | 'email'>>
}

// TODO: Handle conflicts
export const insertEntityAndUser = async (input: EntityUser) => {
    'use server'

    const [entity] = await db.insert(entities).values(input).returning()
    if (!entity) throw new Error('Database did not return the created entity')

    const [user] = await db.insert(users).values(input).returning()
    if (!user) throw new Error('Database did not return the created user')

    return [entity, user] as const
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BCRYPT_COST: string
        }
    }
}
