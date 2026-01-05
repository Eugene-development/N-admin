<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    onMount(() => {
        goto('/rubrics/mebel', { replaceState: true });
    });
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
    <p class="text-gray-500">Перенаправление...</p>
</div>

