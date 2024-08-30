import { useNavigate } from '@solidjs/router'
import { onMount } from 'solid-js'
import { useAuth } from '~/components/providers/AuthProvider'
import LoginDialog from '~/components/ui/LoginDialog'
import { Content } from '~/components/ui/Page'

import styles from './login.module.scss'
import { getSession } from '~/lib/api'

export default () => {
    const navigate = useNavigate()
    const [authData, setAuthData] = useAuth()

    onMount(() => authData.token && navigate('/', { replace: true }))

    return (
        <Content class={styles.Page}>
            <LoginDialog
                onAuthenticated={([token, sessionId]) => {
                    getSession(token).then(([session, error]) => {
                        if (error) return void console.error('Failed to get session:', error)
                        const { entity } = session
                        setAuthData({ token, sessionId, entity })
                        navigate('/')
                    })
                }}
            />
        </Content>
    )
}
