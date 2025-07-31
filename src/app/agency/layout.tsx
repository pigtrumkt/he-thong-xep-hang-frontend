export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="agency-layout">
      <main>{children}</main>
    </div>
  );
}
