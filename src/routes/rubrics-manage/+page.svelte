<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { initAuth, getAuthState } from '$lib/stores/auth.svelte.js';
    import AdminLayout from '$lib/components/AdminLayout.svelte';
    import RubricManager from '$lib/islands/RubricManager.svelte';

    const auth = getAuthState();
    let isChecking = $state(true);

    onMount(async () => {
        await initAuth();
        isChecking = false;
        
        if (!auth.isAuthenticated) {
            goto('/login');
        }
    });
</script>

<svelte:head>
    <title>Рубрики | Admin</title>
</svelte:head>

{#if isChecking || auth.isLoading}
    <div class="flex min-h-screen items-center justify-center bg-gray-50">
        <div class="flex flex-col items-center gap-2">
            <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-gray-500 text-sm">Проверка доступа...</p>
        </div>
    </div>
{:else if auth.isAuthenticated}
    <AdminLayout>
        <RubricManager />
    </AdminLayout>
{/if}
