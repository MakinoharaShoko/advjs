import consola from 'consola'

export function isVideo(path: string) {
  return /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/.test(path)
}

export function isImage(path: string) {
  return /\.(jpeg|jpg|gif|png|svg|webp)(\?.*)?$/.test(path.toLowerCase())
}

export function isAudio(path: string) {
  return /\.(mp3|wav|flac|aac)(\?.*)?$/.test(path.toLowerCase())
}

export function isPDF(path: string) {
  return /\.(pdf)(\?.*)?$/.test(path.toLowerCase())
}

export function isWord(path: string) {
  return /\.(doc|docx)(\?.*)?$/.test(path.toLowerCase())
}

export function isExcel(path: string) {
  return /\.(xls|xlsx)(\?.*)?$/.test(path.toLowerCase())
}

export function isPowerPoint(path: string) {
  return /\.(ppt|pptx)(\?.*)?$/.test(path.toLowerCase())
}

export function isArchive(path: string) {
  return /\.(zip|tar|gz|rar|7z)(\?.*)?$/.test(path.toLowerCase())
}

export function isCode(path: string) {
  return /\.(js|css|html|vue|ts|md|json)(\?.*)?$/.test(path.toLowerCase())
}

export function isText(path: string) {
  return /\.(txt|log|csv)(\?.*)?$/.test(path.toLowerCase())
}

export function isMarkdown(path: string) {
  return /\.(md)(\?.*)?$/.test(path.toLowerCase())
}

export function isJSON(path: string) {
  return /\.(json)(\?.*)?$/.test(path.toLowerCase())
}

/**
 * get file type from path
 */
export function getFiletypeFromPath(path: string) {
  if (!path)
    return ''

  if (path.endsWith('/'))
    return 'folder'
  const ext = path.split('.').pop()
  if (!ext)
    return 'file'
  if (isImage(path))
    return 'image'
  if (isVideo(path))
    return 'video'
  if (isJSON(path))
    return 'json'

  consola.warn('unknown file type:', path)
  return ext
}

/**
 * get icon from file type
 */
export function getIconFromFileType(filetype: string) {
  switch (filetype) {
    case 'folder':
      return 'i-vscode-icons-default-folder'
    case 'image':
      return 'i-vscode-icons-file-type-image'
    case 'video':
      return 'i-vscode-icons-file-type-video'
    case 'audio':
      return 'i-vscode-icons-file-type-audio'
    case 'pdf':
      return 'i-vscode-icons-file-type-pdf2'
    case 'word':
      return 'i-vscode-icons-file-type-word'
    case 'excel':
      return 'i-vscode-icons-file-type-excel'
    case 'powerpoint':
      return 'i-vscode-icons-file-type-powerpoint'

    case 'archive':
      return 'i-vscode-icons-file-type-zip'
    case 'md':
      return 'i-vscode-icons-file-type-markdown'
    case 'json':
      return 'i-vscode-icons-file-type-json'
    case 'vue':
      return 'i-vscode-icons-file-type-vue'
    case 'ts':
    case 'mts':
    case 'typescript':
      return 'i-vscode-icons-file-type-typescript'
    case 'js':
    case 'cjs':
    case 'mjs':
    case 'javascript':
      return 'i-vscode-icons-file-type-js'
    case 'css':
      return 'i-vscode-icons-file-type-css'
    case 'html':
      return 'i-vscode-icons-file-type-html'
    case 'yaml':
    case 'yml':
      return 'i-vscode-icons-file-type-yaml'

    case 'text':
      return 'i-vscode-icons-file-type-text'
    default:
      return 'i-vscode-icons-default-file'
  }
}
