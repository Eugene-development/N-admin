<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { initAuth, getAuthState } from '$lib/stores/auth.svelte.js';
    import CountertopManufacturerManager from '$lib/islands/CountertopManufacturerManager.svelte';
    import AdminLayout from '$lib/components/AdminLayout.svelte';

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
    <title>Производители столешниц | N-admin</title>
</svelte:head>

{#if isChecking || auth.isLoading}
    <div class="flex min-h-screen items-center justify-center bg-gray-100">
        <p class="text-gray-600">Загрузка...</p>
    </div>
{:else if auth.isAuthenticated}
    <AdminLayout>
        <CountertopManufacturerManager />
    </AdminLayout>
{/if}
