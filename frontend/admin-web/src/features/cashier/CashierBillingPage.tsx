import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Check, Banknote, Landmark } from 'lucide-react';
import { billingService } from '../../services/billingService';
import { tableService } from '../../services/tableService';
import type { InvoicePreview, PaymentMethod, Table } from '../../types';
import type { Invoice } from '../../services/billingService';

export function CashierBillingPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [sessionToken, setSessionToken] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [preview, setPreview] = useState<InvoicePreview | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paidInvoice, setPaidInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTables = useCallback(async () => {
    const res = await tableService.getTables({ status: 'Occupied' });
    if (res.success) setTables(res.data);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadTables);
  }, [loadTables]);

  const handleLookupSession = async () => {
    setError(null);
    setLoading(true);
    const res = await billingService.getSessionByToken(sessionToken.trim());
    setLoading(false);
    if (!res.success) { setError(res.error.message); return; }
    setSessionId(res.data.id);
    await handleLoadPreview(res.data.id);
  };

  const handleLoadPreview = async (sid: string) => {
    setError(null);
    setLoading(true);
    const res = await billingService.getInvoicePreview(sid);
    setLoading(false);
    if (!res.success) { setError(res.error.message); return; }
    setPreview(res.data);
    setPaidInvoice(null);
  };

  const handlePay = async () => {
    if (!sessionId) return;
    setError(null);
    setLoading(true);
    const res = await billingService.createInvoice(sessionId, paymentMethod);
    setLoading(false);
    if (!res.success) { setError(res.error.message); return; }
    setPaidInvoice(res.data);
    setPreview(null);
    loadTables();
  };

  const handleReset = () => {
    setSelectedTable(null);
    setSessionToken('');
    setSessionId('');
    setPreview(null);
    setPaidInvoice(null);
    setError(null);
  };

  return (
    <div className="cashier-panel-layout">
      {/* Left: Occupied tables */}
      <div className="occupied-tables-sidebar">
        <div className="sidebar-title-box">
          <h2>Bàn Đang Hoạt Động</h2>
          <p>Chọn bàn để thanh toán.</p>
        </div>
        <div className="occupied-tables-scroll">
          {tables.length === 0 ? (
            <div className="empty-box-inline">Không có bàn nào đang có khách.</div>
          ) : (
            tables.map(t => (
              <div
                key={t.id}
                className={`occupied-table-tile ${selectedTable?.id === t.id ? 'active' : ''}`}
                onClick={() => { setSelectedTable(t); handleReset(); setSelectedTable(t); }}
              >
                <div className="occupied-tile-meta">
                  <strong>{t.tableNumber}</strong>
                  <span>{t.areaName}</span>
                </div>
                <span>›</span>
              </div>
            ))
          )}
        </div>
        <button className="btn btn-tertiary" style={{ margin: '8px' }} onClick={loadTables}>
          <RefreshCw size={14} /> Làm Mới
        </button>
      </div>

      {/* Right: Invoice / payment */}
      <div className="billing-bill-section">
        {!selectedTable ? (
          <div className="control-cardempty">
            <h3>Chưa Chọn Bàn</h3>
            <p>Nhấp chọn bàn từ danh sách bên trái.</p>
          </div>
        ) : paidInvoice ? (
          <div className="invoice-box-card">
            <div className="success-toast-message">
              <Check size={16} /> Thanh toán thành công! Hóa đơn: {paidInvoice.invoiceCode}
            </div>
            <p>Tổng: <strong>{paidInvoice.totalAmount.toLocaleString('vi-VN')}đ</strong></p>
            <p>Phương thức: {paidInvoice.paymentMethod}</p>
            <button className="btn btn-primary" onClick={handleReset}>Chọn Bàn Khác</button>
          </div>
        ) : (
          <div className="invoice-box-card">
            <div className="invoice-header">
              <h3>Bàn: {selectedTable.tableNumber}</h3>
            </div>

            {!preview ? (
              <div style={{ padding: '16px 0' }}>
                <p style={{ marginBottom: 8 }}>Nhập Session Token (từ QR code hoặc phiên bàn):</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="form-input"
                    placeholder="Session token..."
                    value={sessionToken}
                    onChange={e => setSessionToken(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLookupSession()}
                  />
                  <button className="btn btn-primary" onClick={handleLookupSession} disabled={loading || !sessionToken.trim()}>
                    {loading ? '...' : 'Tải Hóa Đơn'}
                  </button>
                </div>
                {error && <p className="error-message">{error}</p>}
              </div>
            ) : (
              <>
                <div className="invoice-table-container">
                  <table className="invoice-data-table">
                    <thead>
                      <tr><th>Món</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr>
                    </thead>
                    <tbody>
                      {preview.items.map((item, i) => (
                        <tr key={i}>
                          <td>{item.menuItemName}</td>
                          <td>x{item.quantity}</td>
                          <td>{item.unitPrice.toLocaleString('vi-VN')}đ</td>
                          <td>{item.subtotal.toLocaleString('vi-VN')}đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="invoice-price-summary">
                  <div className="summary-row"><span>Tạm tính:</span><span>{preview.subtotal.toLocaleString('vi-VN')}đ</span></div>
                  <div className="summary-row"><span>Giảm giá:</span><span>-{preview.discount.toLocaleString('vi-VN')}đ</span></div>
                  <div className="summary-row grand-total-row"><span>Tổng cộng:</span><span>{preview.totalAmount.toLocaleString('vi-VN')}đ</span></div>
                </div>

                <div className="payment-method-selector-box">
                  <span className="form-label">Phương thức:</span>
                  <div className="payment-methods-grid">
                    {(['Cash', 'BankTransfer'] as PaymentMethod[]).map(m => (
                      <button
                        key={m}
                        className={`payment-method-btn ${paymentMethod === m ? 'active' : ''}`}
                        onClick={() => setPaymentMethod(m)}
                      >
                        {m === 'Cash' ? <><Banknote size={14} /> Tiền Mặt</> : <><Landmark size={14} /> Chuyển Khoản</>}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="error-message">{error}</p>}

                <div className="invoice-actions-footer">
                  <button className="btn btn-primary w-full" onClick={handlePay} disabled={loading}>
                    {loading ? 'Đang xử lý...' : <><Check size={16} /> Xác Nhận Thanh Toán</>}
                  </button>
                  <button className="btn btn-tertiary" onClick={handleReset} style={{ marginTop: 8 }}>
                    Hủy
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
