import {writable} from 'svelte/store'

let pets = writable([])

export default pets