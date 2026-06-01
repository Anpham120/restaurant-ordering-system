import { useState, useEffect, useRef } from 'react';
import {
  Utensils, UtensilsCrossed, Calendar, ShoppingBag, Search, Plus, Minus, X, Clock,
  RefreshCw, Sparkles, Sun, Moon, Home, Bot, Heart, Star,
  Tag, Newspaper, Bell, ScanLine, ChevronLeft, ChevronRight, User, Smartphone, Lightbulb
} from 'lucide-react';
import { HomePage } from './features/home/HomePage';
import { MenuPage } from './features/menu/MenuPage';
import { ReservationPage } from './features/reservation/ReservationPage';
import { OrderTrackerPage } from './features/order/OrderTrackerPage';
import type { CartItem } from './types/menu';
import type { Order } from './types/orderTracking';
import { orderService } from './services/orderService';
import { useTableSession } from './hooks/useTableSession';
import './App.css';

// Minimal lookup for AI combo suggestions
const MENU_LOOKUP: Record<string, { name: string; price: number }> = {
  'dish-001': { name: 'Lẩu Thái Hải Sản Tinh Hoa', price: 239000 },
  'dish-002': { name: 'Cá Hồi Sốt Chanh Dây', price: 159000 },
  'dish-003': { name: 'Gà Chiên Nước Mắm Tỏi Ớt', price: 189000 },
  'dish-007': { name: 'Soda Chanh Dây Bạc Hà', price: 79000 },
};

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: string[];
  suggestedAction?: {
    label: string;
    items: { id: string; quantity: number; note: string }[];
  };
}

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('light-theme', theme === 'light');
  }, [theme]);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'reservation' | 'tracker' | 'ai'>(() =>
    (sessionStorage.getItem('activeTab') as any) || 'home'
  );

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'menu', 'reservation', 'tracker', 'ai'].includes(hash)) {
        setActiveTab(hash as any);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => { sessionStorage.setItem('activeTab', activeTab); }, [activeTab]);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = sessionStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => { sessionStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);

  const handleAddCartItem = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === item.menuItemId && c.note === item.note);
      if (existing) {
        return prev.map(c =>
          c.menuItemId === item.menuItemId && c.note === item.note
            ? { ...c, quantity: c.quantity + item.quantity }
            : c
        );
      }
      return [...prev, item];
    });
  };

  const handleUpdateCartQty = (menuItemId: string, note: string, delta: number) => {
    setCart(prev =>
      prev.map(item =>
        item.menuItemId === menuItemId && item.note === note
          ? { ...item, quantity: item.quantity + delta }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const handleRemoveFromCart = (menuItemId: string, note: string) => {
    setCart(prev => prev.filter(item => !(item.menuItemId === menuItemId && item.note === note)));
    triggerToast('Đã xóa món ăn khỏi giỏ hàng.');
  };

  const getCartTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // QR table session — load/verify token, simulate scan, clear. Switches to menu tab on load.
  const {
    sessionToken,
    tableSession,
    isRealSession,
    simulateQRScan: handleSimulateQRScan,
    clearSession,
  } = useTableSession(triggerToast, () => setActiveTab('menu'));

  // Clearing the table session also empties the cart (cart is table-scoped).
  const handleClearSession = () => {
    clearSession();
    setCart([]);
  };

  // Tracker ref — expose addPlacedOrder from OrderTrackerPage to handleSubmitOrder
  const addOrderToTrackerRef = useRef<((order: Order) => void) | null>(null);
  const pendingOrderRef = useRef<Order | null>(null);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmittingOrder(true);

    // Real backend order when the session is verified — status then flows via SignalR/polling.
    if (isRealSession && sessionToken) {
      const res = await orderService.createOrder(sessionToken, cart);
      setIsSubmittingOrder(false);
      if (res.success && res.data) {
        const d = res.data;
        const newOrder: Order = {
          orderId: d.id,
          orderCode: d.orderCode,
          tableNumber: tableSession?.tableNumber || 'A02',
          status: 'Pending',
          items: d.items.map(it => ({
            id: it.id,
            menuItemName: it.menuItemName,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            status: it.status as Order['items'][number]['status'],
            note: it.note,
          })),
          placedAt: new Date(),
        };
        if (addOrderToTrackerRef.current) addOrderToTrackerRef.current(newOrder);
        else pendingOrderRef.current = newOrder;
        setCart([]);
        setIsCartOpen(false);
        setActiveTab('tracker');
        triggerToast('Gửi order thành công! Đang chờ bếp phản hồi...');
      } else {
        triggerToast(`${res.error?.message || 'Gửi order thất bại. Vui lòng thử lại.'}`);
      }
      return;
    }

    // Demo simulation (no verified backend session)
    setTimeout(() => {
      const orderCode = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: Order = {
        orderId: `order_${Math.random().toString(36).substr(2, 9)}`,
        orderCode,
        tableNumber: tableSession?.tableNumber || 'A02',
        status: 'Pending',
        items: cart.map((item, idx) => ({
          id: `ord-it-${idx}-${Date.now()}`,
          menuItemName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          status: 'Pending' as const,
          note: item.note,
        })),
        placedAt: new Date(),
      };

      // Share to kitchen via cookie (admin-web cross-tab bridge)
      try {
        const existing = document.cookie.split('; ').find(r => r.startsWith('tv_food_shared_orders='));
        const orders = existing ? JSON.parse(decodeURIComponent(existing.split('=')[1])) : [];
        orders.push(newOrder);
        document.cookie = `tv_food_shared_orders=${encodeURIComponent(JSON.stringify(orders))}; path=/; max-age=86400`;
      } catch { /* ignore cookie errors */ }

      if (addOrderToTrackerRef.current) {
        addOrderToTrackerRef.current(newOrder);
      } else {
        // Tracker not mounted yet — queue for when it mounts
        pendingOrderRef.current = newOrder;
      }

      setCart([]);
      setIsCartOpen(false);
      setIsSubmittingOrder(false);
      setActiveTab('tracker');
      triggerToast('Gửi order thành công! Đang chờ bếp phản hồi...');
    }, 1500);
  };

  // AI Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{
    id: 'welcome-ai',
    sender: 'assistant',
    text: 'Xin chào quý khách! Tôi là Trợ Lý Ẩm Thực AI của TV FOOD. Tôi có thể tư vấn món ăn ngon theo sở thích, thiết lập combo tiệc hợp túi tiền hoặc giải đáp thắc mắc về chính sách của nhà hàng. Quý khách muốn hỏi gì hôm nay ạ?',
  }]);
  const [aiInputValue, setAiInputValue] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  const handleSendAiMessage = (forcedQuery?: string) => {
    const query = forcedQuery || aiInputValue;
    if (!query.trim()) return;

    setChatMessages(prev => [...prev, { id: `usr-${Date.now()}`, sender: 'user', text: query }]);
    if (!forcedQuery) setAiInputValue('');
    setIsAiTyping(true);

    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      let text = '';
      let sources: string[] = ['menu.md'];
      let suggestedAction: ChatMessage['suggestedAction'];

      if (lowerQuery.includes('4 người') || lowerQuery.includes('600k') || lowerQuery.includes('combo')) {
        text = 'Dựa trên thực đơn và yêu cầu về ngân sách khoảng 600.000đ dành cho nhóm 4 người, tôi đã phối hợp một **Combo Đặc Sản Ấm Cúng** hoàn hảo:\n\n1. **Lẩu Thái Hải Sản Tinh Hoa** (239k)\n2. **Gà Chiên Nước Mắm Tỏi Ớt** (189k)\n3. **Cá Hồi Sốt Chanh Dây** (159k)\n4. **Soda Chanh Dây Bạc Hà** x3 ly (237k)\n\n**Tổng cộng ~824.000đ** cho bữa tiệc 4 người no nê!';
        sources = ['menu.md', 'faq.md'];
        suggestedAction = {
          label: 'Thêm Combo 4 Người Đề Xuất Vào Giỏ Hàng',
          items: [
            { id: 'dish-001', quantity: 1, note: 'Ít cay' },
            { id: 'dish-003', quantity: 1, note: '' },
            { id: 'dish-002', quantity: 1, note: '' },
            { id: 'dish-007', quantity: 3, note: '' },
          ],
        };
      } else if (lowerQuery.includes('cay') || lowerQuery.includes('trẻ em')) {
        text = 'Các món không cay, phù hợp trẻ em:\n\n1. **Bò Lúc Lắc Khoai Tây Giòn** — thịt mềm, không cay\n2. **Cơm Chiên Hải Sản Hạt Sen** — dễ ăn, bổ dưỡng\n3. **Kem Bơ Sầu Riêng Đắk Lắk** — tráng miệng ngọt ngào';
        sources = ['menu.md', 'ingredient_notes.md'];
      } else if (lowerQuery.includes('chay') || lowerQuery.includes('vegetarian')) {
        text = 'Đối với chế độ ăn chay, quý khách có thể ghi chú **"Làm chay"** khi đặt món. Đầu bếp sẽ thay thế nguyên liệu phù hợp.\n\nMón hoàn toàn chay: Kem Bơ Sầu Riêng, Nước Cam Vắt, Soda Chanh Dây.';
        sources = ['menu.md', 'restaurant_policy.md'];
      } else {
        text = 'Tôi đã ghi nhận câu hỏi của quý khách. Lẩu Thái Hải Sản và Bò Lúc Lắc là hai món bán chạy nhất tuần này. Quý khách có muốn tôi tư vấn thêm về khẩu phần hoặc combo không ạ?';
        sources = ['menu.md', 'faq.md'];
      }

      setChatMessages(prev => [...prev, { id: `ast-${Date.now()}`, sender: 'assistant', text, sources, suggestedAction }]);
      setIsAiTyping(false);
    }, 1000);
  };

  const handleApplySuggestedItems = (action: ChatMessage['suggestedAction']) => {
    if (!action) return;
    action.items.forEach(suggested => {
      const dish = MENU_LOOKUP[suggested.id];
      if (dish) {
        handleAddCartItem({
          menuItemId: suggested.id,
          name: dish.name,
          price: dish.price,
          quantity: suggested.quantity,
          note: suggested.note,
        });
      }
    });
    setIsCartOpen(true);
    triggerToast('Đã nhập combo khuyến nghị của AI vào giỏ hàng!');
  };

  return (
    <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px',
          background: 'var(--primary)', color: 'var(--bg-deep)',
          padding: '14px 24px', borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(var(--primary-rgb), 0.3)',
          fontWeight: 700, zIndex: 99999, fontSize: '0.9rem',
          display: 'flex', alignItems: 'center', gap: '8px',
          backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s forwards',
        }}>
          <Bell size={16} /> {toastMessage}
        </div>
      )}

      {/* Left Sidebar */}
      <aside className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <button type="button" className="sidebar-collapse-toggle" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
          {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        <div className="sidebar-scroll-wrapper">
          <div>
            <div className="sidebar-logo">
              <img src="/logo.png" alt="TV FOOD" className="logo-icon" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h1 className="logo-text grad-text" style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.5px', margin: 0 }}>TV FOOD</h1>
              </div>
            </div>

            <nav className="sidebar-menu">
              <button className={`sidebar-menu-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')} id="side-nav-home">
                <Home size={18} /> <span>Trang Chủ</span>
              </button>
              <button className={`sidebar-menu-btn ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')} id="side-nav-menu">
                <Utensils size={18} /> <span>Thực Đơn</span>
              </button>
              <button className={`sidebar-menu-btn ${activeTab === 'reservation' ? 'active' : ''}`} onClick={() => setActiveTab('reservation')} id="side-nav-book">
                <Calendar size={18} /> <span>Đặt Bàn</span>
              </button>
              <button className={`sidebar-menu-btn ${activeTab === 'tracker' ? 'active' : ''}`} onClick={() => setActiveTab('tracker')} id="side-nav-tracker">
                <Clock size={18} /> <span>Đơn Hàng</span>
              </button>
              <button className={`sidebar-menu-btn ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')} id="side-nav-ai">
                <Bot size={18} /> <span>Trợ Lý AI</span>
              </button>

              <div style={{ height: '1px', background: 'var(--border-color)', margin: '12px 0' }}></div>
              <button className="sidebar-menu-btn" onClick={() => triggerToast('Mã giảm giá hôm nay: TVFOOD50 - Giảm 50k!')}>
                <Heart size={18} /> <span>Yêu Thích</span>
              </button>
              <button className="sidebar-menu-btn" onClick={() => triggerToast('Tính năng Đánh Giá đang phát triển!')}>
                <Star size={18} /> <span>Đánh Giá</span>
              </button>
              <button className="sidebar-menu-btn" onClick={() => triggerToast('Mã giảm giá hôm nay: TVFOOD50 - Giảm 50k!')}>
                <Tag size={18} /> <span>Khuyến Mãi</span>
              </button>
              <button className="sidebar-menu-btn" onClick={() => triggerToast('TV FOOD vừa lọt Top 10 nhà hàng công nghệ tốt nhất 2026!')}>
                <Newspaper size={18} /> <span>Tin Tức</span>
              </button>
            </nav>
          </div>

          <div className="sidebar-footer">
            <div className="sidebar-profile" onClick={() => triggerToast('Khách hàng Hoàng Minh - Hạng Vàng')}>
              <div className="sidebar-avatar"><User size={18} /></div>
              <div className="sidebar-profile-info">
                <div className="sidebar-profile-name">Hoàng Minh</div>
                <div className="sidebar-profile-points">120 điểm</div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="sidebar-theme-row">
              <span className="sidebar-theme-label">Chế độ tối</span>
              <label className="theme-switch">
                <input type="checkbox" checked={theme === 'dark'} onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
                <span className="slider-switch"></span>
              </label>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="app-main-content">
        {/* Desktop Header */}
        <header className="desktop-header">
          <div className="header-search-container">
            <Search size={18} className="header-search-icon" />
            <input
              type="text"
              placeholder="Tìm món ăn, hương vị, nguyên liệu..."
              className="header-search-input"
              onClick={() => setActiveTab('menu')}
              readOnly
            />
            <span className="header-shortcut">⌘ K</span>
          </div>
          <div className="header-right-actions">
            <button className="header-icon-btn" onClick={() => triggerToast('Bạn có 2 thông báo mới về đơn hàng!')}>
              <Bell size={18} />
              <span className="badge-count">2</span>
            </button>
            <button className="header-icon-btn" onClick={() => triggerToast('Mã giảm giá: TVFOOD50')}>
              <Heart size={18} />
            </button>
            {sessionToken ? (
              <button className="header-qr-btn" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--danger)', boxShadow: 'none' }} onClick={handleClearSession}>
                <ScanLine size={16} /> Thoát Bàn {tableSession?.tableNumber}
              </button>
            ) : (
              <button className="header-qr-btn" onClick={handleSimulateQRScan}>
                <ScanLine size={16} /> Quét mã QR bàn A01
              </button>
            )}
          </div>
        </header>

        {/* Mobile Top Bar */}
        <div className="mobile-top-bar">
          <div className="sidebar-logo" style={{ marginBottom: 0 }}>
            <img src="/logo.png" alt="TV FOOD" className="logo-icon" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            <h1 className="logo-text grad-text" style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>TV FOOD</h1>
          </div>
          <button type="button" className="theme-toggle-btn" style={{ width: '34px', height: '34px' }} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Mobile QR Strip */}
        {!sessionToken && (
          <div className="mobile-qr-strip glass-panel" style={{ display: window.innerWidth < 1024 ? 'flex' : 'none', marginBottom: '16px', border: '1px solid rgba(var(--primary-rgb), 0.2)' }} onClick={handleSimulateQRScan}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--primary)' }}><ScanLine size={16} /></span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Quét QR để nhận menu trực tiếp tại bàn</span>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
        )}

        {/* Session Panel */}
        {sessionToken && (
          <div className="simulation-panel" style={{ marginBottom: '24px' }}>
            <div className="simulation-info">
              <div className="simulation-icon"><Smartphone size={18} /></div>
              <div>
                <div className="simulation-title">Đang quét bàn {tableSession?.tableNumber}</div>
                <div className="simulation-desc">Session token: {sessionToken.substring(0, 20)}...</div>
              </div>
            </div>
            <button className="simulation-btn" onClick={handleClearSession}>Hủy Bàn</button>
          </div>
        )}

        <main className="main-content" style={{ padding: 0 }}>
          {activeTab === 'home' && (
            <HomePage onNavigate={setActiveTab} onAddToCart={handleAddCartItem} triggerToast={triggerToast} />
          )}

          {activeTab === 'menu' && (
            <MenuPage cart={cart} onAddToCart={handleAddCartItem} onUpdateQty={handleUpdateCartQty} triggerToast={triggerToast} />
          )}

          {activeTab === 'reservation' && (
            <ReservationPage triggerToast={triggerToast} />
          )}

          {activeTab === 'tracker' && (
            <OrderTrackerPage
              sessionToken={sessionToken}
              tableNumber={tableSession?.tableNumber || ''}
              triggerToast={triggerToast}
              isRealSession={isRealSession}
              onTrackingReady={(addOrder) => {
                addOrderToTrackerRef.current = addOrder;
                if (pendingOrderRef.current) {
                  addOrder(pendingOrderRef.current);
                  pendingOrderRef.current = null;
                }
              }}
            />
          )}

          {activeTab === 'ai' && (
            <div className="animate-fade-in ai-container">
              <div className="ai-header-info">
                <div className="ai-avatar"><Bot size={20} /></div>
                <div>
                  <h3 className="ai-title-text">Trợ Lý Khẩu Vị AI - TV FOOD</h3>
                  <div className="ai-status-pulse">
                    <span className="session-indicator"></span>
                    <span>Đang Trực Tuyến | AI RAG Pipeline</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel ai-chat-history">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`ai-chat-bubble ${msg.sender}`}>
                    <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="ai-sources-row">
                        <span>Dẫn nguồn RAG:</span>
                        {msg.sources.map((src, idx) => (
                          <span key={idx} className="ai-source-badge">{src}</span>
                        ))}
                      </div>
                    )}
                    {msg.suggestedAction && (
                      <div className="ai-suggested-actions">
                        <button
                          className="btn btn-primary btn-outline"
                          style={{ fontSize: '0.82rem', padding: '8px 16px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                          onClick={() => handleApplySuggestedItems(msg.suggestedAction)}
                        >
                          <Sparkles size={14} /> {msg.suggestedAction.label}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {isAiTyping && (
                  <div className="ai-chat-bubble assistant" style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '12px 20px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-secondary)', animation: 'bounce 1s infinite' }}></div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-secondary)', animation: 'bounce 1s infinite 0.2s' }}></div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-secondary)', animation: 'bounce 1s infinite 0.4s' }}></div>
                  </div>
                )}
              </div>

              <div className="ai-suggestions-grid" style={{ marginTop: '16px' }}>
                <div className="ai-suggestions-label">Câu Hỏi Gợi Ý:</div>
                <div className="ai-suggestion-pills">
                  <button className="ai-suggestion-pill" onClick={() => handleSendAiMessage('Đi 4 người khoảng 600k nên gọi combo món gì hợp lý?')}>Combo 4 người 600k?</button>
                  <button className="ai-suggestion-pill" onClick={() => handleSendAiMessage('Thực đơn có những món nào ngon không cay cho trẻ em?')}>Món trẻ em không cay?</button>
                  <button className="ai-suggestion-pill" onClick={() => handleSendAiMessage('Nhà hàng mình có tùy chọn món ăn chay không?')}>Có món ăn chay không?</button>
                </div>
              </div>

              <div className="ai-input-row">
                <input
                  type="text"
                  placeholder="Hỏi về món ăn, giá cả, hoặc đặt combo..."
                  className="form-control"
                  value={aiInputValue}
                  onChange={(e) => setAiInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
                  disabled={isAiTyping}
                  id="ai-chat-input"
                />
                <button
                  className="btn btn-primary"
                  onClick={() => handleSendAiMessage()}
                  disabled={isAiTyping || !aiInputValue.trim()}
                  id="btn-ai-send"
                >
                  Gửi <Sparkles size={16} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="tab-navigation">
        <button className={`tab-nav-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')} id="nav-btn-home">
          <span className="tab-nav-btn-icon"><Home size={20} /></span><span>Trang Chủ</span>
        </button>
        <button className={`tab-nav-btn ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')} id="nav-btn-menu">
          <span className="tab-nav-btn-icon"><Utensils size={20} /></span><span>Thực Đơn</span>
        </button>
        <button className={`tab-nav-btn ${activeTab === 'reservation' ? 'active' : ''}`} onClick={() => setActiveTab('reservation')} id="nav-btn-reservation">
          <span className="tab-nav-btn-icon"><Calendar size={20} /></span><span>Đặt Bàn</span>
        </button>
        <button className={`tab-nav-btn ${activeTab === 'tracker' ? 'active' : ''}`} onClick={() => setActiveTab('tracker')} id="nav-btn-tracker">
          <span className="tab-nav-btn-icon"><Clock size={20} /></span><span>Đơn Hàng</span>
        </button>
        <button className={`tab-nav-btn ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')} id="nav-btn-ai">
          <span className="tab-nav-btn-icon"><Bot size={20} /></span><span>Trợ Lý AI</span>
        </button>
      </nav>

      {/* Floating Cart Button */}
      {getCartCount() > 0 && (
        <div className="floating-cart-btn pulsing-glow" onClick={() => setIsCartOpen(true)} id="btn-floating-cart">
          <ShoppingBag className="floating-cart-btn-icon" />
          <span className="floating-cart-badge">{getCartCount()}</span>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <>
          <div className="cart-drawer-backdrop" onClick={() => setIsCartOpen(false)}></div>
          <div className="cart-drawer">
            <div className="cart-header">
              <div className="cart-title-row">
                <ShoppingBag size={22} style={{ color: 'var(--primary)' }} />
                <h3 className="cart-title">Đơn Gọi Món Của Bạn</h3>
              </div>
              <button className="cart-close-btn" onClick={() => setIsCartOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="cart-items-list">
              {cart.length === 0 ? (
                <div className="cart-empty-state">
                  <ShoppingBag className="cart-empty-icon" />
                  <h4>Giỏ hàng của bạn đang trống</h4>
                  <p style={{ fontSize: '0.85rem' }}>Vui lòng chọn các món ăn từ menu để thêm vào giỏ.</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="cart-item">
                    <div className="cart-item-img-placeholder"><UtensilsCrossed size={20} /></div>
                    <div className="cart-item-details">
                      <div>
                        <h4 className="cart-item-name">{item.name}</h4>
                        {item.note && <p className="cart-item-note"><Lightbulb size={12} /> {item.note}</p>}
                      </div>
                      <div className="cart-item-row">
                        <span className="cart-item-price">{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="cart-item-quantity-picker">
                            <button className="cart-item-qty-btn" onClick={() => handleUpdateCartQty(item.menuItemId, item.note, -1)}><Minus size={12} /></button>
                            <span className="cart-item-qty-val">{item.quantity}</span>
                            <button className="cart-item-qty-btn" onClick={() => handleUpdateCartQty(item.menuItemId, item.note, 1)}><Plus size={12} /></button>
                          </div>
                          <button className="cart-item-btn-remove" onClick={() => handleRemoveFromCart(item.menuItemId, item.note)}><X size={16} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Tổng Cộng Tạm Tính:</span>
                  <span className="cart-summary-total">{getCartTotal().toLocaleString('vi-VN')} ₫</span>
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmitOrder} disabled={isSubmittingOrder} id="btn-place-order">
                  {isSubmittingOrder
                    ? <><RefreshCw size={18} style={{ animation: 'spin 1.5s linear infinite' }} /> Đang Tạo Order...</>
                    : <>Gửi Yêu Cầu Xuống Bếp (QR Order)</>
                  }
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
