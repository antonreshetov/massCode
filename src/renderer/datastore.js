import Store from 'nedb'
import path from 'path'
import { remote } from 'electron'

const isDev = process.env.NODE_ENV === 'development'
const folder = isDev ? 'MassCode/dev' : 'MassCode'

export default {
  snippets: new Store({
    autoload: true,
    filename: path.join(remote.app.getPath('home'), `${folder}/snippets.db`)
  }),
  tags: new Store({
    autoload: true,
    filename: path.join(remote.app.getPath('home'), `${folder}/tags.db`)
  }),
  masscode: new Store({
    autoload: true,
    filename: path.join(remote.app.getPath('home'), `${folder}/masscode.db`)
  })
}
