import { useAction } from '@solidjs/router'
import { createSignal, Match, Switch } from 'solid-js'

import RequiresAuthentication from '~/components/RequiresAuthentication'
import { useAuth } from '~/components/providers/AuthProvider'
import { Content } from '~/components/ui/Page'
import Text from '~/components/ui/Text'

import type { Action, CustomResponse } from '@solidjs/router'
import type { DataOrErrorTuple, Entity, SafeEntity } from '~/lib/api/users/utils'
import type { EntityInsert } from '~/schemas/insert'

import 'mdui/components/button'
import 'mdui/components/text-field'
import 'mdui/components/circular-progress'

import styles from './admin.module.scss'
import { createAdminAction, createStudentAction, createTeacherAction } from '~/lib/api'

// TODO: Fix dialogs which require reload to function properly again
// TODO: Fix malformed requests
export default () => {
    const [showingDialog, setShowingDialog] = createSignal<'none' | 'student' | 'teacher' | 'admin'>('none')

    return (
        <RequiresAuthentication types={['admin']}>
            <Content>
                <h1>Administration</h1>
                <p>What would you like to do?</p>
                <div>
                    <mdui-button variant="filled" onClick={() => setShowingDialog('student')}>
                        Create a new student...
                    </mdui-button>
                    <mdui-button variant="filled" onClick={() => setShowingDialog('teacher')}>
                        Create a new teacher...
                    </mdui-button>
                    <mdui-button variant="filled" onClick={() => setShowingDialog('admin')}>
                        Create a new admin...
                    </mdui-button>
                </div>
                <Switch>
                    <Match when={showingDialog() === 'student'}>
                        <CreateEntityDialog type="student" action={createStudentAction} />
                    </Match>
                    <Match when={showingDialog() === 'teacher'}>
                        <CreateEntityDialog type="teacher" action={createTeacherAction} />
                    </Match>
                    <Match when={showingDialog() === 'admin'}>
                        <CreateEntityDialog type="admin" action={createAdminAction} />
                    </Match>
                </Switch>
            </Content>
        </RequiresAuthentication>
    )
}

const CreateEntityDialog = (props: {
    type: Entity['type']
    action: Action<[token: string, data: EntityInsert], CustomResponse<DataOrErrorTuple<SafeEntity<Entity>>>>
    onClose?: () => unknown | Promise<unknown>
}) => {
    const [authData] = useAuth()
    const createAction = useAction(props.action)
    const [open, setOpen] = createSignal(true)
    const [componentState, setComponentState] = createSignal<'idle' | 'loading'>('idle')

    let idInput: HTMLInputElement | undefined
    let nameInput: HTMLInputElement | undefined
    let emailInput: HTMLInputElement | undefined
    let phoneInput: HTMLInputElement | undefined
    let pwdInput: HTMLInputElement | undefined

    return (
        <mdui-dialog class={styles.Card} open={open()} onClose={props.onClose}>
            <Text.Headline size="medium" as="h1">
                Create a new {props.type}
            </Text.Headline>
            <form
                class={styles.InputList}
                onSubmit={event => {
                    event.preventDefault()

                    if (!idInput || !nameInput || !emailInput || !phoneInput || !pwdInput || !authData.token)
                        return void setComponentState('idle')

                    idInput.setCustomValidity('')
                    pwdInput.setCustomValidity('')
                    nameInput.setCustomValidity('')
                    emailInput.setCustomValidity('')
                    phoneInput.setCustomValidity('')

                    setComponentState('loading')

                    const submitter = event.submitter as HTMLInputElement
                    if (!submitter.form?.checkValidity()) return void setComponentState('idle')

                    createAction(authData.token, {
                        id: idInput.value,
                        name: nameInput.value,
                        email: emailInput.value,
                        phone: phoneInput.value,
                        password: pwdInput.value,
                    }).then(([_, error]) => {
                        if (!error) return void setComponentState('idle')

                        idInput.setCustomValidity(error.message)
                        pwdInput.setCustomValidity(error.message)
                        nameInput.setCustomValidity(error.message)
                        emailInput.setCustomValidity(error.message)
                        phoneInput.setCustomValidity(error.message)

                        setComponentState('idle')
                        setOpen(false)
                    })
                }}
            >
                <mdui-text-field ref={idInput} variant="filled" required type="text" label="ID" />
                <mdui-text-field ref={nameInput} variant="filled" required type="text" label="Name" />
                <mdui-text-field ref={emailInput} variant="filled" required type="email" label="Email" />
                <mdui-text-field ref={phoneInput} variant="filled" required type="tel" label="Phone" />
                <mdui-text-field
                    ref={pwdInput}
                    variant="filled"
                    required
                    type="password"
                    label="Password"
                    toggle-password
                />
                <mdui-button variant="tonal" onClick={() => setOpen(false)}>
                    Cancel
                </mdui-button>
                <mdui-button variant="filled" type="submit">
                    {componentState() === 'idle' ? (
                        'Create'
                    ) : (
                        <mdui-circular-progress style="--mdui-color-primary: var(--mdui-color-on-primary); scale: 0.5;" />
                    )}
                </mdui-button>
            </form>
        </mdui-dialog>
    )
}
