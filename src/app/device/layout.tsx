export default function CentralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="central-layout">
      <main>{children}</main>
    </div>
  );
}
