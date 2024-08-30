import { createInsertSchema } from 'drizzle-valibot'
import * as v from 'valibot'
import { admins, entities, students, teachers, users } from '~/models'

export const EntityInsertSchema = v.intersect([
    createInsertSchema(entities, {
        email: v.string('Invalid email format', [v.email()]),
        phone: v.string('Phone numbers must be between 10 - 15 digits long', [v.regex(/\d{10,15}/)]),
        authHash: v.optional(v.undefined_('Authentication hash cannot be set directly')),
        secretKey: v.optional(v.undefined_('Secret key cannot be set directly')),
        publicKey: v.optional(v.undefined_('Public key cannot be set directly')),
        twoFactorSecret: v.optional(v.undefined_('2FA secret cannot be set directly')),
        avatar: v.optional(v.undefined_('Avatar cannot be set right now')),
        type: v.optional(v.undefined_('Type cannot be set directly')),
        sessionHash: v.optional(v.undefined_('Session hash cannot be set directly')),
    }),
    v.object({
        password: v.string('Password must be between 8 - 64 characters long', [v.minLength(8), v.maxLength(64)]),
    }),
])

export const UserInsertSchema = createInsertSchema(users)
export const EntityUserInsertSchema = v.intersect([UserInsertSchema, EntityInsertSchema])
export const AdminInsertSchema = v.intersect([createInsertSchema(admins), EntityInsertSchema])
export const StudentInsertSchema = v.intersect([createInsertSchema(students), EntityUserInsertSchema])
export const TeacherInsertSchema = v.intersect([createInsertSchema(teachers), EntityUserInsertSchema])

type RemoveUndefinedKeyValues<T> = {
    [K in keyof T as T[K] extends undefined ? never : K]: T[K]
}

export type EntityInsert = RemoveUndefinedKeyValues<v.Output<typeof EntityUserInsertSchema>>
export type UserInsert = RemoveUndefinedKeyValues<v.Output<typeof UserInsertSchema>>
export type StudentInsert = RemoveUndefinedKeyValues<v.Output<typeof StudentInsertSchema>>
export type TeacherInsert = RemoveUndefinedKeyValues<v.Output<typeof TeacherInsertSchema>>
export type AdminInsert = RemoveUndefinedKeyValues<v.Output<typeof AdminInsertSchema>>
export type EntityUserInsert = RemoveUndefinedKeyValues<v.Output<typeof EntityUserInsertSchema>>
