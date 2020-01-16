### Cataloger

Cataloger is a simple catalog builder for artists. Use the following steps to get started.

1. Clone this repository locally into a folder and `cd` into that folder.
2. Install all the dependencies with `npm ci`
3. Run the build command with `npm run build` This will generate a new folder called `dist` which will have your catalog built out as HTML files and ready for deployment.
4. On another terminal run `npm run serve` This will spin up a server that serves the contents of the `dist` folder.
5. Visit the server url (it should be at http://localhost:5000) in your browser. Your catalog should be up!

## Adding pages
You can start editing the `pages/index.md` file as you like. Once you edit, you will need to re-run the `npm run build` command to update the built out files.

To add a new series of artworks, create a new markdown file inside of `pages`, following the `myfirstartwork.md` file as a template. All images associated with the artwork must be placed in a folder inside `src/static/images`. Once you add a new file, re-run the build command to rebuild the site.

Keep iterating until you have finished adding all the pages you want.