import { useState, type FormEvent } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import Modal from './Modal';
import { postJson } from '../lib/api';
import { booking, istToday, site } from '../../shared/site';
import type { ReservationResponse } from '../../shared/types';

type Props = { onClose: () => void };

export default function BookingModal({ onClose }: Props) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const field = (key: string) => String(data.get(key) ?? '');

    setSending(true);
    setError('');
    try {
      const res = await postJson<ReservationResponse>('/api/reservations', {
        name: field('name'),
        phone: field('phone'),
        date: field('date'),
        time: field('time'),
        guests: field('guests'),
        notes: field('notes'),
        website: field('website'), // honeypot, must stay empty
      });
      setReference(res.reference);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (reference) {
    return (
      <Modal onClose={onClose}>
        <p className="eyebrow">THANK YOU</p>
        <h2>
          Request <em>received</em>
        </h2>
        <p className="modal-intro">
          We'll confirm your table on the phone number you shared. Your reference is <b>{reference}</b>.
        </p>
        <button className="reserve submit" onClick={onClose}>
          Done
        </button>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <p className="eyebrow">LET'S MAKE IT A DATE</p>
      <h2>
        Request a <em>Table</em>
      </h2>
      <p className="modal-intro">Share your details and we'll confirm your visit.</p>

      <form onSubmit={submit}>
        <label>
          Your name
          <input name="name" required maxLength={80} placeholder="Enter your name" />
        </label>
        <label>
          Phone number
          <input name="phone" required type="tel" placeholder="+91 98765 43210" />
        </label>
        <div className="form-row">
          <label>
            Date
            <input name="date" required type="date" min={istToday()} />
          </label>
          <label>
            Time
            <select name="time" required defaultValue="">
              <option value="" disabled>
                Select time
              </option>
              {booking.times.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Number of guests
          <select name="guests" defaultValue="2">
            {Array.from({ length: booking.maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <label>
          Special requests (optional)
          <input name="notes" maxLength={300} placeholder="Birthday, high chair, window seat…" />
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
          {sending ? 'Sending…' : 'Send request'} <ArrowRight size={16} />
        </button>

        {site.whatsappNumber && (
          <a
            className="form-alt"
            target="_blank"
            rel="noreferrer"
            href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello! I'd like to request a table.")}`}
          >
            <MessageCircle size={14} /> Prefer WhatsApp? Message us
          </a>
        )}
        <small className="form-note">Your request is saved and our team will confirm it. A table is not guaranteed until confirmed.</small>
      </form>
    </Modal>
  );
}
