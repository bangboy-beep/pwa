/**
 * Utility untuk menyalin teks ke clipboard dengan dukungan:
 * 1. Modern navigator.clipboard (HTTPS & localhost)
 * 2. Fallback document.execCommand('copy') untuk koneksi HTTP via IP lokal (misal: http://192.168.x.x di HP)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false

  // 1. Coba Clipboard API modern jika didukung dan diizinkan
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.warn('navigator.clipboard gagal, mencoba fallback execCommand:', err)
    }
  }

  // 2. Fallback untuk non-secure context (HTTP via IP Address di HP)
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.top = '0'
    textArea.style.left = '0'
    textArea.style.width = '2em'
    textArea.style.height = '2em'
    textArea.style.padding = '0'
    textArea.style.border = 'none'
    textArea.style.outline = 'none'
    textArea.style.boxShadow = 'none'
    textArea.style.background = 'transparent'
    textArea.style.opacity = '0'
    textArea.setAttribute('readonly', '')
    
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    textArea.setSelectionRange(0, textArea.value.length)
    
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    return successful
  } catch (err) {
    console.error('Fallback execCommand gagal:', err)
    return false
  }
}
