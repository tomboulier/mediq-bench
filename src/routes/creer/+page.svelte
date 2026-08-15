<script lang="ts">
	import { creerQuestion } from '$lib/application/creer-question';
	import { soumettreQuestion } from '$lib/application/soumettre-question';
	import { listerRfe } from '$lib/application/consulter-questions';
	import { QuestionInvalideError } from '$lib/domain/questions/fabrique';
	import type { TypeQuestion } from '$lib/domain/questions/question';
	import { repository, submitter } from '$lib/infrastructure/composition';
	import tagsControles from '../../../data/meta/tags.json';

	const rfes = listerRfe(repository);

	let rfe = $state('');
	let titre = $state('');
	let type = $state<TypeQuestion>('ouverte');
	let enonce = $state('');
	let reponse = $state('');
	let choix = $state<string[]>(['', '']);
	let auteur = $state('');
	let references = $state([{ titre: '', url: '' }]);
	let tags = $state<string[]>([]);
	let erreurs = $state<string[]>([]);
	let soumise = $state(false);

	function ajouterChoix() {
		choix.push('');
	}

	function retirerChoix(index: number) {
		choix.splice(index, 1);
	}

	function ajouterReference() {
		references.push({ titre: '', url: '' });
	}

	function retirerReference(index: number) {
		references.splice(index, 1);
	}

	function lettresDesChoix(): string[] {
		return choix.map((_, index) => String.fromCharCode(65 + index));
	}

	function basculerTag(tag: string) {
		if (tags.includes(tag)) {
			tags = tags.filter((t) => t !== tag);
		} else {
			tags = [...tags, tag];
		}
	}

	function soumettre(e: SubmitEvent) {
		e.preventDefault();
		erreurs = [];
		try {
			const question = creerQuestion({
				titre,
				type,
				question: enonce,
				reponse,
				choix: type === 'qcm' ? choix : undefined,
				auteur,
				references,
				tags
			});
			soumise = true;
			window.open(soumettreQuestion(submitter, rfe, question), '_blank');
		} catch (e) {
			if (e instanceof QuestionInvalideError) {
				erreurs = e.erreurs;
			} else {
				throw e;
			}
		}
	}
</script>

<svelte:head>
	<title>Proposer une question — MediQ-Bench</title>
</svelte:head>

<h1>Proposer une question</h1>
<p>
	Remplissez ce formulaire : il ouvrira une page GitHub déjà remplie avec votre question. Vous
	n'aurez qu'à cocher la case de licence et cliquer sur <em>Create</em> ; le reste est
	automatique, et votre proposition sera relue par le comité d'experts avant publication.
</p>
<p class="prerequis">
	Un compte GitHub (gratuit) est nécessaire pour cette dernière étape. Si vous n'en avez pas,
	remplissez quand même le formulaire et transmettez la page obtenue à un référent du projet.
</p>

{#if erreurs.length > 0}
	<div class="erreurs" role="alert">
		<strong>La question n'est pas encore complète :</strong>
		<ul>
			{#each erreurs as erreur}
				<li>{erreur}</li>
			{/each}
		</ul>
	</div>
{/if}

{#if soumise}
	<p class="confirmation">
		Votre proposition a été ouverte dans GitHub : vérifiez le contenu, cochez la case de licence
		en bas de page, puis cliquez sur <em>Create</em>. Elle sera relue par le comité avant
		publication.
	</p>
{/if}

<form onsubmit={soumettre}>
	<label>
		Recommandation concernée
		<select bind:value={rfe} required>
			<option value="" disabled>Choisir…</option>
			{#await rfes then liste}
				{#each liste as r}
					<option value={r}>{r}</option>
				{/each}
			{/await}
		</select>
	</label>

	<label>
		Titre court
		<input bind:value={titre} placeholder="Ex : PTH standard" required />
	</label>

	<fieldset>
		<legend>Type de question</legend>
		<label class="inline">
			<input type="radio" bind:group={type} value="ouverte" /> Question ouverte (réponse en texte
			libre)
		</label>
		<label class="inline">
			<input type="radio" bind:group={type} value="qcm" /> QCM (une seule bonne réponse)
		</label>
	</fieldset>

	<label>
		Question
		<textarea bind:value={enonce} rows="3" required></textarea>
	</label>

	{#if type === 'qcm'}
		<fieldset>
			<legend>Choix de réponse</legend>
			{#each choix as c, index}
				<div class="choix">
					<span class="lettre">{String.fromCharCode(65 + index)}</span>
					<input bind:value={choix[index]} placeholder={`Choix ${String.fromCharCode(65 + index)}`} />
					{#if choix.length > 2}
						<button type="button" class="secondaire" onclick={() => retirerChoix(index)}>
							Retirer
						</button>
					{/if}
				</div>
			{/each}
			<button type="button" class="secondaire" onclick={ajouterChoix}>Ajouter un choix</button>
		</fieldset>

		<label>
			Bonne réponse
			<select bind:value={reponse} required>
				<option value="" disabled>Choisir…</option>
				{#each lettresDesChoix() as lettre}
					<option value={lettre}>{lettre}</option>
				{/each}
			</select>
		</label>
	{:else}
		<label>
			Réponse attendue
			<textarea bind:value={reponse} rows="2" required></textarea>
		</label>
	{/if}

	<fieldset>
		<legend>Références aux recommandations (au moins une)</legend>
		{#each references as reference, index}
			<div class="reference">
				<input bind:value={reference.titre} placeholder="Titre de la recommandation" />
				<input bind:value={reference.url} placeholder="https://…" type="url" />
				{#if references.length > 1}
					<button type="button" class="secondaire" onclick={() => retirerReference(index)}>
						Retirer
					</button>
				{/if}
			</div>
		{/each}
		<button type="button" class="secondaire" onclick={ajouterReference}>
			Ajouter une référence
		</button>
	</fieldset>

	<fieldset>
		<legend>Tags</legend>
		{#each tagsControles as tag}
			<label class="inline">
				<input
					type="checkbox"
					checked={tags.includes(tag)}
					onchange={() => basculerTag(tag)}
				/>
				{tag}
			</label>
		{/each}
	</fieldset>

	<label>
		Votre nom (auteur de la question)
		<input bind:value={auteur} placeholder="Prénom Nom" required />
	</label>

	<p style="margin-top: 1.5rem">
		<button type="submit">Proposer sur GitHub</button>
	</p>
</form>

<style>
	fieldset {
		border: 1px solid #e0e0e0;
		border-radius: 0.375rem;
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		background: white;
	}
	legend {
		font-weight: 600;
		padding: 0 0.4rem;
	}
	.inline {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 400;
		margin-top: 0.4rem;
	}
	.inline input {
		width: auto;
	}
	.choix,
	.reference {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		margin-bottom: 0.5rem;
	}
	.lettre {
		font-weight: 700;
		width: 1.2rem;
		text-align: center;
	}
	.secondaire {
		background: #eceff1;
		color: #37474f;
		font-size: 0.85rem;
		padding: 0.35rem 0.8rem;
	}
	.secondaire:hover {
		background: #dfe3e6;
	}
	.prerequis {
		font-size: 0.9rem;
		color: #555;
		border-left: 3px solid #e0e0e0;
		padding-left: 0.75rem;
	}
	.confirmation {
		background: #e8f5e9;
		border: 1px solid #a5d6a7;
		border-radius: 0.375rem;
		padding: 0.75rem 1rem;
	}
</style>
