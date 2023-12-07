/*
let posts = [];

fetch('https://jsonplaceholder.typicode.com/posts')
  .then(response => response.json())
  .then(data => posts = data);

*/

import { writable } from 'svelte/store'
const pets = writable([
  {
    "name": "Fluffy",
    "picture": "fluffy.png",
    "species": "Dog",
    "friendly": true
  },
  {
    "name": "Whiskers",
    "picture": "whiskers.png",
    "species": "Cat",
    "friendly": false
  },
  {
    "name": "Bubbles",
    "picture": "bubbles.png",
    "species": "Fish",
    "friendly": false
  }
])

const petList = {
  subscribe: pets.subscribe,
  addPet(newPet) {
    pets.update(items => {
      return {...items, newPet}
    })
  removePet(petId) {
    pets.update(items => {
      return {...items}
    })
  }
}

export default petList