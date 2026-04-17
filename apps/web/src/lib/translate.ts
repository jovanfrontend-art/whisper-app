export async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    const res = await fetch(url)
    if (!res.ok) return text
    const data = await res.json()
    return (data[0] as [string][]).map(item => item[0]).join('')
  } catch {
    return text
  }
}

export async function translateBatch(texts: string[], targetLang: string): Promise<string[]> {
  return Promise.all(texts.map(t => translateText(t, targetLang)))
}
