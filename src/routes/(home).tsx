import { useNavigate } from '@solidjs/router'
import { useAuth } from '~/components/providers/AuthProvider'
import { Content } from '~/components/ui/Page'

import 'mdui/components/button'
import RequiresAuthentication from '~/components/RequiresAuthentication'

export default () => {
    const navigate = useNavigate()
    const [, , clearAuthData] = useAuth()

    return (
        <RequiresAuthentication>
            <Content>
                <h1>Home</h1>
                <p>Welcome to the home page!</p>
                <mdui-button
                    variant="filled"
                    onClick={() => {
                        clearAuthData()
                        navigate('/login', { replace: true })
                    }}
                >
                    Log out
                </mdui-button>
            </Content>
        </RequiresAuthentication>
    )
}
