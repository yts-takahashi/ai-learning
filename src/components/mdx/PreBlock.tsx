'use client';

import dynamic from 'next/dynamic';
import CodeBlock from '@/components/ui/CodeBlock';
import { ComponentPropsWithoutRef } from 'react';

const MermaidChart = dynamic(() => import('@/components/features/MermaidChart'), { ssr: false });

export default function PreBlock({ children, ...props }: ComponentPropsWithoutRef<'pre'>) {
  const child = children as React.ReactElement<{ className?: string; children?: string }>;

  if (
    child?.props?.className?.includes('language-mermaid') &&
    typeof child.props.children === 'string'
  ) {
    return <MermaidChart chart={child.props.children} />;
  }

  return <CodeBlock {...props}>{children}</CodeBlock>;
}
