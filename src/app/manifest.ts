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
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      }
    ],
  }
}
