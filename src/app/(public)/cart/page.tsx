import { auth } from "@/lib/auth";
import { getCartSessionId } from "@/lib/cart-session";
import { getCart } from "@/services/cart.service";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartClient from "@/components/cart/CartClient";
import { Breadcrumb } from "@/components/common/Breadcrumb";

// force dynamic — cart is always user-specific
export const dynamic = "force-dynamic";

export default async function CartPage() {
  // Resolve identity server-side
  const session = await auth();
  const userId    = session?.user?.id ?? null;
  const sessionId = userId ? null : await getCartSessionId();

  // Fetch cart from DB — never trust client
  const cart = await getCart(userId, sessionId);

  return (
    <>
      <Navbar session={session} cartCount={
        cart ? cart.items.reduce((s, i) => s + i.quantity, 0) : 0
      } />

      <div className="max-w-[1280px] mx-auto px-6 py-6">
        <Breadcrumb items={[
          { label: "الرئيسية", href: "/" },
          { label: "سلة التسوق" },
        ]} />
      </div>

      {/* Client component handles all interactivity */}
      <CartClient initialCart={cart} />

      <Footer />
    </>
  );
}
