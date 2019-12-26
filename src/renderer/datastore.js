import Store from 'nedb'
import path from 'path'
import { remote } from 'electron'

export default {
  snippets: new Store({
    autoload: true,
    filename: path.join(remote.app.getPath('home'), 'MassCode/snippets.db')
  }),
  tags: new Store({
    autoload: true,
    filename: path.join(remote.app.getPath('home'), 'MassCode/tags.db')
  }),
  masscode: new Store({
    autoload: true,
    filename: path.join(remote.app.getPath('home'), 'MassCode/masscode.db')
  })
}
