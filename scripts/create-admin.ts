import db from '~/lib/db'
import { admins, entities } from '~/models'
import { bcrypt } from 'hash-wasm'
import { generateKeys } from 'paseto-ts/v4'

const id = prompt('Enter admin ID (default = admin): ') || 'admin'
const name = prompt('Enter admin name (default = Classy Administrator): ') ?? 'Classy Administrator'
const email = prompt('Enter admin email: ')
const phone = prompt('Enter admin phone number: ')
const password = prompt('Enter admin password: ')

if (!email || !phone || !password) {
    console.error('Missing required fields: phone, email, or password')
    process.exit(1)
}

console.info('Generating your keys...')
const { publicKey, secretKey } = generateKeys('public')

console.info('Making your user secure...')
const authHash = await bcrypt({
    password,
    salt: crypto.getRandomValues(new Uint8Array(16)),
    costFactor: Number(process.env.BCRYPT_COST),
})

console.info('Creating your entity...')
await db
    .insert(entities)
    .values({
        id,
        name,
        email,
        phone,
        type: 'admin',
        publicKey,
        secretKey,
        authHash,
    })
    .onConflictDoUpdate({
        target: entities.id,
        set: {
            name,
            email,
            phone,
            publicKey,
            secretKey,
            authHash,
        },
    })

console.info('Adding you to admins...')
await db
    .insert(admins)
    .values({
        id,
    })
    .onConflictDoUpdate({
        target: admins.id,
        set: {
            id,
        },
    })

console.info('Admin created!')