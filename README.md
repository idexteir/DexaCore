# DexaCore

DexaCore is a modular, extensible front-end framework template for rapid web app prototyping. It features authentication support (via Supabase), customizable modules, and a simple page-based routing structure.

## Features
- Modular structure for various pages/features (dashboard, notes, properties, etc).
- Supabase integration for authentication and database access.
- Easily extensible for new modules and UI components.
- Designed for static hosting (e.g., GitHub Pages).

## Quick Start
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/DexaCore.git
   cd DexaCore
   ```
2. **Configure Supabase:**
   - Open `config.js`.
   - Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your Supabase project credentials.

   ```js
   supabase: {
       url: "YOUR_SUPABASE_URL",
       anonKey: "YOUR_SUPABASE_ANON_KEY"
   }
   ```
3. **Run the app:**
   - Open `index.html` directly in your browser, or
   - Use a simple local server (recommended):
     ```bash
     npx serve .
     # or
     python -m http.server
     ```

## Folder Structure
- `/core` – Essential logic: authentication, routing, bootstrapping
- `/modules` – Feature modules (dashboard, auth, example, etc.)
- `/ui` – Reusable UI components and styling
- `/assets` – Images and CSS themes
- `/data` – Data entities and structures
- `/utils` – Utility/helper functions

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change or add.

## License
See [LICENSE](LICENSE) for details.
