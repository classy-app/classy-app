import { MetaProvider, Title } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense, onMount } from 'solid-js'
import AuthProvider from './components/providers/AuthProvider'
import '~/styles/globals.scss'
import 'mdui/mdui.css'

export default () => {
    onMount(() => document.body.classList.remove('loading'))

    return (
        <Router
            root={props => (
                <MetaProvider>
                    <Title>Classy</Title>
                    <AuthProvider>
                        <Suspense>{props.children}</Suspense>
                    </AuthProvider>
                </MetaProvider>
            )}
        >
            <FileRoutes />
        </Router>
    )
}
