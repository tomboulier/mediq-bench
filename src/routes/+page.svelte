<script lang="ts">
	import { listerRfe } from '$lib/application/consulter-questions';
	import { repository } from '$lib/infrastructure/composition';

	const rfes = listerRfe(repository);
</script>

<svelte:head>
	<title>MediQ-Bench — Banque collaborative de questions cliniques</title>
</svelte:head>

<h1>MediQ-Bench</h1>
<p>
	Banque collaborative de questions-réponses cliniques, versionnée et relue par un comité
	d'experts. Les questions alimentent des benchmarks d'évaluation de modèles de langage en
	médecine.
</p>

<h2>Recommandations disponibles</h2>
{#await rfes}
	<p>Chargement…</p>
{:then liste}
	{#if liste.length === 0}
		<p>Aucune recommandation pour le moment.</p>
	{:else}
		<ul>
			{#each liste as rfe}
				<li><a href="/rfe/{rfe}">{rfe}</a></li>
			{/each}
		</ul>
	{/if}
{/await}

<p style="margin-top: 2rem">
	<a class="cta" href="/creer">Proposer une question</a>
</p>
