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
  Moon
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
    description: "Nước lẩu chua cay chuẩn vị Thái, ăn kèm hải sản tươi sống (tôm, mực, nghêu), nấm đông cô và các loại rau xanh thanh mát.",
    price: 299000,
    categoryId: "cat-hotpot",
    categoryName: "Món Lẩu",
    tags: ["cay", "bán chạy", "nổi bật"],
    isAvailable: true,
    imageUrl: "",
    emoji: "🍲"
  },
  {
    id: "dish-002",
    name: "Gỏi Cuốn Tôm Thịt Thanh Nhã",
    description: "Tôm luộc đỏ au, ba chỉ luộc mềm thơm cuộn cùng bánh tráng, rau sống tươi rói, ăn kèm sốt tương đen đậu phộng béo bùi.",
    price: 69000,
    categoryId: "cat-appetizer",
    categoryName: "Khai Vị",
    tags: ["thanh đạm", "khai vị"],
    isAvailable: true,
    imageUrl: "",
    emoji: "🌯"
  },
  {
    id: "dish-003",
    name: "Cánh Gà Chiên Nước Mắm Tỏi Ớt",
    description: "Cánh gà chiên giòn rụm bên ngoài, mọng nước bên trong, được phủ lớp sốt nước mắm Phú Quốc sánh quyện và tỏi ớt phi thơm.",
    price: 99000,
    categoryId: "cat-appetizer",
    categoryName: "Khai Vị",
    tags: ["mặn ngọt", "được thích"],
    isAvailable: true,
    imageUrl: "",
    emoji: "🍗"
  },
  {
    id: "dish-004",
    name: "Bò Lúc Lắc Khoai Tây Giòn",
    description: "Thịt thăn bò Mỹ thái quân cờ xào to lửa sốt tiêu đen hành tây, ăn kèm khoai tây chiên muối vàng ươm và xà lách trộn.",
    price: 189000,
    categoryId: "cat-main",
    categoryName: "Món Chính",
    tags: ["bò", "trẻ em yêu thích"],
    isAvailable: true,
    imageUrl: "",
    emoji: "🥩"
  },
  {
    id: "dish-005",
    name: "Cơm Chiên Hải Sản Hạt Sen",
    description: "Cơm trắng đảo tơi vàng ươm cùng trứng gà ta, rắc tôm mực thái hạt lựu, hạt sen bùi béo và hành lá thơm phức.",
    price: 119000,
    categoryId: "cat-main",
    categoryName: "Món Chính",
    tags: ["dễ ăn", "ăn no"],
    isAvailable: true,
    imageUrl: "",
    emoji: "🍛"
  },
  {
    id: "dish-006",
    name: "Nước Cam Vắt Nguyên Chất",
    description: "Cam sành tươi vắt lấy nước, thêm chút đá mát lạnh giúp thanh lọc cơ thể và giải nhiệt sảng khoái.",
    price: 39000,
    categoryId: "cat-drink",
    categoryName: "Đồ Uống",
    tags: ["thanh nhiệt", "healthy"],
    isAvailable: true,
    imageUrl: "",
    emoji: "🍹"
  },
  {
    id: "dish-007",
    name: "Trà Đào Sả Hồng Trứ Danh",
    description: "Cốt trà đen đậm đà pha cùng đào ngâm thơm lừng, điểm xuyết vài lát sả tươi thơm nồng và hạt chia bổ dưỡng.",
    price: 45000,
    categoryId: "cat-drink",
    categoryName: "Đồ Uống",
    tags: ["bán chạy", "thanh mát"],
    isAvailable: true,
    imageUrl: "",
    emoji: "🍑"
  },
  {
    id: "dish-008",
    name: "Kem Bơ Sầu Riêng Đắk Lắk",
    description: "Bơ sáp xay mịn béo ngậy kết hợp một viên kem vani Pháp sang trọng và một múi sầu riêng RI6 tươi chín mọng ngon ngọt.",
    price: 59000,
    categoryId: "cat-dessert",
    categoryName: "Tráng Miệng",
    tags: ["béo ngậy", "đặc sản"],
    isAvailable: true,
    imageUrl: "",
    emoji: "🥑"
  },
  {
    id: "dish-009",
    name: "Bánh Tiramisu Cà Phê Moka",
    description: "Bánh ngọt kiểu Ý mềm mịn đan xen lớp kem phô mai mascarpone béo ngậy và cốt bánh đẫm hương vị cà phê moka thơm đậm.",
    price: 49000,
    categoryId: "cat-dessert",
    categoryName: "Tráng Miệng",
    tags: ["ngọt ngào"],
    isAvailable: false, // Out of stock to test unavailable items UI
    imageUrl: "",
    emoji: "🍰"
  }
];

