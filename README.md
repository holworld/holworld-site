# House of Legends

The website for House of Legends, South Delhi: holworld.com

A static site served by GitHub Pages from this repository, with DNS at name.com. Every page is already built, so there is nothing to install or run: edit the HTML, CSS or images and push to `main`.

Photographs of the works live in `assets/img/works/`: a `.jpg` master, a `.webp` for the page and a smaller `.webp` in `thumb/` for grids. Each photograph is cropped to the edge of the work itself, with frames, mounts and background removed. If you replace a photograph, keep all three files and update the `width` and `height` on the pages that show it.

Artists are listed on `artists.html`, and each has one page, `artist-<name>.html`, built the same way: their story, their works in the house, and links to the previous and next artist. Archival photographs of the masters live in `assets/img/portraits/` (a `.jpg` and `.webp` at 800 × 1000, and a 440 × 550 `.webp` in `thumb/`). Every other artist's tile on the Artists page is a 440 × 550 detail of one of their works, in `assets/img/artists/`. `masters.html` and `nandalal-bose.html` only forward old links to the new pages.

The collection page shows every work in one grid. Each card carries `data-artist` and `data-medium` (painting, drawing, sculpture or postcard), which the filters use. Links such as `collection.html?artist=indra-dugar&kind=postcard` open it already filtered.
