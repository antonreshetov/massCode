export function clone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

export function guid () {
  return Math.random()
    .toString(36)
    .substring(2, 15)
}

export function updateNodeById (nodes = [], id, payload) {
  for (const [, node] of nodes.entries()) {
    if (node.id === id) {
      for (const prop in node) {
        node[prop] = payload[prop]
      }
      break
    }

    if (node.children.length) {
      updateNodeById(node.children, id)
    }
  }
}

export function deleteNodeById (nodes = [], id) {
  for (const [index, node] of nodes.entries()) {
    if (node.id === id) {
      nodes.splice(index, 1)
      break
    }
    if (node.children.length) {
      deleteNodeById(node.children, id)
    }
  }
}

export function pushNodeById (nodes = [], id, payload) {
  for (const [, node] of nodes.entries()) {
    if (node.id === id) {
      node.children.push(payload)
      break
    }

    if (node.children.length) {
      pushNodeById(node.children, id, payload)
    }
  }
}

export function insertNodeById (nodes = [], id, payload, position = 'after') {
  for (const [index, node] of nodes.entries()) {
    if (node.id === id) {
      if (position === 'after') {
        console.log('insert after', node.name, payload.name, index)
        nodes.splice(index + 1, 0, payload)
      }
      if (position === 'before') {
        console.log('insert before')
        nodes.unshift(payload)
      }
      break
    }

    if (node.children.length) {
      insertNodeById(node.children, id, payload, position)
    }
  }
}

export function toggleNodeById (nodes = [], id) {
  for (const [, node] of nodes.entries()) {
    if (node.id === id) {
      node.open = !node.open
      break
    }

    if (node.children.length) {
      toggleNodeById(node.children, id)
    }
  }
}