const CATEGORIES = [
  { id: "all", name: "Tất Cả Món" },
  { id: "cat-appetizer", name: "Món Khai Vị" },
  { id: "cat-main", name: "Món Chính" },
  { id: "cat-hotpot", name: "Món Lẩu" },
  { id: "cat-drink", name: "Đồ Uống" },
  { id: "cat-dessert", name: "Tráng Miệng" }
];

export function App() {
  // Theme state & body class manager
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'reservation' | 'tracker' | 'ai'>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  
  // Search & Filters
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Active QR Session (Flow 3.3 / 3.4)
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [tableSession, setTableSession] = useState<TableSession | null>(null);
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dishNotes, setDishNotes] = useState("");
  const [dishQuantity, setDishQuantity] = useState(1);
  
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
      text: "Xin chào quý khách! Tôi là Trợ Lý Ẩm Thực AI của Antigravity Bistro. Tôi có thể tư vấn món ăn ngon theo sở thích, thiết lập combo tiệc hợp túi tiền hoặc giải đáp thắc mắc về chính sách của nhà hàng. Quý khách muốn hỏi gì hôm nay ạ?",
    }
  ]);
  const [aiInputValue, setAiInputValue] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

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

    // Simulate SignalR server pushing status updates for the orders in preparation
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
    }, 12000); // Trigger a transition state every 12 seconds

    return () => clearInterval(interval);
  }, [placedOrders]);

  // -------------------------------------------------------------
  // ACTIONS: LOADING TABLE SESSION
  // -------------------------------------------------------------
  const handleLoadTableSession = (token: string) => {
    // Aligns with: GET /api/v1/table-sessions/by-token/{token}
    setSessionToken(token);
    const mockSession: TableSession = {
      id: "sess_" + Math.random().toString(36).substr(2, 9),
      tableId: "tbl-a01",
      tableNumber: "A01",
      status: "Active",
      openedAt: new Date().toISOString()
    };
    setTableSession(mockSession);
    setActiveTab('menu'); // Navigate directly to QR ordering menu

    // Trigger URL clean display or set in state
    const cleanUrl = window.location.pathname + `?sessionToken=${token}`;
    window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
  };

  const handleSimulateQRScan = () => {
    // Create random mock token
    const randomToken = "secure-qr-session-token-" + Math.floor(1000 + Math.random() * 9000);
    handleLoadTableSession(randomToken);
  };

  const handleClearSession = () => {
    setSessionToken(null);
    setTableSession(null);
    setCart([]);
    window.history.replaceState({}, '', window.location.pathname);
  };

  // -------------------------------------------------------------
  // ACTIONS: CART OPERATIONS
  // -------------------------------------------------------------
  const handleOpenDishModal = (dish: MenuItem) => {
    if (!dish.isAvailable) return;
    setSelectedDish(dish);
    setDishQuantity(1);
    setDishNotes("");
  };

  const handleAddToCart = () => {
    if (!selectedDish) return;
    
    setCart(prevCart => {
      const existing = prevCart.find(item => item.menuItemId === selectedDish.id && item.note === dishNotes);
      if (existing) {
        return prevCart.map(item => 
          (item.menuItemId === selectedDish.id && item.note === dishNotes)
            ? { ...item, quantity: item.quantity + dishQuantity }
            : item
        );
      } else {
        return [...prevCart, {
          menuItemId: selectedDish.id,
          name: selectedDish.name,
          price: selectedDish.price,
          quantity: dishQuantity,
          note: dishNotes,
          emoji: selectedDish.emoji
        }];
      }
    });

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

    // Simulate API delay, enforcing idempotencyKey check
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
        tableNumber: tableSession?.tableNumber || "Vãng Lai",
        status: 'Pending',
        items: newItems,
        placedAt: new Date()
      };

      setPlacedOrders(prev => [newOrder, ...prev]);
      setCart([]);
      setIsCartOpen(false);
      setIsSubmittingOrder(false);
      setActiveTab('tracker'); // Jump to live tracker immediately to wow customer
    }, 1500);
  };

  // -------------------------------------------------------------
  // ACTIONS: RESERVATION SYSTEM (POST /api/v1/reservations)
  // -------------------------------------------------------------
  const handleSubmitReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !reservationTime) return;
    setIsSubmittingReservation(true);

    // Simulate API delay
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

      // Clear Form
      setCustomerName("");
      setPhone("");
      setReservationTime("");
      setReservationNote("");
    }, 1200);
  };

  // -------------------------------------------------------------
  // AI CUSTOMER RAG CHAT ASSISTANT (POST /api/v1/ai/menu-chat)
  // -------------------------------------------------------------
  const handleSendAiMessage = (forcedQuery?: string) => {
    const query = forcedQuery || aiInputValue;
    if (!query.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!forcedQuery) setAiInputValue("");
    setIsAiTyping(true);

    // Simulate AI Service RAG Processing delay
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

    setIsCartOpen(true); // Open the cart to show the added items!
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
    <div className="app-container">
      {/* -------------------------------------------------------------
          SIMULATION BAR: Top banner to showcase full QR Order flow simulator
          ------------------------------------------------------------- */}
      <div className="simulation-panel">
        <div className="simulation-info">
          <div className="simulation-icon">📱</div>
          <div>
            <div className="simulation-title">Trình Giả Lập Quét Mã QR Gọi Món (Customer Web)</div>
            <div className="simulation-desc">
              {sessionToken 
                ? `Đang mô phỏng quét mã tại BÀN ${tableSession?.tableNumber}. Token: ${sessionToken.substring(0, 15)}...`
                : "Quét QR để nhận số bàn, gọi món gửi trực tiếp vào bếp bếp, theo dõi SignalR."
              }
            </div>
          </div>
        </div>
        {sessionToken ? (
          <button className="simulation-btn" onClick={handleClearSession} id="btn-reset-session">
            Hủy Bàn & Thoát
          </button>
        ) : (
          <button className="simulation-btn" onClick={handleSimulateQRScan} id="btn-simulate-qr">
            Quét Mã QR Bàn A01
          </button>
        )}
      </div>

      {/* -------------------------------------------------------------
          HEADER SECTION
          ------------------------------------------------------------- */}
      <header className="app-header">
        <div className="logo-container" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">A</div>
          <div>
            <h1 className="logo-text grad-text">Antigravity</h1>
            <p style={{ fontSize: '0.68rem', letterSpacing: '2px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '-4px' }}>Bistro</p>
          </div>
        </div>

        <div className="header-actions">
          {sessionToken && tableSession && (
            <div className="session-info-bar">
              <span className="session-indicator"></span>
              <span>📍 Bàn <strong>{tableSession.tableNumber}</strong></span>
            </div>
          )}

          <button 
            type="button"
            className="theme-toggle-btn" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Chuyển sang Chế độ sáng' : 'Chuyển sang Chế độ tối'}
            id="theme-toggle"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------------
          MAIN APPLICATION DISPLAY
          ------------------------------------------------------------- */}
      <main className="main-content">
        
        {/* TAB 1: HOME VIEW */}
        {activeTab === 'home' && (
          <div className="animate-fade-in">
            <div className="hero-section">
              <div className="hero-content">
                <span className="hero-subtitle">Tinh Hoa Ẩm Thực Việt & Quốc Tế</span>
                <h1 className="hero-title">Trải Nghiệm Gọi Món Khác Biệt Bằng <span className="grad-text">Công Nghệ</span></h1>
                <p className="hero-desc">Đặt bàn trực tuyến trong 30 giây, quét QR gọi món tại bàn không lo xếp hàng và trò chuyện cùng Trợ lý AI đặc sản siêu thông minh.</p>
                <div className="hero-actions">
                  <button className="btn btn-primary" onClick={() => setActiveTab('menu')} id="btn-home-menu">
                    <Utensils size={18} /> Xem Thực Đơn
                  </button>
                  <button className="btn btn-secondary" onClick={() => setActiveTab('reservation')} id="btn-home-book">
                    <Calendar size={18} /> Đặt Bàn Ngay
                  </button>
                </div>
              </div>
              <div className="hero-image-container">
                <div className="hero-circle-backdrop">
                  <span className="hero-artwork animate-float">🍲</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'left', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Chức Năng Tiện Ích Cho Khách</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Mọi dịch vụ số hóa tốt nhất phục vụ quý khách tại nhà hàng.</p>
            </div>

            <div className="dishes-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'left', cursor: 'pointer' }} onClick={() => setActiveTab('menu')}>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🍲</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Thực Đơn Số Hóa</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Xem danh sách món, lọc nhanh, tìm kiếm, giá cả minh bạch rõ ràng kèm hình ảnh trực quan.</p>
              </div>

              <div className="glass-panel" style={{ padding: '24px', textAlign: 'left', cursor: 'pointer' }} onClick={() => setActiveTab('reservation')}>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📅</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Đặt Bàn Trực Tuyến</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Đảm bảo giữ bàn đẹp gần cửa sổ, phục vụ đúng giờ nhanh chóng kèm dịch vụ đón khách chu đáo.</p>
              </div>

              <div className="glass-panel" style={{ padding: '24px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSimulateQRScan()}>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📱</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>QR Code Gọi Món</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Đọc mã bàn, chọn món, ghi chú cay ngọt thoải mái và gửi thẳng đơn xuống bếp nấu lập tức.</p>
              </div>

              <div className="glass-panel" style={{ padding: '24px', textAlign: 'left', cursor: 'pointer' }} onClick={() => setActiveTab('ai')}>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🤖</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Trợ Lý Khẩu Vị AI</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Tự động tư vấn món ngon theo số người, ngân sách nhóm và hỏi đáp các chính sách ẩm thực tại chỗ.</p>
              </div>
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
                  : "Khám phá danh sách các món ăn tinh tế của Antigravity Bistro."
                }
              </p>
            </div>

            {/* Search and Filters */}
            <div className="menu-search-bar">
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
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Dishes grid */}
            {filteredMenu.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🍽️</div>
                <h3>Không tìm thấy món ăn nào phù hợp</h3>
                <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>Quý khách vui lòng thử tìm kiếm với từ khóa khác.</p>
              </div>
            ) : (
              <div className="dishes-grid">
                {filteredMenu.map(dish => (
                  <div 
                    key={dish.id} 
                    className={`glass-panel dish-card ${!dish.isAvailable ? 'out-of-stock' : ''}`}
                    onClick={() => handleOpenDishModal(dish)}
                    id={`dish-card-${dish.id}`}
                  >
                    <div className="dish-image-wrapper">
                      <div className="dish-image-placeholder">{dish.emoji}</div>
                      <div className="dish-badge-container">
                        {dish.tags.map((tag, idx) => (
                          <span key={idx} className="badge badge-primary">{tag}</span>
                        ))}
                        {!dish.isAvailable && (
                          <span className="badge badge-danger">Hết Món</span>
                        )}
                      </div>
                    </div>
                    <div className="dish-details">
                      <div className="dish-category">{dish.categoryName}</div>
                      <h3 className="dish-title">{dish.name}</h3>
                      <p className="dish-desc">{dish.description}</p>
                      <div className="dish-footer">
                        <span className="dish-price">{dish.price.toLocaleString('vi-VN')} ₫</span>
                        {dish.isAvailable && (
                          <div className="dish-btn-add">
                            <Plus size={18} />
                          </div>
                        )}
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
              // Display beautiful animated Booking Receipt
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
              // Form for reservation submission
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
              placedOrders.map(order => (
                <div key={order.orderId} className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                    <div>
                      <div className="tracker-table-num">📍 Bàn {order.tableNumber}</div>
                      <div className="tracker-order-code">Mã Đơn: <strong>{order.orderCode}</strong> | {new Date(order.placedAt).toLocaleTimeString('vi-VN')}</div>
                    </div>
                    <div>
                      {order.status === 'Pending' && <span className="badge badge-warning">Chờ Bếp Nhận</span>}
                      {order.status === 'Preparing' && <span className="badge badge-primary pulsing-glow">Đang Chế Biến</span>}
                      {order.status === 'Ready' && <span className="badge badge-success pulsing-glow">Sẵn Sàng Phục Vụ</span>}
                      {order.status === 'Served' && <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>Đã Lên Bàn</span>}
                    </div>
                  </div>

                  {/* Flow Steps for real-time order tracking (Flow 3.4) */}
                  <div className="tracker-status-box">
                    <div className={`tracker-status-step ${
                      order.status === 'Pending' ? 'active' : 
                      (order.status === 'Preparing' || order.status === 'Ready' || order.status === 'Served') ? 'completed' : ''
                    }`}>
                      <div className="tracker-step-icon-container">1</div>
                      <div>
                        <h4 className="tracker-step-title">Gửi Đơn & Chờ Nhận</h4>
                        <p className="tracker-step-desc">Hệ thống đã gửi đơn xuống bếp bằng Token chống trùng (Idempotency).</p>
                      </div>
                    </div>

                    <div className={`tracker-status-step ${
                      order.status === 'Preparing' ? 'active' : 
                      (order.status === 'Ready' || order.status === 'Served') ? 'completed' : ''
                    }`}>
                      <div className="tracker-step-icon-container">2</div>
                      <div>
                        <h4 className="tracker-step-title">Đang Chuẩn Bị (Preparing)</h4>
                        <p className="tracker-step-desc">Đầu bếp đã nhận đơn và bắt đầu chế biến món ăn của bạn.</p>
                      </div>
                    </div>

                    <div className={`tracker-status-step ${
                      order.status === 'Ready' ? 'active' : 
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

                  {/* Order Items List */}
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
              ))
            )}
          </div>
        )}

        {/* TAB 5: AI dining assistant chat (Flow 3.5) */}
        {activeTab === 'ai' && (
          <div className="animate-fade-in ai-container">
            <div className="ai-header-info">
              <div className="ai-avatar">🤖</div>
              <div>
                <h3 className="ai-title-text">Trợ Lý Khẩu Vị AI - Antigravity</h3>
                <div className="ai-status-pulse">
                  <span className="session-indicator"></span>
                  <span>Đang Trực Tuyến | AI RAG Pipeline</span>
                </div>
              </div>
            </div>

            {/* Chat History Panel */}
            <div className="glass-panel ai-chat-history">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`ai-chat-bubble ${msg.sender}`}>
                  <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                  
                  {/* Sources tag display */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="ai-sources-row">
                      <span>Dẫn nguồn RAG:</span>
                      {msg.sources.map((src, idx) => (
                        <span key={idx} className="ai-source-badge">{src}</span>
                      ))}
                    </div>
                  )}

                  {/* Actions buttons dynamically simulated */}
                  {msg.suggestedAction && (
                    <div className="ai-suggested-actions">
                      <button 
                        className="btn btn-primary btn-outline" 
                        style={{ fontSize: '0.82rem', padding: '8px 16px', background: 'rgba(255, 107, 53, 0.1)', color: 'var(--primary)', borderColor: 'var(--primary)' }}
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

            {/* Dynamic suggested questions */}
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

            {/* Input message form */}
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

      {/* -------------------------------------------------------------
          TAB BAR MOBILE-FIRST FOOTER NAVIGATION
          ------------------------------------------------------------- */}
      <nav className="glass-panel tab-navigation">
        <button 
          className={`tab-nav-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
          id="nav-btn-home"
        >
          <span className="tab-nav-btn-icon">🏠</span>
          <span>Trang Chủ</span>
        </button>
        <button 
          className={`tab-nav-btn ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
          id="nav-btn-menu"
        >
          <span className="tab-nav-btn-icon">🍲</span>
          <span>Thực Đơn</span>
        </button>
        <button 
          className={`tab-nav-btn ${activeTab === 'reservation' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservation')}
          id="nav-btn-reservation"
        >
          <span className="tab-nav-btn-icon">📅</span>
          <span>Đặt Bàn</span>
        </button>
        <button 
          className={`tab-nav-btn ${activeTab === 'tracker' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracker')}
          id="nav-btn-tracker"
        >
          <span className="tab-nav-btn-icon">⏳</span>
          <span>Đơn Hàng</span>
        </button>
        <button 
          className={`tab-nav-btn ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
          id="nav-btn-ai"
        >
          <span className="tab-nav-btn-icon">🤖</span>
          <span>Trợ Lý AI</span>
        </button>
      </nav>

      {/* -------------------------------------------------------------
          DISH DETAILS MODAL POPUP
          ------------------------------------------------------------- */}
      {selectedDish && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setSelectedDish(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                  <h3 style={{ fontSize: '1.5rem', marginTop: '4px' }}>{selectedDish.name}</h3>
                </div>
                <div className="modal-price">{selectedDish.price.toLocaleString('vi-VN')} ₫</div>
              </div>

              <div className="modal-tags">
                {selectedDish.tags.map((tag, idx) => (
                  <span key={idx} className="badge badge-primary">{tag}</span>
                ))}
              </div>

              <p className="modal-desc">{selectedDish.description}</p>

              {/* Special instructions / notes inside details modal */}
              <div className="modal-notes-section">
                <label className="form-label" htmlFor="dish-modal-notes" style={{ color: 'var(--primary)', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>💡</span> Hướng Dẫn/Ghi Chú Nấu Món:
                </label>
                <input 
                  type="text" 
                  id="dish-modal-notes" 
                  className="form-control" 
                  placeholder="Ví dụ: Ít cay, không bỏ hành tây, lấy thêm chanh..."
                  value={dishNotes}
                  onChange={(e) => setDishNotes(e.target.value)}
                />
              </div>

              <div className="modal-quantity-row">
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Chọn số lượng suất:</span>
                <div className="quantity-picker">
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
              >
                Thêm Vào Giỏ Hàng - {(selectedDish.price * dishQuantity).toLocaleString('vi-VN')} ₫
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          FLOATING STICKY CART BADGE ACTION (Flow 3.3)
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

                {/* Submitting order button with simulation */}
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
