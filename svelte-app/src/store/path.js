import { writable } from 'svelte/store'

const apiPath = writable('http://127.0.0.1:5000/api/pets')

export default apiPath