import { type CustomResponse, action, cache, json } from '@solidjs/router'
import { eq } from 'drizzle-orm'
import { includeKeys } from 'filter-obj'
import { bcrypt } from 'hash-wasm'
import { generateKeys } from 'paseto-ts/v4'
import { safeParse } from 'valibot'
import { admins, entities, students, users } from '~/models'
import { type AdminInsert, AdminInsertSchema, type EntityUserInsert, StudentInsertSchema } from '~/schemas/insert'
import db from './db'

type Entity = (typeof entities)['$inferInsert']
type EntityUser = (typeof users)['$inferInsert'] & (typeof entities)['$inferInsert']

const generateSecurityFields = async (password: string) => {
    'use server'

    const salt = new Uint8Array(16)
    crypto.getRandomValues(salt)
    const authHash = await bcrypt({ password, costFactor: Number(process.env.BCRYPT_COST), salt })
    const { publicKey, secretKey } = generateKeys('public')
    return { authHash, publicKey, secretKey }
}

const pickSharableFields = <O extends Entity, B extends boolean = false>(input: O, authorized: B = false as B) => {
    const fields: Array<keyof O> = ['id', 'name', 'avatar', 'type']
    if (authorized) fields.push('phone', 'email')
    return includeKeys(input, fields) as Pick<O, 'id' | 'name' | 'avatar' | 'type'> &
        Partial<Pick<O, 'phone' | 'email'>>
}

// TODO: Handle conflicts
const insertEntityAndUser = async (input: EntityUser) => {
    'use server'

    const [entity] = await db.insert(entities).values(input).returning()
    if (!entity) throw new Error('Database did not return the created entity')

    const [user] = await db.insert(users).values(input).returning()
    if (!user) throw new Error('Database did not return the created user')

    return [entity, user] as const
}

type Student = ReturnType<typeof pickSharableFields<EntityUser, boolean>>
type DataOrErrorTuple<T, E extends Error = Error> = [T, null] | [null, E]

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
    async (data: EntityUserInsert): Promise<DataOrErrorTuple<CustomResponse<Student>>> => {
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

type Admin = ReturnType<typeof pickSharableFields<Entity, true>>

// TODO: Protect this route
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

// TODO: Protect this route
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

// TODO: Protect this route
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

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BCRYPT_COST: string
        }
    }
}

// export const createApiRoute =
//     <P extends { [k: string]: string }, S extends BaseSchemaAsync | undefined>(
//         handler: (
//             event: APIEvent & {
//                 data: S extends BaseSchemaAsync ? Output<S> : unknown
//                 params: P
//             },
//             // biome-ignore lint/suspicious/noExplicitAny: This doesn't really matter
//         ) => Promise<any>,
//         schema: S,
//     ) =>
//     async (event: APIEvent) => {
//         try {
//             const json = await event.request.json()
//             const data = await (schema ? parseAsync(schema, json) : json)

//             return await handler({ ...event, data, params: event.params as P })
//         } catch {
//             return new Response('Bad Request', { status: 400 })
//         }
//     }
