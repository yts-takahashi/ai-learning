'use client';

import { useState, useRef, ComponentPropsWithoutRef } from 'react';

export default function CodeBlock({ children, ...props }: ComponentPropsWithoutRef<'pre'>) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  function handleCopy() {
    const text = preRef.current?.innerText ?? '';
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="relative group">
      <pre ref={preRef} {...props}>
        {children}
      </pre>
      <button
        onClick={handleCopy}
        aria-label={copied ? 'コピーしました' : 'コードをコピー'}
        className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-gray-700 text-gray-200 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-gray-600"
      >
        {copied ? '✓ コピー済み' : 'コピー'}
      </button>
    </div>
  );
}
