<script>
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';

	let { content = '', onchange = () => {}, placeholder = 'Начните вводить текст...' } = $props();

	let editorElement = $state(null);
	let editor = $state(null);
	let isFocused = $state(false);

	// Reactive toolbar state
	let activeStates = $state({
		bold: false,
		italic: false,
		strike: false,
		bulletList: false,
		orderedList: false,
		heading2: false,
		heading3: false
	});

	function updateActiveStates() {
		if (!editor) return;
		activeStates = {
			bold: editor.isActive('bold'),
			italic: editor.isActive('italic'),
			strike: editor.isActive('strike'),
			bulletList: editor.isActive('bulletList'),
			orderedList: editor.isActive('orderedList'),
			heading2: editor.isActive('heading', { level: 2 }),
			heading3: editor.isActive('heading', { level: 3 })
		};
	}

	onMount(() => {
		editor = new Editor({
			element: editorElement,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [2, 3]
					}
				})
			],
			content: content || '',
			editorProps: {
				attributes: {
					class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-4 py-3'
				}
			},
			onTransaction: () => {
				updateActiveStates();
			},
			onUpdate: ({ editor: e }) => {
				const html = e.getHTML();
				// Tiptap returns <p></p> for empty content
				onchange(html === '<p></p>' ? '' : html);
			},
			onFocus: () => {
				isFocused = true;
			},
			onBlur: () => {
				isFocused = false;
			}
		});
	});

	// Update editor content when prop changes externally (e.g., when switching between edit/create)
	$effect(() => {
		if (editor && content !== undefined) {
			const currentHTML = editor.getHTML();
			const normalizedCurrent = currentHTML === '<p></p>' ? '' : currentHTML;
			if (normalizedCurrent !== content) {
				editor.commands.setContent(content || '');
			}
		}
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	// Toolbar action helpers
	function toggleBold() {
		editor?.chain().focus().toggleBold().run();
	}
	function toggleItalic() {
		editor?.chain().focus().toggleItalic().run();
	}
	function toggleStrike() {
		editor?.chain().focus().toggleStrike().run();
	}
	function toggleBulletList() {
		editor?.chain().focus().toggleBulletList().run();
	}
	function toggleOrderedList() {
		editor?.chain().focus().toggleOrderedList().run();
	}
	function toggleHeading2() {
		editor?.chain().focus().toggleHeading({ level: 2 }).run();
	}
	function toggleHeading3() {
		editor?.chain().focus().toggleHeading({ level: 3 }).run();
	}
	function setHorizontalRule() {
		editor?.chain().focus().setHorizontalRule().run();
	}
</script>

<div
	class="rich-text-editor overflow-hidden rounded-lg border transition-colors {isFocused
		? 'border-indigo-500 ring-2 ring-indigo-500/20'
		: 'border-gray-300'}"
>
	<!-- Toolbar -->
	<div
		class="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50/80 px-2 py-1.5"
	>
		<!-- Text formatting group -->
		<div class="flex items-center gap-0.5">
			<button
				type="button"
				onclick={toggleBold}
				class="toolbar-btn {activeStates.bold ? 'active' : ''}"
				title="Жирный (Ctrl+B)"
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"
					/>
				</svg>
			</button>
			<button
				type="button"
				onclick={toggleItalic}
				class="toolbar-btn {activeStates.italic ? 'active' : ''}"
				title="Курсив (Ctrl+I)"
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
					<path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
				</svg>
			</button>
			<button
				type="button"
				onclick={toggleStrike}
				class="toolbar-btn {activeStates.strike ? 'active' : ''}"
				title="Зачёркнутый"
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
					<path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" />
				</svg>
			</button>
		</div>

		<div class="mx-1 h-5 w-px bg-gray-300"></div>

		<!-- Headings -->
		<div class="flex items-center gap-0.5">
			<button
				type="button"
				onclick={toggleHeading2}
				class="toolbar-btn text-xs font-bold {activeStates.heading2 ? 'active' : ''}"
				title="Заголовок H2"
			>
				H2
			</button>
			<button
				type="button"
				onclick={toggleHeading3}
				class="toolbar-btn text-xs font-bold {activeStates.heading3 ? 'active' : ''}"
				title="Заголовок H3"
			>
				H3
			</button>
		</div>

		<div class="mx-1 h-5 w-px bg-gray-300"></div>

		<!-- Lists -->
		<div class="flex items-center gap-0.5">
			<button
				type="button"
				onclick={toggleBulletList}
				class="toolbar-btn {activeStates.bulletList ? 'active' : ''}"
				title="Маркированный список"
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"
					/>
				</svg>
			</button>
			<button
				type="button"
				onclick={toggleOrderedList}
				class="toolbar-btn {activeStates.orderedList ? 'active' : ''}"
				title="Нумерованный список"
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"
					/>
				</svg>
			</button>
		</div>

		<div class="mx-1 h-5 w-px bg-gray-300"></div>

		<!-- Horizontal rule -->
		<button
			type="button"
			onclick={setHorizontalRule}
			class="toolbar-btn"
			title="Горизонтальная линия"
		>
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
				<path d="M4 11h16v2H4z" />
			</svg>
		</button>
	</div>

	<!-- Editor area -->
	<div bind:this={editorElement} class="editor-content"></div>
</div>

<style>
	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 0.375rem;
		color: #6b7280;
		transition: all 0.15s ease;
		cursor: pointer;
		border: none;
		background: transparent;
	}

	.toolbar-btn:hover {
		background-color: #e5e7eb;
		color: #374151;
	}

	.toolbar-btn.active {
		background-color: #e0e7ff;
		color: #4338ca;
	}

	/* Editor prose styles */
	:global(.editor-content .tiptap) {
		min-height: 120px;
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		line-height: 1.625;
		outline: none;
	}

	:global(.editor-content .tiptap p) {
		margin: 0 0 0.5em 0;
	}

	:global(.editor-content .tiptap p:last-child) {
		margin-bottom: 0;
	}

	:global(.editor-content .tiptap h2) {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 1em 0 0.5em 0;
		color: #111827;
	}

	:global(.editor-content .tiptap h3) {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0.75em 0 0.4em 0;
		color: #1f2937;
	}

	:global(.editor-content .tiptap ul) {
		list-style-type: disc;
		padding-left: 1.5em;
		margin: 0.5em 0;
	}

	:global(.editor-content .tiptap ol) {
		list-style-type: decimal;
		padding-left: 1.5em;
		margin: 0.5em 0;
	}

	:global(.editor-content .tiptap li) {
		margin: 0.25em 0;
	}

	:global(.editor-content .tiptap li p) {
		margin: 0;
	}

	:global(.editor-content .tiptap strong) {
		font-weight: 700;
	}

	:global(.editor-content .tiptap em) {
		font-style: italic;
	}

	:global(.editor-content .tiptap s) {
		text-decoration: line-through;
	}

	:global(.editor-content .tiptap hr) {
		border: none;
		border-top: 2px solid #e5e7eb;
		margin: 1em 0;
	}

	:global(.editor-content .tiptap p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		color: #9ca3af;
		pointer-events: none;
		height: 0;
	}
</style>
