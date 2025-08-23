import ProductCatalog from "@/components/product-catalog"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gold-50">
      <Navigation />
      <ProductCatalog />
      <Footer />
    </main>
  )
}