import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { reservationService, type ReservationResult } from '../../services/reservationService';

interface Props {
  triggerToast: (msg: string) => void;
}

export function ReservationPage({ triggerToast }: Props) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [reservationTime, setReservationTime] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReservationResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !reservationTime) return;
    setSubmitting(true);
    setError(null);

    const res = await reservationService.create({ customerName, phone, guestCount, reservationTime, note: note || undefined });
    setSubmitting(false);

    if (!res.success) {
      setError(res.error?.message ?? 'Đặt bàn thất bại.');
      return;
    }
    setResult(res.data as ReservationResult);
    triggerToast('Đặt bàn thành công!');
  };

  const handleReset = () => {
    setResult(null);
    setCustomerName('');
    setPhone('');
    setGuestCount(2);
    setReservationTime('');
    setNote('');
  };

  if (result) {
    return (
      <div className="reservation-success">
        <CheckCircle size={48} className="success-icon" />
        <h2>Đặt Bàn Thành Công!</h2>
        <div className="reservation-receipt">
          <p><strong>Mã đặt bàn:</strong> {result.reservationCode}</p>
          <p><strong>Họ tên:</strong> {customerName}</p>
          <p><strong>Số điện thoại:</strong> {phone}</p>
          <p><strong>Số khách:</strong> {guestCount} người</p>
          <p><strong>Thời gian:</strong> {new Date(reservationTime).toLocaleString('vi-VN')}</p>
          {note && <p><strong>Ghi chú:</strong> {note}</p>}
          <p className="status-badge">Trạng thái: {result.status}</p>
        </div>
        <button className="btn btn-secondary" onClick={handleReset}>Đặt Bàn Khác</button>
      </div>
    );
  }

  return (
    <div className="reservation-page">
      <h2>Đặt Bàn Trước</h2>
      <p className="page-subtitle">Điền thông tin để đặt bàn — nhân viên sẽ xác nhận trong ít phút.</p>

      <form className="reservation-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Họ và tên</label>
          <input className="form-input" placeholder="Nguyễn Văn A" value={customerName}
            onChange={e => setCustomerName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Số điện thoại</label>
          <input className="form-input" type="tel" placeholder="0901234567" value={phone}
            onChange={e => setPhone(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Số lượng khách</label>
          <div className="qty-row">
            <button type="button" className="qty-btn" onClick={() => setGuestCount(Math.max(1, guestCount - 1))}>−</button>
            <span>{guestCount} người</span>
            <button type="button" className="qty-btn" onClick={() => setGuestCount(guestCount + 1)}>+</button>
          </div>
        </div>
        <div className="form-group">
          <label>Thời gian đặt bàn</label>
          <input className="form-input" type="datetime-local" value={reservationTime}
            onChange={e => setReservationTime(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Ghi chú (tuỳ chọn)</label>
          <textarea className="form-input" rows={3} placeholder="Yêu cầu đặc biệt..." value={note}
            onChange={e => setNote(e.target.value)} />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Bàn'}
        </button>
      </form>
    </div>
  );
}
