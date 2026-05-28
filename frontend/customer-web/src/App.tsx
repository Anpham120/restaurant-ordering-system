import { useState, useEffect } from 'react';
import {
  Utensils,
  Calendar,
  ShoppingBag,
  Search,
  Plus,
  Minus,
  X,
  Clock,
  User,
  Phone,
  Users,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Sun,
  Moon,
  Home,
  Bot,
  Heart,
  Star,
  Tag,
  Newspaper,
  Bell,
  ScanLine,
  Grid,
  Leaf,
  Soup,
  Flame,
  CupSoda,
  Cookie
} from 'lucide-react';
import './App.css';

// -------------------------------------------------------------
// TYPES & CONTRACT ALIGNED SCHEMAS
// -------------------------------------------------------------
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName: string;
  tags: string[];
  isAvailable: boolean;
  imageUrl: string;
  emoji: string;
}

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  note: string;
  emoji: string;
}

interface Reservation {
  id: string;
  reservationCode: string;
  customerName: string;
  phone: string;
  guestCount: number;
  reservationTime: string;
  note: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
}

interface TableSession {
  id: string;
  tableId: string;
  tableNumber: string;
  status: 'Active' | 'Closed';
  openedAt: string;
}

interface OrderItem {
  id: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled';
  note?: string;
}

interface Order {
  orderId: string;
  orderCode: string;
  tableNumber: string;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Served';
  items: OrderItem[];
  placedAt: Date;
}

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

// -------------------------------------------------------------
// MOCK DATA - RESTAURANT MENU ITEMS (GET /api/v1/menu)
// -------------------------------------------------------------
const MOCK_MENU: MenuItem[] = [
  {
    id: "dish-001",
    name: "Lẩu Thái Hải Sản Tinh Hoa",
    description: "Nước lẩu chua cay, đậm đà vị Thái",
    price: 239000,
    categoryId: "cat-hotpot",
    categoryName: "Món Lẩu",
    tags: ["cay", "bán chạy"],
    isAvailable: true,
    imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80",
    emoji: "🍲"
  },
  {
    id: "dish-002",
    name: "Cá Hồi Sốt Chanh Dây",
    description: "Cá hồi tươi, sốt chanh dây thơm mát",
    price: 159000,
    categoryId: "cat-appetizer",
    categoryName: "Khai Vị",
    tags: ["khai vị", "đặc sản"],
    isAvailable: true,
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80",
    emoji: "🍣"
  },
  {
    id: "dish-003",
    name: "Gà Chiên Nước Mắm Tỏi Ớt",
    description: "Gà giòn rụm, sốt mắm tỏi ớt đậm đà",
    price: 189000,
    categoryId: "cat-appetizer",
    categoryName: "Khai Vị",
    tags: ["mặn ngọt", "bán chạy"],
    isAvailable: true,
    imageUrl: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80",
    emoji: "🍗"
  },
  {
    id: "dish-004",
    name: "Bò Lúc Lắc Khoai Tây Giòn",
    description: "Thịt thăn bò Mỹ quân cờ xào tiêu đen hành tây, ăn kèm khoai tây chiên giòn.",
    price: 219000,
    categoryId: "cat-main",
    categoryName: "Món Chính",
    tags: ["bò", "trẻ em yêu thích", "nổi bật"],
    isAvailable: true,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    emoji: "🥩"
  },
  {
    id: "dish-005",
    name: "Cơm Chiên Hải Sản Hạt Sen",
    description: "Cơm chiên tơi xốp cùng trứng, tôm mực thái hạt lựu và hạt sen thơm bùi.",
    price: 139000,
    categoryId: "cat-main",
    categoryName: "Món Chính",
    tags: ["dễ ăn", "ăn no"],
    isAvailable: true,
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
    emoji: "🍛"
  },
  {
    id: "dish-006",
    name: "Nước Cam Vắt Nguyên Chất",
    description: "Cam sành tươi chín mọng vắt nguyên chất, giàu vitamin C thanh nhiệt cơ thể.",
    price: 49000,
    categoryId: "cat-drink",
    categoryName: "Đồ Uống",
    tags: ["healthy", "thanh nhiệt"],
    isAvailable: true,
    imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80",
    emoji: "🍊"
  },
  {
    id: "dish-007",
    name: "Soda Chanh Dây Bạc Hà",
    description: "Giải nhiệt sảng khoái, thơm mát",
    price: 79000,
    categoryId: "cat-drink",
    categoryName: "Đồ Uống",
    tags: ["đồ uống", "thanh mát"],
    isAvailable: true,
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    emoji: "🍹"
  },
  {
    id: "dish-008",
    name: "Kem Bơ Sầu Riêng Đắk Lắk",
    description: "Bơ sáp xay mịn béo ngậy ăn kèm một viên kem vani Pháp và múi sầu riêng RI6.",
    price: 69000,
    categoryId: "cat-dessert",
    categoryName: "Tráng Miệng",
    tags: ["béo ngậy", "đặc sản"],
    isAvailable: true,
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80",
    emoji: "🥑"
  },
  {
    id: "dish-009",
    name: "Tiramisu Cà Phê",
    description: "Béo mịn, thơm hương cà phê",
    price: 99000,
    categoryId: "cat-dessert",
    categoryName: "Tráng Miệng",
    tags: ["tráng miệng", "ngọt ngào"],
    isAvailable: true,
    imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80",
    emoji: "🍰"
  }
];

const CATEGORIES = [
  { id: "all", name: "Tất Cả Món", emoji: "🍱" },
  { id: "cat-appetizer", name: "Món Khai Vị", emoji: "🥗" },
  { id: "cat-main", name: "Món Chính", emoji: "🥩" },
  { id: "cat-hotpot", name: "Món Lẩu", emoji: "🍲" },
  { id: "cat-drink", name: "Đồ Uống", emoji: "🍹" },
  { id: "cat-dessert", name: "Tráng Miệng", emoji: "🍰" }
];

const getBadgeClass = (tag: string): string => {
  const t = tag.toLowerCase();
  if (t.includes('cay')) return 'badge-danger';
  if (t.includes('bán chạy') || t.includes('được thích') || t.includes('đặc sản')) return 'badge-primary';
  if (t.includes('healthy') || t.includes('thanh đạm') || t.includes('khai vị') || t.includes('thanh nhiệt') || t.includes('thanh mát')) return 'badge-success';
  return 'badge-warning';
};

