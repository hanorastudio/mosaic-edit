import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mosaic Studio Workspace | Aura Mosaic Studio',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function MosaicEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
