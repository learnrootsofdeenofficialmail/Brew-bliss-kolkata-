import { useState, type FormEvent } from 'react';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import Modal from './Modal';
import { postJson } from '../lib/api';
import { menuById } from '../../shared/menu';
import type { OrderResponse, OrderType } from '../../shared/types';

type Props = {
  cart: Record<string, number>;
  onQty: (id: string, qty: number) => void;
  onPlaced: () => void;
  onClose: () => void;
};

export default function CartModal({ cart, onQty, onPlaced, onClose }: Props) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<OrderResponse | null>(null);

  const lines = Object.entries(cart).flatMap(([id, qty]) => {
    const item = menuById.get(id);
    return item ? [{ item, qty }] : [];
  });
  const total = lines.reduce((sum, line) => sum + line.item.price * line.qty, 0);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const field = (key: string) => String(data.get(key) ?? '');

    setSending(true);
    setError('');
    try {
      const res = await postJson<OrderResponse>('/api/orders', {
        name: field('name'),
        phone: field('phone'),
        orderType: field('orderType') as OrderType,
        notes: field('notes'),
        website: field('website'), // honeypot, must stay empty
        items: lines.map((line) => ({ id: line.item.id, qty: line.qty })),
      });
      setResult(res);
      onPlaced();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (result) {
    return (
      <Modal onClose={onClose}>
        <p className="eyebrow">ORDER PLACED</p>
        <h2>
          Thank <em>you!</em>
        </h2>
        <p className="modal-intro">
          Your order <b>{result.reference}</b> for ₹{result.total} has been received. Our team will confirm it shortly.
        </p>
        <button className="reserve submit" onClick={onClose}>
          Back to the menu
        </button>
      </Modal>
    );
  }

  if (lines.length === 0) {
    return (
      <Modal onClose={onClose}>
        <p className="eyebrow">YOUR ORDER</p>
        <h2>
          Nothing <em>yet</em>
        </h2>
        <p className="modal-intro">Add a few dishes from the menu and they will appear here.</p>
        <button className="reserve submit" onClick={onClose}>
          Browse the menu
        </button>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <p className="eyebrow">YOUR ORDER</p>
      <h2>
        Review <em>&amp; send</em>
      </h2>

      <ul className="order-lines">
        {lines.map(({ item, qty }) => (
          <li key={item.id} className="order-line">
            <div>
              <b className="order-name">{item.name}</b>
              <small className="order-meta">₹{item.price} each</small>
            </div>
            <div className="qty">
              <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => onQty(item.id, qty - 1)}>
                <Minus size={13} />
              </button>
              <span>{qty}</span>
              <button type="button" aria-label={`Add one ${item.name}`} onClick={() => onQty(item.id, qty + 1)}>
                <Plus size={13} />
              </button>
            </div>
            <b className="order-sub">₹{item.price * qty}</b>
          </li>
        ))}
      </ul>

      <div className="order-total">
        <span>Total</span>
        <b>₹{total}</b>
      </div>

      <form onSubmit={submit}>
        <label>
          Your name
          <input name="name" required maxLength={80} placeholder="Enter your name" />
        </label>
        <label>
          Phone number
          <input name="phone" required type="tel" placeholder="+91 98765 43210" />
        </label>
        <label>
          Pickup or dine-in
          <select name="orderType" defaultValue="takeaway">
            <option value="takeaway">Takeaway</option>
            <option value="dine_in">Dine-in</option>
          </select>
        </label>
        <label>
          Notes (optional)
          <input name="notes" maxLength={300} placeholder="Less spicy, no onion…" />
        </label>

        <div className="hp-field" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button className="reserve submit" type="submit" disabled={sending}>
          {sending ? 'Placing order…' : `Place order · ₹${total}`} <ArrowRight size={16} />
        </button>
        <small className="form-note">Prices are indicative. Our team will confirm your order and the final amount.</small>
      </form>
    </Modal>
  );
}
