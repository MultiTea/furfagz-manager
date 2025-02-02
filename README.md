# Furfagz Band Manager

Even though having a music band is great, only the "**playing on stage**" part is fun. The rest is kind of a hassle : creating setlists, scheduling rehearsals, managing the budget, organize and give informations to FH... So, what better than creating a web app to help us out organizing and managing most of it? Introducing **Furfagz Band Manager**!

## Features

- **User Authentication**: Secure login and registration system using Supabase
- **Personal Playlists**: Each band member can maintain their own playlist of song suggestions for the next performances by copy/pasting YouTube and Spotify links
- **Setlist Management**: Admins can create and organize setlists from suggested songs with intuitive drag-and-drop interface for reordering
- **Member Profiles**: Customizable profiles with avatars and role assignments, gear listing, stages needs and specificities
- **Responsive Design**: Full mobile and desktop support using Tailwind CSS

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (Latest LTS version recommended)
- npm or yarn
- A Supabase account for database and authentication
- API keys for YouTube and Spotify integration

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
YOUTUBE_API_KEY=your_youtube_api_key
```

## Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd furfagz-manager
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Build for production:

```bash
npm run build
# or
yarn build
```

## Database Setup

This project uses Supabase as its database. You'll need to set up the following tables:

- `band_members`: Stores user profiles and roles
- `playlist_songs`: Stores songs and their metadata, and manage setlists

Refer to the `types/supabase.ts` file for the complete database schema.

## Tech Stack

- **Framework**: Nuxt 3
- **State Management**: Pinia
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **API Integrations**: YouTube API, Spotify API
- **Deployment**: Netlify

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Deployment

The project is configured for deployment on Netlify. The `netlify.toml` file contains the necessary configuration.

To deploy:

1. Connect your repository to Netlify
2. Configure environment variables in Netlify's dashboard
3. Deploy using Netlify's continuous deployment

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
