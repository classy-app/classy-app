import { alert } from 'mdui'

import 'mdui/mdui.css'
import '~/styles/globals.scss'

import 'mdui/components/button'

import { useAction } from '@solidjs/router'
import {
    createAdminAction,
    createSessionAction,
    createStudentAction,
    createTeacherAction,
    deleteAdminAction,
    deleteStudentAction,
    deleteTeacherAction,
    getAdmin,
    getStudent,
    getTeacher,
} from '~/lib/api'
import { createSignal } from 'solid-js'

const studentId = '12345'
const teacherId = 't_12345'
const adminId = 'admin'

export default () => {
    const [token, setToken] = createSignal('')

    const createStudent = useAction(createStudentAction)
    const deleteStudent = useAction(deleteStudentAction)
    const createAdmin = useAction(createAdminAction)
    const deleteAdmin = useAction(deleteAdminAction)
    const createTeacher = useAction(createTeacherAction)
    const deleteTeacher = useAction(deleteTeacherAction)
    const createSession = useAction(createSessionAction)

    return (
        <main>
            <h1>Classy app</h1>
            <p>Current token: <code>{token()}</code></p>
            <div>
                <mdui-button
                    variant="filled"
                    onClick={() =>
                        createStudent(token(), {
                            id: studentId,
                            name: 'Palm',
                            email: 'contact@palmdevs.me',
                            phone: '1234567890',
                            password: 'password',
                        }).then(([student, error]) => {
                            console.log(student)
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
                        getStudent(token(), studentId).then(([student, error]) => {
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
                        deleteStudent(token(), studentId).then(([_, error]) => {
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
                        createAdmin(token(), {
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
                        getAdmin(token(), adminId).then(([admin, error]) => {
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
                        deleteAdmin(token(), adminId).then(([_, error]) => {
                            if (error) return void alert({ headline: 'Error', description: error.message })
                            alert({ headline: 'Admin deleted' })
                        })
                    }
                >
                    Delete admin
                </mdui-button>
            </div>
            <div>
                <mdui-button
                    variant="filled"
                    onClick={() =>
                        createTeacher(token(), {
                            id: teacherId,
                            name: 'Mrs. Sarah',
                            email: 'sarah@palmdevs.me',
                            phone: '1234567890',
                            password: 'password',
                        }).then(([teacher, error]) => {
                            if (error) return void alert({ headline: 'Error', description: error.message })
                            alert({ headline: 'Teacher created', description: JSON.stringify(teacher, undefined, 4) })
                        })
                    }
                >
                    Create teacher
                </mdui-button>
                <mdui-button
                    variant="filled"
                    onClick={() =>
                        getTeacher(token(), teacherId).then(([teacher, error]) => {
                            if (error) return void alert({ headline: 'Error', description: error.message })
                            alert({
                                headline: 'Teacher information',
                                description: JSON.stringify(teacher, undefined, 4),
                            })
                        })
                    }
                >
                    Get teacher
                </mdui-button>
                <mdui-button
                    variant="tonal"
                    onClick={() =>
                        deleteTeacher(token(), teacherId).then(([_, error]) => {
                            if (error) return void alert({ headline: 'Error', description: error.message })
                            alert({ headline: 'Teacher deleted' })
                        })
                    }
                >
                    Delete teacher
                </mdui-button>
            </div>
            <div>
            <mdui-button
                    variant="filled"
                    onClick={() =>
                        createSession(studentId, 'password').then(([session, error]) => {
                            if (error) return void alert({ headline: 'Error', description: error.message })
                            setToken(session)
                            alert({ headline: 'Student session created', description: session })
                        })
                    }
                >
                    Login as student
                </mdui-button>
                <mdui-button
                    variant="filled"
                    onClick={() =>
                        createSession(teacherId, 'password').then(([session, error]) => {
                            if (error) return void alert({ headline: 'Error', description: error.message })
                            setToken(session)
                            alert({ headline: 'Teacher session created', description: session })
                        })
                    }
                >
                    Login as teacher
                </mdui-button>
                <mdui-button
                    variant="filled"
                    onClick={() =>
                        createSession(adminId, 'password').then(([session, error]) => {
                            if (error) return void alert({ headline: 'Error', description: error.message })
                            setToken(session)
                            alert({ headline: 'Admin session created', description: session })
                        })
                    }
                >
                    Login as admin
                </mdui-button>
            </div>
        </main>
    )
}
