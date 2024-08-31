import { createSignal } from 'solid-js'

import RequiresAuthentication from '~/components/RequiresAuthentication'
import CreateEntityDialog from '~/components/ui/CreateEntityDialog'
import { Content } from '~/components/ui/Page'

import {
    createAdminAction,
    createStudentAction,
    createTeacherAction,
    deleteAdminAction,
    deleteStudentAction,
    deleteTeacherAction,
} from '~/lib/api'

import 'mdui/components/button'
import DeleteEntityDialog from '~/components/ui/DeleteEntityDialog'

export default () => {
    const [currentDialog, setCurrentDialog] = createSignal<
        'none' | 'createStudent' | 'createTeacher' | 'createAdmin' | 'deleteStudent' | 'deleteTeacher' | 'deleteAdmin'
    >('none')

    return (
        <RequiresAuthentication types={['admin']}>
            <Content>
                <h1>Administration</h1>
                <p>What would you like to do?</p>
                <div>
                    <mdui-button variant="filled" onClick={() => setCurrentDialog('createStudent')}>
                        Create a new student
                    </mdui-button>
                    <mdui-button variant="filled" onClick={() => setCurrentDialog('createTeacher')}>
                        Create a new teacher
                    </mdui-button>
                    <mdui-button variant="filled" onClick={() => setCurrentDialog('createAdmin')}>
                        Create a new admin
                    </mdui-button>
                </div>
                <div>
                    <mdui-button variant="filled" onClick={() => setCurrentDialog('deleteStudent')}>
                        Delete a student
                    </mdui-button>
                    <mdui-button variant="filled" onClick={() => setCurrentDialog('deleteTeacher')}>
                        Delete a teacher
                    </mdui-button>
                    <mdui-button variant="filled" onClick={() => setCurrentDialog('deleteAdmin')}>
                        Delete an admin
                    </mdui-button>
                </div>
                <CreateEntityDialog
                    type="student"
                    action={createStudentAction}
                    ref={currentDialog}
                    open={currentDialog() === 'createStudent'}
                    onClose={() => setCurrentDialog('none')}
                />
                <CreateEntityDialog
                    type="teacher"
                    action={createTeacherAction}
                    ref={currentDialog}
                    open={currentDialog() === 'createTeacher'}
                    onClose={() => setCurrentDialog('none')}
                />
                <CreateEntityDialog
                    type="admin"
                    action={createAdminAction}
                    ref={currentDialog}
                    open={currentDialog() === 'createAdmin'}
                    onClose={() => setCurrentDialog('none')}
                />
                <DeleteEntityDialog
                    type="student"
                    action={deleteStudentAction}
                    ref={currentDialog}
                    open={currentDialog() === 'deleteStudent'}
                    onClose={() => setCurrentDialog('none')}
                />
                <DeleteEntityDialog
                    type="teacher"
                    action={deleteTeacherAction}
                    ref={currentDialog}
                    open={currentDialog() === 'deleteTeacher'}
                    onClose={() => setCurrentDialog('none')}
                />
                <DeleteEntityDialog
                    type="admin"
                    action={deleteAdminAction}
                    ref={currentDialog}
                    open={currentDialog() === 'deleteAdmin'}
                    onClose={() => setCurrentDialog('none')}
                />
            </Content>
        </RequiresAuthentication>
    )
}
