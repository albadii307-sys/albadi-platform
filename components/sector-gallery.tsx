export default function SectorGallery({
  images,
  name,
  eyebrow,
  title,
  accent,
  countLabel,
}: {
  images: string[];
  name: string;
  eyebrow: string;
  title: string;
  accent: string;
  countLabel: string;
}) {
  if (images.length < 2) return null;

  return (
    <section className="x-sgal-sec">
      <div className="x-block-head reveal">
        <div>
          <span className="x-eyebrow">
            <i aria-hidden="true" />
            {eyebrow}
          </span>
          <h2 className="x-h2">
            {title}
            <br />
            <em>{accent}</em>
          </h2>
        </div>
        <span className="x-block-count">{images.length}</span>
      </div>

      <div className="x-sgal">
        {images.slice(0, 8).map((src, index) => (
          <figure className={`x-sgal-item${index === 0 ? ' is-lead' : ''}`} key={`${src}-${index}`}>
            <img src={src} alt={`${name} — ${countLabel} ${index + 1}`} loading="lazy" />
          </figure>
        ))}
      </div>
    </section>
  );
}
