const URL_PATTERN = /(https?:\/\/[^\s<]+)/;

export function Linkify({ text, nested }: { text: string; nested?: boolean }) {
  const parts = text.split(URL_PATTERN);
  return (
    <>
      {parts.map((part, i) =>
        URL_PATTERN.test(part) ? (
          nested ? (
            <span
              key={i}
              role="link"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(part, "_blank", "noopener,noreferrer");
              }}
              className="text-primary hover:underline break-all cursor-pointer"
            >
              {part}
            </span>
          ) : (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-primary hover:underline break-all"
            >
              {part}
            </a>
          )
        ) : (
          part
        )
      )}
    </>
  );
}
