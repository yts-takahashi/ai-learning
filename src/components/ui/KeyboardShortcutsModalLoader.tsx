'use client';

import dynamic from 'next/dynamic';

const KeyboardShortcutsModal = dynamic(
  () => import('@/components/ui/KeyboardShortcutsModal'),
  { ssr: false },
);

export default function KeyboardShortcutsModalLoader() {
  return <KeyboardShortcutsModal />;
}
