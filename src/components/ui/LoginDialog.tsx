import { useAction } from '@solidjs/router'
import { createSessionAction } from '~/lib/api'

import Text from './Text'

import { createSignal } from 'solid-js'
import HeroImage from '../../assets/images/login-dialog-hero.svg'
import styles from './LoginDialog.module.scss'

import 'mdui/components/card'
import 'mdui/components/text-field'
import 'mdui/components/button'

const LoginDialog = (props: {
    onAuthenticated?: (data: [token: string, sessionId: string]) => unknown | Promise<unknown>
}) => {
    const createSession = useAction(createSessionAction)
    const [componentState, setComponentState] = createSignal<'idle' | 'loading'>('idle')
    let idInput: HTMLInputElement | undefined
    let pwdInput: HTMLInputElement | undefined

    return (
        <mdui-card variant="filled" class={styles.Card}>
            <HeroImage class={styles.Image} />
            <div class={styles.TextList}>
                <Text.Headline size="medium" as="h1">
                    Welcome to Classy!
                </Text.Headline>
                <Text.Body size="medium">
                    Classy is a free and open-source classroom solution.
                    <br />
                    Let's get started by signing in!
                </Text.Body>
            </div>
            <form
                class={styles.InputList}
                onSubmit={event => {
                    event.preventDefault()

                    idInput?.setCustomValidity('')
                    pwdInput?.setCustomValidity('')

                    setComponentState('loading')

                    const submitter = event.submitter as HTMLInputElement
                    if (!submitter.form?.checkValidity() || !idInput || !pwdInput) return void setComponentState('idle')

                    createSession(idInput.value, pwdInput.value).then(([data, error]) => {
                        if (!error) return void props.onAuthenticated?.(data)

                        idInput.setCustomValidity(error.message)
                        pwdInput.setCustomValidity(error.message)

                        setComponentState('idle')
                    })
                }}
            >
                <mdui-text-field ref={idInput} variant="filled" required type="text" label="ID" />
                <mdui-text-field
                    ref={pwdInput}
                    variant="filled"
                    required
                    type="password"
                    label="Password"
                    toggle-password
                />
                <mdui-button variant="filled" type="submit">
                    {componentState() === 'idle' ? (
                        "Let's go!"
                    ) : (
                        <mdui-circular-progress style="--mdui-color-primary: var(--mdui-color-on-primary); scale: 0.5;" />
                    )}
                </mdui-button>
            </form>
        </mdui-card>
    )
}

export default LoginDialog
