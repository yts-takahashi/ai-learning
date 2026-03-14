'use client';

import { useEffect, useState } from 'react';
import type { Heading } from '@/lib/parseLesson';

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length < 3) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 },
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

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
              className={`hover:underline transition-colors leading-snug ${
                activeId === h.id
                  ? 'text-blue-700 font-semibold'
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
