import { Dynamic } from 'solid-js/web'

import styles from './Text.module.scss'

import type { ComponentProps } from 'solid-js'

type TextCategory = 'display' | 'headline' | 'title' | 'body' | 'label'
type TextSize = 'large' | 'medium' | 'small'

const createTextComponent =
    (category: TextCategory) =>
    <As extends 'p' | 'span' | 'label' | `h${1 | 2 | 3 | 4 | 5 | 6}`>(
        props: { as?: As; size: TextSize } & ComponentProps<As>,
    ) => {
        // @ts-expect-error: Some things are just too complex for TypeScript
        return <Dynamic {...props} component={props.as ?? 'p'} class={styles[`${category}-${props.size}`]} />
    }

const Text: Record<Capitalize<TextCategory>, ReturnType<typeof createTextComponent>> = {
    Display: createTextComponent('display'),
    Headline: createTextComponent('headline'),
    Title: createTextComponent('title'),
    Body: createTextComponent('body'),
    Label: createTextComponent('label'),
}

export default Text
