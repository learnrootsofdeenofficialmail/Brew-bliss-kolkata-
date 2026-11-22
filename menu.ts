export const categories = ['Starters', 'Main Course', 'Beverages', 'Desserts'] as const;
export type Category = (typeof categories)[number];

export type MenuItem = {
  id: string; // stable ID: saved orders reference it, so keep it unchanged once live
  name: string;
  category: Category;
  price: number; // whole rupees (INR)
  description: string;
  image: string;
  tag?: string;
};

const unsplash = (id: string, width = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=85`;

// Replace with licensed photos of your own restaurant before launch.
export const photos = {
  interior: unsplash('1517248135467-4c7edcad34c4', 1200),
  paneer: unsplash('1567188040759-fb8a883dc6d8'),
  curry: unsplash('1603894584373-5ac82b2ae398'),
  biryani: unsplash('1563379091339-03246963d96c'),
  dosa: unsplash('1630383249896-424e482df921'),
  dal: unsplash('1546833999-b9f581a1996d'),
  dessert: unsplash('1587314168485-3236d6710814'),
  drinks: unsplash('1544145945-f90425340c7e'),
};

export const menu: MenuItem[] = [
  { id: 'paneer-tikka', name: 'Paneer Tikka', category: 'Starters', price: 349, description: 'Smoky tandoor-grilled paneer, peppers and mint chutney.', image: photos.paneer, tag: 'Guest favourite' },
  { id: 'butter-chicken', name: 'Butter Chicken', category: 'Main Course', price: 499, description: 'Slow-simmered tomato makhani gravy with tender chicken.', image: photos.curry },
  { id: 'veg-dum-biryani', name: 'Veg Dum Biryani', category: 'Main Course', price: 399, description: 'Fragrant basmati, seasonal vegetables and house biryani masala.', image: photos.biryani },
  { id: 'masala-dosa', name: 'Masala Dosa', category: 'Starters', price: 299, description: 'Crisp rice-lentil crepe with spiced potato and sambar.', image: photos.dosa },
  { id: 'dal-makhani', name: 'Dal Makhani', category: 'Main Course', price: 349, description: 'Black lentils simmered overnight with a touch of cream.', image: photos.dal },
  { id: 'gulab-jamun', name: 'Gulab Jamun', category: 'Desserts', price: 199, description: 'Warm khoya dumplings finished in cardamom syrup.', image: photos.dessert },
  { id: 'mango-cooler', name: 'Mango Cooler', category: 'Beverages', price: 179, description: 'A bright, chilled seasonal mango and lime cooler.', image: photos.drinks },
  { id: 'tandoori-platter', name: 'Tandoori Platter', category: 'Starters', price: 549, description: 'A shareable selection from our clay oven.', image: photos.paneer },
  { id: 'masala-chai', name: 'Classic Masala Chai', category: 'Beverages', price: 99, description: 'Freshly brewed tea with ginger and warming spices.', image: photos.drinks },
];

export const menuById = new Map<string, MenuItem>(menu.map((item): [string, MenuItem] => [item.id, item]));
