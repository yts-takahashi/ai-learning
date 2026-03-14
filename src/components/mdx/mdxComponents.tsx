import dynamic from 'next/dynamic';
import CodeBlock from '@/components/ui/CodeBlock';
import RelatedLesson from '@/components/ui/RelatedLesson';
import { ComponentPropsWithoutRef } from 'react';

const MermaidChart = dynamic(() => import('@/components/features/MermaidChart'), { ssr: false });

function Pre({ children, ...props }: ComponentPropsWithoutRef<'pre'>) {
  // children is typically a <code> element
  const child = children as React.ReactElement<{ className?: string; children?: string }>;

  if (
    child?.props?.className?.includes('language-mermaid') &&
    typeof child.props.children === 'string'
  ) {
    return <MermaidChart chart={child.props.children} />;
  }

  return <CodeBlock {...props}>{children}</CodeBlock>;
}

export const mdxComponents = {
  pre: Pre,
  RelatedLesson,
};
