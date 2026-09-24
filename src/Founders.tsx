import { useState } from "react";

const founders = [
  {
    name: "Talib Khan",
    initials: "TK",
    portrait: "/images/founders/talib-khan.jpg",
    thought:
      "A home is not just where we live, but where life begins to feel like our own.",
  },
  {
    name: "Prathvi Narayan",
    initials: "PN",
    portrait: "/images/founders/prathvi-narayan.jpg",
    thought:
      "The right home gives us room to grow, a place to pause, and a reason to return.",
  },
];

/**
 * Portraits are the founders' own photographs, used exactly as supplied.
 * Until that file exists the card keeps the reserved frame instead of
 * showing a broken image or a stand-in face.
 */
function FounderPortrait({
  founder,
  index,
}: {
  founder: (typeof founders)[number];
  index: number;
}) {
  const [photoLoaded, setPhotoLoaded] = useState(true);
  const showPhoto = photoLoaded && founder.portrait.length > 0;

  return (
    <div className="founder-portrait" data-photo={showPhoto ? "true" : "false"}>
      {showPhoto ? (
        <img
          src={founder.portrait}
          alt={founder.name}
          loading="lazy"
          decoding="async"
          onError={() => setPhotoLoaded(false)}
        />
      ) : (
        <div
          className="founder-photo-placeholder"
          role="img"
          aria-label={`Photo space reserved for ${founder.name}`}
        >
          <span className="founder-placeholder-frame" aria-hidden="true" />
          <span className="founder-initials" aria-hidden="true">
            {founder.initials}
          </span>
          <span className="founder-photo-label" aria-hidden="true">
            PORTRAIT TO FOLLOW
          </span>
        </div>
      )}
      <span className="founder-portrait-index" aria-hidden="true">
        0{index + 1} / BENIGN REALTY
      </span>
    </div>
  );
}

export function Founders() {
  return (
    <section
      className="founders-section section-shell"
      id="founders"
      aria-labelledby="founders-title"
    >
      <div className="founders-intro" data-reveal>
        <div className="section-kicker">
          <span className="tiny-square" /> THE PEOPLE BEHIND BENIGN
        </div>
        <h2 id="founders-title">
          The Founders.
          <br />
          <span>A shared vision.</span>
        </h2>
        <p>
          Meet Talib Khan and Prathvi Narayan, the founders of Benign Realty.
          Two perspectives, brought together by a simple idea: finding a place
          should always begin with the people who will call it home.
        </p>
        <div className="founders-signature">
          <span className="founders-signature-line" aria-hidden="true" />
          PEOPLE FIRST. ALWAYS.
        </div>
      </div>
      <div className="founders-grid">
        {founders.map((founder, index) => (
          <article
            className="founder-card"
            key={founder.name}
            data-reveal
            data-scroll-scene
          >
            <FounderPortrait founder={founder} index={index} />
            <div className="founder-name-row">
              <h3>{founder.name}</h3>
              <span>Co-founder</span>
            </div>
            <div className="founder-thought">
              <span className="eyebrow">A THOUGHT ON HOME</span>
              <p>{founder.thought}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
