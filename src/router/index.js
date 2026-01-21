import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import SubtractingFractions from '../views/calculators/SubtractingFractions.vue'
import MultiplyingFractions from '../views/calculators/MultiplyingFractions.vue'
import AddingFractionsCalculator from '../views/calculators/AddingFractionsCalculator.vue'
import SquareRootCalculator from '../views/calculators/SquareRootCalculator.vue'
import CosineCalculator from '../views/calculators/CosineCalculator.vue'
import SinCalculator from '../views/calculators/SinCalculator.vue'
import TanCalculator from '../views/calculators/TanCalculator.vue'
import RootsCalculator from '../views/calculators/RootsCalculator.vue'
import PolynomialRemainderCalculator from '../views/calculators/PolynomialRemainderCalculator.vue'
import RemainderCalculator from '../views/calculators/RemainderCalculator.vue'
import RatioCalculator from '../views/calculators/RatioCalculator.vue'
import RandomNumbersGenerator from '../views/calculators/RandomNumbersGenerator.vue'
import QuadraticEquationCalculator from '../views/calculators/QuadraticEquationCalculator.vue'
import PythagoreanTheoremCalculator from '../views/calculators/PythagoreanTheoremCalculator.vue'
import PercentageIncreaseCalculator from '../views/calculators/PercentageIncreaseCalculator.vue'
import PercentErrorCalculator from '../views/calculators/PercentErrorCalculator.vue'
import NaturalLogarithmCalculator from '../views/calculators/NaturalLogarithmCalculator.vue'
import LogCalculator from '../views/calculators/LogCalculator.vue'
import ExponentCalculator from '../views/calculators/ExponentCalculator.vue'
import ExponentialGrowthCalculator from '../views/calculators/ExponentialGrowthCalculator.vue'
import AdditionCalculator from '../views/calculators/AdditionCalculator.vue'
import LcmCalculator from '../views/calculators/LcmCalculator.vue'
import GcfCalculator from '../views/calculators/GcfCalculator.vue'
import KineticEnergyCalculator from '../views/calculators/KineticEnergyCalculator.vue'
import LongMultiplicationCalculator from '../views/calculators/LongMultiplicationCalculator.vue'
import ConvolutionCalculator from '../views/calculators/ConvolutionCalculator.vue'
import ArctanCalculator from '../views/calculators/ArctanCalculator.vue'
import ArcsinCalculator from '../views/calculators/ArcsinCalculator.vue'
import ArccosCalculator from '../views/calculators/ArccosCalculator.vue'
import AntilogCalculator from '../views/calculators/AntilogCalculator.vue'
import SubtractionCalculator from '../views/calculators/SubtractionCalculator.vue'
import MultiplicationCalculator from '../views/calculators/MultiplicationCalculator.vue'
import DivisionCalculator from '../views/calculators/DivisionCalculator.vue'
import SquareCalculator from '../views/calculators/SquareCalculator.vue'
import CubeCalculator from '../views/calculators/CubeCalculator.vue'
import FactorialCalculator from '../views/calculators/FactorialCalculator.vue'
import PercentageCalculator from '../views/calculators/PercentageCalculator.vue'
import PercentageChangeCalculator from '../views/calculators/PercentageChangeCalculator.vue'
import AverageCalculator from '../views/calculators/AverageCalculator.vue'
import DividingFractionsCalculator from '../views/calculators/DividingFractionsCalculator.vue'
import SimplifyingFractionsCalculator from '../views/calculators/SimplifyingFractionsCalculator.vue'
import WhToMahCalculator from '../views/calculators/WhToMahCalculator.vue'
import WattToKvaCalculator from '../views/calculators/WattToKvaCalculator.vue'
import WattToVaCalculator from '../views/calculators/WattToVaCalculator.vue'
import WattToKwhCalculator from '../views/calculators/WattToKwhCalculator.vue'
import WireGaugeCalculator from '../views/calculators/WireGaugeCalculator.vue'
import AmpsToKilowattsCalculator from '../views/calculators/AmpsToKilowattsCalculator.vue'
import AmpsToKvaCalculator from '../views/calculators/AmpsToKvaCalculator.vue'
import AmpsToVaCalculator from '../views/calculators/AmpsToVaCalculator.vue'
import AmpsToVoltsCalculator from '../views/calculators/AmpsToVoltsCalculator.vue'
import AmpsToWattsCalculator from '../views/calculators/AmpsToWattsCalculator.vue'
import ElectricBillCalculator from '../views/calculators/ElectricBillCalculator.vue'
import EnergyConsumptionCalculator from '../views/calculators/EnergyConsumptionCalculator.vue'
import EvToVoltsCalculator from '../views/calculators/EvToVoltsCalculator.vue'
import JoulesToWattsCalculator from '../views/calculators/JoulesToWattsCalculator.vue'
import JoulesToVoltsCalculator from '../views/calculators/JoulesToVoltsCalculator.vue'
import KvaToAmpsCalculator from '../views/calculators/KvaToAmpsCalculator.vue'
import KvaToWattsCalculator from '../views/calculators/KvaToWattsCalculator.vue'
import KvaToKwCalculator from '../views/calculators/KvaToKwCalculator.vue'
import KvaToVaCalculator from '../views/calculators/KvaToVaCalculator.vue'
import KwToAmpsCalculator from '../views/calculators/KwToAmpsCalculator.vue'
import KwToVoltsCalculator from '../views/calculators/KwToVoltsCalculator.vue'
import KwToKwhCalculator from '../views/calculators/KwToKwhCalculator.vue'
import KwToVaCalculator from '../views/calculators/KwToVaCalculator.vue'
import KwToKvaCalculator from '../views/calculators/KwToKvaCalculator.vue'
import KwhToKwCalculator from '../views/calculators/KwhToKwCalculator.vue'
import KwhToWattsCalculator from '../views/calculators/KwhToWattsCalculator.vue'
import MahToWhCalculator from '../views/calculators/MahToWhCalculator.vue'
import OhmsLawCalculator from '../views/calculators/OhmsLawCalculator.vue'
import PowerCalculator from '../views/calculators/PowerCalculator.vue'
import VaToAmpsCalculator from '../views/calculators/VaToAmpsCalculator.vue'
import VaToWattsCalculator from '../views/calculators/VaToWattsCalculator.vue'
import VaToKwCalculator from '../views/calculators/VaToKwCalculator.vue'
import VaToKvaCalculator from '../views/calculators/VaToKvaCalculator.vue'
import VoltageDividerCalculator from '../views/calculators/VoltageDividerCalculator.vue'
import VoltageDropCalculator from '../views/calculators/VoltageDropCalculator.vue'
import VoltsToAmpsCalculator from '../views/calculators/VoltsToAmpsCalculator.vue'
import WattsToAmpsCalculator from '../views/calculators/WattsToAmpsCalculator.vue'
import WattsToJoulesCalculator from '../views/calculators/WattsToJoulesCalculator.vue'
import WattsToVoltsCalculator from '../views/calculators/WattsToVoltsCalculator.vue'
import VoltsToWattsCalculator from '../views/calculators/VoltsToWattsCalculator.vue'
import VoltsToKwCalculator from '../views/calculators/VoltsToKwCalculator.vue'
import VoltsToJoulesCalculator from '../views/calculators/VoltsToJoulesCalculator.vue'
import VoltsToEvCalculator from '../views/calculators/VoltsToEvCalculator.vue'
import WattsVoltsAmpsOhmsCalculator from '../views/calculators/WattsVoltsAmpsOhmsCalculator.vue'
import ElectricalCalculator from '../views/calculators/ElectricalCalculator.vue'
import MathCalculators from '../views/calculators/MathCalculators.vue'

