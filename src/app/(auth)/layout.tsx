// Auth layout — clean, no navbar, no footer
// Pages: /login, /register, /forgot-password, /reset-password, /verify-email
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF1FF] via-[#F8FAFC] to-[#FFF7ED]">
      {children}
    </div>
  );
}
