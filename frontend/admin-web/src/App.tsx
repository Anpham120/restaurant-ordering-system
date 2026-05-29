import React, { useState, useEffect } from 'react';
import { 
  Coffee, Calendar, DollarSign, TrendingUp, Users, Clock, 
  Play, Check, Sun, Moon, LogOut, ChevronRight, Copy, 
  CheckCircle, RefreshCw, Send, AlertTriangle, Layers, 
  PlusCircle, ShoppingBag, Eye
} from 'lucide-react';
import './App.css';
import { createRestaurantHubConnection } from './realtime/restaurantRealtime';
import type { OrderItemReadyEvent } from './realtime/restaurantRealtime';

// TypeScript interfaces for safety and robustness
interface Table {
  id: string;
  name: string;
  area: 'A' | 'B' | 'C'; // Area A: Garden, Area B: VIP, Area C: Main Hall
  status: 'Available' | 'Reserved' | 'Occupied' | 'Cleaning' | 'Inactive';
  seats: number;
  currentSessionId?: string;
}

interface Reservation {
  id: string;
  name: string;
  phone: string;
  guests: number;
  time: string;
  note: string;
  status: 'Pending' | 'CheckedIn' | 'Cancelled';
}

interface OrderItem {
  id: string;
  orderId?: string;
  tableId: string;
  dishName: string;
  quantity: number;
  note: string;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Served';
  timeAdded: string; // ISO string
  source?: 'mock' | 'realtime';
}

interface InvoiceItem {
  dishName: string;
  quantity: number;
  price: number;
}

type UserRole = 'Staff' | 'Kitchen' | 'Cashier' | 'Manager';

function isUserRole(value: string | null): value is UserRole {
  return value === 'Staff' || value === 'Kitchen' || value === 'Cashier' || value === 'Manager';
}

function upsertReadyOrderItem(items: OrderItem[], event: OrderItemReadyEvent): OrderItem[] {
  const existingIndex = items.findIndex(item => item.id === event.orderItemId);

  if (existingIndex >= 0) {
    return items.map(item => item.id === event.orderItemId ? {
      ...item,
      orderId: event.orderId,
      status: 'Ready',
      timeAdded: event.readyAt ?? item.timeAdded,
      source: 'realtime',
    } : item);
  }

  return [{
    id: event.orderItemId,
    orderId: event.orderId,
    tableId: event.tableId ?? event.tableNumber ?? 'unknown',
    dishName: event.menuItemName ?? `Món #${event.orderItemId}`,
    quantity: event.quantity ?? 1,
    note: event.note ?? '',
    status: 'Ready',
    timeAdded: event.readyAt ?? new Date().toISOString(),
    source: 'realtime',
  }, ...items];
}

