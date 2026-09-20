import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type CSSProperties,
} from "react";
import Lenis from "lenis";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  MapPin,
  ChevronDown,
  Plus,
  Minus,
  Heart,
  X,
  Menu,
  Check,
  BedDouble,
  Maximize,
  Building2,
  Download,
  Compass,
  Leaf,
  ShieldCheck,
} from "lucide-react";
import { properties, services, type Property } from "./data";
import { useScrollScenes } from "./useScrollScenes";
import { ScrollJourney } from "./ScrollJourney";
import { Founders } from "./Founders";

type Modal =
  | { kind: "property"; property: Property }
  | { kind: "contact"; interest?: string }
  | { kind: "privacy" }
  | null;
const locationOptions = [
  "Greater Kailash II",
  "Vasant Vihar",
  "Defence Colony",
  "Dwarka",
  "Aerocity",
  "Gurugram",
];

function Brand({ light = false }: { light?: boolean }) {
  return (
    <a
      className={`brand ${light ? "brand-light" : ""}`}
      href="#home"
      aria-label="Benign Realty home"
    >
      <svg
        className="brand-monogram"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <path
          className="brand-letter-b"
          d="M9 8H23C32 8 37 12 37 20C37 28 32 32 23 32H9M23 32C33 32 39 36 39 44C39 52 33 56 23 56H9V8"
        />
        <path
          className="brand-letter-r"
          d="M29 56V8H39C49 8 55 13 55 21C55 29 49 33 39 33H29M39 33L56 56"
        />
      </svg>
      <span className="brand-copy">
        <span className="brand-name">BENIGN</span>
        <span className="brand-descriptor">REALTY</span>
      </span>
    </a>
  );
}

