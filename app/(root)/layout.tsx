import TopBar from '@/components/TopBar';

export default function RootGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopBar />
      <main>{children}</main>
    </>
  );
}
