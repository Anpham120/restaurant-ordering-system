import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { menuService } from '../../services/menuService';
import type { MenuCategory, MenuItem, CartItem } from '../../types/menu';

interface Props {
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onUpdateQty: (menuItemId: string, note: string, delta: number) => void;
  triggerToast: (msg: string) => void;
}

export function MenuPage({ cart, onAddToCart, onUpdateQty, triggerToast }: Props) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [catsRes, itemsRes] = await Promise.all([
      menuService.getCategories(),
      menuService.getMenuItems(),
    ]);
    if (catsRes.success && Array.isArray(catsRes.data)) setCategories(catsRes.data as MenuCategory[]);
    if (itemsRes.success && Array.isArray(itemsRes.data)) setItems(itemsRes.data as MenuItem[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const filtered = items.filter(item => {
    const matchCat = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchKw = !keyword || item.name.toLowerCase().includes(keyword.toLowerCase());
    return matchCat && matchKw;
  });

  const cartQty = (menuItemId: string) =>
    cart.find(c => c.menuItemId === menuItemId)?.quantity ?? 0;

  return (
    <div className="menu-page">
      {/* Search bar */}
      <div className="menu-search-row">
        <Search size={16} />
        <input
          className="form-input"
          placeholder="Tìm món ăn..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
      </div>

      {/* Category tabs */}
      <div className="category-tabs">
        <button
          className={`cat-tab ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          Tất Cả
        </button>
        {categories.filter(c => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder).map(cat => (
          <button
            key={cat.id}
            className={`cat-tab ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Items grid */}
      {loading ? (
        <div className="loading-state">Đang tải menu...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">Không tìm thấy món nào.</div>
      ) : (
        <div className="menu-grid">
          {filtered.map(item => {
            const qty = cartQty(item.menuItemId ?? item.id);
            return (
              <div key={item.id} className="dish-card">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="dish-card-img" />
                )}
                <div className="dish-card-body">
                  <h3>{item.name}</h3>
                  {item.description && <p className="dish-desc">{item.description}</p>}
                  <div className="dish-tags">
                    {item.tags.map(t => <span key={t} className="tag-chip">{t}</span>)}
                  </div>
                  <div className="dish-card-footer">
                    <span className="dish-price">{item.price.toLocaleString('vi-VN')}đ</span>
                    {qty === 0 ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          onAddToCart({ menuItemId: item.id, name: item.name, price: item.price, quantity: 1, note: '' });
                          triggerToast(`Đã thêm ${item.name} vào giỏ!`);
                        }}
                      >
                        + Thêm
                      </button>
                    ) : (
                      <div className="qty-row">
                        <button className="qty-btn" onClick={() => onUpdateQty(item.id, '', -1)}>−</button>
                        <span>{qty}</span>
                        <button className="qty-btn" onClick={() => onUpdateQty(item.id, '', 1)}>+</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
