import { type MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Plan B Streaming',
    short_name: 'Plan B',
    description: 'Tu alternativa para ver televisión en vivo.',
    start_url: '/',
    display: 'standalone',
    background_color: '#030617',
    theme_color: '#030617',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
