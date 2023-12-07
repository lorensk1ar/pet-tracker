<script>
  import { onMount } from 'svelte'

  let pets = []

  onMount(async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/pets')
      const data = await response.json()
      pets = data
    } catch (error) {
      console.error('Gretchen, stop trying to make fetch happen!', error)
    }
  })

  import GetCard from './GetCard.svelte'

  let update = false

</script>

<h3> Pet List </h3>

{#each pets as pet}
  <GetCard {pet} {update} />
  <hr>
{/each}


