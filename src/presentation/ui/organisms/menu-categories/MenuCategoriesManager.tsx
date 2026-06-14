import { useState } from 'react';
import { IMenuCategory } from '@/application/dtos/menu-categories/response/MenuCategoryResponse';

const SUGGESTED_CATEGORIES: Array<{ group: string; items: string[] }> = [
  {
    group: 'Comidas',
    items: [
      'Entradas', 'Sopas y cremas', 'Ensaladas', 'Platos fuertes',
      'Mariscos', 'Carnes a la brasa', 'Pastas y risottos', 'Pizzas',
      'Hamburguesas', 'Sushi y asiáticos', 'Tacos y burritos',
      'Postres', 'Vegano y vegetariano',
    ],
  },
  {
    group: 'Bebidas sin alcohol',
    items: [
      'Jugos naturales', 'Limonadas', 'Gaseosas', 'Agua mineral',
      'Café y té', 'Batidos y smoothies', 'Agua de panela',
    ],
  },
  {
    group: 'Cervezas y vinos',
    items: [
      'Cervezas nacionales', 'Cervezas importadas', 'Cervezas artesanales',
      'Vinos tintos', 'Vinos blancos', 'Vinos rosados', 'Champagne y espumantes',
    ],
  },
  {
    group: 'Licores y cócteles',
    items: [
      'Aguardiente', 'Ron', 'Whisky', 'Vodka', 'Gin', 'Tequila',
      'Licores de frutas', 'Cócteles clásicos', 'Cócteles de la casa',
      'Shots y chupitos',
    ],
  },
  {
    group: 'Extras',
    items: ['Combos y menú del día', 'Adiciones y salsas', 'Promociones'],
  },
];

interface MenuCategoriesManagerProps {
  storeId: string;
  categories: IMenuCategory[];
  submitting: boolean;
  error: string | null;
  onCreate: (name: string, sortOrder: number) => Promise<void>;
  onUpdate: (id: string, name: string, sortOrder?: number) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

const MenuCategoriesManager = ({
  categories,
  submitting,
  error,
  onCreate,
  onUpdate,
  onRemove,
}: MenuCategoriesManagerProps) => {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const existingNames = new Set(categories.map((c) => c.name.toLowerCase()));

  const addSuggestion = async (name: string) => {
    if (existingNames.has(name.toLowerCase())) return;
    await onCreate(name, categories.length);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await onCreate(newName.trim(), categories.length);
    setNewName('');
  };

  const startEdit = (cat: IMenuCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    await onUpdate(id, editName.trim());
    setEditingId(null);
  };

  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  return (
    <div className='space-y-4'>
      <p className='text-xs text-slate-500'>
        Las categorías agrupan los platos en el menú público (Entradas, Platos fuertes, Postres…).
      </p>

      {error ? (
        <div className='rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600'>
          {error}
        </div>
      ) : null}

      {/* Category list */}
      <div className='space-y-2'>
        {sorted.length === 0 ? (
          <div className='rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400'>
            Sin categorías — agrega la primera abajo
          </div>
        ) : null}
        {sorted.map((cat) => (
          <div
            key={cat.id}
            className='flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2'
          >
            <i className='bx bx-menu text-slate-300' aria-hidden='true' />
            {editingId === cat.id ? (
              <>
                <input
                  type='text'
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleUpdate(cat.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className='min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                  autoFocus
                  disabled={submitting}
                />
                <button
                  type='button'
                  onClick={() => void handleUpdate(cat.id)}
                  disabled={submitting}
                  className='rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-white transition hover:opacity-90'
                >
                  Guardar
                </button>
                <button
                  type='button'
                  onClick={() => setEditingId(null)}
                  className='rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 transition hover:text-slate-700'
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <span className='min-w-0 flex-1 truncate text-sm font-medium text-slate-700'>
                  {cat.name}
                </span>
                <button
                  type='button'
                  onClick={() => startEdit(cat)}
                  className='rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 transition hover:border-primary/30 hover:text-primary'
                >
                  Editar
                </button>
                <button
                  type='button'
                  onClick={() => void onRemove(cat.id)}
                  disabled={submitting}
                  className='rounded-lg border border-red-200 px-2 py-1 text-xs text-red-400 transition hover:border-red-400 hover:text-red-600'
                >
                  <i className='bx bx-trash' aria-hidden='true' />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Suggested categories */}
      <div className='rounded-xl border border-slate-200 bg-slate-50'>
        <button
          type='button'
          onClick={() => setShowSuggestions((v) => !v)}
          className='flex w-full items-center justify-between px-3 py-2.5 text-xs font-semibold text-slate-600'
        >
          <span className='flex items-center gap-1.5'>
            <i className='bx bx-bulb text-amber-500' aria-hidden='true' />
            Sugerencias rápidas
          </span>
          <i className={`bx bx-chevron-${showSuggestions ? 'up' : 'down'} text-slate-400`} aria-hidden='true' />
        </button>
        {showSuggestions ? (
          <div className='border-t border-slate-200 px-3 pb-3 pt-2 space-y-3'>
            {SUGGESTED_CATEGORIES.map((group) => (
              <div key={group.group}>
                <p className='mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400'>
                  {group.group}
                </p>
                <div className='flex flex-wrap gap-1.5'>
                  {group.items.map((name) => {
                    const already = existingNames.has(name.toLowerCase());
                    return (
                      <button
                        key={name}
                        type='button'
                        disabled={submitting || already}
                        onClick={() => void addSuggestion(name)}
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                          already
                            ? 'border-green-200 bg-green-50 text-green-600 opacity-60 cursor-default'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-95'
                        }`}
                      >
                        {already ? <><i className='bx bx-check mr-0.5' />{name}</> : `+ ${name}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Add new */}
      <form onSubmit={(e) => void handleCreate(e)} className='flex gap-2'>
        <input
          type='text'
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder='Nueva categoría (ej. Entradas)'
          className='min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
          disabled={submitting}
          maxLength={100}
        />
        <button
          type='submit'
          disabled={submitting || !newName.trim()}
          className='flex-shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50'
        >
          <i className='bx bx-plus' aria-hidden='true' />
        </button>
      </form>
    </div>
  );
};

export default MenuCategoriesManager;
