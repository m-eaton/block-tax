import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Taxes from '@/components/Taxes'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/taxes',
      name: 'Taxes',
      component: Taxes
    }
  ]
})
