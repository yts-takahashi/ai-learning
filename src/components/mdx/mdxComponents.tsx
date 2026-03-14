import dynamic from 'next/dynamic';
import CodeBlock from '@/components/ui/CodeBlock';
import RelatedLesson from '@/components/ui/RelatedLesson';
import { ComponentPropsWithoutRef } from 'react';
import { slugifyHeading } from '@/lib/parseLesson';

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

function H2({ children, ...props }: ComponentPropsWithoutRef<'h2'>) {
  const text = typeof children === 'string' ? children : '';
  const id = text ? slugifyHeading(text) : undefined;
  return <h2 id={id} {...props}>{children}</h2>;
}

function H3({ children, ...props }: ComponentPropsWithoutRef<'h3'>) {
  const text = typeof children === 'string' ? children : '';
  const id = text ? slugifyHeading(text) : undefined;
  return <h3 id={id} {...props}>{children}</h3>;
}

export const mdxComponents = {
  pre: Pre,
  h2: H2,
  h3: H3,
  RelatedLesson,
};
