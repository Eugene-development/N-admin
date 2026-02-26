<script>
	import { getCategoriesByRubricSlug } from '$lib/api/graphql.js';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';
	import LogoUploader from '$lib/components/LogoUploader.svelte';

	let { manufacturer = null, onclose, onsave } = $props();

	let categories = $state([]);
	let isLoadingCategories = $state(true);

	// Form data - initialized once from manufacturer prop
	let formData = $state({
		category_id: '',
		value: '',
		slug: '',
		description: '',
		logo: '',
		website: '',
		phone: '',
		email: '',
		country: '',
		is_active: true,
		sort_order: 0
	});

	// Initialize formData from manufacturer prop
	$effect(() => {
		if (manufacturer) {
			formData = {
				category_id: manufacturer.category_id || '',
				value: manufacturer.value || '',
				slug: manufacturer.slug || '',
				description: manufacturer.description || '',
				logo: manufacturer.logo || '',
				website: manufacturer.website || '',
				phone: manufacturer.phone || '',
				email: manufacturer.email || '',
				country: manufacturer.country || '',
				is_active: manufacturer.is_active ?? true,
				sort_order: manufacturer.sort_order || 0
			};
		}
	});

	// Title computed from manufacturer
	let modalTitle = $derived(
		manufacturer ? 'Редактировать производителя' : 'Добавить производителя'
	);
	let submitLabel = $derived(manufacturer ? 'Сохранить' : 'Добавить');

	let errors = $state({});

	async function loadCategories() {
		try {
			const data = await getCategoriesByRubricSlug('stoleshnica');
			categories = data.categories || [];
		} catch (e) {
			console.error('Failed to load categories:', e);
		} finally {
			isLoadingCategories = false;
		}
	}

	function validate() {
		errors = {};

		if (!formData.category_id) {
			errors.category_id = 'Выберите категорию';
		}
		if (!formData.value.trim()) {
			errors.value = 'Введите название';
		}
		if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			errors.email = 'Неверный формат email';
		}
		if (formData.website && !formData.website.startsWith('http')) {
			errors.website = 'URL должен начинаться с http:// или https://';
		}

		return Object.keys(errors).length === 0;
	}

	function handleSubmit(e) {
		e.preventDefault();

		if (!validate()) return;

		const data = {
			...formData,
			sort_order: parseInt(formData.sort_order) || 0
		};

		// Remove empty optional fields
		if (!data.slug) delete data.slug;
		if (!data.description) delete data.description;
		if (!data.logo) delete data.logo;
		if (!data.website) delete data.website;
		if (!data.phone) delete data.phone;
		if (!data.email) delete data.email;
		if (!data.country) delete data.country;

		onsave({ detail: data });
	}

	function handleBackdropClick(e) {
		if (e.target === e.currentTarget) {
			onclose();
		}
	}

	$effect(() => {
		loadCategories();
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-backdrop" onclick={handleBackdropClick}>
	<div class="modal">
		<div class="modal-header">
			<h3>{modalTitle}</h3>
			<button class="btn-close" onclick={onclose} aria-label="Закрыть">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M18 6L6 18M6 6l12 12" />
				</svg>
			</button>
		</div>

		<form onsubmit={handleSubmit}>
			<div class="modal-body">
				<div class="form-grid">
					<!-- Category -->
					<div class="form-group full-width">
						<label for="category">Категория столешниц *</label>
						{#if isLoadingCategories}
							<select disabled>
								<option>Загрузка...</option>
							</select>
						{:else}
							<select
								id="category"
								bind:value={formData.category_id}
								class:error={errors.category_id}
							>
								<option value="">Выберите категорию</option>
								{#each categories as cat}
									<option value={cat.id}>{cat.value}</option>
								{/each}
							</select>
						{/if}
						{#if errors.category_id}<span class="error-text">{errors.category_id}</span>{/if}
					</div>

					<!-- Name -->
					<div class="form-group">
						<label for="value">Название *</label>
						<input
							type="text"
							id="value"
							bind:value={formData.value}
							placeholder="Например: Caesarstone"
							class:error={errors.value}
						/>
						{#if errors.value}<span class="error-text">{errors.value}</span>{/if}
					</div>

					<!-- Slug -->
					<div class="form-group">
						<label for="slug">URL-slug</label>
						<input
							type="text"
							id="slug"
							bind:value={formData.slug}
							placeholder="Автоматически из названия"
						/>
					</div>

					<!-- Country -->
					<div class="form-group">
						<label for="country">Страна</label>
						<input
							type="text"
							id="country"
							bind:value={formData.country}
							placeholder="Россия, Германия, Италия..."
						/>
					</div>

					<!-- Website -->
					<div class="form-group">
						<label for="website">Сайт</label>
						<input
							type="url"
							id="website"
							bind:value={formData.website}
							placeholder="https://example.com"
							class:error={errors.website}
						/>
						{#if errors.website}<span class="error-text">{errors.website}</span>{/if}
					</div>

					<!-- Phone -->
					<div class="form-group">
						<label for="phone">Телефон</label>
						<input
							type="tel"
							id="phone"
							bind:value={formData.phone}
							placeholder="+7 (999) 123-45-67"
						/>
					</div>

					<!-- Email -->
					<div class="form-group">
						<label for="email">Email</label>
						<input
							type="email"
							id="email"
							bind:value={formData.email}
							placeholder="info@example.com"
							class:error={errors.email}
						/>
						{#if errors.email}<span class="error-text">{errors.email}</span>{/if}
					</div>

					<!-- Logo Upload -->
					<div class="form-group full-width">
						<LogoUploader
							bind:logoUrl={formData.logo}
							onchange={(url) => (formData.logo = url)}
							label="Логотип"
						/>
					</div>

					<!-- Description -->
					<div class="form-group full-width">
						<label>Описание</label>
						<RichTextEditor
							content={formData.description}
							onchange={(html) => (formData.description = html)}
							placeholder="Описание производителя..."
						/>
					</div>

					<!-- Sort Order -->
					<div class="form-group">
						<label for="sort_order">Порядок сортировки</label>
						<input type="number" id="sort_order" bind:value={formData.sort_order} min="0" />
					</div>

					<!-- Is Active -->
					<div class="form-group">
						<label class="checkbox-label">
							<input type="checkbox" bind:checked={formData.is_active} />
							Активен
						</label>
					</div>
				</div>
			</div>

			<div class="modal-footer">
				<button type="button" class="btn-cancel" onclick={onclose}>Отмена</button>
				<button type="submit" class="btn-save">
					{submitLabel}
				</button>
			</div>
		</form>
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}

	.modal {
		background: white;
		border-radius: 16px;
		width: 100%;
		max-width: 640px;
		max-height: calc(100vh - 40px);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px;
		border-bottom: 1px solid #e2e8f0;
	}

	.modal-header h3 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
		color: #1e293b;
	}

	.btn-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: #f1f5f9;
		border: none;
		border-radius: 8px;
		color: #64748b;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-close:hover {
		background: #e2e8f0;
		color: #334155;
	}

	.modal-body {
		padding: 24px;
		overflow-y: auto;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.form-group.full-width {
		grid-column: 1 / -1;
	}

	label {
		font-size: 13px;
		font-weight: 500;
		color: #475569;
	}

	input,
	select {
		padding: 10px 12px;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		font-size: 14px;
		outline: none;
		transition: border-color 0.2s;
	}

	input:focus,
	select:focus {
		border-color: #f59e0b;
	}

	input.error,
	select.error {
		border-color: #ef4444;
	}

	.error-text {
		font-size: 12px;
		color: #ef4444;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		padding-top: 24px;
	}

	.checkbox-label input {
		width: 18px;
		height: 18px;
		cursor: pointer;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		padding: 16px 24px;
		border-top: 1px solid #e2e8f0;
		background: #f8fafc;
	}

	.btn-cancel,
	.btn-save {
		padding: 10px 20px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-cancel {
		background: white;
		border: 1px solid #e2e8f0;
		color: #64748b;
	}

	.btn-cancel:hover {
		background: #f1f5f9;
	}

	.btn-save {
		background: #f59e0b;
		border: none;
		color: white;
	}

	.btn-save:hover {
		background: #d97706;
	}
</style>
