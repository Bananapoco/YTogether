let apiPromise: Promise<void> | undefined

export function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) {
    return Promise.resolve()
  }

  if (apiPromise) {
    return apiPromise
  }

  apiPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]',
    )
    const script = existingScript ?? document.createElement("script")
    const previousReadyHandler = window.onYouTubeIframeAPIReady

    window.onYouTubeIframeAPIReady = () => {
      previousReadyHandler?.()
      resolve()
    }

    script.addEventListener("error", () => reject(new Error("YouTube player failed to load")), {
      once: true,
    })

    if (!existingScript) {
      script.src = "https://www.youtube.com/iframe_api"
      document.head.appendChild(script)
    }
  })

  return apiPromise
}

export function extractVideoId(input: string): string | null {
  const value = input.trim()

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value
  }

  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, "")

    if (host === "youtu.be") {
      return validVideoId(url.pathname.slice(1).split("/")[0])
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        return validVideoId(url.searchParams.get("v"))
      }

      const [, route, videoId] = url.pathname.split("/")
      if (["embed", "shorts", "live"].includes(route)) {
        return validVideoId(videoId)
      }
    }
  } catch {
    return null
  }

  return null
}

function validVideoId(value: string | null | undefined) {
  return value && /^[a-zA-Z0-9_-]{11}$/.test(value) ? value : null
}
