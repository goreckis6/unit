import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import AdditionCalculator from '../views/calculators/AdditionCalculator.vue'
import WireGaugeCalculator from '../views/calculators/WireGaugeCalculator.vue'
import MathCalculators from '../views/calculators/MathCalculators.vue'
import ElectricalCalculator from '../views/calculators/ElectricalCalculator.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/calculators/math-calculators',
    name: 'MathCalculators',
    component: MathCalculators
  },
  {
    path: '/calculators/addition-calculator',
    name: 'AdditionCalculator',
    component: AdditionCalculator
  },
  {
    path: '/calculators/electrical-calculator',
    name: 'ElectricalCalculator',
    component: ElectricalCalculator
  },
  {
    path: '/calculators/wire-gauge-calculator',
    name: 'WireGaugeCalculator',
    component: WireGaugeCalculator
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
