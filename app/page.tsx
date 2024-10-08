import Link from "next/link";
import Image from "next/image";
import { PanelsTopLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full bg-background/95 border-b backdrop-blur-sm dark:bg-black/60 border-border/40">
        <div className="container h-14 flex items-center">
          <Link href="/" className="flex items-center hover:opacity-85 transition-opacity duration-300">
            <PanelsTopLeft className="w-6 h-6 mr-3" />
            <span className="font-bold">shadcn/ui sidebar</span>
          </Link>
          <nav className="ml-auto">
            <ModeToggle />
          </nav>
        </div>
      </header>

      <main className="flex-1 min-h-[calc(100vh-57px-97px)]">
        <div className="container relative pb-10">
          <section className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 lg:py-24 lg:pb-6">
            <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
              Sidebar example built on top of shadcn/ui
            </h1>
            <p className="max-w-[750px] text-center text-lg font-light text-foreground">
              A stunning and functional retractable sidebar for Next.js using
              shadcn/ui complete with desktop and mobile responsiveness.
            </p>
            <div className="flex w-full items-center justify-center space-x-4 py-4 md:pb-6">
              <Button variant="default" asChild>
                <Link href="/dashboard">Demo</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="https://ui.shadcn.com/" target="_blank" rel="noopener noreferrer">
                  Learn shadcn/ui
                </Link>
              </Button>
            </div>
          </section>

          <div className="w-full flex justify-center relative">
            {/* ... Image components remain unchanged ... */}
          </div>
        </div>
      </main>

      <footer className="py-6 md:py-0 border-t border-border/40">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
            Built on top of{" "}
            <Link href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4">
              shadcn/ui
            </Link>
            . The source code is available on{" "}
            <Link href="https://github.com/salimi-my/shadcn-ui-sidebar" target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4">
              GitHub
            </Link>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
