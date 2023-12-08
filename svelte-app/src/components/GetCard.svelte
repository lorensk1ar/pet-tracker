<script>
  export let pet

  const handleRemove = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/pets/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        console.log('Remove ok')
      } else {
        console.error('Remove fail')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

</script>

<p>Name: {pet.name}</p>

<p>Species: {pet.species}</p>

<img src={'./img/' + pet.picture} alt="A {pet.species.toLowerCase()} named {pet.name}">

{#if pet.friendly}
<p>{pet.name} is super friendly!</p>
{:else}
<p>Careful, {pet.name} is not so friendly...</p>
{/if}

<button on:click={handleRemove(pet.id)}> Remove </button>

<br>

<style>
  img {
    height: 15rem; 
  }
</style>
