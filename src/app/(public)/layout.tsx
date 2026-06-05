// Public layout — all public pages (/stores, /store/[slug], /product/[id], /cart, /)
// Navbar and Footer are added per-page (not here) to allow full-width sections
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#F8FAFC]">{children}</div>;
}
