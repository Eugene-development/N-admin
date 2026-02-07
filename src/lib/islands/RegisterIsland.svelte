<script>
    import { register } from '$lib/api/auth.js';
    import { setUser } from '$lib/stores/auth.svelte.js';
    import { goto } from '$app/navigation';

    let name = $state('');
    let email = $state('');
    let phone = $state('');
    let password = $state('');
    let password_confirmation = $state('');
    let errors = $state({});
    let isLoading = $state(false);
    let generalError = $state('');

    async function handleSubmit(e) {
        e.preventDefault();
        errors = {};
        generalError = '';
        isLoading = true;

        try {
            const response = await register({
                name,
                email,
                phone: phone || undefined,
                password,
                password_confirmation,
            });
            
            if (response.success) {
                setUser(response.user);
                goto('/dashboard');
            }
        } catch (error) {
            if (error.errors) {
                errors = error.errors;
            }
            generalError = error.message || 'Ошибка регистрации';
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="mx-auto max-w-md">
    <form onsubmit={handleSubmit} class="space-y-6">
        <h2 class="text-center text-2xl font-bold text-gray-900">Регистрация</h2>

        {#if generalError}
            <div class="rounded-md bg-red-50 p-4">
                <p class="text-sm text-red-700">{generalError}</p>
            </div>
        {/if}

        <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
                Имя
            </label>
            <input
                type="text"
                id="name"
                bind:value={name}
                required
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                class:border-red-500={errors.name}
            />
            {#if errors.name}
                <p class="mt-1 text-sm text-red-600">{errors.name[0]}</p>
            {/if}
        </div>

        <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
                Email
            </label>
            <input
                type="email"
                id="email"
                bind:value={email}
                required
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                class:border-red-500={errors.email}
            />
            {#if errors.email}
                <p class="mt-1 text-sm text-red-600">{errors.email[0]}</p>
            {/if}
        </div>

        <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">
                Телефон <span class="text-gray-400">(необязательно)</span>
            </label>
            <input
                type="tel"
                id="phone"
                bind:value={phone}
                placeholder="+7 (999) 123-45-67"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                class:border-red-500={errors.phone}
            />
            {#if errors.phone}
                <p class="mt-1 text-sm text-red-600">{errors.phone[0]}</p>
            {/if}
        </div>

        <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
                Пароль
            </label>
            <input
                type="password"
                id="password"
                bind:value={password}
                required
                minlength="8"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                class:border-red-500={errors.password}
            />
            {#if errors.password}
                <p class="mt-1 text-sm text-red-600">{errors.password[0]}</p>
            {/if}
        </div>

        <div>
            <label for="password_confirmation" class="block text-sm font-medium text-gray-700">
                Подтверждение пароля
            </label>
            <input
                type="password"
                id="password_confirmation"
                bind:value={password_confirmation}
                required
                minlength="8"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            />
        </div>

        <button
            type="submit"
            disabled={isLoading}
            class="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>

        <p class="text-center text-sm text-gray-600">
            Уже есть аккаунт?
            <a href="/login" class="text-blue-600 hover:text-blue-500">
                Войти
            </a>
        </p>
    </form>
</div>
