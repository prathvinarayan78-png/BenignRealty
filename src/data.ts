export type Property = {
  id: number;
  title: string;
  location: string;
  area: string;
  category: "Residential" | "Commercial";
  type: string;
  image: string;
  size: string;
  configuration: string;
  budget: number;
  description: string;
};

// Illustrative concepts, not verified inventory. Replace with approved listings before launch.
export const properties: Property[] = [
  {
    id: 1,
    title: "The park-side perspective",
    location: "Greater Kailash II",
    area: "South Delhi",
    category: "Residential",
    type: "Builder floor",
    image: "/images/residence-interior.webp",
    size: "2,700 sq. ft.",
    configuration: "4 bedrooms",
    budget: 5,
    description:
      "Imagine slow mornings, generous living spaces and a green outlook. This concept captures the appeal of an independent builder floor in Greater Kailash II, close to neighbourhood cafés and everyday essentials.",
  },
  {
    id: 2,
    title: "Room for a remarkable life",
    location: "Vasant Vihar",
    area: "South Delhi",
    category: "Residential",
    type: "Independent home",
    image: "/images/villa.webp",
    size: "5,400 sq. ft.",
    configuration: "5 bedrooms",
    budget: 12,
    description:
      "A vision of private, multigenerational living: expansive interiors, landscaped outdoor spaces and room to make your own. Explore independent home requirements in one of South Delhi’s established neighbourhoods.",
  },
  {
    id: 3,
    title: "A new outlook on business",
    location: "Aerocity",
    area: "New Delhi",
    category: "Commercial",
    type: "Office space",
    image: "/images/commercial.webp",
    size: "3,200 sq. ft.",
    configuration: "Office space",
    budget: 7,
    description:
      "A workplace concept for a business with ambition. Think flexible floor plates, contemporary architecture and connectivity to the airport. Share your requirements to explore suitable spaces around Aerocity.",
  },
  {
    id: 4,
    title: "Everyday, elevated",
    location: "Dwarka",
    area: "West Delhi",
    category: "Residential",
    type: "Apartment",
    image: "/images/hero-residence.webp",
    size: "1,850 sq. ft.",
    configuration: "3 bedrooms",
    budget: 2.5,
    description:
      "A considered apartment concept with light-filled rooms and useful outdoor space. Explore a home brief in Dwarka, balancing neighbourhood convenience with space for family life.",
  },
  {
    id: 5,
    title: "A little closer to everything",
    location: "Defence Colony",
    area: "South Delhi",
    category: "Residential",
    type: "Builder floor",
    image: "/images/residence-interior.webp",
    size: "2,900 sq. ft.",
    configuration: "4 bedrooms",
    budget: 6.5,
    description:
      "An independent floor concept in an established South Delhi neighbourhood. A starting point for a home search that values a lively local market, generous proportions and a personal sense of place.",
  },
  {
    id: 6,
    title: "Space for your next chapter",
    location: "Gurugram",
    area: "Delhi NCR",
    category: "Commercial",
    type: "Office space",
    image: "/images/commercial.webp",
    size: "4,500 sq. ft.",
    configuration: "Office space",
    budget: 9,
    description:
      "A commercial concept for growing teams in Gurugram. Discuss your preferred business district, fit-out needs and move-in timeline to shape a more relevant search.",
  },
];

export const services = [
  {
    title: "Residential real estate",
    short: "Homes with a sense of belonging.",
    text: "From independent floors in South Delhi to family apartments in Dwarka, we begin with how you want to live. We help you define your brief, compare neighbourhoods and navigate your next move.",
    tags: ["Buy a home", "Find a rental", "Sell your property"],
    image: "/images/residence-interior.webp",
  },
  {
    title: "Commercial spaces",
    short: "The right space for your ambition.",
    text: "Find a setting that works as hard as your business. Explore offices, retail and commercial opportunities across Delhi and NCR, with a clear focus on location, connectivity and your practical needs.",
    tags: ["Office leasing", "Retail spaces", "Commercial sales"],
    image: "/images/commercial.webp",
  },
  {
    title: "Investment advisory",
    short: "A clearer view of what comes next.",
    text: "Look beyond the brochure. We help you compare locations, understand asking prices and ask the right questions about documentation and long-term suitability. Independent legal and financial advice remains essential.",
    tags: ["Location insights", "Portfolio planning", "Property comparison"],
    image: "/images/villa.webp",
  },
];
