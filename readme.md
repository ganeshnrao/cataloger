### Cataloger

Cataloger is a simple catalog builder for artists. Use the following steps to get started.

1. Clone this repository locally into a folder and `cd` into that folder.
2. Install all the dependencies with `npm ci`
3. Run the build command with `npm run build` This will generate a new folder called `dist` which will have your catalog built out as HTML files and ready for deployment.
4. On another terminal run `npm run serve` from the same folder. This will spin up a server that serves the contents of the `dist` folder.
5. Visit the server url (it should be at http://localhost:5000) in your browser. Your catalog should be up!

## Adding pages
You can start editing the `pages/index.md` file as you like. Once you edit, you will need to re-run the `npm run build` command to update the built out files.

To add a new series of artworks, create a new markdown file inside of `pages`, following the `myfirstartwork.md` file as a template. All images associated with the artwork must be placed in a folder inside `src/static/images`. Once you add a new file, re-run the build command to rebuild the site.

At the top of the markdown file, you must include a front-matter (YAML) data, which looks like the following,
```yaml
---
url: /myfirstartwork # this is the url at whic the page will be created
template: index # this is the name of the pug template file that will be used to render this page
isCatalogItem: true # when set to true this page will be added to the catalog menu bar
title: My First Artwork
caption: Brief description of artwork
year: 2019-05-09
media:
  - images: myfirstartwork # name of the folder inside of src/static/images that contains all the image files to be rendered on this page
---
```

Keep iterating until you have finished adding all the pages you want.

## Deploying your site to Netlify
Once you have added all the pages you like, you can publish the catalog on Netlify for free.

1. Create a new repository on Github and push the cataloger folder to it
2. Go to http://netlify.com and signup with your Github account
3. On Netlify choose to deploy from the new repository you created. In the build steps, set the following.
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Set an environment variable `NODE_ENV` as `production`
