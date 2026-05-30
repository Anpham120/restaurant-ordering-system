import { useCallback, useEffect, useState } from 'react';
import { Utensils } from 'lucide-react';
import { menuService } from '../../services/menuService';
import type { MenuItem } from '../../types/menu';
import type { CartItem } from '../../types/menu';

interface Props {
  onNavigate: (tab: 'menu' | 'reservation' | 'tracker' | 'ai') => void;
  onAddToCart: (item: CartItem) => void;
  triggerToast: (msg: string) => void;
}

export function HomePage({ onNavigate, onAddToCart, triggerToast }: Props) {
  const [featured, setFeatured] = useState<MenuItem[]>([]);

  const load = useCallback(async () => {
    const res = await menuService.getMenuItems();
    if (res.success && Array.isArray(res.data)) {
      setFeatured((res.data as MenuItem[]).slice(0, 6));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="home-page">
      {/* Hero */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1>TV FOOD</h1>
          <p>Tinh hoa thực phẩm sạch — gọi món ngay tại bàn</p>
          <div className="hero-cta-row">
            <button className="btn btn-primary" onClick={() => onNavigate('menu')}>
              <Utensils size={16} /> Xem Menu
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate('reservation')}>
              Đặt Bàn
            </button>
          </div>
        </div>
      </div>

      {/* Featured dishes */}
      {featured.length > 0 && (
        <section className="featured-section">
          <h2>Món Nổi Bật</h2>
          <div className="featured-grid">
            {featured.map(item => (
              <div key={item.id} className="dish-card">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="dish-card-img" />
                )}
                <div className="dish-card-body">
                  <h3>{item.name}</h3>
                  {item.description && <p className="dish-desc">{item.description}</p>}
                  <div className="dish-card-footer">
                    <span className="dish-price">{item.price.toLocaleString('vi-VN')}đ</span>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        onAddToCart({ menuItemId: item.id, name: item.name, price: item.price, quantity: 1, note: '' });
                        triggerToast(`Đã thêm ${item.name} vào giỏ!`);
                      }}
                    >
                      + Thêm
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
