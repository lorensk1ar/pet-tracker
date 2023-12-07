<script>
  let pet = {
    name: '',
    picture: 'Picture URL',
    species: '',
    friendly: false
  }

  const handleAdd = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pet),
      })

      pet = {
        name: '',
        picture: 'Picture URL',
        species: '',
        friendly: false
        }

      if (response.ok) {
        console.log('Add ok')
      } else {
        console.error('Add fail')
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

</script>

<form>
  <h3>New Pet</h3>
  <div>
    <label for="pet-name">Pet Name<span class="required">*</span>: </label>
    <input type="text" id="pet-name" bind:value={pet.name} required/>
  </div><br>

  <div>
    <label for="profile-picture">Profile Picture<span class="required">*</span>: </label>
    <input type="url" id="profile-picture" bind:value={pet.picture} required/>
  </div><br>

  <fieldset>
    <legend>Species<span class="required">*</span></legend>
    
    <label for="species-dog">
      <input type="radio" name="species" id="species-dog" bind:value={pet.species} required>
      Dog
    </label>

    
    
    <label for="species-cat">
      <input type="radio" name="species" id="species-cat" bind:value={pet.species} required>
      Cat
    </label>

    <label for="species-fish">
      <input type="radio" name="species" id="species-fish" bind:value={pet.species} required>
      Fish
    </label>
  </fieldset><br>

  <div>
    <label for="pet-friendly">
      Is {pet.name} friendly?
      <input type="checkbox" id="pet-friendly"  bind:value={pet.friendly}/>
    </label>
  </div><br>


  <button on:click={handleAdd}> Add Pet </button>

</form>


<style>
  .required {
    color: red;
  }
</style>


