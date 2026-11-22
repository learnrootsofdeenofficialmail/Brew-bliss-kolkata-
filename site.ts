// Business details and booking rules. Replace the placeholders before going live.
export const site = {
  name: 'Brew & Bliss',
  address: 'Salt Lake, Bidhannagar, Kolkata, West Bengal 700091, India',
  phoneDisplay: '+91 XXXXX XXXXX', // TODO: replace with the live number
  phoneTel: '+91XXXXXXXXXX', // TODO: same number, digits only (used for tap-to-call)
  whatsappNumber: '', // optional: country code + number, digits only, e.g. 919876543210
  hours: 'Daily · 11:00 AM – 11:00 PM', // TODO: confirm
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Salt+Lake+Bidhannagar+Kolkata',
  instagramUrl: '', // optional, e.g. https://instagram.com/yourhandle
};

export const booking = {
  times: ['12:00 PM', '1:00 PM', '2:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'],
  maxGuests: 10,
  maxDaysAhead: 90,
  maxRequestsPerHour: 5, // per phone number, applies to reservations and orders
};

/** Today's date as YYYY-MM-DD in India Standard Time (UTC+5:30). */
export function istToday(): string {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
