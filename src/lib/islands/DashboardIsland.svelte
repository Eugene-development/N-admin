<script>
    import { goto } from '$app/navigation';

    const menuItems = [
        {
            title: 'Рубрики',
            description: 'Управление рубриками каталога',
            icon: 'folder',
            href: '/rubrics-manage',
            color: 'indigo'
        },
        {
            title: 'Мебель',
            description: 'Категории мебели',
            icon: 'couch',
            href: '/rubrics/mebel',
            color: 'blue'
        },
        {
            title: 'Бытовая техника',
            description: 'Категории бытовой техники',
            icon: 'device',
            href: '/rubrics/appliances',
            color: 'green'
        },
        {
            title: 'Столешницы',
            description: 'Категории столешниц',
            icon: 'table',
            href: '/rubrics/countertops',
            color: 'amber'
        },
        {
            title: 'Сантехника',
            description: 'Категории сантехники',
            icon: 'droplet',
            href: '/rubrics/plumbing',
            color: 'cyan'
        },
        {
            title: 'Фурнитура',
            description: 'Категории фурнитуры',
            icon: 'tool',
            href: '/rubrics/fittings',
            color: 'orange'
        },
        {
            title: 'Аксессуары',
            description: 'Категории аксессуаров',
            icon: 'star',
            href: '/rubrics/accessories',
            color: 'pink'
        }
    ];

    const colorClasses = {
        indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200',
        blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200',
        green: 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200',
        amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200',
        cyan: 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border-cyan-200',
        orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200',
        pink: 'bg-pink-50 text-pink-600 hover:bg-pink-100 border-pink-200'
    };

    const iconColorClasses = {
        indigo: 'bg-indigo-500',
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        amber: 'bg-amber-500',
        cyan: 'bg-cyan-500',
        orange: 'bg-orange-500',
        pink: 'bg-pink-500'
    };
</script>

<div class="space-y-6">
    <!-- Welcome Section -->
    <div class="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 p-6 shadow-lg text-white">
        <h2 class="text-2xl font-bold mb-2">Добро пожаловать в панель управления!</h2>
        <p class="text-indigo-100">
            Здесь вы можете управлять рубриками и категориями каталога.
        </p>
    </div>

    <!-- Menu Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each menuItems as item}
            <a
                href={item.href}
                class="group rounded-xl bg-white p-5 shadow-sm border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 {colorClasses[item.color]}"
            >
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-lg {iconColorClasses[item.color]} flex items-center justify-center flex-shrink-0 shadow-sm">
                        {#if item.icon === 'folder'}
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                            </svg>
                        {:else if item.icon === 'couch'}
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7M4 10h16M8 14h8"/>
                            </svg>
                        {:else if item.icon === 'device'}
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                        {:else if item.icon === 'table'}
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 6h18M3 14h18M3 18h18"/>
                            </svg>
                        {:else if item.icon === 'droplet'}
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                            </svg>
                        {:else if item.icon === 'tool'}
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                        {:else if item.icon === 'star'}
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                            </svg>
                        {/if}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="font-semibold text-gray-900 group-hover:text-current transition-colors">
                            {item.title}
                        </h3>
                        <p class="text-sm text-gray-500 mt-1">
                            {item.description}
                        </p>
                    </div>
                    <svg class="w-5 h-5 text-gray-400 group-hover:text-current transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            </a>
        {/each}
    </div>
</div>
