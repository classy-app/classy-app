import { clientOnly } from '@solidjs/start'
import { type JSX, createContext, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'
import { getSession } from '~/lib/api'
import type { Entity, SafeEntity } from '~/lib/api/users/utils'

const TokenLocalStorageKey = 'token__DO_NOT_SHARE_THIS_TO_ANYONE'

type AuthDataObject = { token?: string; sessionId?: string; entity?: SafeEntity<Entity> }
type AuthData = Required<AuthDataObject> | Partial<AuthDataObject>
type AuthContextStruct = [data: AuthData, set: (value: Required<AuthData>) => void, clear: () => void]

const AuthContext = createContext<AuthContextStruct>(undefined as unknown as AuthContextStruct)

const AuthProvider = clientOnly(async () => ({
    default: (props: { children: JSX.Element | JSX.Element[] }) => {
        const [store, setStore] = createStore<AuthData>({})

        const token = localStorage.getItem(TokenLocalStorageKey)
        if (token)
            getSession(token).then(([session, error]) => {
                if (error) return void console.error('Failed to get session:', error)
                const { data, entity } = session
                setStore({ token, sessionId: data.payload.sid, entity })
            })

        return (
            <AuthContext.Provider
                value={[
                    store,
                    struct => {
                        setStore(struct)
                        localStorage.setItem(TokenLocalStorageKey, struct.token)
                    },
                    () => {
                        setStore({ token: undefined, sessionId: undefined })
                        localStorage.removeItem(TokenLocalStorageKey)
                    },
                ]}
            >
                {props.children}
            </AuthContext.Provider>
        )
    },
}))

export const useAuth = () => useContext(AuthContext)

export default AuthProvider
