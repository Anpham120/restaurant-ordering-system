import { useCallback, useEffect, useRef, useState } from 'react';
import { Clock, DollarSign, Eye, RefreshCw, Send, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { kitchenService } from '../../services/kitchenService';
import { tableService } from '../../services/tableService';
import type { KitchenOrderItem, Table } from '../../types';

type Tab = 'metrics' | 'orders' | 'report';

const HOURLY_CHART = [
  { label: '08:00', h: 15 }, { label: '09:00', h: 25 }, { label: '10:00', h: 20 },
  { label: '11:00', h: 45 }, { label: '12:00', h: 85, peak: true }, { label: '13:00', h: 70, peak: true },
  { label: '14:00', h: 15 }, { label: '15:00', h: 20 }, { label: '16:00', h: 30 },
  { label: '17:00', h: 55 }, { label: '18:00', h: 80, peak: true }, { label: '19:00', h: 95, peak: true },
  { label: '20:00', h: 65 }, { label: '21:00', h: 40 }, { label: '22:00', h: 10 },
];

const TOP_SELLERS = [
  { name: '1. Trà Đào Sả TV FOOD', desc: 'Đồ Uống / Topping thạch sả', count: '18 Cốc' },
  { name: '2. Phở Bò Tày Đặc Biệt', desc: 'Món Ăn / Súp bò hầm thảo mộc', count: '14 Tô' },
  { name: '3. Cà Phê Muối TV', desc: 'Đồ Uống / Kem mặn đặc sản', count: '12 Ly' },
  { name: '4. Bánh Mì Chảo Đặc Biệt', desc: 'Món Ăn / Pate trứng nóng sốt', count: '9 Suất' },
];

const AI_REPORT_TEXT = `### BÁO CÁO VẬN HÀNH HÀNG NGÀY - TV FOOD (AI RAG ASSISTANT)
---
* **Dữ liệu phân tích**: Hệ thống Monolith & RAG Knowledge Base

#### 📈 1. Phân Tích Doanh Thu & Đơn Hàng
* **Tổng doanh thu hôm nay**: **1,850,000 VND** (Đạt 115% so với mục tiêu ngày).
* **Số đơn hàng đã hoàn thành**: **42 đơn** (Tăng 12% so với hôm qua).
* **Giá trị trung bình mỗi đơn**: **44,047 VND** / đơn.

#### ☕ 2. Sản Phẩm Bán Chạy & Khung Giờ Cao Điểm
* **Món bán chạy nhất**: **Trà Đào Sả TV FOOD** (18 cốc) & **Phở Bò Tày Đặc Biệt** (14 tô).
* **Khung giờ cao điểm**: Từ **11:30 - 13:30** (Chiếm 62% tổng lượng khách) và **18:00 - 20:00**.

#### ⚠️ 3. Cảnh Báo Vận Hành & Kiến Nghị
* **Thời gian chờ chế biến tại Bếp**: Trung bình 18 phút/món. Khuyến nghị tăng thêm nhân sự bếp 11:00 - 14:00.
* **Tỷ lệ thanh toán Bank Transfer**: Đạt **74%**, giảm thiểu chi phí tiền mặt thủ công.
* **Gợi ý khuyến mại**: Đẩy mạnh bán kèm bánh ngọt khung giờ 14:30 - 16:30.`;

export function ManagerDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('metrics');
  const [occupiedTables, setOccupiedTables] = useState<Table[]>([]);
  const [orderItems, setOrderItems] = useState<KitchenOrderItem[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiReportOutput, setAiReportOutput] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    const [tablesRes, ordersRes] = await Promise.all([
      tableService.getTables({ status: 'Occupied' }),
      kitchenService.getOrderItems(),
    ]);
    if (tablesRes.success) setOccupiedTables(tablesRes.data);
    if (ordersRes.success) setOrderItems(ordersRes.data);
  }, []);

  useEffect(() => {
    loadData();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [loadData]);

  const pendingCount = orderItems.filter(i => i.status === 'Pending' || i.status === 'Preparing').length;

  const generateAiReport = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsGeneratingReport(true);
    setAiReportOutput('');
    let i = 0;
    intervalRef.current = setInterval(() => {
      setAiReportOutput(prev => prev + AI_REPORT_TEXT.charAt(i));
      i++;
      if (i >= AI_REPORT_TEXT.length) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setIsGeneratingReport(false);
      }
    }, 10);
  };

  return (
    <div className="manager-panel-layout">
      <div className="manager-tabs-bar">
        <button className={`manager-tab-btn ${activeTab === 'metrics' ? 'active' : ''}`} onClick={() => setActiveTab('metrics')}>
          <TrendingUp size={16} /> Tổng Quan Doanh Số
        </button>
        <button className={`manager-tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          <ShoppingBag size={16} /> Giám Sát Đơn Hàng Realtime
        </button>
        <button className={`manager-tab-btn ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}>
          <Send size={16} /> AI Assistant Operational Report
        </button>
      </div>

      {activeTab === 'metrics' && (
        <div className="manager-tab-content active-metrics">
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
                <h3>{occupiedTables.length} Bàn</h3>
              </div>
            </div>
            <div className="metric-card-box">
              <div className="metric-icon bg-yellow-light"><Clock size={20} /></div>
              <div className="metric-info">
                <span>Món Đang Chờ Bếp</span>
                <h3>{pendingCount} Món</h3>
              </div>
            </div>
          </div>

          <div className="chart-seller-grid">
            <div className="chart-box-card">
              <h3>Lượng Đơn Hàng Theo Giờ</h3>
              <div className="css-bar-chart">
                {HOURLY_CHART.map(({ label, h, peak }) => (
                  <div key={label} className="chart-bar-container">
                    <div className={`chart-bar-fill${peak ? ' highlight-primary' : ''}`} style={{ height: `${h}%` }}></div>
                    <span className="bar-label">{label}</span>
                  </div>
                ))}
              </div>
              <span className="chart-legend-text">* Khung giờ 12:00 và 19:00 là thời điểm lượng khách tập trung đông nhất trong ngày.</span>
            </div>

            <div className="seller-box-card">
              <h3>Sản Phẩm Bán Chạy Nhất</h3>
              <div className="seller-items-list">
                {TOP_SELLERS.map(({ name, desc, count }) => (
                  <div key={name} className="seller-item-row">
                    <div className="seller-item-details">
                      <strong>{name}</strong>
                      <span>{desc}</span>
                    </div>
                    <span className="seller-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
                {orderItems.length === 0 ? (
                  <tr><td colSpan={6} className="empty-invoice-row">Không có đơn hàng nào.</td></tr>
                ) : (
                  orderItems.map(item => (
                    <tr key={item.id}>
                      <td><strong>{item.orderCode}</strong></td>
                      <td>{item.tableNumber}</td>
                      <td>{item.menuItemName}</td>
                      <td>x{item.quantity}</td>
                      <td>
                        <span className={`status-pill pill-${item.status.toLowerCase()}`}>
                          {item.status === 'Pending' && 'Chờ chế biến'}
                          {item.status === 'Preparing' && 'Đang nấu'}
                          {item.status === 'Ready' && 'Đã nấu chín'}
                          {item.status === 'Served' && 'Đã phục vụ'}
                          {item.status === 'Cancelled' && 'Đã huỷ'}
                        </span>
                      </td>
                      <td>{new Date(item.createdAt).toLocaleTimeString('vi-VN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <button className="btn btn-tertiary" style={{ marginTop: 8 }} onClick={loadData}>
            <RefreshCw size={14} /> Làm Mới
          </button>
        </div>
      )}

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
  );
}
