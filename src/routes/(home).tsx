import { alert } from 'mdui'

import 'mdui/mdui.css'
import '../styles/globals.scss'

import 'mdui/components/button'

export default () => (
    <main>
        <h1>Classy app</h1>
        <mdui-button variant="filled" onClick={() => alert({ headline: 'Hello world', description: 'Hi world!' })}>
            Click me
        </mdui-button>
    </main>
)
