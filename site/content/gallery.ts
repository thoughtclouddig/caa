/**
 * The photograph gallery.
 *
 * CAA's own photographs, carried over from catholicaviation.org. Captions
 * describe what is actually in the frame rather than decorating it, and
 * they double as the alt text, because a gallery where the caption and the
 * alt text disagree is a gallery that was not really checked.
 *
 * Credits are kept where the existing site credits them.
 */
export type GalleryPhoto = {
  src: string;
  caption: string;
  credit?: string;
  /** Portrait and landscape shots sit differently in the grid. */
  tall?: boolean;
};

export const GALLERY: GalleryPhoto[] = [
  {
    src: "/gallery/flight-simulator-build.jpg",
    caption: "CAA Indianapolis members at work on the flight simulator, built from a section of glider fuselage.",
  },
  {
    src: "/gallery/aircraft-blessing.jpg",
    caption: "An Aeronca Chief blessed on the grass, October 2024.",
  },
  {
    src: "/gallery/ncyc-stand.jpg",
    caption: "Tom Beckenbauer and Christian Tombers at the CAA stand, National Catholic Youth Conference.",
  },
  {
    src: "/gallery/citabria-sunset.jpg",
    caption: "Out under the wing of a Citabria at sunset over Indiana farmland.",
    credit: "Laura Stants",
  },
  {
    src: "/gallery/noblesville.jpg",
    caption: "The CAA tent at Noblesville, under the banner reading Let Us Fly to Christ.",
  },
  {
    src: "/gallery/westfield.jpg",
    caption: "CAA at Westfield, Indiana.",
  },
  {
    src: "/gallery/hillsdale-flag-jump.jpg",
    caption: "A parachutist under canopy with the flag, Hillsdale College, August 2024.",
  },
  {
    src: "/gallery/cessna-310.png",
    caption: "A Cessna 310.",
  },
  {
    src: "/gallery/lifted.jpg",
    caption: "Lifted, May 2024.",
  },
  {
    src: "/gallery/eucharist.jpg",
    caption: "The Blessed Sacrament.",
    tall: true,
  },
  {
    src: "/gallery/divine-mercy.jpg",
    caption: "Divine Mercy, Diocese of Raleigh.",
    tall: true,
  },
  {
    src: "/gallery/caa-banner.jpg",
    caption: "The Catholic Aviation Association banner: Faith, Flying and Fellowship.",
  },
];