function App() {
  const lenis = useRef<Lenis | null>(null);
  useScrollScenes();
  const menuButton = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [searchLocation, setSearchLocation] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchBudget, setSearchBudget] = useState("");
  const [filters, setFilters] = useState({ location: "", budget: "" });
  const [category, setCategory] = useState("All spaces");
  const [showAll, setShowAll] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useState<number[]>(() => {
    try {
      const value: unknown = JSON.parse(
        localStorage.getItem("benign-saved") || "[]",
      );
      return Array.isArray(value)
        ? value.filter(
            (id): id is number =>
              typeof id === "number" && properties.some((p) => p.id === id),
          )
        : [];
    } catch {
      return [];
    }
  });
  const [activeService, setActiveService] = useState(0);
  const [enquiry, setEnquiry] = useState("");
  const [enquiryUrl, setEnquiryUrl] = useState("");

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setup = () => {
      lenis.current?.destroy();
      lenis.current = new Lenis({
        autoRaf: true,
        smoothWheel: !motion.matches,
        lerp: 0.075,
        anchors: { offset: 0, duration: motion.matches ? 0 : 1.4 },
        stopInertiaOnNavigate: true,
      });
      if (document.body.style.overflow === "hidden") lenis.current.stop();
    };
    setup();
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    motion.addEventListener("change", setup);
    // Optional entrance motion only. CSS keeps every section visible even if
    // this observer is unsupported, delayed, or never delivers a callback.
    const observer =
      typeof window.IntersectionObserver === "function"
        ? new IntersectionObserver(
            (entries) =>
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add("is-visible");
                  observer?.unobserve(entry.target);
                }
              }),
            { threshold: 0, rootMargin: "0px 0px 80px 0px" },
          )
        : null;
    document
      .querySelectorAll("[data-reveal]")
      .forEach((el) => observer?.observe(el));
    return () => {
      lenis.current?.destroy();
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
      motion.removeEventListener("change", setup);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("benign-saved", JSON.stringify(saved));
    } catch {
      /* Saved favourites remain available in memory when storage is disabled. */
    }
  }, [saved]);

  useEffect(() => {
    if (modal) dialog.current?.showModal();
    else dialog.current?.close();
    if (modal || menuOpen) {
      lenis.current?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis.current?.start();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      lenis.current?.start();
    };
  }, [modal, menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeMenu = () => {
      setMenuOpen(false);
      menuButton.current?.focus();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
      if (event.key === "Tab") {
        const items = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".site-header a, .site-header button, #mobile-nav a, #mobile-nav button",
          ),
        ).filter((item) => item.getClientRects().length);
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const onResize = () => {
      if (window.innerWidth > 800) setMenuOpen(false);
    };
    document.querySelector<HTMLElement>("#mobile-nav a")?.focus();
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!enquiry) {
      setEnquiryUrl("");
      return;
    }
    const url = URL.createObjectURL(
      new Blob([enquiry], { type: "text/plain;charset=utf-8" }),
    );
    setEnquiryUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [enquiry]);

  const goTo = (id: string) => {
    setMenuOpen(false);
    lenis.current?.start();
    lenis.current?.scrollTo(id, {
      offset: 0,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : 1.6,
    });
  };
  const openContact = (interest?: string) => {
    setMenuOpen(false);
    setEnquiry("");
    setModal({ kind: "contact", interest });
  };
  const toggleSaved = (id: number) =>
    setSaved((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  const resetFilters = () => {
    setFilters({ location: "", budget: "" });
    setCategory("All spaces");
    setSavedOnly(false);
    setSearchLocation("");
    setSearchType("");
    setSearchBudget("");
  };
  const search = (e: FormEvent) => {
    e.preventDefault();
    setFilters({ location: searchLocation, budget: searchBudget });
    setCategory(searchType || "All spaces");
    setShowAll(true);
    setSavedOnly(false);
    goTo("#properties");
  };
  const filtered = properties.filter(
    (p) =>
      (category === "All spaces" || p.category === category) &&
      (!filters.location || p.location === filters.location) &&
      (!filters.budget ||
        (filters.budget === "under3"
          ? p.budget < 3
          : filters.budget === "3to7"
            ? p.budget >= 3 && p.budget <= 7
            : p.budget > 7)) &&
      (!savedOnly || saved.includes(p.id)),
  );
  const visible = showAll ? filtered : filtered.slice(0, 3);
  const prepareEnquiry = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setEnquiry(
      `BENIGN REALTY — PROPERTY ENQUIRY\n\nName: ${data.get("name")}\nEmail: ${data.get("email")}\nPhone: ${data.get("phone")}\nInterested in: ${data.get("interest")}\n\nRequirements:\n${data.get("message")}\n\nPrepared: ${new Date().toLocaleDateString("en-IN")}\nThis enquiry was prepared locally. It has not been sent to Benign Realty.`,
    );
  };

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="reading-progress" aria-hidden="true" />
      <header
        className={`site-header ${scrolled ? "is-scrolled" : ""} ${menuOpen ? "menu-is-open" : ""}`}
      >
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#about">Our story</a>
          <a href="#properties">Properties</a>
          <a href="#expertise">Our expertise</a>
          <a href="#founders">The founders</a>
          <a href="#delhi">
            Delhi & NCR <span className="nav-dot" />
          </a>
        </nav>
        <div className="header-actions">
          <button className="talk-button" onClick={() => openContact()}>
            Let’s talk{" "}
            <span>
              <ArrowUpRight size={17} />
            </span>
          </button>
          <button
            ref={menuButton}
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {menuOpen && (
        <div
          className="menu-backdrop"
          onClick={() => {
            setMenuOpen(false);
            menuButton.current?.focus();
          }}
          aria-hidden="true"
        />
      )}
      {menuOpen && (
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label="Mobile navigation"
          data-lenis-prevent
        >
          {[
            ["Our story", "#about"],
            ["Properties", "#properties"],
            ["Our expertise", "#expertise"],
            ["The founders", "#founders"],
            ["Delhi & NCR", "#delhi"],
          ].map(([text, link]) => (
            <a
              key={link}
              href={link}
              onClick={(event) => {
                event.preventDefault();
                goTo(link);
              }}
            >
              {text}
              <ArrowUpRight />
            </a>
          ))}
          <button onClick={() => openContact()}>
            Start a conversation <ArrowRight />
          </button>
        </nav>
      )}

      <main id="main" inert={menuOpen}>
        <div className="hero-scroll" id="home">
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-visual">
              <img
                className="hero-image"
                src="/images/hero-residence.webp"
                alt="Architectural concept of a sculptural ivory residence with sweeping balconies and green terraces"
                fetchPriority="high"
              />
              <div className="hero-wash" />
            </div>
            <div className="hero-content">
              <div className="eyebrow hero-eyebrow">
                <span className="little-line" /> DISTINCTIVE SPACES. DELHI &
                NCR.
              </div>
              <h1 id="hero-title">
                A better address.
                <br />A finer way
                <br />
                of{" "}
                <span className="life-word">
                  life.
                  <svg viewBox="0 0 160 22" aria-hidden="true">
                    <path d="M3 15C44 4 103 2 153 8M14 20c44-9 82-9 116-8" />
                  </svg>
                </span>
              </h1>
              <p>
                Extraordinary homes. Exceptional opportunities.
                <br />
                Real estate, with you at the heart of it.
              </p>
              <a className="primary-button" href="#properties">
                Find your space <ArrowUpRight size={19} />
              </a>
              <div className="hero-location">
                <MapPin size={14} />
                <span>Rooted in Delhi. Designed around you.</span>
              </div>
            </div>
            <div className="visual-caption">
              <span className="caption-cross">+</span> A NEW PERSPECTIVE ON
              LIVING
              <span>Architectural vision / 01</span>
            </div>
            <div className="hero-bottom">
              <a className="scroll-cue" href="#about">
                <span>
                  <ArrowDown size={16} />
                </span>{" "}
                A little scroll. A world of possibilities.
              </a>
              <span className="hero-index" aria-hidden="true">
                A NEW PERSPECTIVE <i />
              </span>
            </div>
          </section>
        </div>
        <section
          className="finder-section"
          aria-label="Find your ideal property"
        >
          <div className="finder-heading">
            <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
            <span>Let’s find a space that feels like you.</span>
          </div>
          <form className="property-finder" onSubmit={search}>
            <label>
              <span>
                <MapPin size={15} /> PREFERRED LOCATION
              </span>
              <div className="select-wrap">
                <select
                  aria-label="Preferred location"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                >
                  <option value="">Explore Delhi & NCR</option>
                  {locationOptions.map((location) => (
                    <option key={location}>{location}</option>
                  ))}
                </select>
                <ChevronDown size={16} />
              </div>
            </label>
            <label>
              <span>
                <Building2 size={15} /> PROPERTY TYPE
              </span>
              <div className="select-wrap">
                <select
                  aria-label="Property type"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="">A space for every ambition</option>
                  <option>Residential</option>
                  <option>Commercial</option>
                </select>
                <ChevronDown size={16} />
              </div>
            </label>
            <label>
              <span>
                <span className="rupee">₹</span> YOUR BUDGET
              </span>
              <div className="select-wrap">
                <select
                  aria-label="Your budget"
                  value={searchBudget}
                  onChange={(e) => setSearchBudget(e.target.value)}
                >
                  <option value="">Find your perfect fit</option>
                  <option value="under3">Under ₹3 Cr</option>
                  <option value="3to7">₹3 Cr – ₹7 Cr</option>
                  <option value="above7">Above ₹7 Cr</option>
                </select>
                <ChevronDown size={16} />
              </div>
            </label>
            <button className="search-button" type="submit">
              Explore properties <ArrowUpRight size={22} />
            </button>
          </form>
        </section>

        <section
          className="about-section section-shell"
          id="about"
          data-scroll-scene
        >
          <div className="section-kicker" data-reveal>
            <span className="tiny-square" /> THE BENIGN PERSPECTIVE{" "}
            <span className="section-number">01 /</span>
          </div>
          <div className="about-main">
            <h2
              className="scroll-statement"
              aria-label="More than square feet. A feeling of being home."
            >
              <span aria-hidden="true">
                {["More", "than", "square", "feet."].map((word, index) => (
                  <span
                    className="scroll-word"
                    key={word}
                    style={{ "--word-index": index } as CSSProperties}
                  >
                    {word}{" "}
                  </span>
                ))}
              </span>
              <br />
              <span aria-hidden="true">
                {["A", "feeling", "of", "being", "home."].map((word, index) => (
                  <span
                    className={`scroll-word ${index > 2 ? "word-sage" : ""}`}
                    key={word}
                    style={{ "--word-index": index + 4 } as CSSProperties}
                  >
                    {word}{" "}
                  </span>
                ))}
              </span>
            </h2>
            <div className="about-bottom">
              <p>
                In a city of endless possibilities, the right space changes
                everything. We bring a thoughtful, personal approach to real
                estate—connecting you with places that reflect who you are, and
                where you want to go.
              </p>
              <a
                className="round-link"
                href="#expertise"
                aria-label="Discover our approach"
              >
                <ArrowUpRight size={28} />
              </a>
            </div>
          </div>
          <div className="values-row" data-reveal>
            <div>
              <Compass strokeWidth={1.2} />
              <span>
                Local knowledge.<small>A genuine understanding of Delhi.</small>
              </span>
            </div>
            <div>
              <ShieldCheck strokeWidth={1.2} />
              <span>
                Clarity at every step.
                <small>Thoughtful advice. No pressure.</small>
              </span>
            </div>
            <div>
              <Leaf strokeWidth={1.2} />
              <span>
                Relationships, not transactions.
                <small>Here for your next chapter. And the next.</small>
              </span>
            </div>
          </div>
        </section>

        <section className="properties-section section-shell" id="properties">
          <div className="section-kicker" data-reveal>
            <span className="tiny-square" /> THE CONSIDERED COLLECTION{" "}
            <span className="section-number">02 /</span>
          </div>
          <div className="section-title-row" data-reveal>
            <h2>
              Some spaces just
              <br />
              <span>feel different.</span>
            </h2>
            <p>
              A glimpse of what’s possible.
              <br />
              Find inspiration for your next move.
            </p>
          </div>
          <div className="collection-toolbar">
            <div
              className="property-tabs"
              role="group"
              aria-label="Property categories"
            >
              {["All spaces", "Residential", "Commercial"].map((tab) => (
                <button
                  className={category === tab ? "active" : ""}
                  key={tab}
                  aria-pressed={category === tab}
                  onClick={() => {
                    setCategory(tab);
                    setShowAll(true);
                  }}
                >
                  {tab}
                  {category === tab && <span className="tab-dot" />}
                </button>
              ))}
            </div>
            <button
              className={`saved-toggle ${savedOnly ? "active" : ""}`}
              aria-label={`Saved properties (${saved.length})`}
              aria-pressed={savedOnly}
              onClick={() => {
                setSavedOnly(!savedOnly);
                setShowAll(true);
              }}
            >
              <Heart size={15} fill={savedOnly ? "currentColor" : "none"} />{" "}
              Saved <span>{saved.length.toString().padStart(2, "0")}</span>
            </button>
          </div>
          {(filters.location || filters.budget || savedOnly) && (
            <div className="filter-summary" role="status">
              <span>
                {filtered.length}{" "}
                {filtered.length === 1 ? "concept" : "concepts"}
                {filters.location ? ` in ${filters.location}` : ""}
                {filters.budget
                  ? ` · ${filters.budget === "under3" ? "Under ₹3 Cr" : filters.budget === "3to7" ? "₹3 Cr – ₹7 Cr" : "Above ₹7 Cr"}`
                  : ""}
                {savedOnly ? " · Your saved spaces" : ""}
              </span>
              <button onClick={resetFilters}>
                Clear filters <X size={14} />
              </button>
            </div>
          )}
          <div className="property-grid" aria-live="polite">
            {visible.map((property, index) => (
              <article
                className="property-card"
                data-scroll-scene
                key={property.id}
                style={{ "--card-order": index % 3 } as CSSProperties}
              >
                <div className="property-photo">
                  <button
                    className="property-image-button"
                    onClick={() => setModal({ kind: "property", property })}
                    aria-label={`Explore ${property.title}`}
                  >
                    <img
                      src={property.image}
                      alt={`${property.type} architectural concept for ${property.location}`}
                      loading="lazy"
                    />
                  </button>
                  <span className="property-badge">{property.type}</span>
                  <button
                    className={`save-button ${saved.includes(property.id) ? "is-saved" : ""}`}
                    aria-label={`${saved.includes(property.id) ? "Unsave" : "Save"} ${property.title}`}
                    aria-pressed={saved.includes(property.id)}
                    onClick={() => toggleSaved(property.id)}
                  >
                    <Heart
                      size={17}
                      fill={
                        saved.includes(property.id) ? "currentColor" : "none"
                      }
                    />
                  </button>
                  <span className="image-number">0{property.id} /</span>
                </div>
                <div className="property-meta">
                  <span>
                    <MapPin size={13} /> {property.location}, {property.area}
                  </span>
                  <ArrowUpRight size={19} />
                </div>
                <button
                  className="property-title"
                  onClick={() => setModal({ kind: "property", property })}
                >
                  <h3>{property.title}</h3>
                </button>
                <div className="property-specs">
                  <span>{property.configuration}</span>
                  <i />
                  <span>{property.size}</span>
                  <span className="property-budget">
                    ₹{property.budget} Cr<span>Indicative</span>
                  </span>
                </div>
              </article>
            ))}
          </div>
          {!filtered.length && (
            <div className="empty-state">
              <Compass size={36} strokeWidth={1} />
              <h3>
                {savedOnly
                  ? "Your collection is waiting."
                  : "Your perfect space may be yet to come."}
              </h3>
              <p>
                {savedOnly
                  ? "Tap the heart on a property to keep it in your collection, or clear your filters."
                  : "Try a different location or budget, or tell us what you have in mind."}
              </p>
              <button className="text-link" onClick={resetFilters}>
                Explore all spaces <ArrowRight size={17} />
              </button>
            </div>
          )}
          <div className="collection-footer">
            <p>
              Illustrative property concepts. Images, sizes and budgets are for
              inspiration,
              <br className="desktop-break" /> not live offers. Availability and
              details are subject to verification.
            </p>
            <button
              className="text-link"
              onClick={() => {
                if (showAll) {
                  setShowAll(false);
                  resetFilters();
                  goTo("#properties");
                } else {
                  setShowAll(true);
                  resetFilters();
                }
              }}
            >
              {showAll ? "Show curated selection" : "Explore the collection"}{" "}
              <ArrowUpRight size={19} />
            </button>
          </div>
        </section>

        <section
          className="perspective-ribbon"
          data-scroll-scene
          aria-label="Considered spaces. Lasting connections."
        >
          <div className="ribbon-overline">
            <span className="tiny-square" /> A MORE PERSONAL PERSPECTIVE ON REAL
            ESTATE
          </div>
          <div className="ribbon-track" aria-hidden="true">
            <span>Considered spaces.</span>
            <span className="ribbon-separator">✳</span>
            <span>Lasting connections.</span>
          </div>
          <div className="ribbon-underline">
            <span>ROOTED IN DELHI & NCR</span>
            <span>BUILT AROUND YOU</span>
          </div>
        </section>

        <ScrollJourney
          onNavigate={(target) =>
            lenis.current?.scrollTo(target, { duration: 1.1 })
          }
        />

        <section className="expertise-section section-shell" id="expertise">
          <div className="expertise-intro" data-reveal>
            <div className="section-kicker">
              <span className="tiny-square" /> FROM VISION TO KEYS
            </div>
            <h2>
              Your ambition.
              <br />
              <span>Our expertise.</span>
            </h2>
            <p>
              Big decisions deserve a personal approach.
              <br />
              We help make your next move a considered one.
            </p>
            <div className="service-image">
              <img
                key={activeService}
                src={services[Math.max(0, activeService)].image}
                alt={`${services[Math.max(0, activeService)].title} inspiration`}
                loading="lazy"
              />
              <span>CONSIDERED. CONNECTED. PERSONAL.</span>
            </div>
          </div>
          <div className="services-list" data-reveal>
            {services.map((service, index) => (
              <div
                className={`service ${activeService === index ? "service-active" : ""}`}
                key={service.title}
              >
                <button
                  className="service-toggle"
                  onClick={() =>
                    setActiveService(activeService === index ? -1 : index)
                  }
                  aria-expanded={activeService === index}
                  aria-controls={`service-${index}`}
                >
                  <span className="service-number">0{index + 1}</span>
                  <span>{service.title}</span>
                  {activeService === index ? (
                    <Minus size={21} />
                  ) : (
                    <Plus size={21} />
                  )}
                </button>
                <div
                  className="service-content"
                  id={`service-${index}`}
                  hidden={activeService !== index}
                >
                  <h3>{service.short}</h3>
                  <p>{service.text}</p>
                  <div className="service-tags">
                    {service.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <button
                    className="text-link"
                    onClick={() => openContact(service.title)}
                  >
                    Let’s explore the possibilities <ArrowUpRight size={18} />
                  </button>
                </div>
              </div>
            ))}
            <div className="service-note">
              <span className="tiny-square" /> A considered process. From the
              first hello to the final handover.
            </div>
          </div>
        </section>

        <section className="delhi-section" id="delhi" data-scroll-scene>
          <div className="delhi-image">
            <img
              src="/images/delhi.jpg"
              alt="India Gate framed by leafy trees in New Delhi"
              loading="lazy"
            />
            <div className="delhi-image-overlay" />
            <div className="delhi-coordinates">
              28.6139° N &nbsp; 77.2090° E
            </div>
            <div className="delhi-photo-title">
              Our city.
              <br />
              <span>Your story.</span>
            </div>
            <span className="delhi-image-label">
              <MapPin size={14} /> NEW DELHI, INDIA
            </span>
          </div>
          <div className="delhi-content" data-reveal>
            <div className="section-kicker">
              <span className="tiny-square" /> LOCAL ROOTS. WIDER POSSIBILITIES.
            </div>
            <h2>
              We don’t just
              <br />
              know the market.
              <br />
              <span>We know Delhi.</span>
            </h2>
            <p>
              The leafy lanes of South Delhi. The energy of Aerocity. The
              evolving skyline of NCR. Every neighbourhood has a character.
              Let’s find the one that fits yours.
            </p>
            <div className="neighbourhoods">
              {[
                "Greater Kailash II",
                "Vasant Vihar",
                "Defence Colony",
                "Dwarka",
                "Aerocity",
                "Gurugram",
              ].map((location) => (
                <button
                  key={location}
                  onClick={() => {
                    setFilters({ location, budget: "" });
                    setSearchLocation(location);
                    setCategory("All spaces");
                    setSavedOnly(false);
                    setShowAll(true);
                    goTo("#properties");
                  }}
                >
                  {location}
                  <ArrowUpRight size={16} />
                </button>
              ))}
            </div>
            <span className="neighbourhood-note">
              Different neighbourhoods. One thoughtful approach.
            </span>
          </div>
        </section>

        <Founders />

        <section
          className="contact-section section-shell"
          id="contact"
          data-scroll-scene
        >
          <div className="contact-orbit" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="contact-content" data-reveal>
            <div className="eyebrow">
              <span className="tiny-square" /> GOOD THINGS BEGIN WITH A
              CONVERSATION
            </div>
            <h2>
              Your next chapter.
              <br />
              <span>Let’s find its address.</span>
            </h2>
            <p>
              A new home, a bigger ambition, or simply a question.
              <br />
              We’d love to hear what you have in mind.
            </p>
            <button className="primary-button" onClick={() => openContact()}>
              Start a conversation <ArrowUpRight size={20} />
            </button>
            <div className="contact-location">
              <span className="status-dot" /> DELHI & NCR <span>·</span>{" "}
              PERSONAL, BY APPOINTMENT
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" inert={menuOpen} data-scroll-scene>
        <div className="footer-top">
          <Brand light />
          <p>
            Exceptional spaces.
            <br />
            Genuine connections.
          </p>
          <div className="footer-links">
            <a href="#about">Our story</a>
            <a href="#properties">Our collection</a>
            <a href="#expertise">Our expertise</a>
            <a href="#founders">The founders</a>
            <button onClick={() => openContact()}>
              Get in touch <ArrowUpRight size={14} />
            </button>
          </div>
          <a className="back-top" href="#home" aria-label="Back to top">
            <ArrowUp size={22} />
          </a>
        </div>
        <div className="footer-wordmark" aria-hidden="true">
          a space to belong.
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Benign Realty. All rights reserved.
          </span>
          <span>Thoughtfully rooted in Delhi, India.</span>
          <button onClick={() => setModal({ kind: "privacy" })}>
            Privacy & information
          </button>
        </div>
      </footer>

      <dialog
        ref={dialog}
        className={`site-dialog ${modal?.kind === "property" ? "property-dialog" : ""}`}
        data-lenis-prevent
        aria-labelledby="dialog-title"
        onCancel={() => setModal(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModal(null);
        }}
      >
        <div className="dialog-inner">
          <button
            className="dialog-close"
            autoFocus
            aria-label="Close dialog"
            onClick={() => setModal(null)}
          >
            <X size={21} />
          </button>
          {modal?.kind === "property" && (
            <>
              <div className="detail-image">
                <img
                  src={modal.property.image}
                  alt={`${modal.property.type} architectural concept`}
                />
                <span className="property-badge">
                  Illustrative property concept
                </span>
              </div>
              <div className="detail-content">
                <span className="eyebrow">
                  <MapPin size={13} /> {modal.property.location},{" "}
                  {modal.property.area}
                </span>
                <h2 id="dialog-title">{modal.property.title}</h2>
                <div className="detail-specs">
                  <span>
                    {modal.property.category === "Residential" ? (
                      <BedDouble size={18} />
                    ) : (
                      <Building2 size={18} />
                    )}
                    {modal.property.configuration}
                  </span>
                  <span>
                    <Maximize size={17} />
                    {modal.property.size}
                  </span>
                  <strong>
                    ₹{modal.property.budget} Cr<small>Indicative budget</small>
                  </strong>
                </div>
                <p>{modal.property.description}</p>
                <div className="detail-disclaimer">
                  This is a design concept, not a live or verified listing. The
                  image is illustrative. Prices, area and configuration are
                  indicative, not an offer. Request current options,
                  documentation and applicable RERA details before making any
                  commitment.
                </div>
                <div className="detail-actions">
                  <button
                    className="primary-button"
                    onClick={() =>
                      openContact(
                        `${modal.property.title} — ${modal.property.location}`,
                      )
                    }
                  >
                    Find a space like this <ArrowUpRight size={18} />
                  </button>
                  <button
                    className="outline-button"
                    onClick={() => toggleSaved(modal.property.id)}
                  >
                    <Heart
                      size={17}
                      fill={
                        saved.includes(modal.property.id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                    {saved.includes(modal.property.id) ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            </>
          )}
          {modal?.kind === "contact" && (
            <div className="contact-dialog-content">
              <span className="eyebrow">
                <span className="tiny-square" /> YOUR NEXT CHAPTER
              </span>
              <h2 id="dialog-title">
                Let’s find your
                <br />
                <span>kind of space.</span>
              </h2>
              {enquiry ? (
                <div className="enquiry-success" role="status">
                  <span className="success-icon">
                    <Check size={25} />
                  </span>
                  <h3>Your enquiry is ready.</h3>
                  <p>
                    Download your enquiry and share it with your Benign Realty
                    advisor.
                  </p>
                  <p className="form-note">
                    This preview does not send enquiries online. Your details
                    have only been used to prepare this file in your browser.
                  </p>
                  <a
                    className="primary-button"
                    href={enquiryUrl}
                    download="Benign-Realty-Enquiry.txt"
                  >
                    Download my enquiry <Download size={18} />
                  </a>
                  <button className="text-link" onClick={() => setEnquiry("")}>
                    Prepare another enquiry <ArrowRight size={17} />
                  </button>
                </div>
              ) : (
                <>
                  <p>
                    Tell us a little about yourself and what you’re looking for.
                  </p>
                  <form className="enquiry-form" onSubmit={prepareEnquiry}>
                    <div className="form-row">
                      <label>
                        Your name
                        <input
                          name="name"
                          placeholder="Full name"
                          required
                          maxLength={100}
                          autoComplete="name"
                        />
                      </label>
                      <label>
                        Phone number
                        <input
                          name="phone"
                          type="tel"
                          placeholder="+91"
                          required
                          pattern="[+]?[0-9][0-9 ]{8,15}[0-9]"
                          maxLength={18}
                          title="Enter 10 to 17 digits, with an optional + country code and spaces."
                          autoComplete="tel"
                        />
                      </label>
                    </div>
                    <label>
                      Email address
                      <input
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        maxLength={200}
                        autoComplete="email"
                      />
                    </label>
                    <label>
                      I’m interested in
                      <select
                        name="interest"
                        defaultValue={modal.interest || "Finding a home"}
                      >
                        {modal.interest && <option>{modal.interest}</option>}
                        <option>Finding a home</option>
                        <option>Commercial spaces</option>
                        <option>Selling a property</option>
                        <option>Renting a property</option>
                        <option>Investment advisory</option>
                      </select>
                    </label>
                    <label>
                      A little about your plans
                      <textarea
                        name="message"
                        rows={3}
                        placeholder="Preferred neighbourhood, budget, timeline…"
                        maxLength={2000}
                      />
                    </label>
                    <label className="consent">
                      <input type="checkbox" required />
                      <span>
                        I understand my enquiry is prepared in this browser for
                        me to download and share. It is not sent automatically.
                      </span>
                    </label>
                    <button className="primary-button" type="submit">
                      Prepare my enquiry <ArrowUpRight size={19} />
                    </button>
                    <p className="form-note">
                      Your details stay private. No account, no mailing lists,
                      no data sent.
                    </p>
                  </form>
                </>
              )}
            </div>
          )}
          {modal?.kind === "privacy" && (
            <div className="privacy-content">
              <span className="eyebrow">CLEAR FROM THE START</span>
              <h2 id="dialog-title">Privacy & information</h2>
              <h3>Your privacy</h3>
              <p>
                This website saves only your property favourites in your
                browser’s local storage. You can remove them using the heart
                buttons or clear your browser’s site data. Enquiry details are
                used locally to create a downloadable file; they are not sent to
                a server or retained after you leave this page.
              </p>
              <h3>About this collection</h3>
              <p>
                All displayed properties are illustrative concepts, not active
                listings. Architectural imagery is AI-generated. Sizes and
                budgets are examples, not quotations. India Gate photography is
                used for local context.
              </p>
              <h3>Before you decide</h3>
              <p>
                Actual availability, prices, ownership, approvals, title and
                applicable RERA registration must be independently verified.
                This website does not provide legal or financial advice, and no
                investment returns are promised.
              </p>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
export default App;
