import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { About } from './sections/About'
import { Artists } from './sections/Artists'
import { Hero } from './sections/Hero'
import { Host } from './sections/Host'
import { Lookup } from './sections/Lookup'
import { Tickets } from './sections/Tickets'

export default function App() {
  return (
    <div className="film-grain">
      <a href="#ingressos" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:bg-gold-300 focus:px-4 focus:py-2 focus:text-ink">
        Ir para a compra de ingressos
      </a>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Artists />
        <Host />
        <Tickets />
        <Lookup />
      </main>
      <Footer />
    </div>
  )
}
