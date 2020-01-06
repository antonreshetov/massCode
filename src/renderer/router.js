import Vue from 'vue'
import Router from 'vue-router'
import Preferences from './views/Preferences.vue'
import Main from './views/Main.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main',
      component: Main
    },
    {
      path: '/preferences',
      name: 'preferences',
      component: Preferences
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
