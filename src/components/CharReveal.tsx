type CharRevealProps = {
  text: string;
  className?: string;
};

export function CharReveal({ text, className }: CharRevealProps) {
  return (
    <span className={className} aria-label={text}>
      {Array.from(text).map((char, index) => (
        <span className="char-clip" key={`${char}-${index}`} aria-hidden="true">
          <span className="char">{char === " " ? "\u00A0" : char}</span>
        </span>
      ))}
    </span>
  );
}
