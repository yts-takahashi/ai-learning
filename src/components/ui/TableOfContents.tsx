import type { Heading } from '@/lib/parseLesson';

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length < 3) return null;

  return (
    <nav
      aria-label="目次"
      className="bg-gray-50 border border-gray-200 rounded-lg px-5 py-4 mb-8 text-sm"
    >
      <p className="font-semibold text-gray-700 mb-3">目次</p>
      <ol className="space-y-1.5 list-none">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'pl-4' : ''}>
            <a
              href={`#${h.id}`}
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors leading-snug"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
