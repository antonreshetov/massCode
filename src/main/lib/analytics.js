import ua from 'universal-analytics'
import store from '../store'
import { convertName } from '../util/platform'

const pkg = require('../../../package.json')

const analytics = ua('UA-56182454-13')
const isDev = process.env.NODE_ENV === 'development'

function track (path) {
  if (isDev) return

  const isAllowAnalytics = store.get('allowAnalytics')

  if (isAllowAnalytics) {
    const version = pkg.version
    analytics.pageview(`${version}/${path}`).send()
  }
}

function trackEvent (category, action, label, value) {
  if (isDev) return

  const isAllowAnalytics = store.get('allowAnalytics')
  const version = pkg.version

  if (isAllowAnalytics) {
    analytics.event(`${version}-${category}`, action, label, value).send()
  }
}

function initAnalytics () {
  if (isDev) return

  if (store.get('allowAnalytics') === undefined) {
    store.set('allowAnalytics', true)
  }

  const version = pkg.version
  const installedVersion = store.get('install')

  if (installedVersion !== version) {
    store.set('install', version)
    const os = convertName(process.platform)
    track(`${os}/install`)
  }
}

export { track, trackEvent, initAnalytics }