const supportedLocales = ['en', 'pl', 'sv', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'vi', 'tr', 'ru', 'fa', 'th', 'ja', 'zh']

// Helper function to generate path with locale prefix (en has no prefix)
function getLocalePath(locale, path) {
  if (locale === 'en') {
    return path
  }
  return `/${locale}${path}`
}

// Generate routes for each locale
const routes = [
  // Home route for English (no prefix)
  {
    path: '/',
    name: 'Home-en',
    component: Home,
    meta: { locale: 'en' }
  },
  // Home routes for other locales (with prefix)
  ...supportedLocales.filter(locale => locale !== 'en').map(locale => ({
    path: `/${locale}/`,
    name: `Home-${locale}`,
    component: Home,
    meta: { locale }
  })),
  // Redirect /en/ to / (for backward compatibility)
  {
    path: '/en/',
    redirect: '/'
  },
  // Calculator routes
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/subtracting-fractions'),
    name: `SubtractingFractions-${locale}`,
    component: SubtractingFractions,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/multiplying-fractions'),
    name: `MultiplyingFractions-${locale}`,
    component: MultiplyingFractions,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/adding-fractions-calculator'),
    name: `AddingFractionsCalculator-${locale}`,
    component: AddingFractionsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/square-root-calculator'),
    name: `SquareRootCalculator-${locale}`,
    component: SquareRootCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/cosine-calculator'),
    name: `CosineCalculator-${locale}`,
    component: CosineCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/sin-calculator'),
    name: `SinCalculator-${locale}`,
    component: SinCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/tan-calculator'),
    name: `TanCalculator-${locale}`,
    component: TanCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/roots-calculator'),
    name: `RootsCalculator-${locale}`,
    component: RootsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/polynomial-remainder-calculator'),
    name: `PolynomialRemainderCalculator-${locale}`,
    component: PolynomialRemainderCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/remainder-calculator'),
    name: `RemainderCalculator-${locale}`,
    component: RemainderCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/ratio-calculator'),
    name: `RatioCalculator-${locale}`,
    component: RatioCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/random-numbers-generator'),
    name: `RandomNumbersGenerator-${locale}`,
    component: RandomNumbersGenerator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/quadratic-equation-calculator'),
    name: `QuadraticEquationCalculator-${locale}`,
    component: QuadraticEquationCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/pythagorean-theorem-calculator'),
    name: `PythagoreanTheoremCalculator-${locale}`,
    component: PythagoreanTheoremCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/percentage-increase-calculator'),
    name: `PercentageIncreaseCalculator-${locale}`,
    component: PercentageIncreaseCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/percent-error-calculator'),
    name: `PercentErrorCalculator-${locale}`,
    component: PercentErrorCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/natural-logarithm-calculator'),
    name: `NaturalLogarithmCalculator-${locale}`,
    component: NaturalLogarithmCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/log-calculator'),
    name: `LogCalculator-${locale}`,
    component: LogCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/exponent-calculator'),
    name: `ExponentCalculator-${locale}`,
    component: ExponentCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/exponential-growth-calculator'),
    name: `ExponentialGrowthCalculator-${locale}`,
    component: ExponentialGrowthCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/addition-calculator'),
    name: `AdditionCalculator-${locale}`,
    component: AdditionCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/lcm-calculator'),
    name: `LcmCalculator-${locale}`,
    component: LcmCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/gcf-calculator'),
    name: `GcfCalculator-${locale}`,
    component: GcfCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/kinetic-energy-calculator'),
    name: `KineticEnergyCalculator-${locale}`,
    component: KineticEnergyCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/long-multiplication-calculator'),
    name: `LongMultiplicationCalculator-${locale}`,
    component: LongMultiplicationCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/convolution-calculator'),
    name: `ConvolutionCalculator-${locale}`,
    component: ConvolutionCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/arctan-calculator'),
    name: `ArctanCalculator-${locale}`,
    component: ArctanCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/arcsin-calculator'),
    name: `ArcsinCalculator-${locale}`,
    component: ArcsinCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/arccos-calculator'),
    name: `ArccosCalculator-${locale}`,
    component: ArccosCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/anti-log-calculator'),
    name: `AntilogCalculator-${locale}`,
    component: AntilogCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/addition-calculator'),
    name: `AdditionCalculator-${locale}`,
    component: AdditionCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/subtraction-calculator'),
    name: `SubtractionCalculator-${locale}`,
    component: SubtractionCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/multiplication-calculator'),
    name: `MultiplicationCalculator-${locale}`,
    component: MultiplicationCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/division-calculator'),
    name: `DivisionCalculator-${locale}`,
    component: DivisionCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/square-calculator'),
    name: `SquareCalculator-${locale}`,
    component: SquareCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/cube-calculator'),
    name: `CubeCalculator-${locale}`,
    component: CubeCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/factorial-calculator'),
    name: `FactorialCalculator-${locale}`,
    component: FactorialCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/percentage-calculator'),
    name: `PercentageCalculator-${locale}`,
    component: PercentageCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/percentage-change-calculator'),
    name: `PercentageChangeCalculator-${locale}`,
    component: PercentageChangeCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/average-calculator'),
    name: `AverageCalculator-${locale}`,
    component: AverageCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/dividing-fractions'),
    name: `DividingFractionsCalculator-${locale}`,
    component: DividingFractionsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/simplifying-fractions'),
    name: `SimplifyingFractionsCalculator-${locale}`,
    component: SimplifyingFractionsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/wh-to-mah-calculator'),
    name: `WhToMahCalculator-${locale}`,
    component: WhToMahCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/watt-to-kva-calculator'),
    name: `WattToKvaCalculator-${locale}`,
    component: WattToKvaCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/watt-to-va-calculator'),
    name: `WattToVaCalculator-${locale}`,
    component: WattToVaCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/wire-gauge-calculator'),
    name: `WireGaugeCalculator-${locale}`,
    component: WireGaugeCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/watt-to-kwh-calculator'),
    name: `WattToKwhCalculator-${locale}`,
    component: WattToKwhCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/amps-to-kilowatts-calculator'),
    name: `AmpsToKilowattsCalculator-${locale}`,
    component: AmpsToKilowattsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/amps-to-kva-calculator'),
    name: `AmpsToKvaCalculator-${locale}`,
    component: AmpsToKvaCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/amps-to-va-calculator'),
    name: `AmpsToVaCalculator-${locale}`,
    component: AmpsToVaCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/amps-to-volts-calculator'),
    name: `AmpsToVoltsCalculator-${locale}`,
    component: AmpsToVoltsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/amps-to-watts-calculator'),
    name: `AmpsToWattsCalculator-${locale}`,
    component: AmpsToWattsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/electricity-bill-calculator'),
    name: `ElectricBillCalculator-${locale}`,
    component: ElectricBillCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/energy-consumption-calculator'),
    name: `EnergyConsumptionCalculator-${locale}`,
    component: EnergyConsumptionCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/ev-to-volts-calculator'),
    name: `EvToVoltsCalculator-${locale}`,
    component: EvToVoltsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/joules-to-watts-calculator'),
    name: `JoulesToWattsCalculator-${locale}`,
    component: JoulesToWattsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/joules-to-volts-calculator'),
    name: `JoulesToVoltsCalculator-${locale}`,
    component: JoulesToVoltsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/kva-to-amps-calculator'),
    name: `KvaToAmpsCalculator-${locale}`,
    component: KvaToAmpsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/kva-to-watts-calculator'),
    name: `KvaToWattsCalculator-${locale}`,
    component: KvaToWattsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/kva-to-kw-calculator'),
    name: `KvaToKwCalculator-${locale}`,
    component: KvaToKwCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/kva-to-va-calculator'),
    name: `KvaToVaCalculator-${locale}`,
    component: KvaToVaCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/kw-to-amps-calculator'),
    name: `KwToAmpsCalculator-${locale}`,
    component: KwToAmpsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/kw-to-volts-calculator'),
    name: `KwToVoltsCalculator-${locale}`,
    component: KwToVoltsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/kw-to-kwh-calculator'),
    name: `KwToKwhCalculator-${locale}`,
    component: KwToKwhCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/kw-to-va-calculator'),
    name: `KwToVaCalculator-${locale}`,
    component: KwToVaCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/kw-to-kva-calculator'),
    name: `KwToKvaCalculator-${locale}`,
    component: KwToKvaCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/kwh-to-kw-calculator'),
    name: `KwhToKwCalculator-${locale}`,
    component: KwhToKwCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/kwh-to-watts-calculator'),
    name: `KwhToWattsCalculator-${locale}`,
    component: KwhToWattsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/mah-to-wh-calculator'),
    name: `MahToWhCalculator-${locale}`,
    component: MahToWhCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/ohms-law-calculator'),
    name: `OhmsLawCalculator-${locale}`,
    component: OhmsLawCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/power-calculator'),
    name: `PowerCalculator-${locale}`,
    component: PowerCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/va-to-amps-calculator'),
    name: `VaToAmpsCalculator-${locale}`,
    component: VaToAmpsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/va-to-watts-calculator'),
    name: `VaToWattsCalculator-${locale}`,
    component: VaToWattsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/va-to-kw-calculator'),
    name: `VaToKwCalculator-${locale}`,
    component: VaToKwCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/va-to-kva-calculator'),
    name: `VaToKvaCalculator-${locale}`,
    component: VaToKvaCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/voltage-divider-calculator'),
    name: `VoltageDividerCalculator-${locale}`,
    component: VoltageDividerCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/voltage-drop-calculator'),
    name: `VoltageDropCalculator-${locale}`,
    component: VoltageDropCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/volts-to-amps-calculator'),
    name: `VoltsToAmpsCalculator-${locale}`,
    component: VoltsToAmpsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/watts-to-amps-calculator'),
    name: `WattsToAmpsCalculator-${locale}`,
    component: WattsToAmpsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/watts-to-joules-calculator'),
    name: `WattsToJoulesCalculator-${locale}`,
    component: WattsToJoulesCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/watts-to-volts-calculator'),
    name: `WattsToVoltsCalculator-${locale}`,
    component: WattsToVoltsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/volts-to-watts-calculator'),
    name: `VoltsToWattsCalculator-${locale}`,
    component: VoltsToWattsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/volts-to-kw-calculator'),
    name: `VoltsToKwCalculator-${locale}`,
    component: VoltsToKwCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/volts-to-joules-calculator'),
    name: `VoltsToJoulesCalculator-${locale}`,
    component: VoltsToJoulesCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/volts-to-ev-calculator'),
    name: `VoltsToEvCalculator-${locale}`,
    component: VoltsToEvCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/watts-volts-amps-ohms-calculator'),
    name: `WattsVoltsAmpsOhmsCalculator-${locale}`,
    component: WattsVoltsAmpsOhmsCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/electrical-calculator'),
    name: `ElectricalCalculator-${locale}`,
    component: ElectricalCalculator,
    meta: { locale }
  })),
  ...supportedLocales.map(locale => ({
    path: getLocalePath(locale, '/calculators/math-calculators'),
    name: `MathCalculators-${locale}`,
    component: MathCalculators,
    meta: { locale }
  })),
  // Redirects from /en/... to /... (for backward compatibility)
  {
    path: '/en/calculators/subtracting-fractions',
    redirect: '/calculators/subtracting-fractions'
  },
  {
    path: '/en/calculators/multiplying-fractions',
    redirect: '/calculators/multiplying-fractions'
  },
  {
    path: '/en/calculators/adding-fractions-calculator',
    redirect: '/calculators/adding-fractions-calculator'
  },
  {
    path: '/en/calculators/square-root-calculator',
    redirect: '/calculators/square-root-calculator'
  },
  {
    path: '/en/calculators/cosine-calculator',
    redirect: '/calculators/cosine-calculator'
  },
  {
    path: '/en/calculators/sin-calculator',
    redirect: '/calculators/sin-calculator'
  },
  {
    path: '/en/calculators/tan-calculator',
    redirect: '/calculators/tan-calculator'
  },
  {
    path: '/en/calculators/roots-calculator',
    redirect: '/calculators/roots-calculator'
  },
  {
    path: '/en/calculators/polynomial-remainder-calculator',
    redirect: '/calculators/polynomial-remainder-calculator'
  },
  {
    path: '/en/calculators/remainder-calculator',
    redirect: '/calculators/remainder-calculator'
  },
  {
    path: '/en/calculators/ratio-calculator',
    redirect: '/calculators/ratio-calculator'
  },
  {
    path: '/en/calculators/random-numbers-generator',
    redirect: '/calculators/random-numbers-generator'
  },
  {
    path: '/en/calculators/quadratic-equation-calculator',
    redirect: '/calculators/quadratic-equation-calculator'
  },
  {
    path: '/en/calculators/pythagorean-theorem-calculator',
    redirect: '/calculators/pythagorean-theorem-calculator'
  },
  {
    path: '/en/calculators/percentage-increase-calculator',
    redirect: '/calculators/percentage-increase-calculator'
  },
  {
    path: '/en/calculators/percent-error-calculator',
    redirect: '/calculators/percent-error-calculator'
  },
  {
    path: '/en/calculators/natural-logarithm-calculator',
    redirect: '/calculators/natural-logarithm-calculator'
  },
  {
    path: '/en/calculators/log-calculator',
    redirect: '/calculators/log-calculator'
  },
  {
    path: '/en/calculators/exponent-calculator',
    redirect: '/calculators/exponent-calculator'
  },
  {
    path: '/en/calculators/exponential-growth-calculator',
    redirect: '/calculators/exponential-growth-calculator'
  },
  {
    path: '/en/calculators/addition-calculator',
    redirect: '/calculators/addition-calculator'
  },
  {
    path: '/en/calculators/lcm-calculator',
    redirect: '/calculators/lcm-calculator'
  },
  {
    path: '/en/calculators/gcf-calculator',
    redirect: '/calculators/gcf-calculator'
  },
  {
    path: '/en/calculators/kinetic-energy-calculator',
    redirect: '/calculators/kinetic-energy-calculator'
  },
  {
    path: '/en/calculators/long-multiplication-calculator',
    redirect: '/calculators/long-multiplication-calculator'
  },
  {
    path: '/en/calculators/convolution-calculator',
    redirect: '/calculators/convolution-calculator'
  },
  {
    path: '/en/calculators/arctan-calculator',
    redirect: '/calculators/arctan-calculator'
  },
  {
    path: '/en/calculators/arcsin-calculator',
    redirect: '/calculators/arcsin-calculator'
  },
  {
    path: '/en/calculators/arccos-calculator',
    redirect: '/calculators/arccos-calculator'
  },
  {
    path: '/en/calculators/anti-log-calculator',
    redirect: '/calculators/anti-log-calculator'
  },
  {
    path: '/en/calculators/addition-calculator',
    redirect: '/calculators/addition-calculator'
  },
  {
    path: '/en/calculators/subtraction-calculator',
    redirect: '/calculators/subtraction-calculator'
  },
  {
    path: '/en/calculators/multiplication-calculator',
    redirect: '/calculators/multiplication-calculator'
  },
  {
    path: '/en/calculators/division-calculator',
    redirect: '/calculators/division-calculator'
  },
  {
    path: '/en/calculators/square-calculator',
    redirect: '/calculators/square-calculator'
  },
  {
    path: '/en/calculators/cube-calculator',
    redirect: '/calculators/cube-calculator'
  },
  {
    path: '/en/calculators/factorial-calculator',
    redirect: '/calculators/factorial-calculator'
  },
  {
    path: '/en/calculators/percentage-calculator',
    redirect: '/calculators/percentage-calculator'
  },
  {
    path: '/en/calculators/percentage-change-calculator',
    redirect: '/calculators/percentage-change-calculator'
  },
  {
    path: '/en/calculators/average-calculator',
    redirect: '/calculators/average-calculator'
  },
  {
    path: '/en/calculators/dividing-fractions',
    redirect: '/calculators/dividing-fractions'
  },
  {
    path: '/en/calculators/simplifying-fractions',
    redirect: '/calculators/simplifying-fractions'
  },
  {
    path: '/en/calculators/wh-to-mah-calculator',
    redirect: '/calculators/wh-to-mah-calculator'
  },
  {
    path: '/en/calculators/watt-to-kva-calculator',
    redirect: '/calculators/watt-to-kva-calculator'
  },
  {
    path: '/en/calculators/watt-to-va-calculator',
    redirect: '/calculators/watt-to-va-calculator'
  },
  {
    path: '/en/calculators/wire-gauge-calculator',
    redirect: '/calculators/wire-gauge-calculator'
  },
  {
    path: '/en/calculators/watt-to-kwh-calculator',
    redirect: '/calculators/watt-to-kwh-calculator'
  },
  {
    path: '/en/calculators/amps-to-kilowatts-calculator',
    redirect: '/calculators/amps-to-kilowatts-calculator'
  },
  {
    path: '/en/calculators/amps-to-kva-calculator',
    redirect: '/calculators/amps-to-kva-calculator'
  },
  {
    path: '/en/calculators/amps-to-va-calculator',
    redirect: '/calculators/amps-to-va-calculator'
  },
  {
    path: '/en/calculators/amps-to-volts-calculator',
    redirect: '/calculators/amps-to-volts-calculator'
  },
  {
    path: '/en/calculators/amps-to-watts-calculator',
    redirect: '/calculators/amps-to-watts-calculator'
  },
  {
    path: '/en/calculators/electricity-bill-calculator',
    redirect: '/calculators/electricity-bill-calculator'
  },
  {
    path: '/en/calculators/energy-consumption-calculator',
    redirect: '/calculators/energy-consumption-calculator'
  },
  {
    path: '/en/calculators/ev-to-volts-calculator',
    redirect: '/calculators/ev-to-volts-calculator'
  },
  {
    path: '/en/calculators/joules-to-watts-calculator',
    redirect: '/calculators/joules-to-watts-calculator'
  },
  {
    path: '/en/calculators/joules-to-volts-calculator',
    redirect: '/calculators/joules-to-volts-calculator'
  },
  {
    path: '/en/calculators/kva-to-amps-calculator',
    redirect: '/calculators/kva-to-amps-calculator'
  },
  {
    path: '/en/calculators/kva-to-watts-calculator',
    redirect: '/calculators/kva-to-watts-calculator'
  },
  {
    path: '/en/calculators/kva-to-kw-calculator',
    redirect: '/calculators/kva-to-kw-calculator'
  },
  {
    path: '/en/calculators/kva-to-va-calculator',
    redirect: '/calculators/kva-to-va-calculator'
  },
  {
    path: '/en/calculators/kw-to-amps-calculator',
    redirect: '/calculators/kw-to-amps-calculator'
  },
  {
    path: '/en/calculators/kw-to-volts-calculator',
    redirect: '/calculators/kw-to-volts-calculator'
  },
  {
    path: '/en/calculators/kw-to-kwh-calculator',
    redirect: '/calculators/kw-to-kwh-calculator'
  },
  {
    path: '/en/calculators/kw-to-va-calculator',
    redirect: '/calculators/kw-to-va-calculator'
  },
  {
    path: '/en/calculators/kw-to-kva-calculator',
    redirect: '/calculators/kw-to-kva-calculator'
  },
  {
    path: '/en/calculators/kwh-to-kw-calculator',
    redirect: '/calculators/kwh-to-kw-calculator'
  },
  {
    path: '/en/calculators/kwh-to-watts-calculator',
    redirect: '/calculators/kwh-to-watts-calculator'
  },
  {
    path: '/en/calculators/mah-to-wh-calculator',
    redirect: '/calculators/mah-to-wh-calculator'
  },
  {
    path: '/en/calculators/ohms-law-calculator',
    redirect: '/calculators/ohms-law-calculator'
  },
  {
    path: '/en/calculators/power-calculator',
    redirect: '/calculators/power-calculator'
  },
  {
    path: '/en/calculators/va-to-amps-calculator',
    redirect: '/calculators/va-to-amps-calculator'
  },
  {
    path: '/en/calculators/va-to-watts-calculator',
    redirect: '/calculators/va-to-watts-calculator'
  },
  {
    path: '/en/calculators/va-to-kw-calculator',
    redirect: '/calculators/va-to-kw-calculator'
  },
  {
    path: '/en/calculators/va-to-kva-calculator',
    redirect: '/calculators/va-to-kva-calculator'
  },
  {
    path: '/en/calculators/voltage-divider-calculator',
    redirect: '/calculators/voltage-divider-calculator'
  },
  {
    path: '/en/calculators/voltage-drop-calculator',
    redirect: '/calculators/voltage-drop-calculator'
  },
  {
    path: '/en/calculators/volts-to-amps-calculator',
    redirect: '/calculators/volts-to-amps-calculator'
  },
  {
    path: '/en/calculators/watts-to-amps-calculator',
    redirect: '/calculators/watts-to-amps-calculator'
  },
  {
    path: '/en/calculators/watts-to-joules-calculator',
    redirect: '/calculators/watts-to-joules-calculator'
  },
  {
    path: '/en/calculators/watts-to-volts-calculator',
    redirect: '/calculators/watts-to-volts-calculator'
  },
  {
    path: '/en/calculators/volts-to-watts-calculator',
    redirect: '/calculators/volts-to-watts-calculator'
  },
  {
    path: '/en/calculators/volts-to-kw-calculator',
    redirect: '/calculators/volts-to-kw-calculator'
  },
  {
    path: '/en/calculators/volts-to-joules-calculator',
    redirect: '/calculators/volts-to-joules-calculator'
  },
  {
    path: '/en/calculators/volts-to-ev-calculator',
    redirect: '/calculators/volts-to-ev-calculator'
  },
  {
    path: '/en/calculators/watts-volts-amps-ohms-calculator',
    redirect: '/calculators/watts-volts-amps-ohms-calculator'
  },
  {
    path: '/en/calculators/electrical-calculator',
    redirect: '/calculators/electrical-calculator'
  },
  {
    path: '/en/calculators/math-calculators',
    redirect: '/calculators/math-calculators'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Always open page at the top (instant, no animation)
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, left: 0 }
    }
  }
})

// Router navigation guard to set locale based on URL
router.beforeEach((to, from, next) => {
  // Determine locale from route meta or URL path
  let locale = to.meta.locale
  
  // If no locale in meta, check if URL starts with a locale prefix
  if (!locale) {
    const pathSegments = to.path.split('/').filter(Boolean)
    if (pathSegments.length > 0 && supportedLocales.includes(pathSegments[0])) {
      locale = pathSegments[0]
    } else {
      // No prefix means English (default)
      locale = 'en'
    }
  }
  
  // Set i18n locale if available
  if (window.$i18n) {
    window.$i18n.locale = locale
  }
  
  // Also try to get i18n from the app instance if available
  try {
    const app = router.app
    if (app && app.config && app.config.globalProperties && app.config.globalProperties.$i18n) {
      app.config.globalProperties.$i18n.locale = locale
    }
  } catch (e) {
    // App might not be available yet, that's okay
  }
  
  // Update HTML lang attribute
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale
  }
  
  // Save preference to localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('preferred-language', locale)
  }
  
  next()
})

export { supportedLocales, getLocalePath }
export default router
