import { type JSX, createContext, onMount, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'

const TokenLocalStorageKey = 'token__DO_NOT_SHARE_THIS_TO_ANYONE'

type AuthData = { token?: string; sessionId?: string }
type AuthContextStruct = [data: AuthData, set: (value: Required<AuthData>) => void, clear: () => void]

const AuthContext = createContext<AuthContextStruct>(undefined as unknown as AuthContextStruct)

const AuthProvider = (props: { children: JSX.Element | JSX.Element[] }) => {
    const [store, setStore] = createStore<AuthData>({})

    onMount(() => {
        const token = localStorage.getItem(TokenLocalStorageKey)
        if (token) setStore({ token })
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
}

export const useAuth = () => useContext(AuthContext)

export default AuthProvider
