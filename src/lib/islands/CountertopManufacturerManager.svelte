<script>
    import { getCountertopManufacturers, createCountertopManufacturer, updateCountertopManufacturer, deleteCountertopManufacturer } from '$lib/api/graphql.js';
    import CountertopManufacturerModal from './CountertopManufacturerModal.svelte';

    let manufacturers = $state([]);
    let isLoading = $state(true);
    let error = $state(null);
    let searchQuery = $state('');
    let showModal = $state(false);
    let editingManufacturer = $state(null);
    let showDeleted = $state(false);

    // Filtered manufacturers based on search
    let filteredManufacturers = $derived(
        manufacturers.filter(m => 
            m.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.country && m.country.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    );

    async function loadManufacturers() {
        isLoading = true;
        error = null;
        try {
            manufacturers = await getCountertopManufacturers({ 
                trashed: showDeleted ? 'WITH' : 'WITHOUT' 
            });
        } catch (e) {
            error = e.message;
            console.error('Failed to load manufacturers:', e);
        } finally {
            isLoading = false;
        }
    }

    function openAddModal() {
        editingManufacturer = null;
        showModal = true;
    }

    function openEditModal(manufacturer) {
        editingManufacturer = manufacturer;
        showModal = true;
    }

    async function handleSave(event) {
        const data = event.detail;
        try {
            if (editingManufacturer) {
                await updateCountertopManufacturer(editingManufacturer.id, data);
            } else {
                await createCountertopManufacturer(data);
            }
            showModal = false;
            await loadManufacturers();
        } catch (e) {
            console.error('Failed to save manufacturer:', e);
            alert('Ошибка сохранения: ' + e.message);
        }
    }

    async function handleDelete(manufacturer) {
        if (!confirm(`Удалить производителя "${manufacturer.value}"?`)) return;
        
        try {
            await deleteCountertopManufacturer(manufacturer.id);
            await loadManufacturers();
        } catch (e) {
            console.error('Failed to delete manufacturer:', e);
            alert('Ошибка удаления: ' + e.message);
        }
    }

    $effect(() => {
        loadManufacturers();
    });
</script>

<div class="manufacturer-manager">
    <!-- Header -->
    <div class="header">
        <div class="header-left">
            <h2>Производители столешниц</h2>
            <span class="count">{filteredManufacturers.length} из {manufacturers.length}</span>
        </div>
        <div class="header-right">
            <label class="show-deleted">
                <input type="checkbox" bind:checked={showDeleted} onchange={loadManufacturers}>
                Показать удалённые
            </label>
            <button class="btn-add" onclick={openAddModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14"/>
                </svg>
                Добавить производителя
            </button>
        </div>
    </div>

    <!-- Search -->
    <div class="search-bar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
        </svg>
        <input 
            type="text" 
            placeholder="Поиск по названию или стране..." 
            bind:value={searchQuery}
        >
    </div>

    <!-- Loading / Error -->
    {#if isLoading}
        <div class="loading">
            <div class="spinner"></div>
            <span>Загрузка...</span>
        </div>
    {:else if error}
        <div class="error">
            <span>Ошибка: {error}</span>
            <button onclick={loadManufacturers}>Повторить</button>
        </div>
    {:else if filteredManufacturers.length === 0}
        <div class="empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <p>Производители не найдены</p>
            <button class="btn-add" onclick={openAddModal}>Добавить первого</button>
        </div>
    {:else}
        <!-- Table -->
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th class="col-logo">Логотип</th>
                        <th class="col-name">Название</th>
                        <th class="col-category">Категория</th>
                        <th class="col-country">Страна</th>
                        <th class="col-contacts">Контакты</th>
                        <th class="col-status">Статус</th>
                        <th class="col-actions">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {#each filteredManufacturers as manufacturer (manufacturer.id)}
                        <tr class:deleted={manufacturer.deleted_at}>
                            <td class="col-logo">
                                {#if manufacturer.logo}
                                    <img src={manufacturer.logo} alt={manufacturer.value} class="logo-thumb">
                                {:else}
                                    <div class="logo-placeholder">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <path d="M21 15l-5-5L5 21"/>
                                        </svg>
                                    </div>
                                {/if}
                            </td>
                            <td class="col-name">
                                <div class="name-cell">
                                    <span class="name">{manufacturer.value}</span>
                                    <span class="slug">/{manufacturer.slug}</span>
                                </div>
                            </td>
                            <td class="col-category">
                                {manufacturer.category?.value || '—'}
                            </td>
                            <td class="col-country">
                                {manufacturer.country || '—'}
                            </td>
                            <td class="col-contacts">
                                <div class="contacts">
                                    {#if manufacturer.website}
                                        <a href={manufacturer.website} target="_blank" rel="noopener noreferrer" class="contact-link" title={manufacturer.website}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                                            </svg>
                                        </a>
                                    {/if}
                                    {#if manufacturer.phone}
                                        <a href="tel:{manufacturer.phone}" class="contact-link" title={manufacturer.phone}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                                            </svg>
                                        </a>
                                    {/if}
                                    {#if manufacturer.email}
                                        <a href="mailto:{manufacturer.email}" class="contact-link" title={manufacturer.email}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <rect x="2" y="4" width="20" height="16" rx="2"/>
                                                <path d="m22 6-10 7L2 6"/>
                                            </svg>
                                        </a>
                                    {/if}
                                </div>
                            </td>
                            <td class="col-status">
                                {#if manufacturer.deleted_at}
                                    <span class="status status-deleted">Удалён</span>
                                {:else if manufacturer.is_active}
                                    <span class="status status-active">Активен</span>
                                {:else}
                                    <span class="status status-inactive">Неактивен</span>
                                {/if}
                            </td>
                            <td class="col-actions">
                                <div class="actions">
                                    <button class="btn-icon" onclick={() => openEditModal(manufacturer)} title="Редактировать">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                                        </svg>
                                    </button>
                                    {#if !manufacturer.deleted_at}
                                        <button class="btn-icon btn-danger" onclick={() => handleDelete(manufacturer)} title="Удалить">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <polyline points="3 6 5 6 21 6"/>
                                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                            </svg>
                                        </button>
                                    {/if}
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>

{#if showModal}
    <CountertopManufacturerModal 
        manufacturer={editingManufacturer}
        onclose={() => showModal = false}
        onsave={handleSave}
    />
{/if}

<style>
    .manufacturer-manager {
        padding: 24px;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .header-left h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: #1e293b;
    }

    .count {
        font-size: 14px;
        color: #64748b;
        background: #f1f5f9;
        padding: 4px 10px;
        border-radius: 12px;
    }

    .header-right {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .show-deleted {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #64748b;
        cursor: pointer;
    }

    .btn-add {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: #f59e0b;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
    }

    .btn-add:hover {
        background: #d97706;
    }

    .search-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        margin-bottom: 20px;
    }

    .search-bar svg {
        color: #94a3b8;
    }

    .search-bar input {
        flex: 1;
        border: none;
        background: none;
        font-size: 14px;
        outline: none;
    }

    .loading, .error, .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: #64748b;
        gap: 16px;
    }

    .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #e2e8f0;
        border-top-color: #f59e0b;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .error {
        color: #ef4444;
    }

    .error button {
        padding: 8px 16px;
        background: #fee2e2;
        color: #dc2626;
        border: none;
        border-radius: 6px;
        cursor: pointer;
    }

    .table-container {
        background: white;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        overflow: hidden;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        padding: 12px 16px;
        text-align: left;
    }

    th {
        background: #f8fafc;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        color: #64748b;
        border-bottom: 1px solid #e2e8f0;
    }

    td {
        border-bottom: 1px solid #f1f5f9;
        font-size: 14px;
        color: #334155;
    }

    tr:last-child td {
        border-bottom: none;
    }

    tr:hover {
        background: #fafafa;
    }

    tr.deleted {
        opacity: 0.5;
        background: #fef2f2;
    }

    .col-logo {
        width: 60px;
    }

    .logo-thumb {
        width: 48px;
        height: 48px;
        object-fit: contain;
        border-radius: 6px;
        background: #f8fafc;
    }

    .logo-placeholder {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f1f5f9;
        border-radius: 6px;
        color: #94a3b8;
    }

    .name-cell {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .name {
        font-weight: 500;
        color: #1e293b;
    }

    .slug {
        font-size: 12px;
        color: #94a3b8;
    }

    .contacts {
        display: flex;
        gap: 8px;
    }

    .contact-link {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: #f1f5f9;
        border-radius: 6px;
        color: #64748b;
        transition: all 0.2s;
    }

    .contact-link:hover {
        background: #f59e0b;
        color: white;
    }

    .status {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
    }

    .status-active {
        background: #dcfce7;
        color: #16a34a;
    }

    .status-inactive {
        background: #f1f5f9;
        color: #64748b;
    }

    .status-deleted {
        background: #fee2e2;
        color: #dc2626;
    }

    .actions {
        display: flex;
        gap: 8px;
    }

    .btn-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: #f1f5f9;
        border: none;
        border-radius: 6px;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-icon:hover {
        background: #e2e8f0;
        color: #334155;
    }

    .btn-danger:hover {
        background: #fee2e2;
        color: #dc2626;
    }
</style>
