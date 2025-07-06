# Plan B Streaming

This is a Next.js application for streaming live TV channels and movies, built with Firebase integration.

## Getting Started

### 1. Environment Variables

First, create a file named `.env.local` in the root of your project by copying the example `.env` file:

```bash
cp .env .env.local
```

Now, open `.env.local` and fill in the required values for your Firebase project and the TMDb API.

-   `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API Key.
-   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase Auth Domain.
-   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase Project ID.
-   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase Storage Bucket.
-   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase Messaging Sender ID.
-   `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase App ID.
-   `TMDB_API_KEY`: Your TheMovieDB API key (v3 auth).

**Important**: The `TMDB_API_KEY` is used server-side and will not be exposed to the client. The `NEXT_PUBLIC_` prefix is required for the Firebase config to be accessible on the client-side.

### 2. Install Dependencies and Run

Next, install the dependencies and run the development server:

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Firebase Setup

This application is configured to connect to a Firebase project.

1.  **Firebase Configuration**: The Firebase configuration is now securely managed via environment variables in your `.env.local` file.

2.  **Firestore Database**: The application expects a Firestore database with five main collections: `channels`, `radio`, `peliculas`, `agenda`, `tournaments`, and `teams`.

3.  **Data Structure**:
    -   **`channels` Collection**: Each document represents a TV channel.
        ```json
        {
          "name": "Channel Name",
          "logoUrl": "https://...",
          "streamUrl": ["https://... (primary link)", "https://... (fallback link)"],
          "category": "Category Name",
          "description": "A brief channel description."
        }
        ```
    -   **`radio` Collection**: Each document represents a radio station.
        ```json
        {
          "name": "Radio Name",
          "logoUrl": "https://...",
          "streamUrl": ["https://... (primary link)", "https://... (fallback link)"]
        }
        ```

    -   **`peliculas` Collection**: Each document represents a movie.
        ```json
        {
            "tmdbID": "157336",
            "streamUrl": "https://... (mp4 or iframe link)",
            "format": "mp4" or "iframe",
            "title": "(Optional) Title to override TMDb's",
            "posterUrl": "(Optional) Poster URL to override",
            "synopsis": "(Optional) Synopsis to override"
        }
        ```
        -   **`(Required)` `tmdbID`**: The TheMovieDB ID of the movie. The app will fetch all other details automatically from the TMDb API.
        
    -   **`agenda` Collection**: This collection holds all scheduled matches.
        ```json
        {
            "team1": "boca-juniors",
            "team2": "river-plate",
            "time": "(Timestamp) June 20, 2025 at 4:00:00 PM (Your Local Time)",
            "tournamentId": "liga-profesional-arg",
            "channels": ["deportes-1", "deportes-2"],
            "dates": "Fase de grupos · Grupo E · Jornada 2 de 3"
        }
        ```
        -   **`team1`, `team2`**: The **document ID** of the respective team from the `teams` collection group.
        -   **`time`**: **(Required)** This must be of type **`timestamp`** in Firestore. It determines when the match is shown. The application will correctly display it in Argentinian time (UTC-3). Matches appear on the homepage only if their start date is the current day and disappear 3 hours after they have started.
        -   **`tournamentId`**: **(Required)** A **string** that must exactly match the `id` field of a document in the `tournaments` collection.
        -   **`channels`**: An array of **strings**, where each string is the document ID of a channel from your `channels` collection.
        -   **`dates`**: An optional **`string`** field for extra details (e.g., "Round 1 of 3").

    -   **`tournaments` Collection**: Holds details for each competition. The document ID can be anything for organizational purposes, but the linking happens via the `id` field inside.
        ```json
        {
            "id": "liga-profesional-arg",
            "name": "Liga Profesional Argentina",
            "logoUrl": ["https://... (dark theme logo)", "https://... (light theme logo)"]
        }
        ```
        -   **`id`**: **(Required)** The unique string ID for the tournament. This is the value you must use in the `tournamentId` field of your `agenda` documents.
        -   **`name`**: The full name of the tournament.
        -   **`logoUrl`**: An **array** of strings. The first URL is for dark mode, the second for light mode. If only one URL is provided, it will be used for both themes.

    -   **`teams` Collection**: This is structured as a collection group for better organization.
        -   **Structure:** `teams` -> `{country_document}` -> `clubs` -> `{team_document}`
        -   Each **team document** has the following structure:
        ```json
        {
            "name": "Team Name",
            "logoUrl": "https://...",
            "country": "Country Name"
        }
        ```
        -   The **document ID** of each team is used in the `agenda`.

4.  **Security Rules**: For production, ensure your Firestore security rules are properly configured to allow public read access.
    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Allow reads on all collections for this example
        match /{document=**} {
          allow read: if true;
          allow write: if false; // Or your admin logic
        }
      }
    }
    ```

### 5. Image Domain Configuration

For security and performance, Next.js requires all external image hostnames to be explicitly whitelisted. If you need to add team logos or channel images from a new source (e.g., `i.imgur.com`), you must add its hostname to the `next.config.js` file.

**Example: Adding a new domain**

Open `next.config.js` and add a new object to the `remotePatterns` array:

```javascript
// next.config.js
module.exports = {
  // ... other configs
  images: {
    remotePatterns: [
      // ... existing patterns
      {
        protocol: 'https',
        hostname: 'new.image-host.com',
      },
    ],
  },
};
```

After modifying this file, **you must restart the development server** for the changes to take effect.

For demonstration purposes, the application will use placeholder data if it cannot fetch data from Firebase.