function App() {
  // Theme & Role Authentication states
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_token') !== null;
  });
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const storedRole = sessionStorage.getItem('admin_role');
    return isUserRole(storedRole) ? storedRole : 'Staff';
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // App UI & Mock Data states
  const [tables, setTables] = useState<Table[]>([
    { id: 'T101', name: 'Bàn A101', area: 'A', status: 'Available', seats: 2 },
    { id: 'T102', name: 'Bàn A102', area: 'A', status: 'Occupied', seats: 4, currentSessionId: 'sess_102' },
    { id: 'T103', name: 'Bàn A103', area: 'A', status: 'Reserved', seats: 4 },
    { id: 'T104', name: 'Bàn A104', area: 'A', status: 'Cleaning', seats: 2 },
    
    { id: 'T201', name: 'VIP B201', area: 'B', status: 'Available', seats: 6 },
    { id: 'T202', name: 'VIP B202', area: 'B', status: 'Occupied', seats: 8, currentSessionId: 'sess_202' },
    { id: 'T203', name: 'VIP B203', area: 'B', status: 'Reserved', seats: 10 },
    
    { id: 'T301', name: 'Bàn C301', area: 'C', status: 'Available', seats: 4 },
    { id: 'T302', name: 'Bàn C302', area: 'C', status: 'Occupied', seats: 4, currentSessionId: 'sess_302' },
    { id: 'T303', name: 'Bàn C303', area: 'C', status: 'Available', seats: 2 },
    { id: 'T304', name: 'Bàn C304', area: 'C', status: 'Inactive', seats: 4 },
  ]);

  const [reservations, setReservations] = useState<Reservation[]>([
    { id: 'RES_001', name: 'Nguyễn Văn Hùng', phone: '0987654321', guests: 4, time: '18:30', note: 'Gần cửa sổ, không cay nồng', status: 'Pending' },
    { id: 'RES_002', name: 'Phạm Thị Lan', phone: '0912345678', guests: 8, time: '19:00', note: 'Phòng VIP, tiệc sinh nhật', status: 'Pending' },
    { id: 'RES_003', name: 'Trần Minh Đức', phone: '0903334445', guests: 2, time: '17:30', note: 'Bàn sân vườn mát mẻ', status: 'Pending' },
  ]);

  const [orderItems, setOrderItems] = useState<OrderItem[]>(() => [
    { id: 'ORD_001', tableId: 'T102', dishName: 'Phở Bò Tày Đặc Biệt', quantity: 2, note: 'Ít bánh nhiều thịt, không hành', status: 'Preparing', timeAdded: new Date(Date.now() - 15 * 60000).toISOString() },
    { id: 'ORD_002', tableId: 'T102', dishName: 'Trà Đào Sả TV FOOD', quantity: 2, note: 'Ngọt 50%, nhiều đá', status: 'Ready', timeAdded: new Date(Date.now() - 10 * 60000).toISOString() },
    { id: 'ORD_003', tableId: 'T202', dishName: 'Bún Chả Nem Nướng', quantity: 3, note: 'Thêm nem nướng, nước mắm ấm', status: 'Pending', timeAdded: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: 'ORD_004', tableId: 'T302', dishName: 'Bánh Mì Chảo Đặc Biệt', quantity: 1, note: 'Trứng chín kĩ', status: 'Served', timeAdded: new Date(Date.now() - 25 * 60000).toISOString() },
  ]);

  // Invoice calculations
  const menuPrices: Record<string, number> = {
    'Phở Bò Tày Đặc Biệt': 65000,
    'Trà Đào Sả TV FOOD': 35000,
    'Bún Chả Nem Nướng': 55000,
    'Bánh Mì Chảo Đặc Biệt': 49000,
    'Bánh Mì Phô Mai Tan Chảy': 32000,
    'Cà Phê Muối TV': 29000,
  };

  // UI state filters
  const [selectedArea, setSelectedArea] = useState<'All' | 'A' | 'B' | 'C'>('All');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  
  // Cashier Billing states
  const [billingTableId, setBillingTableId] = useState<string>('T102');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'BankTransfer'>('Cash');
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);

  // Manager AI Operational Report states
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiReportOutput, setAiReportOutput] = useState('');
  const [activeTab, setActiveTab] = useState<'metrics' | 'orders' | 'report'>('metrics');

  // SignalR connection state for ready-item notifications.
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'reconnecting' | 'disconnected'>('disconnected');
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [lastReadyEvent, setLastReadyEvent] = useState<OrderItemReadyEvent | null>(null);
  const realtimeRoleEnabled = isAuthenticated && (userRole === 'Staff' || userRole === 'Manager');
  const isRealtimeConnected = realtimeStatus === 'connected';

  // Auto-dismiss the ready-event toast after 5 seconds
  useEffect(() => {
    if (!lastReadyEvent) return;
    const timer = setTimeout(() => setLastReadyEvent(null), 5000);
    return () => clearTimeout(timer);
  }, [lastReadyEvent]);

  // Toggle Theme helper
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  };

  // Sync initial body theme class
  useEffect(() => {
    document.body.classList.add('light-theme');
  }, []);

  useEffect(() => {
    if (!realtimeRoleEnabled) {
      return;
    }

    let isDisposed = false;
    const connection = createRestaurantHubConnection();

    const handleReadyItem = (event: OrderItemReadyEvent) => {
      setLastReadyEvent(event);
      setOrderItems(prev => upsertReadyOrderItem(prev, event));
    };

    connection.on('OrderItemReady', handleReadyItem);
    connection.onreconnecting(() => {
      if (!isDisposed) setRealtimeStatus('reconnecting');
    });
    connection.onreconnected(() => {
      if (!isDisposed) setRealtimeStatus('connected');
      setReconnectAttempt(0); // reset counter after successful reconnect
    });
    connection.onclose(() => {
      if (!isDisposed) setRealtimeStatus('disconnected');
    });

    setRealtimeStatus('connecting');
    connection.start()
      .then(() => {
        if (!isDisposed) setRealtimeStatus('connected');
      })
      .catch(() => {
        if (!isDisposed) setRealtimeStatus('disconnected');
      });

    return () => {
      isDisposed = true;
      connection.off('OrderItemReady', handleReadyItem);
      void connection.stop();
    };
  }, [realtimeRoleEnabled, reconnectAttempt]);

  // Handle Auth Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail === '' || loginPassword === '') {
      setLoginError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    // Simple mock auth credentials
    sessionStorage.setItem('admin_token', 'mock_jwt_token_xyz123');
    sessionStorage.setItem('admin_role', userRole);
    setIsAuthenticated(true);
    setLoginError('');
  };

  // Quick Login bypass button click
  const triggerQuickLogin = (role: 'Staff' | 'Kitchen' | 'Cashier' | 'Manager') => {
    setUserRole(role);
    sessionStorage.setItem('admin_token', 'mock_jwt_token_xyz123');
    sessionStorage.setItem('admin_role', role);
    setIsAuthenticated(true);
    setLoginError('');
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_role');
    setIsAuthenticated(false);
    setSelectedTable(null);
    setRealtimeStatus('disconnected');
  };

  // Simulate incoming customer order in Kitchen display
  const simulateIncomingOrder = () => {
    const dishes = Object.keys(menuPrices);
    const randomDish = dishes[Math.floor(Math.random() * dishes.length)];
    const activeTables = tables.filter(t => t.status === 'Occupied');
    const randomTable = activeTables.length > 0 
      ? activeTables[Math.floor(Math.random() * activeTables.length)].id 
      : 'T102';

    const newItem: OrderItem = {
      id: `ORD_${Math.floor(100 + Math.random() * 900)}`,
      tableId: randomTable,
      dishName: randomDish,
      quantity: Math.floor(1 + Math.random() * 3),
      note: Math.random() > 0.5 ? 'Ít đá, ít đường' : 'Không có ghi chú đặc biệt',
      status: 'Pending',
      timeAdded: new Date().toISOString()
    };

    setOrderItems(prev => [newItem, ...prev]);
  };

  // Advance Order Item status in Bếp Kanban column
  const advanceOrderStatus = (itemId: string) => {
    setOrderItems(prev => prev.map(item => {
      if (item.id === itemId) {
        let nextStatus: OrderItem['status'] = 'Pending';
        if (item.status === 'Pending') nextStatus = 'Preparing';
        else if (item.status === 'Preparing') nextStatus = 'Ready';
        else if (item.status === 'Ready') nextStatus = 'Served';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  // Directly Served order item (Staff role action)
  const markItemAsServed = (itemId: string) => {
    setOrderItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, status: 'Served' };
      }
      return item;
    }));
  };

  // Check-in customer reservation at a selected table
  const checkInReservation = (resId: string, tableId: string) => {
    // 1. Update Reservation status
    setReservations(prev => prev.map(r => r.id === resId ? { ...r, status: 'CheckedIn' } : r));
    // 2. Change table status to Occupied
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'Occupied', currentSessionId: `sess_${Date.now()}` } : t));
    // 3. Clear local selections
    setSelectedReservation(null);
    if (selectedTable && selectedTable.id === tableId) {
      setSelectedTable(prev => prev ? { ...prev, status: 'Occupied' } : null);
    }
  };

  // Clear or reset Table state back to Available
  const changeTableStatus = (tableId: string, status: Table['status']) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return { ...t, status, currentSessionId: status === 'Occupied' ? `sess_${Date.now()}` : undefined };
      }
      return t;
    }));
    if (selectedTable && selectedTable.id === tableId) {
      setSelectedTable(prev => prev ? { ...prev, status, currentSessionId: status === 'Occupied' ? `sess_${Date.now()}` : undefined } : null);
    }
  };

  // Copy QR ordering URL helper for Staff
  const copyQRUrl = (tableId: string) => {
    const mockUrl = `${window.location.protocol}//${window.location.host}/?table=${tableId}&session=sess_${tableId}_active`;
    navigator.clipboard.writeText(mockUrl);
    setCopiedUrl(tableId);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // Submit payment & clear active table session (Cashier Action)
  const executePayment = (tableId: string) => {
    // Remove active orders for this table
    setOrderItems(prev => prev.filter(item => item.tableId !== tableId));
    // Set table state to Cleaning
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'Cleaning', currentSessionId: undefined } : t));
    
    setIsPaidSuccess(true);
    setTimeout(() => {
      setIsPaidSuccess(false);
    }, 3000);
  };

  // Simulate generating Manager Daily AI operational report
  const generateAiReport = () => {
    setIsGeneratingReport(true);
    setAiReportOutput('');
    
    const sampleText = `### BÁO CÁO VẬN HÀNH HÀNG NGÀY - TV FOOD (AI RAG ASSISTANT)
---
* **Thời gian sinh báo cáo**: Hôm nay, lúc ${new Date().toLocaleTimeString('vi-VN')}
* **Dữ liệu phân tích**: Hệ thống Monolith & RAG Knowledge Base

#### 📈 1. Phân Tích Doanh Thu & Đơn Hàng
* **Tổng doanh thu hôm nay**: **1,850,000 VND** (Đạt 115% so với mục tiêu ngày).
* **Số đơn hàng đã hoàn thành**: **42 đơn** (Tăng 12% so với hôm qua).
* **Giá trị trung bình mỗi đơn**: **44,047 VND** / đơn.

#### ☕ 2. Sản Phẩm Bán Chạy & Khung Giờ Cao Điểm
* **Món bán chạy nhất**: **Trà Đào Sả TV FOOD** (18 cốc) & **Phở Bò Tày Đặc Biệt** (14 tô).
* **Khung giờ cao điểm**: Từ **11:30 - 13:30** (Chiếm 62% tổng lượng khách trong ngày) và **18:00 - 20:00**.

#### ⚠️ 3. Cảnh Báo Vận Hành & Kiến Nghị Cải Tiến (Cost Warnings)
* **Thời gian chờ chế biến tại Bếp**: Đang tăng nhẹ vào giờ trưa (trung bình 18 phút/món). Khuyến nghị tăng cường thêm 01 nhân viên phụ bếp vào khung giờ 11:00 - 14:00 để hỗ trợ sơ chế.
* **Tỷ lệ thanh toán Bank Transfer**: Đạt **74%**, giảm thiểu đáng kể chi phí quản lý tiền mặt thủ công.
* **Gợi ý khuyến mại ngày mai**: Đẩy mạnh bán kèm bánh ngọt vào khung giờ xế chiều (14:30 - 16:30) để nâng doanh thu giờ thấp điểm.`;

    let i = 0;
    const interval = setInterval(() => {
      setAiReportOutput(prev => prev + sampleText.charAt(i));
      i++;
      if (i >= sampleText.length) {
        clearInterval(interval);
        setIsGeneratingReport(false);
      }
    }, 10);
  };

  // Get active session orders for Cashier checkout
  const getBillingItems = (tableId: string): InvoiceItem[] => {
    return orderItems
      .filter(item => item.tableId === tableId)
      .map(item => ({
        dishName: item.dishName,
        quantity: item.quantity,
        price: menuPrices[item.dishName] || 45000
      }));
  };

  const currentBillingItems = getBillingItems(billingTableId);
  const billingSubtotal = currentBillingItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const billingTax = Math.round(billingSubtotal * 0.08); // 8% VAT
  const billingGrandTotal = billingSubtotal + billingTax;

  return (
    <div className="admin-app">
      
      {/* Realtime alerts fallback warning banner */}
      {realtimeRoleEnabled && !isRealtimeConnected && (
        <div className="realtime-warning">
          <div className="warning-content">
            <AlertTriangle size={18} />
            <span>Mất kết nối realtime với máy chủ (SignalR). Danh sách món chờ phục vụ vẫn hiển thị dữ liệu gần nhất.</span>
          </div>
          <button className="btn-reconnect" onClick={() => setReconnectAttempt(prev => prev + 1)}>
            <RefreshCw size={14} /> Thử kết nối lại
          </button>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="admin-header">
        <div className="container header-container">
          <div className="brand-logo-box">
            <img src="/logo.png" className="brand-logo-img" alt="TV FOOD" />
            <div className="brand-titles">
              <span className="brand-name-top">TV FOOD</span>
              <span className="brand-badge-admin">Admin Portal</span>
            </div>
          </div>

          {isAuthenticated && (
            <div className="auth-user-bar">
              <div className="role-pills-bar">
                <span className={`role-pill pill-${userRole.toLowerCase()}`}>
                  <Layers size={13} /> {userRole}
                </span>
                <span className={`live-session-indicator live-${realtimeStatus}`}>
                  <span className="indicator-glow"></span>
                  {realtimeStatus === 'connected' && 'Live'}
                  {realtimeStatus === 'connecting' && 'Connecting'}
                  {realtimeStatus === 'reconnecting' && 'Reconnecting'}
                  {realtimeStatus === 'disconnected' && 'Offline'}
                </span>
              </div>

              {/* Dev quick role switch buttons to make reviewing ultra easy */}
              <div className="quick-role-selector">
                <span className="quick-label">Đổi vai nhanh:</span>
                {(['Staff', 'Kitchen', 'Cashier', 'Manager'] as const).map(role => (
                  <button 
                    key={role} 
                    className={`quick-role-btn ${userRole === role ? 'active' : ''}`}
                    onClick={() => setUserRole(role)}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <div className="header-action-buttons">
                <button className="btn-icon-circle theme-toggle" onClick={toggleTheme} title="Đổi giao diện">
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <button className="btn-logout" onClick={handleLogout} title="Đăng xuất">
                  <LogOut size={16} /> <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="admin-workspace container">
        
        {!isAuthenticated ? (
          /* Authentication Login panel */
          <div className="login-screen-wrapper">
            <div className="login-card">
              <div className="login-logo-box">
                <img src="/logo.png" alt="TV FOOD Logo" />
                <h2>Chào mừng quay lại</h2>
                <p>Đăng nhập vào bảng quản trị TV FOOD để phục vụ, chế biến, và giám sát vận hành.</p>
              </div>

              <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                  <label className="form-label">Vai trò đăng nhập</label>
                  <select 
                    className="form-input" 
                    value={userRole} 
                    onChange={(e) => {
                      if (isUserRole(e.target.value)) {
                        setUserRole(e.target.value);
                      }
                    }}
                  >
                    <option value="Staff">Nhân Viên Phục Vụ (Staff)</option>
                    <option value="Kitchen">Đầu Bếp / Bếp Trưởng (Kitchen)</option>
                    <option value="Cashier">Thu Ngân / Kế Toán (Cashier)</option>
                    <option value="Manager">Quản Lý Nhà Hàng (Manager)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tài khoản Email</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="admin@tvfood.com" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mật khẩu bảo mật</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="••••••••" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>

                {loginError && <div className="login-error-msg">{loginError}</div>}

                <button type="submit" className="btn btn-primary w-full">
                  Đăng Nhập <ChevronRight size={16} />
                </button>
              </form>

              <div className="login-quick-access">
                <span className="quick-label-text">Truy cập nhanh (Không cần mật khẩu):</span>
                <div className="quick-role-grid">
                  <button className="quick-role-tile btn-staff" onClick={() => triggerQuickLogin('Staff')}>
                    <Calendar size={18} />
                    <span>Staff</span>
                  </button>
                  <button className="quick-role-tile btn-kitchen" onClick={() => triggerQuickLogin('Kitchen')}>
                    <Coffee size={18} />
                    <span>Kitchen</span>
                  </button>
                  <button className="quick-role-tile btn-cashier" onClick={() => triggerQuickLogin('Cashier')}>
                    <DollarSign size={18} />
                    <span>Cashier</span>
                  </button>
                  <button className="quick-role-tile btn-manager" onClick={() => triggerQuickLogin('Manager')}>
                    <TrendingUp size={18} />
                    <span>Manager</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Role Dashboard Panels */
          <div className="dashboard-content-area">
            
            {/* 1. STAFF ROLE DASHBOARD */}
            {userRole === 'Staff' && (
              <div className="staff-panel-layout">
                
                {/* Left Side: Sơ đồ bàn (Table Map) */}
                <div className="table-map-section">
                  <div className="panel-header-row">
                    <div className="panel-title-group">
                      <h2>Sơ Đồ Bàn Phục Vụ</h2>
                      <p>Nhấp chọn bàn để kiểm tra trạng thái hoặc Check-in cho khách đặt trước.</p>
                    </div>

                    <div className="area-tabs-filter">
                      <button 
                        className={`area-filter-tab ${selectedArea === 'All' ? 'active' : ''}`}
                        onClick={() => setSelectedArea('All')}
                      >
                        Tất Cả ({tables.length})
                      </button>
                      <button 
                        className={`area-filter-tab ${selectedArea === 'A' ? 'active' : ''}`}
                        onClick={() => setSelectedArea('A')}
                      >
                        Sân Vườn (Khu A)
                      </button>
                      <button 
                        className={`area-filter-tab ${selectedArea === 'B' ? 'active' : ''}`}
                        onClick={() => setSelectedArea('B')}
                      >
                        Phòng VIP (Khu B)
                      </button>
                      <button 
                        className={`area-filter-tab ${selectedArea === 'C' ? 'active' : ''}`}
                        onClick={() => setSelectedArea('C')}
                      >
                        Sảnh Chính (Khu C)
                      </button>
                    </div>
                  </div>

                  {/* Table Grid displaying 12px rounded cards */}
                  <div className="table-grid-display">
                    {tables
                      .filter(t => selectedArea === 'All' ? true : t.area === selectedArea)
                      .map(table => (
                        <div 
                          key={table.id}
                          className={`table-card-item card-status-${table.status.toLowerCase()} ${selectedTable?.id === table.id ? 'active' : ''}`}
                          onClick={() => setSelectedTable(table)}
                        >
                          <div className="table-card-seats">{table.seats} Chỗ</div>
                          <h3 className="table-card-title">{table.name}</h3>
                          <span className={`table-status-label status-${table.status.toLowerCase()}`}>
                            {table.status === 'Available' && 'Còn Trống'}
                            {table.status === 'Reserved' && 'Được Đặt'}
                            {table.status === 'Occupied' && 'Có Khách'}
                            {table.status === 'Cleaning' && 'Đang Dọn'}
                            {table.status === 'Inactive' && 'Bảo Trì'}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Color Guide Status */}
                  <div className="table-status-guide">
                    <span className="guide-item"><span className="dot dot-available"></span> Còn trống</span>
                    <span className="guide-item"><span className="dot dot-reserved"></span> Đã đặt chỗ</span>
                    <span className="guide-item"><span className="dot dot-occupied"></span> Đang có khách</span>
                    <span className="guide-item"><span className="dot dot-cleaning"></span> Đang dọn bàn</span>
                    <span className="guide-item"><span className="dot dot-inactive"></span> Bảo trì</span>
                  </div>
                </div>

                {/* Right Side: Table Detail & Check-in Control */}
                <div className="table-control-sidebar">
                  {selectedTable ? (
                    <div className="control-card">
                      <div className="control-card-header">
                        <h3>Thông Tin {selectedTable.name}</h3>
                        <span className="badge-seats">{selectedTable.seats} Ghế ngồi</span>
                      </div>

                      <div className="control-table-status-block">
                        <span className="status-label-prefix">Trạng thái hiện tại:</span>
                        <span className={`status-pill pill-${selectedTable.status.toLowerCase()}`}>
                          {selectedTable.status}
                        </span>
                      </div>

                      {/* Action options depending on table status */}
                      <div className="control-action-options">
                        {selectedTable.status === 'Available' && (
                          <div className="action-vertical-box">
                            <p className="action-hint">Khách vãng lai vừa ngồi vào bàn này? Chuyển sang Có Khách để khách tự gọi món qua QR.</p>
                            <button 
                              className="btn btn-primary w-full"
                              onClick={() => changeTableStatus(selectedTable.id, 'Occupied')}
                            >
                              <Play size={16} /> Mở Phiên Phục Vụ
                            </button>
                            <button 
                              className="btn btn-tertiary w-full"
                              onClick={() => changeTableStatus(selectedTable.id, 'Reserved')}
                            >
                              <Calendar size={16} /> Chuyển Sang Đã Đặt
                            </button>
                          </div>
                        )}

                        {selectedTable.status === 'Reserved' && (
                          <div className="action-vertical-box">
                            <p className="action-hint">Khách đặt chỗ đã đến? Chọn khách đặt trước từ danh sách dưới đây để hoàn tất Check-in.</p>
                            
                            <div className="quick-reservation-select-box">
                              <label className="form-label">Chọn khách check-in:</label>
                              <select 
                                className="form-input"
                                onChange={(e) => {
                                  const res = reservations.find(r => r.id === e.target.value);
                                  if (res) setSelectedReservation(res);
                                }}
                              >
                                <option value="">-- Chọn Đơn Đặt Chỗ --</option>
                                {reservations.filter(r => r.status === 'Pending').map(r => (
                                  <option key={r.id} value={r.id}>
                                    {r.name} ({r.guests} khách - {r.time})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {selectedReservation && (
                              <div className="selected-res-preview">
                                <strong>Khách:</strong> {selectedReservation.name}<br />
                                <strong>Điện thoại:</strong> {selectedReservation.phone}<br />
                                <strong>Thời gian:</strong> {selectedReservation.time}<br />
                                <strong>Ghi chú:</strong> {selectedReservation.note || 'Không có'}<br />
                                <button 
                                  className="btn btn-primary w-full mt-10"
                                  onClick={() => checkInReservation(selectedReservation.id, selectedTable.id)}
                                >
                                  <CheckCircle size={16} /> Xác Nhận Check-In
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {selectedTable.status === 'Occupied' && (
                          <div className="action-vertical-box">
                            <p className="action-hint">Bàn đang có khách. Bạn có thể sao chép và gửi URL đặt món QR trực tiếp tại bàn này.</p>
                            
                            <div className="qr-url-box">
                              <span className="qr-label">URL Gọi Món QR:</span>
                              <div className="qr-input-row">
                                <input 
                                  type="text" 
                                  readOnly 
                                  className="form-input text-ellipsis" 
                                  value={`${window.location.protocol}//${window.location.host}/?table=${selectedTable.id}&session=sess_${selectedTable.id}`}
                                />
                                <button 
                                  className="btn btn-primary btn-copy" 
                                  onClick={() => copyQRUrl(selectedTable.id)}
                                >
                                  {copiedUrl === selectedTable.id ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                              </div>
                              {copiedUrl === selectedTable.id && (
                                <span className="copy-success-message">Đã sao chép liên kết gọi món!</span>
                              )}
                            </div>

                            <button 
                              className="btn btn-tertiary w-full mt-10"
                              onClick={() => changeTableStatus(selectedTable.id, 'Cleaning')}
                            >
                              <RefreshCw size={16} /> Chuyển dọn dẹp / Trống bàn
                            </button>
                          </div>
                        )}

                        {selectedTable.status === 'Cleaning' && (
                          <div className="action-vertical-box">
                            <p className="action-hint">Dọn dẹp bàn hoàn tất? Chuyển trạng thái bàn về Sẵn sàng đón khách.</p>
                            <button 
                              className="btn btn-primary w-full"
                              onClick={() => changeTableStatus(selectedTable.id, 'Available')}
                            >
                              <CheckCircle size={16} /> Hoàn Tất Dọn Dẹp (Sẵn Sàng)
                            </button>
                          </div>
                        )}

                        {selectedTable.status === 'Inactive' && (
                          <div className="action-vertical-box">
                            <p className="action-hint">Bàn đang trong trạng thái bảo trì. Kích hoạt lại khi sửa chữa xong.</p>
                            <button 
                              className="btn btn-primary w-full"
                              onClick={() => changeTableStatus(selectedTable.id, 'Available')}
                            >
                              Kích Hoạt Hoạt Động Trở Lại
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="control-cardempty">
                      <Calendar size={36} />
                      <h3>Chưa Chọn Bàn</h3>
                      <p>Vui lòng nhấp chọn một bàn bất kỳ trên sơ đồ để bắt đầu các tác vụ.</p>
                    </div>
                  )}

                  {/* Serving food items update notification */}
                  <div className="staff-serving-list-box">
                    <div className="serving-header-row">
                      <h3>Món Chín Chờ Phục Vụ ({orderItems.filter(i => itemStatusFilter(i, 'Ready')).length})</h3>
                      <span className={`serving-realtime-badge badge-${realtimeStatus}`}>
                        {realtimeStatus === 'connected' && 'SignalR'}
                        {realtimeStatus === 'connecting' && 'Đang nối'}
                        {realtimeStatus === 'reconnecting' && 'Nối lại'}
                        {realtimeStatus === 'disconnected' && 'Mất nối'}
                      </span>
                    </div>
                    {lastReadyEvent && (
                      <div className="ready-event-toast">
                        <CheckCircle size={14} />
                        <span>
                          {lastReadyEvent.tableNumber
                            ? `Bàn ${lastReadyEvent.tableNumber}: `
                            : lastReadyEvent.tableId
                            ? `Bàn ${lastReadyEvent.tableId}: `
                            : ''}
                          <strong>
                            {lastReadyEvent.menuItemName ?? `Món #${lastReadyEvent.orderItemId}`}
                          </strong>{lastReadyEvent.quantity && lastReadyEvent.quantity > 1 ? ` ×${lastReadyEvent.quantity}` : ''} đã sẵn sàng phục vụ!
                        </span>
                      </div>
                    )}
                    <div className="serving-items-scroll">
                      {orderItems.filter(i => itemStatusFilter(i, 'Ready')).length === 0 ? (
                        <div className="empty-box-inline">Không có món ăn nào đang chờ phục vụ.</div>
                      ) : (
                        orderItems.filter(i => itemStatusFilter(i, 'Ready')).map(item => (
                          <div key={item.id} className="serving-item-row">
                            <div className="serving-item-meta">
                              <strong>Bàn: {tables.find(t => t.id === item.tableId)?.name || item.tableId}</strong>
                              <span>{item.dishName} (x{item.quantity})</span>
                              {item.source === 'realtime' && <small>🔴 Realtime</small>}
                            </div>
                            <button 
                              className="btn-serve-item"
                              onClick={() => markItemAsServed(item.id)}
                            >
                              <Check size={14} /> Giao
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. KITCHEN ROLE DASHBOARD (Kanban Screen) */}
            {userRole === 'Kitchen' && (
              <div className="kitchen-panel-layout">
                <div className="panel-header-row">
                  <div className="panel-title-group">
                    <h2>Bảng Điều Phối Món Ăn (Kitchen Kanban)</h2>
                    <p>Đầu bếp quản lý và cập nhật tiến độ nấu ăn theo thời gian thực.</p>
                  </div>

                  <div className="panel-actions-group">
                    <button className="btn btn-tertiary" onClick={simulateIncomingOrder}>
                      <PlusCircle size={16} /> Giả Lập Order Mới
                    </button>
                  </div>
                </div>

                {/* Kanban columns Grid */}
                <div className="kanban-board-grid">
                  
                  {/* Column 1: Pending */}
                  <div className="kanban-column col-pending">
                    <div className="column-header">
                      <h3>Chờ Chế Biến ({orderItems.filter(i => itemStatusFilter(i, 'Pending')).length})</h3>
                    </div>
                    <div className="column-items-scroll">
                      {orderItems.filter(i => itemStatusFilter(i, 'Pending')).length === 0 ? (
                        <div className="kanban-empty-state">Trống</div>
                      ) : (
                        orderItems.filter(i => itemStatusFilter(i, 'Pending')).map(item => (
                          <div key={item.id} className="kanban-item-card">
                            <div className="item-card-top">
                              <span className="item-table-no">Bàn: {tables.find(t => t.id === item.tableId)?.name.split(' ')[1] || item.tableId}</span>
                              <span className="item-time-waiting">
                                <Clock size={12} /> {getWaitTimeStr(item.timeAdded)} phút trước
                              </span>
                            </div>
                            <h4 className="item-dish-name">{item.dishName}</h4>
                            <div className="item-quantity-box">Số lượng: <strong>x{item.quantity}</strong></div>
                            {item.note && <div className="item-note-box">📝 {item.note}</div>}
                            
                            <button 
                              className="btn btn-primary btn-advance w-full mt-10"
                              onClick={() => advanceOrderStatus(item.id)}
                            >
                              Bắt Đầu Nấu <Play size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Column 2: Preparing */}
                  <div className="kanban-column col-preparing">
                    <div className="column-header">
                      <h3>Đang Nấu ({orderItems.filter(i => itemStatusFilter(i, 'Preparing')).length})</h3>
                    </div>
                    <div className="column-items-scroll">
                      {orderItems.filter(i => itemStatusFilter(i, 'Preparing')).length === 0 ? (
                        <div className="kanban-empty-state">Trống</div>
                      ) : (
                        orderItems.filter(i => itemStatusFilter(i, 'Preparing')).map(item => (
                          <div key={item.id} className="kanban-item-card card-preparing-active">
                            <div className="item-card-top">
                              <span className="item-table-no">Bàn: {tables.find(t => t.id === item.tableId)?.name.split(' ')[1] || item.tableId}</span>
                              <span className="item-time-waiting">
                                <Clock size={12} /> {getWaitTimeStr(item.timeAdded)} phút trước
                              </span>
                            </div>
                            <h4 className="item-dish-name">{item.dishName}</h4>
                            <div className="item-quantity-box">Số lượng: <strong>x{item.quantity}</strong></div>
                            {item.note && <div className="item-note-box">📝 {item.note}</div>}
                            
                            <button 
                              className="btn btn-secondary btn-advance w-full mt-10"
                              onClick={() => advanceOrderStatus(item.id)}
                            >
                              Báo Món Chín <Check size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Column 3: Ready */}
                  <div className="kanban-column col-ready">
                    <div className="column-header">
                      <h3>Sẵn Sàng Phục Vụ ({orderItems.filter(i => itemStatusFilter(i, 'Ready')).length})</h3>
                    </div>
                    <div className="column-items-scroll">
                      {orderItems.filter(i => itemStatusFilter(i, 'Ready')).length === 0 ? (
                        <div className="kanban-empty-state">Trống</div>
                      ) : (
                        orderItems.filter(i => itemStatusFilter(i, 'Ready')).map(item => (
                          <div key={item.id} className="kanban-item-card card-ready-active">
                            <div className="item-card-top">
                              <span className="item-table-no">Bàn: {tables.find(t => t.id === item.tableId)?.name.split(' ')[1] || item.tableId}</span>
                              <span className="item-time-waiting">Đã xong</span>
                            </div>
                            <h4 className="item-dish-name">{item.dishName}</h4>
                            <div className="item-quantity-box">Số lượng: <strong>x{item.quantity}</strong></div>
                            
                            <button 
                              className="btn btn-tertiary btn-advance w-full mt-10"
                              onClick={() => advanceOrderStatus(item.id)}
                            >
                              Xác nhận đã giao bàn <CheckCircle size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 3. CASHIER ROLE DASHBOARD */}
            {userRole === 'Cashier' && (
              <div className="cashier-panel-layout">
                
                {/* Left side: occupied tables list */}
                <div className="occupied-tables-sidebar">
                  <div className="sidebar-title-box">
                    <h2>Bàn Đang Hoạt Động</h2>
                    <p>Chọn bàn có phiên sử dụng để in hóa đơn và thanh toán.</p>
                  </div>

                  <div className="occupied-tables-scroll">
                    {tables.filter(t => t.status === 'Occupied').length === 0 ? (
                      <div className="empty-box-inline">Không có bàn nào đang có khách.</div>
                    ) : (
                      tables.filter(t => t.status === 'Occupied').map(table => (
                        <div 
                          key={table.id}
                          className={`occupied-table-tile ${billingTableId === table.id ? 'active' : ''}`}
                          onClick={() => setBillingTableId(table.id)}
                        >
                          <div className="occupied-tile-meta">
                            <strong>{table.name}</strong>
                            <span>{getBillingItems(table.id).length} Món ăn đã gọi</span>
                          </div>
                          <ChevronRight size={16} />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right side: Invoice bill & checkouts */}
                <div className="billing-bill-section">
                  {billingTableId && tables.find(t => t.id === billingTableId)?.status === 'Occupied' ? (
                    <div className="invoice-box-card">
                      
                      <div className="invoice-header">
                        <div className="invoice-brand-block">
                          <img src="/logo.png" alt="TV FOOD" />
                          <div>
                            <h3>HÓA ĐƠN TẠM TÍNH</h3>
                            <span>TV FOOD - Tinh hoa Thực Phẩm Sạch</span>
                          </div>
                        </div>
                        <div className="invoice-meta-info">
                          <span>Bàn: <strong>{tables.find(t => t.id === billingTableId)?.name}</strong></span>
                          <span>Mã phiên: {tables.find(t => t.id === billingTableId)?.currentSessionId}</span>
                          <span>Giờ in: {new Date().toLocaleTimeString('vi-VN')}</span>
                        </div>
                      </div>

                      {/* Billing Items list table */}
                      <div className="invoice-table-container">
                        <table className="invoice-data-table">
                          <thead>
                            <tr>
                              <th>Tên món ăn</th>
                              <th>Số lượng</th>
                              <th>Đơn giá</th>
                              <th className="text-right">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentBillingItems.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="empty-invoice-row">Bàn này chưa đặt món nào.</td>
                              </tr>
                            ) : (
                              currentBillingItems.map((item, idx) => (
                                <tr key={idx}>
                                  <td>{item.dishName}</td>
                                  <td>x{item.quantity}</td>
                                  <td>{item.price.toLocaleString()}đ</td>
                                  <td className="text-right">{(item.price * item.quantity).toLocaleString()}đ</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Summary prices calculations */}
                      <div className="invoice-price-summary">
                        <div className="summary-row">
                          <span>Tạm tính (chưa thuế):</span>
                          <span>{billingSubtotal.toLocaleString()}đ</span>
                        </div>
                        <div className="summary-row">
                          <span>Thuế VAT (8%):</span>
                          <span>{billingTax.toLocaleString()}đ</span>
                        </div>
                        <div className="summary-row grand-total-row">
                          <span>Tổng cộng thanh toán:</span>
                          <span>{billingGrandTotal.toLocaleString()}đ</span>
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div className="payment-method-selector-box">
                        <span className="form-label">Phương thức thanh toán:</span>
                        <div className="payment-methods-grid">
                          <button 
                            className={`payment-method-btn ${paymentMethod === 'Cash' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('Cash')}
                          >
                            Tiền Mặt (Cash)
                          </button>
                          <button 
                            className={`payment-method-btn ${paymentMethod === 'BankTransfer' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('BankTransfer')}
                          >
                            Chuyển Khoản (Bank)
                          </button>
                        </div>

                        {paymentMethod === 'BankTransfer' && (
                          <div className="payment-bank-qr-mock">
                            <div className="qr-graphic-box">
                              {/* Standard mockup QR Payment box */}
                              <div className="qr-mock-square">
                                <div className="qr-corner qr-top-left"></div>
                                <div className="qr-corner qr-top-right"></div>
                                <div className="qr-corner qr-bottom-left"></div>
                                <div className="qr-center-logo">TV FOOD</div>
                              </div>
                            </div>
                            <div className="qr-bank-details">
                              <strong>Mã VietQR Thanh Toán Nhanh</strong>
                              <span>Số tiền: {billingGrandTotal.toLocaleString()}đ</span>
                              <span>Nội dung: TVFOOD {billingTableId}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Checkout action buttons */}
                      {isPaidSuccess && (
                        <div className="success-toast-message">
                          <CheckCircle size={16} /> Thanh toán hoàn tất! Bàn đã chuyển sang dọn dẹp.
                        </div>
                      )}

                      <div className="invoice-actions-footer">
                        <button 
                          className="btn btn-primary w-full"
                          onClick={() => executePayment(billingTableId)}
                        >
                          Xác Nhận Đã Thu Tiền & Giải Phóng Bàn
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="control-cardempty">
                      <DollarSign size={48} />
                      <h3>Chưa Chọn Bàn Thanh Toán</h3>
                      <p>Vui lòng nhấp chọn một bàn đang có khách từ danh sách bên trái để kiểm tra hóa đơn.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 4. MANAGER ROLE DASHBOARD */}
            {userRole === 'Manager' && (
              <div className="manager-panel-layout">
                
                {/* Manager Tab switches */}
                <div className="manager-tabs-bar">
                  <button 
                    className={`manager-tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('metrics')}
                  >
                    <TrendingUp size={16} /> Tổng Quan Doanh Số
                  </button>
                  <button 
                    className={`manager-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                  >
                    <ShoppingBag size={16} /> Giám Sát Đơn Hàng Realtime
                  </button>
                  <button 
                    className={`manager-tab-btn ${activeTab === 'report' ? 'active' : ''}`}
                    onClick={() => setActiveTab('report')}
                  >
                    <Send size={16} /> AI Assistant Operational Report
                  </button>
                </div>

                {/* Tab content 1: Metrics & charts */}
                {activeTab === 'metrics' && (
                  <div className="manager-tab-content active-metrics">
                    
                    {/* Top Row Cards */}
                    <div className="manager-metrics-grid">
                      <div className="metric-card-box">
                        <div className="metric-icon bg-orange-light"><DollarSign size={20} /></div>
                        <div className="metric-info">
                          <span>Doanh Thu Hôm Nay</span>
                          <h3>1,850,000 VND</h3>
                        </div>
                      </div>

                      <div className="metric-card-box">
                        <div className="metric-icon bg-blue-light"><ShoppingBag size={20} /></div>
                        <div className="metric-info">
                          <span>Số Đơn Hàng Hôm Nay</span>
                          <h3>42 Đơn</h3>
                        </div>
                      </div>

                      <div className="metric-card-box">
                        <div className="metric-icon bg-green-light"><Users size={20} /></div>
                        <div className="metric-info">
                          <span>Bàn Đang Phục Vụ</span>
                          <h3>{tables.filter(t => t.status === 'Occupied').length} Bàn</h3>
                        </div>
                      </div>

                      <div className="metric-card-box">
                        <div className="metric-icon bg-yellow-light"><Clock size={20} /></div>
                        <div className="metric-info">
                          <span>Món Đang Chờ Bếp</span>
                          <h3>{orderItems.filter(i => itemStatusFilter(i, 'Pending') || itemStatusFilter(i, 'Preparing')).length} Món</h3>
                        </div>
                      </div>
                    </div>

                    {/* Chart & Top seller grids */}
                    <div className="chart-seller-grid">
                      
                      {/* Interactive Bar Chart built in Pure HTML/CSS for premium Zapier feel */}
                      <div className="chart-box-card">
                        <h3>Lượng Đơn Hàng Theo Giờ</h3>
                        <div className="css-bar-chart">
                          <div className="chart-bar-container">
                            <div className="chart-bar-fill" style={{ height: '15%' }}></div>
                            <span className="bar-label">08:00</span>
                          </div>
                          <div className="chart-bar-container">
                            <div className="chart-bar-fill" style={{ height: '25%' }}></div>
                            <span className="bar-label">09:00</span>
                          </div>
                          <div className="chart-bar-container">
                            <div className="chart-bar-fill" style={{ height: '20%' }}></div>
                            <span className="bar-label">10:00</span>
                          </div>
                          <div className="chart-bar-container">
                            <div className="chart-bar-fill" style={{ height: '45%' }}></div>
                            <span className="bar-label">11:00</span>
                          </div>
                          <div className="chart-bar-container">
                            <div className="chart-bar-fill highlight-primary" style={{ height: '85%' }}></div>
                            <span className="bar-label">12:00</span>
                          </div>
                          <div className="chart-bar-container">
                            <div className="chart-bar-fill highlight-primary" style={{ height: '70%' }}></div>
                            <span className="bar-label">13:00</span>
                          </div>
                          <div className="chart-bar-container">
                            <div className="chart-bar-fill" style={{ height: '15%' }}></div>
                            <span className="bar-label">14:00</span>
                          </div>
                          <div className="chart-bar-container">
                            <div className="chart-bar-fill" style={{ height: '20%' }}></div>
                            <span className="bar-label">15:00</span>
                          </div>
                          <div className="chart-bar-container">
                            <div className="chart-bar-fill" style={{ height: '30%' }}></div>
                            <span className="bar-label">16:00</span>
                          </div>
                          <div className="chart-bar-container">
                            <div className="chart-bar-fill" style={{ height: '55%' }}></div>
                            <span className="bar-label">17:00</span>
                          </div>
                          <div className="chart-bar-container">
                            <div className="chart-bar-fill highlight-primary" style={{ height: '80%' }}></div>
                            <span className="bar-label">18:00</span>
                          </div>
                          <div className="chart-bar-container">
                            <div className="chart-bar-fill highlight-primary" style={{ height: '95%' }}></div>
                            <span className="bar-label">19:00</span>
                          </div>
                          <div className="chart-bar-container">
                            <div className="chart-bar-fill" style={{ height: '65%' }}></div>
                            <span className="bar-label">20:00</span>
                          </div>
                          <div className="chart-bar-container">
                            <div className="chart-bar-fill" style={{ height: '40%' }}></div>
                            <span className="bar-label">21:00</span>
                          </div>
                          <div className="chart-bar-container">
                            <div className="chart-bar-fill" style={{ height: '10%' }}></div>
                            <span className="bar-label">22:00</span>
                          </div>
                        </div>
                        <span className="chart-legend-text">* Khung giờ 12:00 và 19:00 là thời điểm lượng khách tập trung đông nhất trong ngày.</span>
                      </div>

                      {/* Top items table */}
                      <div className="seller-box-card">
                        <h3>Sản Phẩm Bán Chạy Nhất</h3>
                        <div className="seller-items-list">
                          <div className="seller-item-row">
                            <div className="seller-item-details">
                              <strong>1. Trà Đào Sả TV FOOD</strong>
                              <span>Đồ Uống / Topping thạch sả</span>
                            </div>
                            <span className="seller-count">18 Cốc</span>
                          </div>
                          <div className="seller-item-row">
                            <div className="seller-item-details">
                              <strong>2. Phở Bò Tày Đặc Biệt</strong>
                              <span>Món Ăn / Súp bò hầm thảo mộc</span>
                            </div>
                            <span className="seller-count">14 Tô</span>
                          </div>
                          <div className="seller-item-row">
                            <div className="seller-item-details">
                              <strong>3. Cà Phê Muối TV</strong>
                              <span>Đồ Uống / Kem mặn đặc sản</span>
                            </div>
                            <span className="seller-count">12 Ly</span>
                          </div>
                          <div className="seller-item-row">
                            <div className="seller-item-details">
                              <strong>4. Bánh Mì Chảo Đặc Biệt</strong>
                              <span>Món Ăn / Pate trứng nóng sốt</span>
                            </div>
                            <span className="seller-count">9 Suất</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* Tab content 2: Live order tracking list */}
                {activeTab === 'orders' && (
                  <div className="manager-tab-content active-orders">
                    <h3>Giám Sát Tiến Độ Đơn Hàng Khách Tại Bàn</h3>
                    <div className="manager-order-monitoring-table-container">
                      <table className="manager-order-table">
                        <thead>
                          <tr>
                            <th>Mã Đơn</th>
                            <th>Bàn</th>
                            <th>Món Ăn</th>
                            <th>Số Lượng</th>
                            <th>Trạng Thái Chế Biến</th>
                            <th>Thời Gian Gọi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderItems.map(item => (
                            <tr key={item.id}>
                              <td><strong>{item.id}</strong></td>
                              <td>{tables.find(t => t.id === item.tableId)?.name || item.tableId}</td>
                              <td>{item.dishName}</td>
                              <td>x{item.quantity}</td>
                              <td>
                                <span className={`status-pill pill-${item.status.toLowerCase()}`}>
                                  {item.status === 'Pending' && 'Chờ chế biến'}
                                  {item.status === 'Preparing' && 'Đang nấu'}
                                  {item.status === 'Ready' && 'Đã nấu chín'}
                                  {item.status === 'Served' && 'Đã phục vụ'}
                                </span>
                              </td>
                              <td>{new Date(item.timeAdded).toLocaleTimeString('vi-VN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab content 3: AI report operational */}
                {activeTab === 'report' && (
                  <div className="manager-tab-content active-report">
                    <div className="ai-report-layout">
                      <div className="ai-prompt-box">
                        <h3>Trợ Lý Báo Cáo Thông Minh TV FOOD AI</h3>
                        <p>Trợ lý ảo RAG tự động thu thập doanh số thực tế, phân tích khung giờ cao điểm và đánh giá hiệu năng bếp chế biến để sinh báo cáo hành động thông minh.</p>
                        
                        <div className="mock-prompt-container">
                          <strong>Yêu cầu gửi AI Service:</strong>
                          <pre className="prompt-pre">
{`{
  "system": "FastAPI AI RAG service",
  "knowledge_base": "tv_food_operations_guide",
  "today_metrics": {
    "revenue": 1850000,
    "completed_orders": 42,
    "peak_hour": "12:00 & 19:00",
    "top_item": "Trà Đào Sả TV FOOD",
    "avg_prep_time_minutes": 18
  }
}`}
                          </pre>
                        </div>

                        <button 
                          className="btn btn-primary w-full"
                          onClick={generateAiReport}
                          disabled={isGeneratingReport}
                        >
                          {isGeneratingReport ? 'AI Đang Phân Tích...' : 'Khởi Chạy Sinh Báo Cáo AI RAG'}
                        </button>
                      </div>

                      <div className="ai-output-box">
                        <h3>Kết Quả Trả Về Từ AI Service</h3>
                        {aiReportOutput ? (
                          <div className="ai-typing-output-content">
                            <pre className="report-render">{aiReportOutput}</pre>
                            {isGeneratingReport && <span className="typing-cursor">|</span>}
                          </div>
                        ) : (
                          <div className="ai-empty-output">
                            <Eye size={42} />
                            <span>Vui lòng nhấn nút Khởi Chạy bên trái để sinh báo cáo hoạt động tức thì.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </main>

      {/* Admin Web Footer */}
      <footer className="admin-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} TV FOOD Admin Portal. Được cung cấp bởi Giải Pháp Quản Lý Nhà Hàng Monolith.</p>
        </div>
      </footer>

    </div>
  );
}

// Utility helper to compute wait time minutes
function getWaitTimeStr(isoString: string): number {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  return diffMins > 0 ? diffMins : 1;
}

// Custom Order item status filters
function itemStatusFilter(item: OrderItem, status: OrderItem['status']): boolean {
  return item.status === status;
}

export default App;
