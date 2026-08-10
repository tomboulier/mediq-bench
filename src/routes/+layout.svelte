<script lang="ts">
	import { base } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>MediQ-Bench</title>
</svelte:head>

<header>
	<nav>
		<strong><a href="{base}/">MediQ-Bench</a></strong>
		<a href="{base}/creer">Proposer une question</a>
	</nav>
</header>

<main>
	{@render children()}
</main>

<footer>
	<p>
		Banque collaborative de questions-réponses cliniques — données CC-BY 4.0, code EUPL-1.2.
	</p>
</footer>

<style>
	header {
		background: #1a1a2e;
		padding: 0.75rem 1rem;
	}
	nav {
		max-width: 52rem;
		margin: 0 auto;
		display: flex;
		gap: 1.5rem;
		align-items: baseline;
	}
	header a {
		color: white;
		text-decoration: none;
	}
	header a:hover {
		text-decoration: underline;
	}
	footer {
		max-width: 52rem;
		margin: 2rem auto 0;
		padding: 1rem;
		font-size: 0.85rem;
		color: #666;
		border-top: 1px solid #e0e0e0;
	}
</style>
