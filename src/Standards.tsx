import { ArrowUpRight } from "lucide-react";

const standards = [
  {
    number: "01",
    title: "Rooted in Delhi & NCR.",
    text: "From South Delhi floors to Aerocity workplaces and the NCR skyline, our work starts with the city we actually live in — street by street, not postcode by postcode.",
    detail: "SOUTH DELHI · AEROCITY · DWARKA · GURUGRAM",
  },
  {
    number: "02",
    title: "Illustrative, and honest about it.",
    text: "Every concept on this site is a design illustration, not verified inventory. We say what is confirmed, what still needs checking, and never dress up a maybe as a yes.",
    detail: "NO PHOTOGRAPH OF A VERIFIED LISTING APPEARS HERE",
  },
  {
    number: "03",
    title: "Your decision stays yours.",
    text: "We advise, we compare, we explain — then we step back. Your own legal and financial checks matter, and we would rather you asked the hard questions.",
    detail: "INDEPENDENT ADVICE ENCOURAGED",
  },
];

export function Standards({ onTalk }: { onTalk: (interest: string) => void }) {
  return (
    <section
      className="standards-section"
      id="standards"
      data-scroll-scene
      aria-labelledby="standards-title"
    >
      <div className="standards-stage">
        <div className="standards-intro" data-reveal>
          <div className="section-kicker">
            <span className="tiny-square" /> WHAT WE HOLD TO
          </div>
          <h2 id="standards-title">
            The Benign standard.
            <br />
            <span>Three promises we keep.</span>
          </h2>
          <p>
            Anyone can show you a longer list. We would rather be the ones who
            tell you what a listing is, what it isn’t, and what you should check
            for yourself.
          </p>
          <div className="standards-rail" aria-hidden="true">
            <span />
          </div>
          <div className="standards-count" aria-hidden="true">
            <span>01 — 03</span>
            <span>KEPT, NOT CLAIMED</span>
          </div>
        </div>
        <ol className="standards-list">
          {standards.map((standard, index) => (
            <li className="standard-item" key={standard.title} data-reveal>
              <button
                className="standard-option"
                aria-label={`Start a conversation about: ${standard.title}`}
                onClick={() => onTalk(standard.title)}
              >
                <span className="standard-number" aria-hidden="true">
                  {standard.number}
                </span>
                <span className="standard-body">
                  <span className="standard-heading">
                    <span className="standard-title">{standard.title}</span>
                    <ArrowUpRight size={19} aria-hidden="true" />
                  </span>
                  <span className="standard-copy">{standard.text}</span>
                  <span className="standard-detail">{standard.detail}</span>
                </span>
                <span className="standard-sweep" aria-hidden="true" />
                <span className="standard-item-index" aria-hidden="true">
                  0{index + 1} / 0{standards.length}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
