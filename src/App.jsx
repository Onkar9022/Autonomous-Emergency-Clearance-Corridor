import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Problem from './components/Problem'
import Solution from './components/Solution'
import ThreeUnits from './components/ThreeUnits'
import RoundaboutSpotlight from './components/RoundaboutSpotlight'
import HowItWorks from './components/HowItWorks'
import LiveDashboard from './components/LiveDashboard'
import AIDecisionEngine from './components/AIDecisionEngine'
import SystemArchitecture from './components/SystemArchitecture'
import SafetyFailsafe from './components/SafetyFailsafe'
import Simulation from './components/Simulation'
import Impact from './components/Impact'
import Innovation from './components/Innovation'
import Research from './components/Research'
import Team from './components/Team'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-surface antialiased">
      <Navbar />
      <main className="w-full pt-16">
        <Hero />
        <Problem />
        <Solution />
        <ThreeUnits />
        <RoundaboutSpotlight />
        <HowItWorks />
        <LiveDashboard />
        <AIDecisionEngine />
        <SystemArchitecture />
        <SafetyFailsafe />
        <Simulation />
        <Impact />
        <Innovation />
        <Research />
        <Team />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}

export default App
