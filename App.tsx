import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, Clock3, Coffee, Instagram, MapPin, Menu as MenuIcon, Phone, Play, Plus, ShoppingBag, Star, X } from 'lucide-react';
import { categories, menu, photos, type MenuItem } from '../shared/menu';
import { site } from '../shared/site';
import BookingModal from './components/BookingModal';
import CartModal from './components/CartModal';
import './features.css';

const filters = ['All', ...categories];
const gallery = [photos.interior, photos.paneer, photos.drinks, photos.biryani, photos.curry, photos.dessert, photos.dal, photos.interior];
const navLinks: [string, string][] = [
  ['Home', '#home'],
  ['Our Menu', '#menu'],
  ['About', '#about'],
  ['Gallery', '#gallery'],
  ['Reviews', '#reviews'],
  ['Contact', '#contact'],
];
// Sample testimonials for layout only. Replace with real reviews, then remove the disclaimer below.
const reviews: [string, string][] = [
  ['Rohan Mehta', '“Amazing food and a genuinely cosy ambience. A lovely evening out.”'],
  ['Priya Sharma', '“The flavours are balanced and the service is attentive. Will visit again.”'],
  ['Aman Verma', '“A comfortable place for family dinners. The biryani was excellent.”'],
];
const MAX_QTY = 20;

function Logo() {
  return (
    <a className="brand" href="#home">
      <span className="brand-mark">
        <Coffee size={29} />
      </span>
      <span>
        <b>{site.name}</b>
        <small>R E S T A U R A N T</small>
      </span>
    </a>
  );
}

