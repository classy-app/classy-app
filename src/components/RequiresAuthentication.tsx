import { useNavigate } from '@solidjs/router'
import { clientOnly } from '@solidjs/start'
import { type JSX, Show, createSignal } from 'solid-js'
import { useAuth } from './providers/AuthProvider'
import { alert } from 'mdui'
import type { Entity } from '~/lib/api/users/utils'

export default clientOnly(async () => ({
    default: (props: { types?: Entity['type'][]; children: JSX.Element | JSX.Element[] }) => {
        const navigate = useNavigate()
        const [authorized, setAuthorized] = createSignal(false)
        const [authData] = useAuth()

        if (!authData.token) return void navigate('/login', { replace: true })
        if (props.types && authData.entity && !props.types.includes(authData.entity.type))
            return void alert({
                headline: 'Unauthorized',
                description: 'You are not authorized to view this page.',
                confirmText: 'Back to home',
                onClose: () => navigate('/', { replace: true }),
            })

        setAuthorized(true)

        return <Show when={authorized()}>{props.children}</Show>
    },
}))
