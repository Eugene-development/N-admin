<svelte:head>
	<title>Admin Panel | Novostroy</title>
</svelte:head>

<main class="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
	<div class="text-center">
		<h1 class="mb-4 text-4xl font-bold text-gray-900">Админ-панель-4</h1>
		<p class="mb-8 text-gray-600">Система управления Novostroy</p>

		<div class="flex gap-4">
			<a
				href="/login"
				class="rounded-md bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
			>
				Войти
			</a>
			<a
				href="/register"
				class="rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
			>
				Регистрация
			</a>
		</div>
	</div>
</main>
