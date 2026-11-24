import React, { useState, useEffect } from 'react';
import {
  FiLayers,
  FiTag,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiArrowUp,
  FiArrowDown,
  FiSearch,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiMove,
  FiPackage,
  FiEye,
} from 'react-icons/fi';
import client from '../../api/client';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const TAG_COLOR_PRESETS = [
  { name: 'Fucsia Paola', color: '#E6007E', bg: 'bg-surface-elevated', border: 'border-border-strong', text: 'text-brand-deep' },
  { name: 'Rosa Intenso', color: '#BE123C', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
  { name: 'Ámbar', color: '#B45309', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' },
  { name: 'Esmeralda', color: '#15803D', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  { name: 'Violeta', color: '#6D28D9', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
  { name: 'Azul', color: '#1D4ED8', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
];

const CollectionsPage = () => {
  const [activeTab, setActiveTab] = useState('collections'); // 'collections' | 'tags'
  const [collections, setCollections] = useState([]);
  const [tags, setTags] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Collection modal state
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [collectionForm, setCollectionForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    active: true,
    items: [],
  });
  const [productSearch, setProductSearch] = useState('');
  const [savingCollection, setSavingCollection] = useState(false);

  // Tag creation state
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#907878');
  const [creatingTag, setCreatingTag] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [collsRes, tagsRes, prodsRes] = await Promise.all([
        client.get('/collections'),
        client.get('/tags'),
        client.get('/products?limit=200'),
      ]);

      setCollections(Array.isArray(collsRes.data) ? collsRes.data : []);
      setTags(Array.isArray(tagsRes.data) ? tagsRes.data : []);
      
      const prodsData = prodsRes.data?.products || (Array.isArray(prodsRes.data) ? prodsRes.data : []);
      setProducts(prodsData);
    } catch (err) {
      console.error('Error fetching collections/tags:', err);
      setError('Error al cargar datos de colecciones y etiquetas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // --- COLLECTIONS CRUD ---

  const handleOpenCreateCollection = () => {
    setEditingCollection(null);
    setCollectionForm({
      name: '',
      slug: '',
      description: '',
      image: '',
      active: true,
      items: [],
    });
    setProductSearch('');
    setIsCollectionModalOpen(true);
  };

  const handleOpenEditCollection = (coll) => {
    setEditingCollection(coll);
    
    // Normalize items
    const rawItems = coll.items || [];
    const normalizedItems = rawItems.map((item, idx) => {
      const prodId = item.productId || item.product?.id || item.id;
      const matchedProd = products.find((p) => p.id === prodId) || item.product || {};
      return {
        productId: prodId,
        order: item.order ?? (idx + 1),
        product: matchedProd,
      };
    });

    setCollectionForm({
      name: coll.name || '',
      slug: coll.slug || '',
      description: coll.description || '',
      image: coll.image || '',
      active: coll.active !== false,
      items: normalizedItems,
    });
    setProductSearch('');
    setIsCollectionModalOpen(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    const autoSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    setCollectionForm((prev) => ({
      ...prev,
      name: val,
      slug: editingCollection ? prev.slug : autoSlug,
    }));
  };

  const handleAddProductToCollection = (prod) => {
    if (collectionForm.items.some((it) => it.productId === prod.id)) return;
    const newItems = [
      ...collectionForm.items,
      {
        productId: prod.id,
        order: collectionForm.items.length + 1,
        product: prod,
      },
    ];
    setCollectionForm((prev) => ({ ...prev, items: newItems }));
  };

  const handleRemoveProductFromCollection = (productId) => {
    const filtered = collectionForm.items
      .filter((it) => it.productId !== productId)
      .map((it, idx) => ({ ...it, order: idx + 1 }));
    setCollectionForm((prev) => ({ ...prev, items: filtered }));
  };

  const handleMoveItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= collectionForm.items.length) return;

    const itemsCopy = [...collectionForm.items];
    const temp = itemsCopy[index];
    itemsCopy[index] = itemsCopy[targetIndex];
    itemsCopy[targetIndex] = temp;

    // reindex order
    const updated = itemsCopy.map((it, idx) => ({ ...it, order: idx + 1 }));
    setCollectionForm((prev) => ({ ...prev, items: updated }));
  };

  const handleSaveCollection = async (e) => {
    e.preventDefault();
    if (!collectionForm.name.trim()) return;

    setSavingCollection(true);
    try {
      const payload = {
        name: collectionForm.name.trim(),
        slug: collectionForm.slug.trim(),
        description: collectionForm.description.trim(),
        image: collectionForm.image.trim() || undefined,
        active: collectionForm.active,
        items: collectionForm.items.map((it, idx) => ({
          productId: it.productId,
          order: idx + 1,
        })),
      };

      if (editingCollection) {
        await client.put(`/collections/${editingCollection.id}`, payload);
        showNotification('Colección actualizada con éxito');
      } else {
        await client.post('/collections', payload);
        showNotification('Colección creada con éxito');
      }

      setIsCollectionModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Error saving collection:', err);
      alert(err.response?.data?.message || 'Error al guardar la colección.');
    } finally {
      setSavingCollection(false);
    }
  };

  const handleDeleteCollection = async (coll) => {
    if (!window.confirm(`¿Estás seguro de que querés eliminar la colección "${coll.name}"?`)) return;
    try {
      await client.delete(`/collections/${coll.id}`);
      showNotification('Colección eliminada');
      await fetchData();
    } catch (err) {
      console.error('Error deleting collection:', err);
      alert(err.response?.data?.message || 'Error al eliminar la colección.');
    }
  };

  // --- TAGS CRUD ---

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setCreatingTag(true);
    try {
      await client.post('/tags', {
        name: newTagName.trim(),
        color: newTagColor,
      });
      setNewTagName('');
      showNotification('Etiqueta creada');
      await fetchData();
    } catch (err) {
      console.error('Error creating tag:', err);
      alert(err.response?.data?.message || 'Error al crear la etiqueta.');
    } finally {
      setCreatingTag(false);
    }
  };

  const handleDeleteTag = async (tag) => {
    const prodCount = tag._count?.products ?? tag.productCount ?? 0;
    const confirmText = prodCount > 0
      ? `La etiqueta "${tag.name}" está asignada a ${prodCount} producto(s). ¿Eliminarla de todas formas?`
      : `¿Eliminar la etiqueta "${tag.name}"?`;
    
    if (!window.confirm(confirmText)) return;

    try {
      await client.delete(`/tags/${tag.id}`);
      showNotification('Etiqueta eliminada');
      await fetchData();
    } catch (err) {
      console.error('Error deleting tag:', err);
      alert(err.response?.data?.message || 'Error al eliminar la etiqueta.');
    }
  };

  // Filtered products for modal picker
  const filteredAvailableProducts = products
    .filter((p) => {
      if (collectionForm.items.some((it) => it.productId === p.id)) return false;
      if (!productSearch) return true;
      const term = productSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term) ||
        p.category?.name?.toLowerCase().includes(term)
      );
    })
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-semibold text-content">
            Colecciones y Etiquetas
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Organizá agrupaciones temáticas de productos y etiquetas para destacar en la tienda.
          </p>
        </div>

        {activeTab === 'collections' && (
          <Button
            variant="primary"
            onClick={handleOpenCreateCollection}
            className="inline-flex items-center space-x-2 text-xs py-2 px-3 self-start sm:self-auto"
          >
            <FiPlus size={14} />
            <span>Nueva Colección</span>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-brand-border/20 flex space-x-6">
        <button
          type="button"
          onClick={() => setActiveTab('collections')}
          className={`pb-3 text-xs sm:text-sm font-medium flex items-center space-x-2 transition-colors border-b-2 ${
            activeTab === 'collections'
              ? 'border-brand text-content'
              : 'border-transparent text-content-muted hover:text-content-secondary'
          }`}
        >
          <FiLayers size={14} className={activeTab === 'collections' ? 'text-brand' : ''} />
          <span>Colecciones</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-elevated text-content-secondary border border-border">
            {collections.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tags')}
          className={`pb-3 text-xs sm:text-sm font-medium flex items-center space-x-2 transition-colors border-b-2 ${
            activeTab === 'tags'
              ? 'border-brand text-content'
              : 'border-transparent text-content-muted hover:text-content-secondary'
          }`}
        >
          <FiTag size={14} className={activeTab === 'tags' ? 'text-brand' : ''} />
          <span>Etiquetas (Tags)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-elevated text-content-secondary border border-border">
            {tags.length}
          </span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3 bg-status-success-bg border border-status-success-border text-status-success text-xs rounded-md flex items-center space-x-2">
          <FiCheck size={14} className="text-status-success shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-3 bg-status-error-bg border border-status-error-border text-status-error text-xs rounded-md flex items-center space-x-2">
          <FiAlertCircle size={14} className="text-status-error shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="p-12 text-center text-content-muted text-xs">
          Cargando colecciones y etiquetas...
        </div>
      ) : activeTab === 'collections' ? (
        /* ================= COLLECTIONS TAB ================= */
        collections.length === 0 ? (
          <div className="p-10 border border-dashed border-brand-border/30 rounded-lg text-center space-y-3 bg-surface/50">
            <FiLayers className="mx-auto text-content-muted" size={32} />
            <p className="text-sm font-medium text-content">No hay colecciones creadas todavía</p>
            <p className="text-xs text-content-muted max-w-md mx-auto">
              Las colecciones te permiten armar páginas especiales o secciones destacadas con una selección ordenada de productos.
            </p>
            <Button variant="primary" onClick={handleOpenCreateCollection} className="text-xs">
              Crear la primera colección
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((coll) => {
              const itemCount = coll.items?.length ?? coll.itemCount ?? 0;
              return (
                <div
                  key={coll.id}
                  className="bg-surface border border-brand-border/20 rounded-lg p-5 flex flex-col justify-between hover:border-brand-border/40 transition-colors shadow-sm"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="p-2 rounded bg-surface-elevated border border-border-strong text-brand">
                          <FiLayers size={14} />
                        </span>
                        <div>
                          <h3 className="text-sm font-semibold text-content">{coll.name}</h3>
                          <p className="text-[10px] text-content-muted font-mono">/{coll.slug}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded border ${
                          coll.active !== false
                            ? 'bg-status-success-bg text-status-success border-status-success-border'
                            : 'bg-surface-elevated text-content-secondary border-border-strong'
                        }`}
                      >
                        {coll.active !== false ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>

                    {coll.description && (
                      <p className="text-xs text-content-secondary line-clamp-2">
                        {coll.description}
                      </p>
                    )}

                    <div className="pt-2 flex items-center justify-between text-[11px] text-content-muted border-t border-border/50">
                      <span className="flex items-center space-x-1">
                        <FiPackage size={12} className="text-brand" />
                        <span>{itemCount} producto{itemCount === 1 ? '' : 's'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditCollection(coll)}
                      className="px-2.5 py-1.5 text-xs text-content hover:text-white bg-surface-elevated hover:bg-brand border border-border-strong rounded transition-colors inline-flex items-center space-x-1 font-medium"
                    >
                      <FiEdit2 size={12} />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCollection(coll)}
                      className="px-2 py-1.5 text-xs text-status-error hover:text-white hover:bg-rose-600 border border-status-error-border bg-status-error-bg rounded transition-colors"
                      title="Eliminar colección"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ================= TAGS TAB ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Tag Card */}
          <div className="bg-surface border border-border rounded-lg p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-content flex items-center space-x-2">
                <FiTag className="text-brand" size={14} />
                <span>Nueva Etiqueta</span>
              </h2>
              <p className="text-xs text-content-secondary mt-1">
                Creá badges como "Imperdible", "Favorito", "Nuevo" para catalogar y destacar productos.
              </p>
            </div>

            <form onSubmit={handleCreateTag} className="space-y-4">
              <Input
                label="Nombre de la etiqueta"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Ej: Destacado, Imperdible..."
                required
              />

              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1.5">
                  Color sugerido
                </label>
                <div className="flex flex-wrap gap-2">
                  {TAG_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => setNewTagColor(preset.color)}
                      className={`h-6 w-6 rounded-full border-2 transition-transform ${
                        newTagColor === preset.color ? 'scale-110 border-white' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-3 bg-canvas rounded border border-brand-border/20">
                <p className="text-[10px] text-content-muted uppercase tracking-wider mb-1.5 font-semibold">
                  Vista previa de insignia
                </p>
                <span
                  className="inline-block text-[11px] font-medium px-2.5 py-0.5 rounded border"
                  style={{
                    backgroundColor: `${newTagColor}25`,
                    borderColor: `${newTagColor}60`,
                    color: '#f3f4f6',
                  }}
                >
                  {newTagName.trim() || 'Nombre de Etiqueta'}
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={creatingTag || !newTagName.trim()}
                className="text-xs py-2"
              >
                {creatingTag ? 'Creando...' : 'Guardar Etiqueta'}
              </Button>
            </form>
          </div>

          {/* Tags List */}
          <div className="lg:col-span-2 bg-surface border border-brand-border/20 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-content">Etiquetas Activas</h2>
                <p className="text-xs text-content-secondary mt-0.5">
                  Podés asignarlas desde la edición de cada producto o usarlas en filtros.
                </p>
              </div>
              <span className="text-xs text-content-muted">{tags.length} etiquetas</span>
            </div>

            {tags.length === 0 ? (
              <p className="text-xs text-content-muted py-8 text-center">
                No hay etiquetas creadas todavía.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tags.map((tag) => {
                  const prodCount = tag._count?.products ?? tag.productCount ?? 0;
                  const tagColor = tag.color || '#907878';
                  return (
                    <div
                      key={tag.id}
                      className="p-3 rounded bg-surface-elevated border border-brand-border/25 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: tagColor }}
                        />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-content truncate">{tag.name}</p>
                          <p className="text-[10px] text-content-muted font-mono truncate">
                            slug: {tag.slug} &bull; {prodCount} producto{prodCount === 1 ? '' : 's'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTag(tag)}
                        className="text-content-muted hover:text-status-error p-1 rounded hover:bg-status-error-bg transition-colors shrink-0"
                        title="Eliminar etiqueta"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT COLLECTION ================= */}
      {isCollectionModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-content/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-brand-border/40 rounded-xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-brand-border/20 pb-4">
              <div>
                <h3 className="text-base font-semibold text-content">
                  {editingCollection ? 'Editar Colección' : 'Nueva Colección'}
                </h3>
                <p className="text-xs text-content-secondary mt-0.5">
                  Agrupá y ordená productos en esta colección especial.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCollectionModalOpen(false)}
                className="text-content-muted hover:text-content p-1 rounded"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form id="collection-form" onSubmit={handleSaveCollection} className="space-y-5 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre de la colección *"
                  value={collectionForm.name}
                  onChange={handleNameChange}
                  placeholder="Ej: Regalos para ella"
                  required
                />
                <Input
                  label="Slug (identificador URL) *"
                  value={collectionForm.slug}
                  onChange={(e) => setCollectionForm({ ...collectionForm, slug: e.target.value })}
                  placeholder="ej: regalos-para-ella"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1.5">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={collectionForm.description}
                  onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
                  className="w-full bg-surface-elevated border border-brand-border/30 rounded-md p-2.5 text-xs text-content placeholder:text-content-muted focus:outline-none focus:border-mauve"
                  placeholder="Breve reseña sobre los productos incluidos en esta colección..."
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-canvas rounded-lg border border-brand-border/20">
                <div>
                  <p className="text-xs font-medium text-content">Estado de la colección</p>
                  <p className="text-[10px] text-content-muted">
                    Si está inactiva, no se mostrará en los enlaces ni filtros públicos.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={collectionForm.active}
                    onChange={(e) => setCollectionForm({ ...collectionForm, active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Products in Collection */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-content uppercase tracking-wider">
                      Productos en esta colección ({collectionForm.items.length})
                    </h4>
                    <p className="text-[11px] text-content-muted">
                      Usá las flechas para ordenar en qué posición aparecerá cada producto.
                    </p>
                  </div>
                </div>

                {/* Selected Products List */}
                {collectionForm.items.length === 0 ? (
                  <div className="p-4 border border-dashed border-brand-border/30 rounded-md text-center text-xs text-content-muted">
                    No seleccionaste ningún producto todavía. Buscá abajo para agregarlos.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {collectionForm.items.map((item, idx) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between p-2.5 bg-surface-elevated rounded-md border border-brand-border/20 text-xs"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <span className="h-6 w-6 rounded bg-brand text-white font-mono text-[10px] font-semibold flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <div className="truncate">
                            <p className="font-medium text-content truncate">
                              {item.product?.name || `Producto ID: ${item.productId}`}
                            </p>
                            <p className="text-[10px] text-content-muted truncate">
                              {item.product?.category?.name || 'Catálogo'} &bull; SKU: {item.product?.sku || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveItem(idx, -1)}
                            disabled={idx === 0}
                            className="p-1 rounded text-content-secondary hover:text-content disabled:opacity-30 disabled:hover:text-content-secondary"
                            title="Subir posición"
                          >
                            <FiArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveItem(idx, 1)}
                            disabled={idx === collectionForm.items.length - 1}
                            className="p-1 rounded text-content-secondary hover:text-content disabled:opacity-30 disabled:hover:text-content-secondary"
                            title="Bajar posición"
                          >
                            <FiArrowDown size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveProductFromCollection(item.productId)}
                            className="p-1 rounded text-content-muted hover:text-status-error ml-1"
                            title="Quitar de la colección"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Product Search & Selector */}
                <div className="p-3 bg-canvas rounded-lg border border-border space-y-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <FiSearch className="text-content-muted" size={13} />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Buscar producto por nombre o SKU para agregar..."
                      className="bg-transparent text-content placeholder:text-content-muted focus:outline-none w-full text-xs"
                    />
                  </div>

                  {filteredAvailableProducts.length > 0 && (
                    <div className="pt-2 border-t border-border/60 max-h-36 overflow-y-auto space-y-1">
                      {filteredAvailableProducts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-1.5 hover:bg-surface-elevated rounded text-xs transition-colors"
                        >
                          <div className="truncate mr-2">
                            <span className="font-medium text-content">{p.name}</span>
                            <span className="text-[10px] text-content-muted ml-2">SKU: {p.sku}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddProductToCollection(p)}
                            className="text-[11px] text-brand-deep hover:text-white hover:bg-brand px-2 py-0.5 rounded bg-surface border border-border-strong inline-flex items-center space-x-1 shrink-0 transition-colors"
                          >
                            <FiPlus size={11} />
                            <span>Agregar</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-brand-border/20">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCollectionModalOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="collection-form"
                variant="primary"
                loading={savingCollection}
                className="text-xs"
              >
                {editingCollection ? 'Guardar Cambios' : 'Crear Colección'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;
