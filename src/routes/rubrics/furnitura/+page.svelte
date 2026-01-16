<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { initAuth, getAuthState } from '$lib/stores/auth.svelte.js';
    import { getRubricBySlug } from '$lib/api/graphql.js';
    import AdminLayout from '$lib/components/AdminLayout.svelte';
    import ShopManager from '$lib/islands/ShopManager.svelte';

    const auth = getAuthState();
    let isChecking = $state(true);
    let rubric = $state(null);
    let loadError = $state(null);

    const RUBRIC_SLUG = 'furnitura';

    onMount(async () => {
        await initAuth();
        isChecking = false;
        
        if (!auth.isAuthenticated) {
            goto('/login');
            return;
        }

        // Load rubric by slug
        try {
            rubric = await getRubricBySlug(RUBRIC_SLUG);
            if (!rubric) {
                loadError = 'Рубрика "Фурнитура" не найдена';
            }
        } catch (e) {
            loadError = e.message;
        }
    });
</script>

<svelte:head>
    <title>Магазины фурнитуры | N-Admin</title>
</svelte:head>

{#if isChecking}
    <div class="flex min-h-screen items-center justify-center bg-gray-100">
        <div class="text-center">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p class="mt-2 text-gray-600">Проверка авторизации...</p>
        </div>
    </div>
{:else if auth.isAuthenticated}
    <AdminLayout>
        <div class="mb-6">
            <nav class="flex text-sm text-gray-500" aria-label="Breadcrumb">
                <ol class="flex items-center space-x-2">
                    <li><a href="/rubrics" class="hover:text-indigo-600">Рубрики</a></li>
                    <li><span>/</span></li>
                    <li class="text-gray-900 font-medium">Фурнитура — Магазины</li>
                </ol>
            </nav>
        </div>

        {#if loadError}
            <div class="rounded-lg bg-red-50 p-6 text-red-700 border border-red-200">
                <h3 class="font-medium">Ошибка загрузки</h3>
                <p class="mt-1">{loadError}</p>
            </div>
        {:else if rubric}
            <ShopManager 
                rubricId={rubric.id} 
                rubricSlug={RUBRIC_SLUG}
                title="Магазины фурнитуры"
            />
        {:else}
            <div class="rounded-lg bg-white p-6 shadow">
                <div class="flex items-center justify-center py-12">
                    <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                    <p class="ml-3 text-gray-600">Загрузка рубрики...</p>
                </div>
            </div>
        {/if}
    </AdminLayout>
{/if}
