<script lang="ts">
	import type { StatutRelecture } from '$lib/domain/relecture/statut';

	let { statut }: { statut: StatutRelecture } = $props();

	const libelles: Record<StatutRelecture, string> = {
		draft: 'Brouillon',
		pending_review: 'En relecture',
		approved: 'Approuvée',
		deprecated: 'Dépréciée'
	};
</script>

<span class="badge badge-{statut}">{libelles[statut]}</span>

<style>
	.badge {
		font-size: 0.75rem;
		padding: 0.15rem 0.5rem;
		border-radius: 1rem;
		white-space: nowrap;
	}
	.badge-draft {
		background: #eceff1;
		color: #455a64;
	}
	.badge-pending_review {
		background: #fff8e1;
		color: #8d6e00;
	}
	.badge-approved {
		background: #e8f5e9;
		color: #2e7d32;
	}
	.badge-deprecated {
		background: #fbe9e7;
		color: #c62828;
	}
</style>
