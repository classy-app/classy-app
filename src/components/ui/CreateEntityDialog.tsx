import { useAction } from '@solidjs/router'
import { createSignal } from 'solid-js'
import { useAuth } from '~/components/providers/AuthProvider'

import type { Action, CustomResponse } from '@solidjs/router'
import type { Dialog } from 'mdui'
import type { DataOrErrorTuple, Entity, SafeEntity } from '~/lib/api/users/utils'
import type { EntityInsert } from '~/schemas/insert'

import styles from './CreateEntityDialog.module.scss'

import 'mdui/components/button'
import 'mdui/components/text-field'
import 'mdui/components/circular-progress'

const CreateEntityDialog = (props: {
    onClose?: () => unknown
    open?: boolean
    type: Entity['type']
    action: Action<[token: string, data: EntityInsert], CustomResponse<DataOrErrorTuple<SafeEntity<Entity>>>>
}) => {
    const [authData] = useAuth()
    const createAction = useAction(props.action)
    const [componentState, setComponentState] = createSignal<'idle' | 'loading'>('idle')
    const FormId = `create-entity-form-${props.type}`

    let dialog: Dialog | undefined
    let form: HTMLFormElement | undefined

    let idInput: HTMLInputElement | undefined
    let nameInput: HTMLInputElement | undefined
    let emailInput: HTMLInputElement | undefined
    let phoneInput: HTMLInputElement | undefined
    let pwdInput: HTMLInputElement | undefined

    const onClose = () => {
        form!.reset()
        props.onClose?.()
    }

    return (
        <mdui-dialog
            ref={dialog}
            open={props.open}
            close-on-esc
            close-on-overlay-click
            headline={`Create a new ${props.type}`}
            onClose={onClose}
        >
            <form
                ref={form}
                id={FormId}
                class={styles.InputList}
                onSubmit={event => {
                    event.preventDefault()

                    const inputs = [idInput, nameInput, emailInput, phoneInput, pwdInput]

                    if (!idInput || !nameInput || !emailInput || !phoneInput || !pwdInput || !authData.token)
                        return void setComponentState('idle')

                    for (const input of inputs) input?.setCustomValidity('')
                    setComponentState('loading')

                    const submitter = event.submitter as HTMLInputElement
                    if (!submitter.form?.reportValidity()) return void setComponentState('idle')

                    createAction(authData.token, {
                        id: idInput.value,
                        name: nameInput.value,
                        email: emailInput.value,
                        phone: phoneInput.value,
                        password: pwdInput.value,
                    }).then(([_, error]) => {
                        if (!error) {
                            setComponentState('idle')
                            dialog!.open = false
                            return
                        }

                        for (const input of inputs) input?.setCustomValidity(error.message)
                        setComponentState('idle')
                    })
                }}
            >
                <mdui-text-field ref={idInput} variant="filled" required type="text" label="ID" />
                <mdui-text-field ref={nameInput} variant="filled" required type="text" label="Name" />
                <mdui-text-field ref={emailInput} variant="filled" required type="email" label="Email" />
                <mdui-text-field
                    ref={phoneInput}
                    variant="filled"
                    required
                    type="tel"
                    label="Phone"
                    minLength={10}
                    maxLength={15}
                />
                <mdui-text-field
                    ref={pwdInput}
                    variant="filled"
                    required
                    type="password"
                    label="Password"
                    minLength={8}
                    maxLength={64}
                    toggle-password
                />
            </form>
            <mdui-button slot="action" variant="text" onClick={() => (dialog!.open = false)}>
                Cancel
            </mdui-button>
            <mdui-button slot="action" variant="filled" type="submit" form={FormId}>
                {componentState() === 'idle' ? (
                    'Create'
                ) : (
                    <mdui-circular-progress style="--mdui-color-primary: var(--mdui-color-on-primary); scale: 0.5;" />
                )}
            </mdui-button>
        </mdui-dialog>
    )
}

export default CreateEntityDialog