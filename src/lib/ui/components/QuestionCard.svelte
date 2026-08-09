<script lang="ts">
	import type { Question } from '$lib/domain/questions/question';
	import StatusBadge from './StatusBadge.svelte';

	let { question }: { question: Question } = $props();
</script>

<article class="carte">
	<header>
		<h3>{question.titre}</h3>
		<StatusBadge statut={question.statut} />
	</header>

	<p class="enonce">{question.question}</p>

	{#if question.type === 'qcm'}
		<ol type="A">
			{#each question.choix as choix, index}
				<li class:correct={String.fromCharCode(65 + index) === question.reponse}>{choix}</li>
			{/each}
		</ol>
	{:else}
		<p><strong>Réponse attendue :</strong> {question.reponse}</p>
	{/if}

	<details>
		<summary>Références</summary>
		<ul>
			{#each question.references as reference}
				<li><a href={reference.url}>{reference.titre}</a></li>
			{/each}
		</ul>
	</details>

	<footer>
		{#each question.tags as tag}
			<span class="tag">{tag}</span>
		{/each}
		<span class="auteur">{question.auteur}</span>
	</footer>
</article>

<style>
	.carte {
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 0.5rem;
		padding: 1rem;
		margin-bottom: 1rem;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
	}
	h3 {
		margin: 0;
	}
	.enonce {
		font-weight: 500;
	}
	.correct {
		font-weight: 700;
		color: #2e7d32;
	}
	.tag {
		font-size: 0.75rem;
		background: #e3f2fd;
		color: #005a9c;
		padding: 0.1rem 0.5rem;
		border-radius: 1rem;
		margin-right: 0.4rem;
	}
	.auteur {
		font-size: 0.8rem;
		color: #666;
		float: right;
	}
</style>
