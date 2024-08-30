import { useNavigate } from '@solidjs/router'
import { clientOnly } from '@solidjs/start'
import { type JSX, createEffect } from 'solid-js'
import { useAuth } from './providers/AuthProvider'

export default clientOnly(async () => ({
    default: (props: { children: JSX.Element | JSX.Element[] }) => {
        const navigate = useNavigate()
        const [authData] = useAuth()

        createEffect(() => !authData.token && navigate('/login', { replace: true }))

        return authData.token ? props.children : null
    },
}))
