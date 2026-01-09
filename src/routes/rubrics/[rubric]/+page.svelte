<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { initAuth, getAuthState } from '$lib/stores/auth.svelte.js';
    import { getRubricBySlug } from '$lib/api/graphql.js';
    import AdminLayout from '$lib/components/AdminLayout.svelte';
    import CategoryManager from '$lib/islands/CategoryManager.svelte';

    const auth = getAuthState();
    let isChecking = $state(true);
    let rubric = $state(null);
    let loadError = $state(null);
    
    // Use derived state to react to page navigation
    let currentRubricSlug = $derived($page.params.rubric);
    let title = $derived(rubric ? rubric.value : currentRubricSlug);

    onMount(async () => {
        await initAuth();
        isChecking = false;
        
        if (!auth.isAuthenticated) {
            goto('/login');
            return;
        }

        // Load rubric by slug
        try {
            rubric = await getRubricBySlug(currentRubricSlug);
            if (!rubric) {
                loadError = 'Рубрика не найдена';
            }
        } catch (e) {
            loadError = e.message;
        }
    });

    // React to rubric slug changes
    $effect(() => {
        if (auth.isAuthenticated && currentRubricSlug) {
            getRubricBySlug(currentRubricSlug).then(r => {
                rubric = r;
                loadError = r ? null : 'Рубрика не найдена';
            }).catch(e => {
                loadError = e.message;
            });
        }
    });
</script>

<svelte:head>
    <title>{title} | Admin</title>
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
        {#if loadError}
            <div class="rounded-lg bg-red-50 border border-red-200 p-6 text-center">
                <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <h3 class="mt-4 text-lg font-medium text-red-800">Ошибка</h3>
                <p class="mt-2 text-red-600">{loadError}</p>
                <a href="/dashboard" class="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
                    ← Вернуться на дашборд
                </a>
            </div>
        {:else if rubric}
            <CategoryManager 
                rubricId={rubric.id} 
                rubricSlug={rubric.slug}
                title="Категории: {rubric.value}" 
            />
        {:else}
            <div class="py-12 text-center text-gray-500">
                <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                <p class="mt-2">Загрузка рубрики...</p>
            </div>
        {/if}
    </AdminLayout>
{/if}
