<script>
    import { page } from '$app/stores';

    const menuItems = [
        { name: 'Мебель', href: '/rubrics/mebel' },
        { name: 'Бытовая техника', href: '/rubrics/appliances' },
        { name: 'Столешницы', href: '/rubrics/countertops' },
        { name: 'Сантехника', href: '/rubrics/plumbing' },
        { name: 'Фурнитура', href: '/rubrics/fittings' },
        { name: 'Аксессуары', href: '/rubrics/accessories' }
    ];
</script>

<aside class="w-64 bg-white shadow-lg min-h-screen flex flex-col z-10">
    <!-- Brand -->
    <div class="h-16 flex items-center px-6 border-b border-gray-100">
        <span class="text-xl font-bold text-gray-800 tracking-tight">N-Admin</span>
    </div>
    
    <!-- Navigation -->
    <nav class="p-4 space-y-1 flex-1 overflow-y-auto">
        <a 
            href="/dashboard"
            class="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
            {$page.url.pathname === '/dashboard' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
        >
            <svg class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Дашборд
        </a>

        <div class="mt-6 mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Рубрики
        </div>
        {#each menuItems as item}
            <a 
                href={item.href}
                class="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
                {$page.url.pathname.includes(item.href) 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
            >
                {item.name}
            </a>
        {/each}
    </nav>

    <!-- Footer or Info -->
    <div class="p-4 border-t border-gray-100">
        <p class="text-xs text-center text-gray-400">© 2026 Admin Panel</p>
    </div>
</aside>
