<script lang="ts">
	import { page } from '$app/state';
	import { consulterQuestions } from '$lib/application/consulter-questions';
	import { STATUTS_RELECTURE, type StatutRelecture } from '$lib/domain/relecture/statut';
	import { repository } from '$lib/infrastructure/composition';
	import QuestionCard from '$lib/ui/components/QuestionCard.svelte';

	const rfe = $derived(page.params.id ?? '');

	let tag = $state('');
	let statut = $state('');

	const questions = $derived(
		consulterQuestions(repository, rfe, {
			tag: tag || undefined,
			statut: (statut || undefined) as StatutRelecture | undefined
		})
	);

	const tagsDisponibles = $derived(
		questions.then((liste) => [...new Set(liste.flatMap((q) => q.tags))].sort())
	);

	const libellesStatuts: Record<StatutRelecture, string> = {
		draft: 'Brouillon',
		pending_review: 'En relecture',
		approved: 'Approuvée',
		deprecated: 'Dépréciée'
	};
</script>

<svelte:head>
	<title>{rfe} — MediQ-Bench</title>
</svelte:head>

<p><a href="/">← Toutes les recommandations</a></p>
<h1>{rfe}</h1>

<form class="filtres">
	<label>
		Tag
		<select bind:value={tag}>
			<option value="">Tous</option>
			{#await tagsDisponibles then liste}
				{#each liste as t}
					<option value={t}>{t}</option>
				{/each}
			{/await}
		</select>
	</label>
	<label>
		Statut
		<select bind:value={statut}>
			<option value="">Tous</option>
			{#each STATUTS_RELECTURE as s}
				<option value={s}>{libellesStatuts[s]}</option>
			{/each}
		</select>
	</label>
</form>

{#await questions}
	<p>Chargement…</p>
{:then liste}
	{#if liste.length === 0}
		<p>Aucune question pour ces critères.</p>
	{:else}
		<p>{liste.length} question{liste.length > 1 ? 's' : ''}</p>
		{#each liste as question (question.id)}
			<QuestionCard {question} />
		{/each}
	{/if}
{/await}

<p style="margin-top: 2rem">
	<a class="cta" href="/creer">Proposer une question</a>
</p>

<style>
	.filtres {
		display: flex;
		gap: 1rem;
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		margin-bottom: 1.5rem;
	}
	.filtres label {
		margin-top: 0;
		flex: 1;
	}
</style>
