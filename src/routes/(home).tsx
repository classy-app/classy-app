import { alert } from 'mdui'

import 'mdui/mdui.css'
import '~/styles/globals.scss'

import 'mdui/components/button'

import { useAction } from '@solidjs/router'
import {
    createAdminAction,
    createStudentAction,
    deleteAdminAction,
    deleteStudentAction,
    getAdmin,
    getStudent,
} from '~/lib/api'

const id = '12345'
const adminId = 'admin'

export default () => {
    const createStudent = useAction(createStudentAction)
    const deleteStudent = useAction(deleteStudentAction)
    const createAdmin = useAction(createAdminAction)
    const deleteAdmin = useAction(deleteAdminAction)

    return (
        <main>
            <h1>Classy app</h1>
            <div>
                <mdui-button
                    variant="filled"
                    onClick={() =>
                        createStudent({
                            id,
                            name: 'Palm',
                            email: 'contact@palmdevs.me',
                            phone: '1234567890',
                            password: 'password',
                        }).then(([student, error]) => {
                            if (error) return void alert({ headline: 'Error', description: error.message })
                            alert({ headline: 'Student created', description: JSON.stringify(student, undefined, 4) })
                        })
                    }
                >
                    Create student
                </mdui-button>
                <mdui-button
                    variant="filled"
                    onClick={() =>
                        getStudent(id).then(([student, error]) => {
                            if (error) return void alert({ headline: 'Error', description: error.message })
                            alert({
                                headline: 'Student information',
                                description: JSON.stringify(student, undefined, 4),
                            })
                        })
                    }
                >
                    Get student
                </mdui-button>
                <mdui-button
                    variant="tonal"
                    onClick={() =>
                        deleteStudent(id).then(([_, error]) => {
                            if (error) return void alert({ headline: 'Error', description: error.message })
                            alert({ headline: 'Student deleted' })
                        })
                    }
                >
                    Delete student
                </mdui-button>
            </div>
            <div>
                <mdui-button
                    variant="filled"
                    onClick={() =>
                        createAdmin({
                            id: adminId,
                            name: 'Admin',
                            email: 'classy@products.palmdevs.me',
                            phone: '1234567890',
                            password: 'password',
                        }).then(([admin, error]) => {
                            if (error) return void alert({ headline: 'Error', description: error.message })
                            alert({ headline: 'Admin created', description: JSON.stringify(admin, undefined, 4) })
                        })
                    }
                >
                    Create admin
                </mdui-button>
                <mdui-button
                    variant="filled"
                    onClick={() =>
                        getAdmin(adminId).then(([admin, error]) => {
                            if (error) return void alert({ headline: 'Error', description: error.message })
                            alert({
                                headline: 'Admin information',
                                description: JSON.stringify(admin, undefined, 4),
                            })
                        })
                    }
                >
                    Get admin
                </mdui-button>
                <mdui-button
                    variant="tonal"
                    onClick={() =>
                        deleteAdmin(adminId).then(([_, error]) => {
                            if (error) return void alert({ headline: 'Error', description: error.message })
                            alert({ headline: 'Admin deleted' })
                        })
                    }
                >
                    Delete admin
                </mdui-button>
            </div>
        </main>
    )
}
