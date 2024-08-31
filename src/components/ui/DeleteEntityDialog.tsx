import { useAction } from '@solidjs/router'
import { createSignal } from 'solid-js'
import { useAuth } from '~/components/providers/AuthProvider'

import type { Action, CustomResponse } from '@solidjs/router'
import type { Dialog } from 'mdui'
import type { DataOrErrorTuple, Entity } from '~/lib/api/users/utils'

import 'mdui/components/button'
import 'mdui/components/text-field'
import 'mdui/components/circular-progress'



const DeleteEntityDialog = (props: {
    onClose?: () => unknown
    open?: boolean
    type: Entity['type']
    action: Action<[token: string, id: string], CustomResponse<DataOrErrorTuple<boolean>>>
}) => {
    const [authData] = useAuth()
    const deleteAction = useAction(props.action)
    const [componentState, setComponentState] = createSignal<'idle' | 'loading'>('idle')
    const FormId = `delete-entity-form-${props.type}`

    let dialog: Dialog | undefined
    let form: HTMLFormElement | undefined

    let idInput: HTMLInputElement | undefined

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
                onSubmit={event => {
                    event.preventDefault()

                    if (!idInput || !authData.token) return void setComponentState('idle')

                    idInput.setCustomValidity('')
                    setComponentState('loading')

                    const submitter = event.submitter as HTMLInputElement
                    if (!submitter.form?.reportValidity()) return void setComponentState('idle')

                    deleteAction(authData.token, idInput.value).then(([_, error]) => {
                        if (!error) {
                            setComponentState('idle')
                            dialog!.open = false
                            return
                        }

                        idInput.setCustomValidity(error.message)
                        setComponentState('idle')
                    })
                }}
            >
                <mdui-text-field ref={idInput} variant="filled" required type="text" label="ID" />
            </form>
            <mdui-button slot="action" variant="text" onClick={() => (dialog!.open = false)}>
                Cancel
            </mdui-button>
            <mdui-button slot="action" variant="filled" type="submit" form={FormId}>
                {componentState() === 'idle' ? (
                    'Delete'
                ) : (
                    <mdui-circular-progress style="--mdui-color-primary: var(--mdui-color-on-primary); scale: 0.5;" />
                )}
            </mdui-button>
        </mdui-dialog>
    )
}

export default DeleteEntityDialog
