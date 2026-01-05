<script>
    import Sidebar from './Sidebar.svelte';
    import { logout, getAuthState } from '$lib/stores/auth.svelte.js';
    import { goto } from '$app/navigation';
    
    let { children } = $props();
    const auth = getAuthState();

    async function handleLogout() {
        await logout();
        goto('/login');
    }
</script>

<div class="min-h-screen bg-gray-50 flex">
    <Sidebar />
    
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Top Header -->
        <header class="h-16 bg-white shadow-sm flex justify-between items-center px-8 z-0">
            <h2 class="text-lg font-medium text-gray-900">
                Управление контентом
            </h2>
            
            <div class="flex items-center gap-6">
                {#if auth.user}
                    <div class="flex items-center gap-2">
                        <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {auth.user.name[0]?.toUpperCase() || 'A'}
                        </div>
                        <span class="text-sm font-medium text-gray-700">{auth.user.name}</span>
                    </div>
                {/if}
                <button 
                    onclick={handleLogout} 
                    class="text-sm font-medium text-red-600 hover:text-red-800 transition-colors px-3 py-1.5 rounded hover:bg-red-50"
                >
                    Выйти
                </button>
            </div>
        </header>

        <!-- Main Content Area -->
        <main class="flex-1 overflow-auto p-8">
            <div class="max-w-7xl mx-auto">
                {@render children()}
            </div>
        </main>
    </div>
</div>