const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export default function App() {
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const visible = useMemo(() => (category === 'All' ? menu : menu.filter((d) => d.category === category)), [category]);
  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2200);
  };

  const addToCart = (item: MenuItem) => {
    setCart((c) => ({ ...c, [item.id]: Math.min((c[item.id] ?? 0) + 1, MAX_QTY) }));
    flash(`${item.name} added to your order`);
  };

  const setQty = (id: string, qty: number) =>
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(qty, MAX_QTY);
      return next;
    });

  const openBooking = () => {
    setMobileOpen(false);
    setBookingOpen(true);
  };

  return (
    <>
      <header className="header">
        <div className="nav-wrap">
          <Logo />
          <nav className={mobileOpen ? 'nav nav-open' : 'nav'}>
            {navLinks.map(([label, href]) => (
              <a key={label} href={href} onClick={() => setMobileOpen(false)}>
                {label}
              </a>
            ))}
            <button className="nav-reserve" onClick={openBooking}>
              Reserve a Table
            </button>
          </nav>
          <div className="nav-actions">
            <button className="reserve small" onClick={openBooking}>
              Reserve a Table <ArrowRight size={15} />
            </button>
            <button className="cart-btn" onClick={() => setCartOpen(true)} aria-label="View your order">
              <ShoppingBag size={15} /> <strong className="cart-label">Order</strong> <span>{cartCount}</span>
            </button>
            <button className="mobile-toggle" aria-label="Toggle menu" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-image" />
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow">
              INDIAN CUISINE <i /> GREAT VIBES
            </p>
            <h1>
              Good Food.
              <br />
              <em>Better Mood.</em>
            </h1>
            <p className="hero-copy">Experience the perfect blend of taste, ambience and hospitality at {site.name}.</p>
            <div className="hero-buttons">
              <button className="reserve" onClick={openBooking}>
                Reserve a Table <ArrowRight size={16} />
              </button>
              <a className="video-link" href="#about">
                <span>
                  <Play size={15} />
                </span>{' '}
                Discover our story
              </a>
            </div>
          </div>
          <div className="hero-note">
            <span>01</span>
            <div>
              <b>Made with care</b>
              <small>Every plate tells a story</small>
            </div>
          </div>
        </section>

        <section className="features">
          <div>
            <span>✧</span>
            <p>
              <b>Authentic Indian</b>
              <small>Flavours</small>
            </p>
          </div>
          <div>
            <span>♧</span>
            <p>
              <b>Cozy Ambience</b>
              <small>For every occasion</small>
            </p>
          </div>
          <div>
            <span>❋</span>
            <p>
              <b>Premium Ingredients</b>
              <small>Thoughtfully sourced</small>
            </p>
          </div>
          <div>
            <span>♡</span>
            <p>
              <b>Warm Hospitality</b>
              <small>Always welcoming</small>
            </p>
          </div>
        </section>

        <section className="section menu-section" id="menu">
          <div className="section-head">
            <p className="eyebrow">A TASTE TO REMEMBER</p>
            <h2>
              Explore Our <em>Menu</em>
            </h2>
            <p>Comforting classics, thoughtful twists and flavours worth sharing.</p>
          </div>
          <div className="filters">
            {filters.map((c) => (
              <button key={c} className={category === c ? 'filter active' : 'filter'} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="menu-grid">
            {visible.map((d) => (
              <article className="dish-card" key={d.id}>
                <div className="dish-photo">
                  <img src={d.image} alt={d.name} loading="lazy" />
                  {d.tag && <span className="tag">{d.tag}</span>}
                  <button className="add-btn" aria-label={`Add ${d.name}`} onClick={() => addToCart(d)}>
                    <Plus size={17} />
                  </button>
                </div>
                <div className="dish-info">
                  <div>
                    <h3>{d.name}</h3>
                    <p>{d.description}</p>
                  </div>
                  <b className="price">₹{d.price}</b>
                </div>
              </article>
            ))}
          </div>
          <p className="menu-foot">Prices are indicative and may change. Please tell us about any allergies when you order.</p>
        </section>

        <section className="about-section" id="about">
          <div className="about-photo">
            <img src={photos.interior} alt="Warm restaurant dining room" loading="lazy" />
            <div className="photo-caption">
              <span>THE BREW & BLISS EXPERIENCE</span>
              <b>Good food, good company.</b>
            </div>
          </div>
          <div className="about-copy">
            <p className="eyebrow">OUR STORY</p>
            <h2>
              A place where
              <br />
              <em>food brings people</em>
              <br />
              together.
            </h2>
            <p>
              At Brew & Bliss, we believe a meal is more than just food. It is a chance to slow down, share stories and make memories. Our kitchen
              brings familiar Indian flavours to the table with care, fresh ingredients and a modern touch.
            </p>
            <p>Whether it is a quick catch-up, a family dinner or a little celebration, there is always a place for you here.</p>
            <button className="text-link" onClick={() => scrollToId('contact')}>
              Find us in Salt Lake <ArrowRight size={16} />
            </button>
          </div>
        </section>

        <section className="stats">
          <div>
            <b>
              5<span>+</span>
            </b>
            <small>Years of passion</small>
          </div>
          <div>
            <b>
              50K<span>+</span>
            </b>
            <small>Happy moments</small>
          </div>
          <div>
            <b>
              4.8<Star size={17} fill="currentColor" />
            </b>
            <small>Guest love*</small>
          </div>
        </section>

        <section className="section gallery-section" id="gallery">
          <div className="section-head">
            <p className="eyebrow">A GLIMPSE INSIDE</p>
            <h2>
              Our <em>Gallery</em>
            </h2>
            <p>From the first pour to the last bite.</p>
          </div>
          <div className="gallery-grid">
            {gallery.map((src, i) => (
              <div className="gallery-item" key={i}>
                <img src={src} alt={`${site.name} food and ambience ${i + 1}`} loading="lazy" />
              </div>
            ))}
          </div>
        </section>

        <section className="review-section" id="reviews">
          <div className="section-head">
            <p className="eyebrow">KIND WORDS</p>
            <h2>
              What our guests <em>say</em>
            </h2>
            <p>We aim to make every visit a memorable one.</p>
          </div>
          <div className="review-grid">
            {reviews.map(([name, quote]) => (
              <article className="review-card" key={name}>
                <div className="stars">★★★★★</div>
                <p>{quote}</p>
                <b>{name}</b>
                <small>Guest feedback</small>
              </article>
            ))}
          </div>
          <p className="disclaimer">*Sample testimonials and rating shown for layout preview. Replace with verified customer reviews before publishing.</p>
        </section>

        <section className="reservation-band">
          <div>
            <p className="eyebrow">YOUR TABLE IS WAITING</p>
            <h2>
              Make time for <em>something delicious.</em>
            </h2>
            <p>Plan your next meal at {site.name}, Salt Lake.</p>
          </div>
          <button className="reserve" onClick={openBooking}>
            Request a Table <ArrowRight size={16} />
          </button>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-copy">
            <p className="eyebrow">COME SAY HELLO</p>
            <h2>
              Contact <em>Us</em>
            </h2>
            <p className="contact-intro">Questions, celebrations or just a craving? Get in touch.</p>
            <div className="contact-line">
              <MapPin />
              <div>
                <b>Our location</b>
                <p>{site.address}</p>
              </div>
            </div>
            <div className="contact-line">
              <Phone />
              <div>
                <b>Call us</b>
                <p>
                  <a href={`tel:${site.phoneTel}`}>{site.phoneDisplay}</a>
                </p>
              </div>
            </div>
            <div className="contact-line">
              <Clock3 />
              <div>
                <b>Opening hours</b>
                <p>{site.hours}</p>
              </div>
            </div>
            <a className="text-link" target="_blank" rel="noreferrer" href={site.mapsUrl}>
              Open in Maps <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="map-panel">
            <div className="map-grid" />
            <div className="map-pin">
              <MapPin size={27} fill="currentColor" />
              <b>{site.name}</b>
              <small>Salt Lake · Kolkata</small>
            </div>
            <a target="_blank" rel="noreferrer" href={site.mapsUrl}>
              Explore map <ArrowUpRight size={14} />
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-top">
          <Logo />
          <p>
            Good food. Better mood.
            <br />
            A little more bliss in every bite.
          </p>
          <div className="socials">
            {site.instagramUrl && (
              <a href={site.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram />
              </a>
            )}
            <a href={`tel:${site.phoneTel}`} aria-label="Call us">
              <Phone />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </span>
          <span>Salt Lake, Kolkata, India</span>
          <a href="#home">Back to top ↑</a>
        </div>
      </footer>

      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
      {bookingOpen && <BookingModal onClose={() => setBookingOpen(false)} />}
      {cartOpen && <CartModal cart={cart} onQty={setQty} onPlaced={() => setCart({})} onClose={() => setCartOpen(false)} />}
    </>
  );
}
