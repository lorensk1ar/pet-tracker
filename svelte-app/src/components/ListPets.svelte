<script>
  import { onMount } from 'svelte'

  import pets from '../store/pets.js'

  onMount(async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/pets')
      const data = await response.json()
      $pets = data
    } catch (error) {
      console.error('Gretchen, stop trying to make fetch happen!', error)
    }
  })

  import GetCard from './GetCard.svelte'

</script>

<h2> Pet List </h2>

{#each $pets as pet}
  <section>
    <GetCard {pet} />
    <hr>
  </section>
{/each}



