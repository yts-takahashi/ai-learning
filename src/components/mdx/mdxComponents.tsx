import MermaidChart from '@/components/features/MermaidChart';
import { ComponentPropsWithoutRef } from 'react';

function Pre({ children, ...props }: ComponentPropsWithoutRef<'pre'>) {
  // children is typically a <code> element
  const child = children as React.ReactElement<{ className?: string; children?: string }>;

  if (
    child?.props?.className?.includes('language-mermaid') &&
    typeof child.props.children === 'string'
  ) {
    return <MermaidChart chart={child.props.children} />;
  }

  return <pre {...props}>{children}</pre>;
}

export const mdxComponents = {
  pre: Pre,
};
