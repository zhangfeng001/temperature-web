import Vue from 'vue'
import Router from 'vue-router'
import Temperature from '@/components/temperature.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Temperature',
      component: Temperature
    }
  ]
})
