import PreBlock from '@/components/mdx/PreBlock';
import RelatedLesson from '@/components/ui/RelatedLesson';
import { ComponentPropsWithoutRef } from 'react';
import { slugifyHeading } from '@/lib/parseLesson';

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

function Table({ children, ...props }: ComponentPropsWithoutRef<'table'>) {
  return (
    <div className="overflow-x-auto my-6">
      <table
        className="min-w-full border border-gray-200 rounded-lg text-sm"
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

function Thead({ children, ...props }: ComponentPropsWithoutRef<'thead'>) {
  return (
    <thead className="bg-gray-50" {...props}>
      {children}
    </thead>
  );
}

function Tbody({ children, ...props }: ComponentPropsWithoutRef<'tbody'>) {
  return (
    <tbody className="divide-y divide-gray-100" {...props}>
      {children}
    </tbody>
  );
}

function Tr({ children, ...props }: ComponentPropsWithoutRef<'tr'>) {
  return (
    <tr className="hover:bg-gray-50 transition-colors" {...props}>
      {children}
    </tr>
  );
}

function Th({ children, ...props }: ComponentPropsWithoutRef<'th'>) {
  return (
    <th
      className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200"
      {...props}
    >
      {children}
    </th>
  );
}

function Td({ children, ...props }: ComponentPropsWithoutRef<'td'>) {
  return (
    <td className="px-4 py-3 text-gray-600" {...props}>
      {children}
    </td>
  );
}

export const mdxComponents = {
  pre: PreBlock,
  h2: H2,
  h3: H3,
  table: Table,
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  th: Th,
  td: Td,
  RelatedLesson,
};
