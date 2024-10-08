import Link from "next/link"
import { PanelsTopLeft, Home, CreditCard, Percent, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import Image from "next/image" // Add this import
import hsbcLogo from "@/public/hsbc-uk.svg";
export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="flex justify-between items-center py-4 px-4 w-full">
        <div className="flex items-center">
         
        
        </div>
        <ModeToggle />
      </header>
      <main className="flex-1 w-full">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container flex flex-col items-center gap-4 text-center">
            <div className="flex items-center justify-center">
              <Image
                src={hsbcLogo} // Replace with your actual logo path
                alt="GDM Frontview Logo"
                width={120}
                height={120} 
                className="mr-4"
              />
              <div className="flex flex-col items-start">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  GDM Frontview
                </h1>
                <p className="text-sm text-left font-[family-name:var(--font-geist-mono)] ">
                  intuitive frontend solution
                </p>
              </div>
            </div>
         
          </div>
          {/* Added margin-top to create space */}
          <div className="container flex flex-col items-center gap-4 text-center mt-8 sm:mt-12">
            <div className="flex flex-col sm:flex-row gap-5">
              <Button
                variant="outline"
                size="lg"
                asChild // Add this prop to use Link component
              >
                <Link href="/financing/dashboard"> {/* Wrap button content with Link */}
                  <CreditCard className="mr-2 h-4 w-4" />
                  Financing
                </Link>
              </Button>
              <Button variant="outline" size="lg" disabled>
                <Percent className="mr-2 h-5 w-5" />
                Credit
              </Button>
              <Button variant="outline" size="lg" disabled>
                <ArrowRight className="mr-2 h-5 w-5" />
                Rates
              </Button>
            </div>
          </div>
        </section>

        
      </main>
    </div>
  )
}


