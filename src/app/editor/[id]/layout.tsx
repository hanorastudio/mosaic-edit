import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editor Workspace | Aura Mosaic Studio',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
