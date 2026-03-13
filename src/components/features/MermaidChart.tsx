'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidChartProps {
  chart: string;
}

let mermaidInitialized = false;

export default function MermaidChart({ chart }: MermaidChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;

        if (!mermaidInitialized) {
          mermaid.initialize({ startOnLoad: false, theme: 'default' });
          mermaidInitialized = true;
        }

        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, chart.trim());

        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <pre className="text-red-600 text-sm bg-red-50 p-4 rounded-lg overflow-auto">
        Mermaid エラー: {error}
      </pre>
    );
  }

  return <div ref={ref} className="my-6 flex justify-center overflow-auto" />;
}
