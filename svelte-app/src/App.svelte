<script> 
	import AddPet from './components/AddPet.svelte'
	import ListPets from './components/ListPets.svelte'

</script>

<main role="main">
	<h1>Pet Tracker</h1>

	<section role="form" id="add-pet-heading" aria-labelledby="add-pet-heading">
		<AddPet />
	</section>

	<section role="list" id="list-pets-heading" aria-labelledby="list-pets-heading">
		<ListPets />
	</section>
</main>


<style>
	main {
		width: 360px;
	}

	h1 {
		text-align: center;
	}

	section {
		margin: 10px;
		border: 1px solid black;
		border-radius: 10px;
		padding: 10px
	}
</style>