export function App() {
  // Theme state & body class manager
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Realtime bridge: Listen to status updates from Kitchen Display (Flow 33)
  useEffect(() => {
    const interval = setInterval(() => {
      const cookieVal = document.cookie
        .split('; ')
        .find(row => row.startsWith('tv_food_order_status_updates='));
      if (cookieVal) {
        try {
          const jsonStr = decodeURIComponent(cookieVal.split('=')[1]);
          const statusUpdates = JSON.parse(jsonStr);
          if (statusUpdates && statusUpdates.length > 0) {
            let updatedAny = false;
            setPlacedOrders(prevOrders => {
              return prevOrders.map(order => {
                let orderUpdated = false;
                const newItems = order.items.map(item => {
                  const update = statusUpdates.find((u: any) => u.dishName === item.menuItemName);
                  if (update && update.status !== item.status) {
                    orderUpdated = true;
                    updatedAny = true;
                    return { ...item, status: update.status };
                  }
                  return item;
                });

                if (orderUpdated) {
                  // Calculate dynamic overall order status
                  const allServed = newItems.every(i => i.status === 'Served');
                  const anyReady = newItems.some(i => i.status === 'Ready');
                  const anyPreparing = newItems.some(i => i.status === 'Preparing');
                  
                  let computedStatus = 'Pending';
                  if (allServed) computedStatus = 'Served';
                  else if (anyReady) computedStatus = 'Ready';
                  else if (anyPreparing) computedStatus = 'Preparing';

                  return { ...order, status: computedStatus as any, items: newItems };
                }
                return order;
              });
            });
            if (updatedAny) {
              triggerToast("🔔 Trạng thái món ăn tại Bếp đã thay đổi!");
            }
            // Clear the status updates cookie
            document.cookie = "tv_food_order_status_updates=; path=/; max-age=0";
          }
        } catch (e) {
          console.error("Error reading order status updates", e);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Realtime SignalR connection status state (API Contract: /hubs/restaurant)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  // Attempt standard SignalR WebSocket connection
  useEffect(() => {
    const wsUrl = "ws://localhost:5000/hubs/restaurant";
    let socket: WebSocket | null = null;
    
    try {
      socket = new WebSocket(wsUrl);
      socket.onopen = () => {
        setIsRealtimeConnected(true);
        console.log("🟢 Connected to live SignalR hub!");
      };
      socket.onclose = () => {
        setIsRealtimeConnected(false);
        console.log("⚠️ SignalR disconnected. Safe fallback polling mode enabled.");
      };
      socket.onerror = () => {
        setIsRealtimeConnected(false);
      };
    } catch (e) {
      setIsRealtimeConnected(false);
    }
    
    return () => {
      if (socket) socket.close();
    };
  }, []);

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'reservation' | 'tracker' | 'ai'>(() => {
    return (sessionStorage.getItem('activeTab') as any) || 'home';
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  // Search & Filters
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Active QR Session (Flow 3.3 / 3.4)
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return sessionStorage.getItem('sessionToken');
  });
  const [tableSession, setTableSession] = useState<TableSession | null>(() => {
    const saved = sessionStorage.getItem('tableSession');
    return saved ? JSON.parse(saved) : null;
  });

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = sessionStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [dishNotes, setDishNotes] = useState("");
  const [dishQuantity, setDishQuantity] = useState(1);
  // Starbucks custom PDP states
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL'>('M');
  const [selectedTemperature, setSelectedTemperature] = useState<'Nóng' | 'Đá'>('Đá');
  const [selectedSweetness, setSelectedSweetness] = useState<string>('70%');
  const [extraToppings, setExtraToppings] = useState<{ [key: string]: number }>({
    'Trân Châu Hoàng Kim': 0,
    'Kem Cheese Sữa': 0,
    'Thạch Cà Phê': 0
  });

  // App Core Simulated Database States
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [placedOrders, setPlacedOrders] = useState<Order[]>([]);
  const [latestReservation, setLatestReservation] = useState<Reservation | null>(null);

  // Reservation Form State
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [guestCount, setGuestCount] = useState(4);
  const [reservationTime, setReservationTime] = useState("");
  const [reservationNote, setReservationNote] = useState("");
  const [isSubmittingReservation, setIsSubmittingReservation] = useState(false);

  // Order Submission Status
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // AI Assistant Chat State (Flow 3.5)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-ai",
      sender: "assistant",
      text: "Xin chào quý khách! Tôi là Trợ Lý Ẩm Thực AI của TV FOOD. Tôi có thể tư vấn món ăn ngon theo sở thích, thiết lập combo tiệc hợp túi tiền hoặc giải đáp thắc mắc về chính sách của nhà hàng. Quý khách muốn hỏi gì hôm nay ạ?",
    }
  ]);
  const [aiInputValue, setAiInputValue] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Custom UI alert systems for proto actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Synchronization to sessionStorage to survive page reloads
  useEffect(() => {
    sessionStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    sessionStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const toggleWishlist = (dishId: string) => {
    setWishlist(prev => {
      const isFav = prev.includes(dishId);
      const updated = isFav ? prev.filter(id => id !== dishId) : [...prev, dishId];
      const dishName = MOCK_MENU.find(d => d.id === dishId)?.name || "món ăn";
      triggerToast(isFav ? `💔 Đã xóa ${dishName} khỏi danh sách yêu thích.` : `❤️ Đã thêm ${dishName} vào danh sách yêu thích!`);
      return updated;
    });
  };

  // -------------------------------------------------------------
  // EFFECT - PARSE URL SEARCH PARAMS ON LOAD (GET /qr-order/{token})
  // -------------------------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('sessionToken');
    if (token) {
      handleLoadTableSession(token);
    }
    // Diagnostic log utilizing reservations to prevent TS unused warning
    console.log(`Hệ thống Antigravity sẵn sàng. Đã tải ${reservations.length} đặt bàn cục bộ.`);
  }, [reservations]);

  // -------------------------------------------------------------
  // SIMULATION: SIGNALR REALTIME UPDATES SIMULATOR (Flow 3.4)
  // -------------------------------------------------------------
  useEffect(() => {
    if (placedOrders.length === 0) return;

    const interval = setInterval(() => {
      setPlacedOrders(prevOrders => {
        let updated = false;
        const newOrders = prevOrders.map(order => {
          if (order.status === 'Served') return order;

          let nextStatus: 'Pending' | 'Preparing' | 'Ready' | 'Served' = order.status;
          let nextItems = [...order.items];

          if (order.status === 'Pending') {
            nextStatus = 'Preparing';
            nextItems = order.items.map(it => ({ ...it, status: 'Preparing' }));
            updated = true;
          } else if (order.status === 'Preparing') {
            nextStatus = 'Ready';
            nextItems = order.items.map(it => ({ ...it, status: 'Ready' }));
            updated = true;
          } else if (order.status === 'Ready') {
            nextStatus = 'Served';
            nextItems = order.items.map(it => ({ ...it, status: 'Served' }));
            updated = true;
            triggerToast(`Món ngon của bạn đã sẵn sàng! Nhân viên đang phục vụ lên Bàn ${order.tableNumber}.`);
          }

          return {
            ...order,
            status: nextStatus,
            items: nextItems
          };
        });

        if (updated) {
          return newOrders;
        }
        return prevOrders;
      });
    }, 12000);

    return () => clearInterval(interval);
  }, [placedOrders]);

  // -------------------------------------------------------------
  // ACTIONS: LOADING TABLE SESSION
  // -------------------------------------------------------------
  const handleLoadTableSession = (token: string) => {
    sessionStorage.setItem('sessionToken', token);
    const mockSession: TableSession = {
      id: "sess_" + Math.random().toString(36).substr(2, 9),
      tableId: "tbl-a01",
      tableNumber: "A01",
      status: "Active",
      openedAt: new Date().toISOString()
    };
    sessionStorage.setItem('tableSession', JSON.stringify(mockSession));
    
    setSessionToken(token);
    setTableSession(mockSession);
    setActiveTab('menu');
    triggerToast("📍 Đã kích hoạt session gọi món tại Bàn A01!");

    const cleanUrl = window.location.pathname + `?sessionToken=${token}`;
    window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
  };

  const handleSimulateQRScan = () => {
    const randomToken = "secure-qr-session-token-" + Math.floor(1000 + Math.random() * 9000);
    handleLoadTableSession(randomToken);
  };

  const handleClearSession = () => {
    sessionStorage.removeItem('sessionToken');
    sessionStorage.removeItem('tableSession');
    setSessionToken(null);
    setTableSession(null);
    setCart([]);
    window.history.replaceState({}, '', window.location.pathname);
    triggerToast("Đã đóng phiên gọi món tại bàn.");
  };

  // -------------------------------------------------------------
  // ACTIONS: CART OPERATIONS
  // -------------------------------------------------------------
  const handleOpenDishModal = (dish: MenuItem) => {
    if (!dish.isAvailable) return;
    setSelectedDish(dish);
    setDishQuantity(1);
    setDishNotes("");
    setSelectedSize('M');
    setSelectedTemperature('Đá');
    setSelectedSweetness('70%');
    setExtraToppings({
      'Trân Châu Hoàng Kim': 0,
      'Kem Cheese Sữa': 0,
      'Thạch Cà Phê': 0
    });
  };

  const handleAddToCart = () => {
    if (!selectedDish) return;

    // Calculate final unit price including size and toppings
    let unitPrice = selectedDish.price;
    if (selectedSize === 'S') unitPrice -= 5000;
    if (selectedSize === 'L') unitPrice += 10000;
    if (selectedSize === 'XL') unitPrice += 15000;

    let toppingCost = 0;
    Object.entries(extraToppings).forEach(([name, qty]) => {
      if (name.includes('Cheese')) toppingCost += qty * 10000;
      else toppingCost += qty * 5000;
    });
    const finalPrice = unitPrice + toppingCost;

    // Format full note
    const customList: string[] = [];
    if (selectedSize) {
      const sizeLabel = selectedSize === 'S' ? 'Nhỏ (S)' : selectedSize === 'M' ? 'Vừa (M)' : selectedSize === 'L' ? 'Lớn (L)' : 'Khổng lồ (XL)';
      customList.push(`Size: ${sizeLabel}`);
    }
    // Only show temperature/sweetness for drink categories or when customisable
    const isDrink = selectedDish.categoryId === 'cat-drink' || selectedDish.tags.includes('thức uống') || selectedDish.tags.includes('nước uống') || selectedDish.categoryName.includes('Uống');
    if (isDrink) {
      customList.push(`Nhiệt độ: ${selectedTemperature}`);
      customList.push(`Độ ngọt: ${selectedSweetness}`);
    }

    Object.entries(extraToppings).forEach(([name, qty]) => {
      if (qty > 0) customList.push(`Thêm ${name} (x${qty})`);
    });

    if (dishNotes.trim()) {
      customList.push(`Ghi chú: ${dishNotes}`);
    }

    const combinedNote = customList.join(' | ');

    setCart(prevCart => {
      const existing = prevCart.find(item => item.menuItemId === selectedDish.id && item.note === combinedNote);
      if (existing) {
        return prevCart.map(item =>
          (item.menuItemId === selectedDish.id && item.note === combinedNote)
            ? { ...item, quantity: item.quantity + dishQuantity }
            : item
        );
      } else {
        return [...prevCart, {
          menuItemId: selectedDish.id,
          name: selectedDish.name,
          price: finalPrice,
          quantity: dishQuantity,
          note: combinedNote,
          emoji: selectedDish.emoji
        }];
      }
    });

    triggerToast(`Đã thêm ${dishQuantity} suất ${selectedDish.name} vào giỏ!`);
    setSelectedDish(null);
  };

  const handleUpdateCartQty = (menuItemId: string, note: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.menuItemId === menuItemId && item.note === note) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter((item): item is CartItem => item !== null);
    });
  };

  const handleRemoveFromCart = (menuItemId: string, note: string) => {
    setCart(prevCart => prevCart.filter(item => !(item.menuItemId === menuItemId && item.note === note)));
    triggerToast("Đã xóa món ăn khỏi giỏ hàng.");
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  // -------------------------------------------------------------
  // ACTIONS: ORDER SUBMISSION (POST /api/v1/orders)
  // -------------------------------------------------------------
  const handleSubmitOrder = () => {
    if (cart.length === 0) return;
    setIsSubmittingOrder(true);

    setTimeout(() => {
      const orderCode = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const newItems: OrderItem[] = cart.map((item, idx) => ({
        id: `ord-it-${idx}-${Date.now()}`,
        menuItemName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        status: 'Pending',
        note: item.note
      }));

      const newOrder: Order = {
        orderId: `order_${Math.random().toString(36).substr(2, 9)}`,
        orderCode: orderCode,
        tableNumber: tableSession?.tableNumber || "A02", // Default to A02 if not scanned
        status: 'Pending',
        items: newItems,
        placedAt: new Date()
      };

      // Realtime bridge: Save order to shared cookie for admin-web's Kitchen Kanban display
      const existingCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('tv_food_shared_orders='));
      let sharedOrders = [];
      if (existingCookie) {
        try {
          sharedOrders = JSON.parse(decodeURIComponent(existingCookie.split('=')[1]));
        } catch (e) {
          sharedOrders = [];
        }
      }
      sharedOrders.push(newOrder);
      document.cookie = `tv_food_shared_orders=${encodeURIComponent(JSON.stringify(sharedOrders))}; path=/; max-age=86400`;

      setPlacedOrders(prev => [newOrder, ...prev]);
      setCart([]);
      setIsCartOpen(false);
      setIsSubmittingOrder(false);
      setActiveTab('tracker');
      triggerToast("🚀 Gửi order thành công! Đang chờ bếp phản hồi...");
    }, 1500);
  };

  // -------------------------------------------------------------
  // ACTIONS: RESERVATION SYSTEM (POST /api/v1/reservations)
  // -------------------------------------------------------------
  const handleSubmitReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !reservationTime) return;
    setIsSubmittingReservation(true);

    setTimeout(() => {
      const rCode = `RSV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
      const newRes: Reservation = {
        id: `res_${Math.random().toString(36).substr(2, 9)}`,
        reservationCode: rCode,
        customerName,
        phone,
        guestCount,
        reservationTime,
        note: reservationNote,
        status: 'Pending'
      };

      setReservations(prev => [newRes, ...prev]);
      setLatestReservation(newRes);
      setIsSubmittingReservation(false);

      setCustomerName("");
      setPhone("");
      setReservationTime("");
      setReservationNote("");
      triggerToast("📅 Đặt bàn thành công! Đã tạo phiếu xác nhận.");
    }, 1200);
  };

  // -------------------------------------------------------------
  // AI CUSTOMER RAG CHAT ASSISTANT (POST /api/v1/ai/menu-chat)
  // -------------------------------------------------------------
  const handleSendAiMessage = (forcedQuery?: string) => {
    const query = forcedQuery || aiInputValue;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!forcedQuery) setAiInputValue("");
    setIsAiTyping(true);

    setTimeout(() => {
      let aiResponseText = "";
      let sources: string[] = ["menu.md"];
      let suggestedAction: ChatMessage["suggestedAction"] = undefined;

      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes("4 người") || lowerQuery.includes("600k") || lowerQuery.includes("combo")) {
        aiResponseText = "Dựa trên thực đơn và yêu cầu về ngân sách khoảng 600.000đ dành cho nhóm 4 người, tôi đã phối hợp một **Combo Đặc Sản Ấm Cúng** hoàn hảo giúp quý khách thưởng thức trọn vẹn tinh hoa ẩm thực của Antigravity Bistro:\n\n" +
          "1. 🍲 **Lẩu Thái Hải Sản Tinh Hoa** (299k) - Nồi lẩu chua cay đậm đà, tươi rói mực tôm cho cả bàn xôm tụ.\n" +
          "2. 🍗 **Cánh Gà Chiên Nước Mắm** (99k) - Món nhắm đậm đà tỏi phi kích thích vị giác cực đỉnh.\n" +
          "3. 🌯 **Gỏi Cuốn Tôm Thịt Thanh Nhã** (69k) - Khai vị thanh mát tốt cho sức khỏe.\n" +
          "4. 🍹 **Trà Đào Sả Hồng Trứ Danh** x3 ly (135k) - Thức uống best-seller sảng khoái thơm mát.\n\n" +
          "👉 **Tổng cộng chỉ 602.000đ** cho bữa tiệc 4 người no nê hợp lý! Quý khách có thể nhấp vào nút dưới đây để thêm ngay trọn bộ combo ẩm thực này vào giỏ hàng.";
        sources = ["menu.md", "ingredient_notes.md", "faq.md"];
        suggestedAction = {
          label: "Thêm Combo 4 Người Đề Xuất (602k) Vào Giỏ Hàng",
          items: [
            { id: "dish-001", quantity: 1, note: "Ít cay cho cả bàn dễ ăn" },
            { id: "dish-003", quantity: 1, note: "Chiên giòn" },
            { id: "dish-002", quantity: 1, note: "Sốt đậm đà" },
            { id: "dish-007", quantity: 3, note: "Có hạt chia" }
          ]
        };
      } else if (lowerQuery.includes("cay") || lowerQuery.includes("không cay") || lowerQuery.includes("trẻ em")) {
        aiResponseText = "Rất vui được hỗ trợ quý khách! Nhóm các món **không cay, thanh nhẹ, cực kỳ an toàn và ngon miệng cho trẻ em lẫn người không ăn cay** bao gồm:\n\n" +
          "1. 🥩 **Bò Lúc Lắc Khoai Tây Giòn** (189.000đ) - Thịt thăn bò mềm ngậy, đậm đà nhưng hoàn toàn không cay, xào hành tây mọng nước.\n" +
          "2. 🍛 **Cơm Chiên Hải Sản Hạt Sen** (119.000đ) - Hạt cơm mềm chiên giòn mặt, kèm hạt sen thơm bùi bổ dưỡng rất hợp khẩu vị trẻ em.\n" +
          "3. 🌯 **Gỏi Cuốn Tôm Thịt** (69.000đ) - Món mát mộc mạc, ngọt tôm cuốn chắc tay.\n" +
          "4. 🥑 **Kem Bơ Sầu Riêng Đắk Lắk** (59.000đ) - Tráng miệng bổ dưỡng ngọt ngào mà các bé vô cùng thích.\n\n" +
          "Quý khách có thể lựa chọn thêm các món này vào đơn hàng để thưởng thức!";
        sources = ["menu.md", "ingredient_notes.md"];
      } else if (lowerQuery.includes("chay") || lowerQuery.includes("vegetarian")) {
        aiResponseText = "Dạ, đối với chế độ ăn chay (Vegetarian), Antigravity Bistro rất sẵn lòng tùy biến để chiều lòng thực khách:\n\n" +
          "1. 🌯 **Gỏi Cuốn Chay Tùy Biến** (69.000đ) - Quý khách gọi món này có thể ghi chú **'Làm chay'**, đầu bếp sẽ thay thế tôm thịt bằng đậu hũ khìa nước dừa tươi cùng nấm đùi gà áp chảo và dùng tương ngọt chay.\n" +
          "2. 🥑 **Kem Bơ Sầu Riêng** & 🍹 **Nước ép cam/Trà đào** - Hoàn toàn thuần chay tự nhiên, cung cấp năng lượng mát mẻ.\n\n" +
          "Quý khách vui lòng lưu ý thêm ghi chú **'Ăn Chay'** lúc đặt món để bộ phận bếp chuẩn bị riêng dụng cụ sạch sẽ chuẩn chay nhé ạ!";
        sources = ["menu.md", "restaurant_policy.md"];
      } else {
        aiResponseText = "Tôi đã ghi nhận câu hỏi của quý khách. Tại Antigravity Bistro, chúng tôi cam kết mang lại nguồn nguyên liệu tươi sạch 100% trong ngày, chế biến thủ công không bột ngọt hóa chất. Lẩu Thái Hải Sản (299k) và Bò Lúc Lắc Mỹ (189k) là hai món ăn bán chạy nhất tuần này. Quý khách có muốn tôi tư vấn thêm về khẩu phần hoặc lượng calo của các món này không ạ?";
        sources = ["menu.md", "faq.md"];
      }

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: "assistant",
        text: aiResponseText,
        sources,
        suggestedAction
      };

      setChatMessages(prev => [...prev, assistantMsg]);
      setIsAiTyping(false);
    }, 1000);
  };

  const handleApplySuggestedItems = (action: ChatMessage["suggestedAction"]) => {
    if (!action) return;

    setCart(prevCart => {
      let updatedCart = [...prevCart];

      action.items.forEach(suggested => {
        const dish = MOCK_MENU.find(d => d.id === suggested.id);
        if (dish) {
          const existing = updatedCart.find(item => item.menuItemId === dish.id && item.note === suggested.note);
          if (existing) {
            updatedCart = updatedCart.map(item =>
              (item.menuItemId === dish.id && item.note === suggested.note)
                ? { ...item, quantity: item.quantity + suggested.quantity }
                : item
            );
          } else {
            updatedCart.push({
              menuItemId: dish.id,
              name: dish.name,
              price: dish.price,
              quantity: suggested.quantity,
              note: suggested.note,
              emoji: dish.emoji
            });
          }
        }
      });

      return updatedCart;
    });

    setIsCartOpen(true);
    triggerToast("Đã nhập combo khuyến nghị của AI vào giỏ hàng!");
  };

  // -------------------------------------------------------------
  // PROMO CARD CLICKS -> ACTIVE FILTERS
  // -------------------------------------------------------------
  const handlePromoClick = (type: 'cay' | 'khai-vi' | 'ban-chay') => {
    if (type === 'cay') {
      setSearchKeyword("cay");
      setSelectedCategory("all");
    } else if (type === 'khai-vi') {
      setSearchKeyword("");
      setSelectedCategory("cat-appetizer");
    } else if (type === 'ban-chay') {
      setSearchKeyword("bán chạy");
      setSelectedCategory("all");
    }
    setActiveTab('menu');
    triggerToast(`Đã lọc danh sách món theo bộ sưu tập!`);
  };

  // -------------------------------------------------------------
  // SEARCH & FILTER COMPILATION
  // -------------------------------------------------------------
  const filteredMenu = MOCK_MENU.filter(dish => {
    const matchesKeyword = dish.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      dish.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || dish.categoryId === selectedCategory;
    return matchesKeyword && matchesCategory;
  });

  return (
    <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* -------------------------------------------------------------
          TOAST ALERT BANNER (High-fidelity overlay)
          ------------------------------------------------------------- */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: 'var(--primary)',
          color: 'var(--bg-deep)',
          padding: '14px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(var(--primary-rgb), 0.3)',
          fontWeight: 700,
          zIndex: 99999,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.3s forwards'
        }}>
          <span>🔔</span> {toastMessage}
        </div>
      )}

      {/* -------------------------------------------------------------
          LEFT SIDEBAR (DESKTOP LAYOUT - screens >= 1024px)
          ------------------------------------------------------------- */}
      <aside className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Collapse toggle button on the right edge of sidebar */}
        <button
          type="button"
          className="sidebar-collapse-toggle"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? '›' : '‹'}
        </button>
        <div className="sidebar-scroll-wrapper">
          <div>
            {/* Logo Header */}
            <div className="sidebar-logo">
              <img src="/logo.png" alt="TV FOOD" className="logo-icon" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h1 className="logo-text grad-text" style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.5px', margin: 0 }}>TV FOOD</h1>
              </div>
            </div>

            {/* Menu Links */}
            <nav className="sidebar-menu">
              <button className={`sidebar-menu-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')} id="side-nav-home">
                <Home size={18} /> <span>Trang Chủ</span>
              </button>
              <button className={`sidebar-menu-btn ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => { setActiveTab('menu'); setSearchKeyword(""); setSelectedCategory("all"); }} id="side-nav-menu">
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

              {/* Simulated Extended Links from Mockup */}
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '12px 0' }}></div>
              <button className="sidebar-menu-btn" onClick={() => handlePromoClick('ban-chay')}>
                <Heart size={18} /> <span>Yêu Thích</span>
              </button>
              <button className="sidebar-menu-btn" onClick={() => triggerToast("Tính năng Đánh Giá đang phát triển!")}>
                <Star size={18} /> <span>Đánh Giá</span>
              </button>
              <button className="sidebar-menu-btn" onClick={() => triggerToast("Mã giảm giá hôm nay: ANTIGRAVITY50 - Giảm 50k!")}>
                <Tag size={18} /> <span>Khuyến Mãi</span>
              </button>
              <button className="sidebar-menu-btn" onClick={() => triggerToast("Antigravity Bistro vừa lọt Top 10 nhà hàng Bistro công nghệ tốt nhất 2026!")}>
                <Newspaper size={18} /> <span>Tin Tức</span>
              </button>
            </nav>
          </div>

          {/* Footer info containing user and switch */}
          <div className="sidebar-footer">
            {/* User profile */}
            <div className="sidebar-profile" onClick={() => triggerToast("Khách hàng Hoàng Minh - Hạng Vàng")}>
              <div className="sidebar-avatar">👨‍🚀</div>
              <div className="sidebar-profile-info">
                <div className="sidebar-profile-name">Hoàng Minh</div>
                <div className="sidebar-profile-points">120 điểm</div>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>➔</div>
            </div>

            {/* Theme switcher toggle switch */}
            <div className="sidebar-theme-row">
              <span className="sidebar-theme-label">Chế độ tối</span>
              <label className="theme-switch">
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                />
                <span className="slider-switch"></span>
              </label>
            </div>
          </div>
        </div>
      </aside>

      {/* -------------------------------------------------------------
          MAIN SCROLLABLE CONTENT CONTAINER
          ------------------------------------------------------------- */}
      <div className="app-main-content">

        {/* DESKTOP HEADER (Screens >= 1024px) */}
        <header className="desktop-header">
          {/* Search bar input with shortcut */}
          <div className="header-search-container">
            <Search size={18} className="header-search-icon" />
            <input
              type="text"
              placeholder="Tìm món ăn, hương vị, nguyên liệu..."
              className="header-search-input"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onClick={() => setActiveTab('menu')}
            />
            <span className="header-shortcut">⌘ K</span>
          </div>

          {/* Notification bell, wishlist, and QR button */}
          <div className="header-right-actions">
            <button className="header-icon-btn" onClick={() => triggerToast("Bạn có 2 thông báo mới về đơn hàng!")}>
              <Bell size={18} />
              <span className="badge-count">2</span>
            </button>
            <button className="header-icon-btn" onClick={() => handlePromoClick('ban-chay')}>
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

        {/* MOBILE TOP BAR (Screens < 1024px) */}
        <div className="mobile-top-bar">
          <div className="sidebar-logo" style={{ marginBottom: 0 }}>
            <img src="/logo.png" alt="TV FOOD" className="logo-icon" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <h1 className="logo-text grad-text" style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>TV FOOD</h1>
            </div>
          </div>

          <button
            type="button"
            className="theme-toggle-btn"
            style={{ width: '34px', height: '34px' }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* MOBILE QR SCAN STRIP (Mockup topmost element) */}
        {!sessionToken && (
          <div className="mobile-qr-strip glass-panel" style={{ display: window.innerWidth < 1024 ? 'flex' : 'none', marginBottom: '16px', border: '1px solid rgba(var(--primary-rgb), 0.2)' }} onClick={handleSimulateQRScan}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--primary)' }}><ScanLine size={16} /></span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Quét QR để nhận menu trực tiếp tại bàn</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>➔</span>
          </div>
        )}

        {/* QR Session simulation panel strip (for demo feedback) */}
        {sessionToken && (
          <div className="simulation-panel" style={{ marginBottom: '24px' }}>
            <div className="simulation-info">
              <div className="simulation-icon">📱</div>
              <div>
                <div className="simulation-title">Đang quét bàn {tableSession?.tableNumber}</div>
                <div className="simulation-desc">Session token: {sessionToken.substring(0, 20)}...</div>
              </div>
            </div>
            <button className="simulation-btn" onClick={handleClearSession}>Hủy Bàn</button>
          </div>
        )}

        {/* MAIN DISPLAY AREA */}
        <main className="main-content" style={{ padding: 0 }}>

          {/* TAB 1: HOME VIEW */}
          {activeTab === 'home' && (
            <div className="animate-fade-in">
              {/* Redesigned Hero Banner matching mockup exactly */}
              <div className="hero">
                <div className="hero-content">
                  <span className="hero-subtitle">THỰC ĐƠN TRỰC TUYẾN</span>
                  <h1 className="hero-title" style={{ fontSize: '42px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'none', lineHeight: 1.12 }}>
                    Thưởng Thức <br />Hương Vị <span className="highlight-underline">Độc Đáo</span>
                  </h1>
                  <p className="hero-desc" style={{ marginTop: '12px', fontSize: '16px', color: '#4b5563' }}>Khám phá danh sách các món ăn tinh tế của Tày food 36.</p>

                  {/* Category Tabs inside Hero section as per mockup */}
                  <div className="category-tabs">
                    <button
                      className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
                      onClick={() => { setSelectedCategory('all'); setActiveTab('menu'); }}
                    >
                      <Grid size={18} /> Tất Cả Món
                    </button>
                    <button
                      className={`category-tab ${selectedCategory === 'cat-appetizer' ? 'active' : ''}`}
                      onClick={() => { setSelectedCategory('cat-appetizer'); setActiveTab('menu'); }}
                    >
                      <Leaf size={18} /> Khai Vị
                    </button>
                    <button
                      className={`category-tab ${selectedCategory === 'cat-main' ? 'active' : ''}`}
                      onClick={() => { setSelectedCategory('cat-main'); setActiveTab('menu'); }}
                    >
                      <Soup size={18} /> Món Chính
                    </button>
                    <button
                      className={`category-tab ${selectedCategory === 'cat-hotpot' ? 'active' : ''}`}
                      onClick={() => { setSelectedCategory('cat-hotpot'); setActiveTab('menu'); }}
                    >
                      <Flame size={18} /> Món Lẩu
                    </button>
                    <button
                      className={`category-tab ${selectedCategory === 'cat-drink' ? 'active' : ''}`}
                      onClick={() => { setSelectedCategory('cat-drink'); setActiveTab('menu'); }}
                    >
                      <CupSoda size={18} /> Đồ Uống
                    </button>
                    <button
                      className={`category-tab ${selectedCategory === 'cat-dessert' ? 'active' : ''}`}
                      onClick={() => { setSelectedCategory('cat-dessert'); setActiveTab('menu'); }}
                    >
                      <Cookie size={18} /> Tráng Miệng
                    </button>
                  </div>
                </div>
                <div className="hero-image-wrap">
                  <img
                    src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80"
                    alt="Antigravity Seafood Noodle"
                    className="hero-image"
                  />
                  {/* Floating leaves for natural organic mockup look */}
                  <span className="floating-leaf leaf-1">🍃</span>
                  <span className="floating-leaf leaf-2">🌿</span>
                  <span className="floating-leaf leaf-3">🍃</span>
                </div>
              </div>

              {/* THREE PROMO FEATURE CARDS (Redesigned matching mockup exactly) */}
              <div className="promo-grid">
                {/* Card 1 */}
                <div className="promo-card promo-cay" onClick={() => { setSelectedCategory('cat-hotpot'); setActiveTab('menu'); }}>
                  <div className="promo-content">
                    <h3 className="feature-promo-title" style={{ fontSize: '22px', fontWeight: 800, color: '#ff4d1c', marginBottom: '6px' }}>Món Cay 🌶️</h3>
                    <p className="feature-promo-desc" style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.5, marginBottom: '16px' }}>Hương vị đậm đà, kích thích vị giác</p>
                    <button className="feature-promo-btn">Khám phá →</button>
                  </div>
                  <div className="promo-image-wrap">
                    <img src="https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80" alt="Món Cay" className="promo-image" />
                  </div>
                </div>

                {/* Card 2 */}
                <div className="promo-card promo-khai-vi" onClick={() => { setSelectedCategory('cat-appetizer'); setActiveTab('menu'); }}>
                  <div className="promo-content">
                    <h3 className="feature-promo-title" style={{ fontSize: '22px', fontWeight: 800, color: '#8b5cf6', marginBottom: '6px' }}>Khai Vị Tươi Ngon 🥬</h3>
                    <p className="feature-promo-desc" style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.5, marginBottom: '16px' }}>Món mở đầu hoàn hảo cho bữa ăn</p>
                    <button className="feature-promo-btn">Khám phá →</button>
                  </div>
                  <div className="promo-image-wrap">
                    <img src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80" alt="Khai Vị" className="promo-image" />
                  </div>
                </div>

                {/* Card 3 */}
                <div className="promo-card promo-yeu-thich" onClick={() => { setSelectedCategory('cat-drink'); setActiveTab('menu'); }}>
                  <div className="promo-content">
                    <h3 className="feature-promo-title" style={{ fontSize: '22px', fontWeight: 800, color: '#10b981', marginBottom: '6px' }}>Món Được Yêu Thích ❤️</h3>
                    <p className="feature-promo-desc" style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.5, marginBottom: '16px' }}>Những món ăn được thực khách bình chọn nhiều nhất</p>
                    <button className="feature-promo-btn">Xem ngay →</button>
                  </div>
                  <div className="promo-image-wrap">
                    <img src="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80" alt="Được Yêu Thích" className="promo-image" />
                  </div>
                </div>
              </div>

              {/* MÓN NỔI BẬT LISTING (Grid of highlighted items) */}
              <div style={{ textAlign: 'left', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Món Nổi Bật <span style={{ color: 'var(--primary)' }}>🔥</span>
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '2px' }}>Những món ăn được yêu thích nhất tại TV FOOD.</p>
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '20px' }}
                  onClick={() => { setActiveTab('menu'); setSearchKeyword(""); setSelectedCategory("all"); }}
                >
                  Xem tất cả ➔
                </button>
              </div>

              <div className="dishes-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                {[
                  MOCK_MENU.find(d => d.id === "dish-001"),
                  MOCK_MENU.find(d => d.id === "dish-002"),
                  MOCK_MENU.find(d => d.id === "dish-003"),
                  MOCK_MENU.find(d => d.id === "dish-007"),
                  MOCK_MENU.find(d => d.id === "dish-009")
                ].filter((d): d is MenuItem => !!d).map(dish => (
                  <div
                    key={dish.id}
                    className="glass-panel dish-card"
                    onClick={() => handleOpenDishModal(dish)}
                    style={{ display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer', overflow: 'hidden' }}
                  >
                    <div className="dish-image-wrapper" style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                      {dish.imageUrl ? (
                        <img src={dish.imageUrl} alt={dish.name} className="dish-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className="dish-image-placeholder" style={{ fontSize: '4.5rem' }}>{dish.emoji}</div>
                      )}
                    </div>
                    <div className="dish-details" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                          <span className="dish-category" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{dish.categoryName}</span>
                          <span className={`badge ${getBadgeClass(dish.tags[0])}`} style={{ textTransform: 'capitalize', fontWeight: 700, fontSize: '0.68rem', padding: '3px 8px', borderRadius: '6px' }}>
                            {dish.tags[0]}
                          </span>
                        </div>
                        <h3 className="dish-title" style={{ fontSize: '1.05rem', margin: '4px 0', fontWeight: 750, color: 'var(--text-primary)' }}>{dish.name}</h3>
                        <p className="dish-desc" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineClamp: 2, WebkitLineClamp: 2 }}>{dish.description}</p>
                      </div>
                      <div className="dish-footer" style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="dish-price" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{dish.price.toLocaleString('vi-VN')} đ</span>
                        <button
                          type="button"
                          className={`wishlist-toggle-btn ${wishlist.includes(dish.id) ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(dish.id); }}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)' }}
                        >
                          <Heart size={16} fill={wishlist.includes(dish.id) ? 'var(--danger)' : 'transparent'} color={wishlist.includes(dish.id) ? 'var(--danger)' : 'var(--text-muted)'} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MENU & QR ORDER VIEW */}
          {activeTab === 'menu' && (
            <div className="animate-fade-in menu-container">
              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                  <Utensils size={14} /> Thực Đơn Trực Tuyến
                </div>
                <h2 style={{ fontSize: '2.2rem', marginBottom: '4px' }}>Thưởng Thức Hương Vị Độc Đáo</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {sessionToken
                    ? `Quý khách đang ở BÀN ${tableSession?.tableNumber}. Thêm món vào giỏ và đặt hàng ngay!`
                    : "Khám phá danh sách các món ăn tinh tế của TV FOOD."
                  }
                </p>
              </div>

              {/* Mobile Only search bar (Screens < 1024px) */}
              <div className="menu-search-bar" style={{ display: window.innerWidth < 1024 ? 'block' : 'none' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                  <input
                    type="text"
                    placeholder="Tìm tên món ăn, hương vị, nguyên liệu..."
                    className="form-control"
                    style={{ paddingLeft: '48px' }}
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    id="menu-search"
                  />
                </div>
              </div>

              {/* Category tabs */}
              <div className="category-tabs-container">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    id={`cat-btn-${cat.id}`}
                  >
                    <span style={{ marginRight: '6px' }}>{cat.emoji}</span> {cat.name}
                  </button>
                ))}
              </div>

              {/* Dishes grid */}
              {filteredMenu.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🍽️</div>
                  <h3>Không tìm thấy món ăn nào phù hợp</h3>
                  <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>Quý khách vui lòng thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.</p>
                  <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={() => { setSearchKeyword(""); setSelectedCategory("all"); }}>
                    Xóa Bộ Lọc
                  </button>
                </div>
              ) : (
                <div className="dishes-grid">
                  {filteredMenu.map(dish => (
                    <div
                      key={dish.id}
                      className={`glass-panel dish-card ${!dish.isAvailable ? 'out-of-stock' : ''}`}
                      onClick={() => handleOpenDishModal(dish)}
                      id={`dish-card-${dish.id}`}
                      style={{ display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer', overflow: 'hidden' }}
                    >
                      <div className="dish-image-wrapper" style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                        {dish.imageUrl ? (
                          <img src={dish.imageUrl} alt={dish.name} className="dish-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div className="dish-image-placeholder">{dish.emoji}</div>
                        )}
                      </div>
                      <div className="dish-details" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                            <span className="dish-category" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{dish.categoryName}</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {dish.tags.map((tag, idx) => (
                                <span key={idx} className={`badge ${getBadgeClass(tag)}`} style={{ textTransform: 'capitalize', fontWeight: 700, fontSize: '0.68rem', padding: '3px 8px', borderRadius: '6px' }}>{tag}</span>
                              ))}
                              {!dish.isAvailable && (
                                <span className="badge badge-danger" style={{ fontWeight: 700, fontSize: '0.68rem', padding: '3px 8px', borderRadius: '6px' }}>Hết Món</span>
                              )}
                            </div>
                          </div>
                          <h3 className="dish-title" style={{ fontSize: '1.05rem', margin: '4px 0', fontWeight: 750, color: 'var(--text-primary)' }}>{dish.name}</h3>
                          <p className="dish-desc" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineClamp: 2, WebkitLineClamp: 2 }}>{dish.description}</p>
                        </div>
                        <div className="dish-footer" style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="dish-price" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{dish.price.toLocaleString('vi-VN')} ₫</span>
                          <button
                            type="button"
                            className={`wishlist-toggle-btn ${wishlist.includes(dish.id) ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(dish.id); }}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)' }}
                          >
                            <Heart size={16} fill={wishlist.includes(dish.id) ? 'var(--danger)' : 'transparent'} color={wishlist.includes(dish.id) ? 'var(--danger)' : 'var(--text-muted)'} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RESERVATION VIEW */}
          {activeTab === 'reservation' && (
            <div className="animate-fade-in reservation-container">
              <div className="reservation-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                  <Calendar size={14} /> Dịch Vụ Khách Hàng
                </div>
                <h2 className="reservation-title">Đặt Bàn Trực Tuyến</h2>
                <p className="reservation-subtitle">Đặt bàn trước để giữ chỗ đẹp nhất và nhận phục vụ chu đáo nhất.</p>
              </div>

              {latestReservation ? (
                <div className="glass-panel booking-receipt animate-fade-in">
                  <div className="receipt-header">
                    <div className="receipt-success-icon">
                      <CheckCircle size={44} style={{ display: 'inline' }} />
                    </div>
                    <h3 className="receipt-title">Đặt Bàn Thành Công</h3>
                    <div className="receipt-code-label">Mã Số Đặt Bàn</div>
                    <div className="receipt-code">{latestReservation.reservationCode}</div>
                  </div>

                  <div className="receipt-details-list">
                    <div className="receipt-row">
                      <span className="receipt-label">Quý Khách:</span>
                      <span className="receipt-value">{latestReservation.customerName}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-label">Số Điện Thoại:</span>
                      <span className="receipt-value">{latestReservation.phone}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-label">Số Khách Đi:</span>
                      <span className="receipt-value">{latestReservation.guestCount} Khách</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-label">Thời Gian Đặt:</span>
                      <span className="receipt-value">{new Date(latestReservation.reservationTime).toLocaleString('vi-VN')}</span>
                    </div>
                    {latestReservation.note && (
                      <div className="receipt-row">
                        <span className="receipt-label">Ghi Chú:</span>
                        <span className="receipt-value">{latestReservation.note}</span>
                      </div>
                    )}
                    <div className="receipt-row">
                      <span className="receipt-label">Trạng Thái:</span>
                      <span className="receipt-value">
                        <span className="badge badge-warning">Chờ Check-in</span>
                      </span>
                    </div>
                  </div>

                  <div className="receipt-qr-area">
                    <div className="receipt-qr-box">
                      <div className="receipt-qr-mock">📱</div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                      Quét hoặc Đưa mã QR check-in này cho nhân viên lễ tân khi đến nhà hàng.
                    </p>
                  </div>

                  <div className="receipt-instructions">
                    💡 <strong>Hướng dẫn đến nhà hàng:</strong> Quý khách vui lòng đến trước giờ hẹn 10-15 phút. Đặt bàn sẽ tự động lưu giữ tối đa 30 phút sau giờ đặt hẹn.
                  </div>

                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', marginTop: '24px' }}
                    onClick={() => setLatestReservation(null)}
                    id="btn-book-another"
                  >
                    Đặt Thêm Bàn Khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReservation} className="glass-panel" style={{ padding: '32px', textAlign: 'left' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="res-name">Họ và Tên Khách Hàng *</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        id="res-name"
                        className="form-control"
                        style={{ paddingLeft: '44px' }}
                        placeholder="Nguyễn Văn A"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-grid-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="res-phone">Số Điện Thoại Liên Hệ *</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type="tel"
                          id="res-phone"
                          className="form-control"
                          style={{ paddingLeft: '44px' }}
                          placeholder="0987654321"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="res-guests">Số Lượng Khách Đi *</label>
                      <div style={{ position: 'relative' }}>
                        <Users size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <select
                          id="res-guests"
                          className="form-control"
                          style={{ paddingLeft: '44px', appearance: 'none' }}
                          value={guestCount}
                          onChange={(e) => setGuestCount(Number(e.target.value))}
                        >
                          <option value="1">1 Người</option>
                          <option value="2">2 Người</option>
                          <option value="4">4 Người</option>
                          <option value="6">6 Người</option>
                          <option value="8">8 Người</option>
                          <option value="10">10+ Người (Phòng VIP)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="res-time">Thời Gian Nhận Bàn *</label>
                    <input
                      type="datetime-local"
                      id="res-time"
                      className="form-control"
                      required
                      value={reservationTime}
                      onChange={(e) => setReservationTime(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="res-note">Ghi Chú Đặc Biệt</label>
                    <textarea
                      id="res-note"
                      className="form-control"
                      placeholder="Ví dụ: Cần bàn sát cửa sổ, có trẻ em sơ sinh cần ghế trẻ em, hoặc tổ chức kỷ niệm ngày cưới..."
                      value={reservationNote}
                      onChange={(e) => setReservationNote(e.target.value)}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '10px' }}
                    disabled={isSubmittingReservation}
                    id="btn-submit-reservation"
                  >
                    {isSubmittingReservation ? (
                      <>
                        <RefreshCw className="animate-float" size={18} style={{ animation: 'spin 1.5s linear infinite' }} /> Đang Tạo Đặt Bàn...
                      </>
                    ) : (
                      <>Hoàn Tất Đặt Bàn</>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: SIGNALR LIVE ORDER STATUS TRACKER */}
          {activeTab === 'tracker' && (
            <div className="animate-fade-in tracker-container">
              <div className="tracker-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                  <Clock size={14} /> Theo Dõi Gọi Món Realtime
                </div>
                <h2 style={{ fontSize: '2.2rem', marginBottom: '4px' }}>Món Đang Đợi Bếp</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Màn hình cập nhật trạng thái tự động qua SignalR và fallback polling.</p>
              </div>

              {/* Realtime warning banner */}
              {isRealtimeConnected ? (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: '#10b981',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span className="live-indicator-dot" style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 10px #10b981'
                  }}></span>
                  <span>Đang kết nối thời gian thực với máy chủ Bếp (SignalR Live).</span>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  color: '#f59e0b',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  lineHeight: '1.4'
                }}>
                  <span className="live-indicator-dot" style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#f59e0b',
                    animation: 'pulse 1.5s infinite'
                  }}></span>
                  <span>Mất kết nối thời gian thực (SignalR). Hệ thống đã tự động chuyển sang chế độ Polling dự phòng (Đang hoạt động).</span>
                </div>
              )}

              {placedOrders.length === 0 ? (
                <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
                  <h3>Chưa có order nào được gửi đi</h3>
                  <p style={{ fontSize: '0.9rem', marginTop: '4px', maxWidth: '340px', marginInline: 'auto' }}>
                    Quý khách vui lòng quét mã QR tại bàn, chọn món ngon từ thực đơn để gửi đơn gọi món.
                  </p>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: '24px' }}
                    onClick={() => setActiveTab('menu')}
                  >
                    Xem Thực Đơn Gọi Món
                  </button>
                </div>
              ) : (
                placedOrders.map(order => {
                  const minutesElapsed = Math.floor((Date.now() - new Date(order.placedAt).getTime()) / 60000);
                  const remainingMinutes = Math.max(15 - minutesElapsed, 1);
                  return (
                    <div key={order.orderId} className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                        <div>
                          <div className="tracker-table-num">📍 Bàn {order.tableNumber}</div>
                          <div className="tracker-order-code">Mã Đơn: <strong>{order.orderCode}</strong> | {new Date(order.placedAt).toLocaleTimeString('vi-VN')}</div>
                          {order.status !== 'Served' ? (
                            <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Clock size={13} className="animate-float" />
                              <span>Thời gian chờ dự kiến: ~{remainingMinutes} phút nữa sẽ tới bàn</span>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 700, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <CheckCircle size={13} />
                              <span>Đã bưng phục vụ đầy đủ lên bàn. Chúc ngon miệng!</span>
                            </div>
                          )}
                        </div>
                        <div>
                          {order.status === 'Pending' && <span className="badge badge-warning">Chờ Bếp Nhận</span>}
                          {order.status === 'Preparing' && <span className="badge badge-primary pulsing-glow">Đang Chế Biến</span>}
                          {order.status === 'Ready' && <span className="badge badge-success pulsing-glow">Sẵn Sàng Phục Vụ</span>}
                          {order.status === 'Served' && <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>Đã Lên Bàn</span>}
                        </div>
                      </div>

                      <div className="tracker-status-box">
                        <div className={`tracker-status-step ${order.status === 'Pending' ? 'active' :
                            (order.status === 'Preparing' || order.status === 'Ready' || order.status === 'Served') ? 'completed' : ''
                          }`}>
                          <div className="tracker-step-icon-container">1</div>
                          <div>
                            <h4 className="tracker-step-title">Gửi Đơn & Chờ Nhận</h4>
                            <p className="tracker-step-desc">Hệ thống đã gửi đơn xuống bếp bằng Token chống trùng (Idempotency).</p>
                          </div>
                        </div>

                        <div className={`tracker-status-step ${order.status === 'Preparing' ? 'active' :
                            (order.status === 'Ready' || order.status === 'Served') ? 'completed' : ''
                          }`}>
                          <div className="tracker-step-icon-container">2</div>
                          <div>
                            <h4 className="tracker-step-title">Đang Chuẩn Bị (Preparing)</h4>
                            <p className="tracker-step-desc">Đầu bếp đã nhận đơn và bắt đầu chế biến món ăn của bạn.</p>
                          </div>
                        </div>

                        <div className={`tracker-status-step ${order.status === 'Ready' ? 'active' :
                            (order.status === 'Served') ? 'completed' : ''
                          }`}>
                          <div className="tracker-step-icon-container">3</div>
                          <div>
                            <h4 className="tracker-step-title">Đã Sẵn Sàng (Ready)</h4>
                            <p className="tracker-step-desc">Món ăn chế biến xong hoàn hảo, nhân viên bưng bê đang mang tới.</p>
                          </div>
                        </div>

                        <div className={`tracker-status-step ${order.status === 'Served' ? 'completed' : ''}`}>
                          <div className="tracker-step-icon-container">4</div>
                          <div>
                            <h4 className="tracker-step-title">Đã Phục Vụ (Served)</h4>
                            <p className="tracker-step-desc">Món ăn đã được phục vụ lên bàn của quý khách thành công.</p>
                          </div>
                        </div>
                      </div>

                      {/* Assistant Waiter & Call service block (Flow 33) */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        padding: '16px 20px',
                        background: 'var(--bg-deep)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        marginBottom: '20px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700 }}>
                            🤵
                          </div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Nhân viên hỗ trợ: Trần Tiến Đạt (Bàn {order.tableNumber})</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Đang trực tuyến điều phối trạm phục vụ của quý khách</div>
                          </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '4px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ fontSize: '0.78rem', padding: '8px 10px', height: 'auto', minHeight: 'unset', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', border: '1px solid var(--border-color)' }}
                            onClick={() => {
                              triggerToast("🛎️ Đã gửi yêu cầu trợ giúp! Nhân viên phục vụ đang di chuyển tới bàn.");
                            }}
                          >
                            🛎️ Gọi Phục Vụ
                          </button>
                          
                          <button 
                            className="btn btn-secondary" 
                            style={{ fontSize: '0.78rem', padding: '8px 10px', height: 'auto', minHeight: 'unset', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', border: '1px solid var(--border-color)' }}
                            onClick={() => {
                              triggerToast("🧊 Đã yêu cầu thêm Nước Đá! Nhân viên sẽ mang lên ngay.");
                            }}
                          >
                            🧊 Thêm Nước Đá
                          </button>

                          <button 
                            className="btn btn-secondary" 
                            style={{ fontSize: '0.78rem', padding: '8px 10px', height: 'auto', minHeight: 'unset', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', border: '1px solid var(--border-color)' }}
                            onClick={() => {
                              triggerToast("🧻 Đã yêu cầu thêm Khăn Lạnh! Nhân viên sẽ mang lên ngay.");
                            }}
                          >
                            🧻 Xin Khăn Lạnh
                          </button>
                        </div>
                      </div>

                      <div className="tracker-items-section">
                        <h4 className="tracker-items-title">Chi Tiết Đơn Gọi</h4>
                        <div className="tracker-items-list">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="tracker-item-row">
                              <div className="tracker-item-name-col">
                                <div>
                                  <span className="tracker-item-qty">x{item.quantity}</span>
                                  <strong>{item.menuItemName}</strong>
                                </div>
                                {item.note && <span className="tracker-item-note">💡 Ghi chú: {item.note}</span>}
                              </div>
                              <div>
                                {item.status === 'Pending' && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Đang chờ</span>}
                                {item.status === 'Preparing' && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Đang nấu</span>}
                                {item.status === 'Ready' && <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Xong</span>}
                                {item.status === 'Served' && <span className="badge badge-success" style={{ fontSize: '0.65rem', background: 'transparent' }}>Đã lên bàn</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 5: AI DINING ASSISTANT */}
          {activeTab === 'ai' && (
            <div className="animate-fade-in ai-container">
              <div className="ai-header-info">
                <div className="ai-avatar">🤖</div>
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
                <div className="ai-suggestions-label">Câu Hỏi Ý Kiến Gợi Ý:</div>
                <div className="ai-suggestion-pills">
                  <button
                    className="ai-suggestion-pill"
                    onClick={() => handleSendAiMessage("Đi 4 người khoảng 600k nên gọi combo món gì hợp lý?")}
                  >
                    Combo 4 người 600k?
                  </button>
                  <button
                    className="ai-suggestion-pill"
                    onClick={() => handleSendAiMessage("Thực đơn có những món nào ngon không cay cho trẻ em?")}
                  >
                    Món trẻ em không cay?
                  </button>
                  <button
                    className="ai-suggestion-pill"
                    onClick={() => handleSendAiMessage("Nhà hàng mình có tùy chọn món ăn chay không?")}
                  >
                    Có món ăn chay không?
                  </button>
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

      {/* -------------------------------------------------------------
          MOBILE STICKY BOTTOM NAVIGATION BAR (Screens < 1024px)
          ------------------------------------------------------------- */}
      <nav className="tab-navigation">
        <button className={`tab-nav-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')} id="nav-btn-home">
          <span className="tab-nav-btn-icon">🏠</span>
          <span>Trang Chủ</span>
        </button>
        <button className={`tab-nav-btn ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => { setActiveTab('menu'); setSearchKeyword(""); setSelectedCategory("all"); }} id="nav-btn-menu">
          <span className="tab-nav-btn-icon">🍲</span>
          <span>Thực Đơn</span>
        </button>
        <button className={`tab-nav-btn ${activeTab === 'reservation' ? 'active' : ''}`} onClick={() => setActiveTab('reservation')} id="nav-btn-reservation">
          <span className="tab-nav-btn-icon">📅</span>
          <span>Đặt Bàn</span>
        </button>
        <button className={`tab-nav-btn ${activeTab === 'tracker' ? 'active' : ''}`} onClick={() => setActiveTab('tracker')} id="nav-btn-tracker">
          <span className="tab-nav-btn-icon">⏳</span>
          <span>Đơn Hàng</span>
        </button>
        <button className={`tab-nav-btn ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')} id="nav-btn-ai">
          <span className="tab-nav-btn-icon">🤖</span>
          <span>Trợ Lý AI</span>
        </button>
      </nav>

      {/* -------------------------------------------------------------
          DISH DETAILS MODAL POPUP
          ------------------------------------------------------------- */}
      {/* -------------------------------------------------------------
          DISH DETAILS MODAL POPUP
          ------------------------------------------------------------- */}
      {selectedDish && (() => {
        const isDrink = selectedDish.categoryId === 'cat-drink' || selectedDish.tags.includes('thức uống') || selectedDish.tags.includes('nước uống') || selectedDish.categoryName.includes('Uống');

        let modalUnitPrice = selectedDish.price;
        if (selectedSize === 'S') modalUnitPrice -= 5000;
        if (selectedSize === 'L') modalUnitPrice += 10000;
        if (selectedSize === 'XL') modalUnitPrice += 15000;

        let toppingCost = 0;
        Object.entries(extraToppings).forEach(([name, qty]) => {
          if (name.includes('Cheese')) toppingCost += qty * 10000;
          else toppingCost += qty * 5000;
        });
        const currentDishPrice = modalUnitPrice + toppingCost;

        return (
          <div className="modal-backdrop animate-fade-in" onClick={() => setSelectedDish(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
              <button className="modal-close-btn" onClick={() => setSelectedDish(null)}>
                <X size={20} />
              </button>
              <div className="modal-hero-image">
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface-elevated)', fontSize: '7rem' }}>
                  {selectedDish.emoji}
                </div>
              </div>

              <div className="modal-body">
                <div className="modal-title-row">
                  <div>
                    <span className="dish-category" style={{ fontSize: '0.8rem' }}>{selectedDish.categoryName}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{selectedDish.name}</h3>
                      <span className="starbucks-reward-badge" title="Đạt tiêu chuẩn đổi bằng sao Rewards">150★</span>
                    </div>
                  </div>
                  <div className="modal-price" style={{ color: 'var(--price-color)', fontFamily: 'var(--font-heading)', fontWeight: 850, fontSize: '1.6rem' }}>
                    {currentDishPrice.toLocaleString('vi-VN')} ₫
                  </div>
                </div>

                <div className="modal-tags">
                  {selectedDish.tags.map((tag, idx) => (
                    <span key={idx} className={`badge ${getBadgeClass(tag)}`}>{tag}</span>
                  ))}
                </div>

                <p className="modal-desc" style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '20px' }}>
                  {selectedDish.description}
                </p>

                {/* 1. Size Options Selector (Starbucks style PDP) */}
                <div className="pdp-section" style={{ marginBottom: '24px' }}>
                  <label className="pdp-section-label" style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📐 Chọn Kích Cỡ (Size):
                  </label>
                  <div className="size-selector-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {[
                      { key: 'S', name: 'S (Nhỏ)', size: '12 fl oz', offset: '-5k' },
                      { key: 'M', name: 'M (Grande)', size: '16 fl oz', offset: 'Chuẩn' },
                      { key: 'L', name: 'L (Venti)', size: '24 fl oz', offset: '+10k' },
                      { key: 'XL', name: 'XL (Trenta)', size: '31 fl oz', offset: '+15k' }
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        className={`size-option-btn ${selectedSize === item.key ? 'active' : ''}`}
                        onClick={() => setSelectedSize(item.key as any)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: '12px 8px',
                          border: selectedSize === item.key ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          borderRadius: '12px',
                          background: selectedSize === item.key ? 'rgba(var(--primary-rgb), 0.08)' : 'var(--bg-surface)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          transform: selectedSize === item.key ? 'scale(1.02)' : 'none'
                        }}
                      >
                        <span style={{ fontSize: item.key === 'S' ? '1.1rem' : item.key === 'M' ? '1.3rem' : item.key === 'L' ? '1.5rem' : '1.7rem', marginBottom: '4px' }}>☕</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{item.size}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary)', marginTop: '4px' }}>{item.offset}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Hot/Ice and Sweetness Options for drinks */}
                {isDrink && (
                  <div className="pdp-section" style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="pdp-section-label" style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        ❄️ Nhiệt Độ:
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                          { key: 'Đá', label: 'Lạnh (Đá) ❄️' },
                          { key: 'Nóng', label: 'Nóng ☕' }
                        ].map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            className={`custom-pill-btn ${selectedTemperature === item.key ? 'active' : ''}`}
                            onClick={() => setSelectedTemperature(item.key as any)}
                            style={{
                              flex: 1,
                              padding: '10px 8px',
                              borderRadius: '30px',
                              border: selectedTemperature === item.key ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                              background: selectedTemperature === item.key ? 'rgba(var(--primary-rgb), 0.08)' : 'var(--bg-surface)',
                              color: selectedTemperature === item.key ? 'var(--primary)' : 'var(--text-primary)',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="pdp-section-label" style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        🍯 Độ Ngọt:
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        {['Không đường', '50%', '70% (Chuẩn)', '100%'].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            className={`custom-pill-btn ${selectedSweetness === lvl ? 'active' : ''}`}
                            onClick={() => setSelectedSweetness(lvl)}
                            style={{
                              padding: '6px 4px',
                              borderRadius: '30px',
                              border: selectedSweetness === lvl ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                              background: selectedSweetness === lvl ? 'rgba(var(--primary-rgb), 0.08)' : 'var(--bg-surface)',
                              color: selectedSweetness === lvl ? 'var(--primary)' : 'var(--text-primary)',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Add-ins & Extra Toppings Row */}
                <div className="pdp-section" style={{ marginBottom: '24px' }}>
                  <label className="pdp-section-label" style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ✨ Thêm Topping Thượng Hạng:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(var(--primary-rgb), 0.03)', padding: '16px', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                    {Object.keys(extraToppings).map((toppingName) => {
                      const qty = extraToppings[toppingName];
                      const cost = toppingName.includes('Cheese') ? 10000 : 5000;
                      return (
                        <div key={toppingName} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ textAlign: 'left' }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{toppingName}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>+{cost.toLocaleString('vi-VN')} ₫</span>
                          </div>

                          <div className="quantity-picker" style={{ height: '36px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                            <button
                              type="button"
                              className="quantity-btn"
                              style={{ width: '32px', height: '32px' }}
                              onClick={() => setExtraToppings(prev => ({ ...prev, [toppingName]: Math.max(0, qty - 1) }))}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="quantity-value" style={{ width: '28px', fontSize: '0.85rem' }}>{qty}</span>
                            <button
                              type="button"
                              className="quantity-btn"
                              style={{ width: '32px', height: '32px' }}
                              onClick={() => setExtraToppings(prev => ({ ...prev, [toppingName]: qty + 1 }))}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Notes section */}
                <div className="modal-notes-section" style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                  <label className="form-label" htmlFor="dish-modal-notes" style={{ color: 'var(--primary)', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.88rem' }}>
                    <span>💡</span> Hướng Dẫn/Ghi Chú Nấu Món:
                  </label>
                  <input
                    type="text"
                    id="dish-modal-notes"
                    className="form-control"
                    placeholder="Ví dụ: Ít đá, không hành tây, lấy thêm chanh..."
                    value={dishNotes}
                    onChange={(e) => setDishNotes(e.target.value)}
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>

                {/* 5. Quantity Stepper & Add Button */}
                <div className="modal-quantity-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Chọn số lượng suất:</span>
                  <div className="quantity-picker" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-deep)' }}>
                    <button
                      type="button"
                      className="quantity-btn"
                      onClick={() => setDishQuantity(q => Math.max(1, q - 1))}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="quantity-value">{dishQuantity}</span>
                    <button
                      type="button"
                      className="quantity-btn"
                      onClick={() => setDishQuantity(q => q + 1)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary modal-btn-submit"
                  onClick={handleAddToCart}
                  id="btn-modal-add-to-cart"
                  style={{ width: '100%', padding: '16px 20px', fontSize: '1.05rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  Thêm Vào Giỏ Hàng - {(currentDishPrice * dishQuantity).toLocaleString('vi-VN')} ₫
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* -------------------------------------------------------------
          FLOATING STICKY CART BADGE ACTION
          ------------------------------------------------------------- */}
      {getCartCount() > 0 && (
        <div className="floating-cart-btn pulsing-glow" onClick={() => setIsCartOpen(true)} id="btn-floating-cart">
          <ShoppingBag className="floating-cart-btn-icon" />
          <span className="floating-cart-badge">{getCartCount()}</span>
        </div>
      )}

      {/* -------------------------------------------------------------
          SIDE DRAWER CART SECTION
          ------------------------------------------------------------- */}
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
                  <p style={{ fontSize: '0.85rem' }}>Quý khách vui lòng chọn các món ăn tinh tế từ menu để thêm vào giỏ.</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="cart-item">
                    <div className="cart-item-img-placeholder">{item.emoji}</div>
                    <div className="cart-item-details">
                      <div>
                        <h4 className="cart-item-name">{item.name}</h4>
                        {item.note && <p className="cart-item-note">💡 {item.note}</p>}
                      </div>
                      <div className="cart-item-row">
                        <span className="cart-item-price">{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="cart-item-quantity-picker">
                            <button
                              className="cart-item-qty-btn"
                              onClick={() => handleUpdateCartQty(item.menuItemId, item.note, -1)}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="cart-item-qty-val">{item.quantity}</span>
                            <button
                              className="cart-item-qty-btn"
                              onClick={() => handleUpdateCartQty(item.menuItemId, item.note, 1)}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            className="cart-item-btn-remove"
                            onClick={() => handleRemoveFromCart(item.menuItemId, item.note)}
                          >
                            <X size={16} />
                          </button>
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

                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={handleSubmitOrder}
                  disabled={isSubmittingOrder}
                  id="btn-place-order"
                >
                  {isSubmittingOrder ? (
                    <>
                      <RefreshCw className="animate-float" size={18} style={{ animation: 'spin 1.5s linear infinite' }} /> Đang Tạo Order...
                    </>
                  ) : (
                    <>Gửi Yêu Cầu Xuống Bếp (QR Order)</>
                  )}
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
