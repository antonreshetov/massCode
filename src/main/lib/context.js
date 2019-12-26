import { remote } from 'electron'
const { Menu, MenuItem } = remote

function popup (templates) {
  const menu = new Menu()
  templates.forEach(item => {
    menu.append(new MenuItem(item))
  })
  menu.popup(remote.getCurrentWindow())

  return menu
}

const context = {
  popup
}

export default context
