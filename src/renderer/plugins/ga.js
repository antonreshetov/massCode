import Vue from 'vue'
import VueAnalytics from 'vue-analytics'
import router from '@/router'
const version = require('../../../package.json').version

Vue.use(VueAnalytics, {
  id: 'UA-56182454-13',
  router,
  debug: {
    enabled: false,
    sendHitTask: process.env.NODE_ENV === 'production'
  }
})

Vue.$ga.event({
  eventCategory: 'App',
  eventAction: 'Version',
  eventLabel: version
})
