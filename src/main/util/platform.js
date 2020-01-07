export function convertName (platform) {
  if (platform === 'darwin') {
    return 'macOS'
  }
  if (platform === 'win32') {
    return 'Windows'
  }
  if (platform === 'linux') {
    return 'Linux'
  }
}
