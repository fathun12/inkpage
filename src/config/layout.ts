// Layout settings of the public website (Customize studio, "Layout"). Plain data: no database and no React here.
// Only the names live here. The sizes (rem) are in styles/site.css (--sec and the .site-proj-* rules).

import { fontIds } from "@/config/font-choices";

export const densityModes = ["compact", "comfortable", "airy"] as const;
export type DensityMode = (typeof densityModes)[number];

export const densityLabels: Record<DensityMode, string> = {
  compact: "Compact",
  comfortable: "Comfortable",
  airy: "Airy",
};

export const densityHints: Record<DensityMode, string> = {
  compact: "Sections sit close together.",
  comfortable: "The original space between sections.",
  airy: "More empty space between sections.",
};

export const projectSizes = ["small", "medium", "large"] as const;
export type ProjectSize = (typeof projectSizes)[number];

export const projectSizeLabels: Record<ProjectSize, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

export const projectSizeHints: Record<ProjectSize, string> = {
  small: "Narrow photo column, small title, tight rows.",
  medium: "A bit narrower photos and tighter rows.",
  large: "The original size.",
};

// How the Projects section looks on Home. The Projects page is always a list.
export const projectViews = ["list", "grid", "slider"] as const;
export type ProjectView = (typeof projectViews)[number];

export const projectViewLabels: Record<ProjectView, string> = {
  list: "List",
  grid: "Grid",
  slider: "Slider",
};

export const projectViewHints: Record<ProjectView, string> = {
  list: "Photos on the left, text on the right (the original).",
  grid: "Two columns: one photo on top, text below. One column on a phone.",
  slider: "One project at a time. It slides by itself and has arrows.",
};

// How the Design projects section looks on Home. Grid is the original look.
export const designViews = ["grid", "list", "slider"] as const;
export type DesignView = (typeof designViews)[number];

export const designViewLabels: Record<DesignView, string> = {
  grid: "Grid",
  list: "List",
  slider: "Slider",
};

export const designViewHints: Record<DesignView, string> = {
  grid: "Cards side by side: cover, photos and title (the original).",
  list: "One project per row: photos on the left, text on the right.",
  slider: "One project at a time. It slides by itself and has arrows.",
};

export const designSizes = ["small", "medium", "large"] as const;
export type DesignSize = (typeof designSizes)[number];

export const designSizeLabels: Record<DesignSize, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

export const designSizeHints: Record<DesignSize, string> = {
  small: "Five cards per row. In List and Slider: the narrowest photo column and the smallest title.",
  medium: "Four cards per row. In List and Slider: a narrower photo column and a smaller title.",
  large: "The original size: three cards per row on a wide screen.",
};

// Design projects on Home: inside the page margins (Centered, the original) or edge to edge (Full width).
export const designModes = ["centered", "full"] as const;
export type DesignMode = (typeof designModes)[number];

export const designModeLabels: Record<DesignMode, string> = {
  centered: "Centered",
  full: "Full width",
};

export const designModeHints: Record<DesignMode, string> = {
  centered: "Inside the page margins, clean on the left and right (the original).",
  full: "Edge to edge, like the hero and the gallery.",
};

// The Full width forms.
export const designWideViews = ["stack", "stackslide", "split", "sheet", "mosaic", "filmstrip"] as const;
export type DesignWideView = (typeof designWideViews)[number];

export const designWideViewLabels: Record<DesignWideView, string> = {
  stack: "Stack",
  stackslide: "Stack slide",
  split: "Split",
  sheet: "Contact sheet",
  mosaic: "Mosaic",
  filmstrip: "Filmstrip",
};

export const designWideViewHints: Record<DesignWideView, string> = {
  stack: "One project per row: one photo across the whole screen, then the title.",
  stackslide: "Like Stack, but one project at a time across the whole screen. It slides by itself and has arrows.",
  split: "Two columns edge to edge with tall photos.",
  sheet: "Square photos touching each other, like a contact sheet. The title shows on hover.",
  mosaic: "Photos of different sizes in one tight grid.",
  filmstrip: "One row of tall photos that slides sideways, with arrows.",
};

// The title of the Design projects section and the text under it (Customize, Sections, Design projects).
// The text itself is written in Pages (Home tab). The default look is the small label, as before.
export const designTitleAligns = ["full", "center", "left", "right"] as const;
export type DesignTitleAlign = (typeof designTitleAligns)[number];

export const designTitleAlignLabels: Record<DesignTitleAlign, string> = {
  full: "Full",
  center: "Centered",
  left: "Left edge",
  right: "Right edge",
};

export const designTitleAlignHints: Record<DesignTitleAlign, string> = {
  full: "One full row: the title at the left edge of the screen, the text at the right edge.",
  center: "Inside the page margins (the original).",
  left: "Stuck to the left edge of the screen.",
  right: "Stuck to the right edge of the screen.",
};

// "default" = the font the text already has (for the title at Auto size: the small label).
export const designTextFonts = ["default", ...fontIds] as const;
export type DesignFont = (typeof designTextFonts)[number];

export const designTitleSizes = ["auto", "small", "medium", "large", "huge", "giant"] as const;
export type DesignTitleSize = (typeof designTitleSizes)[number];

export const designTitleSizeLabels: Record<DesignTitleSize, string> = {
  auto: "Auto",
  small: "Small",
  medium: "Medium",
  large: "Large",
  huge: "Huge",
  giant: "Giant",
};

export const designIntroSizes = ["auto", "small", "medium", "large"] as const;
export type DesignIntroSize = (typeof designIntroSizes)[number];

export const designIntroSizeLabels: Record<DesignIntroSize, string> = {
  auto: "Auto",
  small: "Small",
  medium: "Medium",
  large: "Large",
};

// The Showcase section of Home (the detailed projects ticked "Show as Showcase"). List is the original look.
// Mode (Centered or Full width), the title place, the fonts and the title sizes reuse the Design names above.
export const showcaseViews = ["list", "grid", "slider"] as const;
export type ShowcaseView = (typeof showcaseViews)[number];

export const showcaseViewLabels: Record<ShowcaseView, string> = {
  list: "List",
  grid: "Grid",
  slider: "Slider",
};

export const showcaseViewHints: Record<ShowcaseView, string> = {
  list: "One project per row: main photo on the left, text on the right, photos below (the original).",
  grid: "Cards side by side: main photo on top, text below. One column on a phone.",
  slider: "One project at a time. It slides by itself and has arrows.",
};

export const showcaseSizes = ["small", "medium", "large"] as const;
export type ShowcaseSize = (typeof showcaseSizes)[number];

export const showcaseSizeLabels: Record<ShowcaseSize, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

export const showcaseSizeHints: Record<ShowcaseSize, string> = {
  small: "Grid: four cards per row. List and Slider: the narrowest photo column and the smallest title.",
  medium: "Grid: three cards per row. List and Slider: a narrower photo column and a smaller title.",
  large: "The original size: two cards per row in Grid, the original photo column in List.",
};

export const showcaseWideViews = ["stack", "stackslide", "split", "filmstrip", "sheet", "mosaic"] as const;
export type ShowcaseWideView = (typeof showcaseWideViews)[number];

export const showcaseWideViewLabels: Record<ShowcaseWideView, string> = {
  stack: "Stack",
  stackslide: "Stack slide",
  split: "Split",
  filmstrip: "Filmstrip",
  sheet: "Contact sheet",
  mosaic: "Mosaic",
};

export const showcaseWideViewHints: Record<ShowcaseWideView, string> = {
  stack: "One project per row: one photo or video across the whole screen, then title and buttons.",
  stackslide: "Like Stack, but one project at a time across the whole screen. It slides by itself and has arrows.",
  split: "Photo on one half of the screen, text on the other half. The sides swap on each project.",
  filmstrip: "One row of tall panels that slides sideways, with arrows.",
  sheet: "Square photos touching each other. Only the title shows, on hover.",
  mosaic: "Photos of different sizes in one tight grid. Only the title shows.",
};

// The photo of the Stack and Stack slide layouts (Showcase and Design projects): its shape, and (when the shape is
// wide) which part of it shows. Default = as before: 16:9, or the Photo height.
export const stackRatios = ["default", "normal", "wide", "ultra"] as const;
export type StackRatio = (typeof stackRatios)[number];

export const stackRatioLabels: Record<StackRatio, string> = {
  default: "Default",
  normal: "Normal",
  wide: "Wide",
  ultra: "Ultra-wide",
};

export const stackRatioHints: Record<StackRatio, string> = {
  default: "As before: 16:9, or the Photo height above.",
  normal: "16:9. The Photo height above is not used.",
  wide: "21:9, a wide and low photo. The photo is cropped; move the crop to choose which part shows.",
  ultra: "32:9, very wide and low. The photo is cropped; move the crop to choose which part shows.",
};

export const stackAspect: Record<Exclude<StackRatio, "default">, string> = {
  normal: "16 / 9",
  wide: "21 / 9",
  ultra: "32 / 9",
};

// The Writing section of Home (cards of writing from other websites). Slider is the original look.
// Mode, the title place, the fonts and the title sizes reuse the Design names above.
export const writingViews = ["slider", "list", "grid"] as const;
export type WritingView = (typeof writingViews)[number];

export const writingViewLabels: Record<WritingView, string> = {
  slider: "Slider",
  list: "List",
  grid: "Grid",
};

export const writingViewHints: Record<WritingView, string> = {
  slider: "One row of cards that slides by itself and has arrows (the original).",
  list: "One writing per row: big title, short text, and the source at the right. No photos.",
  grid: "Cards side by side: photo on top, title below. One column on a phone.",
};

export const writingSizes = ["small", "medium", "large"] as const;
export type WritingSize = (typeof writingSizes)[number];

export const writingSizeLabels: Record<WritingSize, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

export const writingSizeHints: Record<WritingSize, string> = {
  small: "Four cards per row on a wide screen.",
  medium: "Three cards per row on a wide screen.",
  large: "Two cards per row.",
};

export const writingWideViews = ["stack", "stackslide", "filmstrip"] as const;
export type WritingWideView = (typeof writingWideViews)[number];

export const writingWideViewLabels: Record<WritingWideView, string> = {
  stack: "Stack",
  stackslide: "Stack slide",
  filmstrip: "Filmstrip",
};

export const writingWideViewHints: Record<WritingWideView, string> = {
  stack: "One writing per row: one photo across the whole screen, then the title and text. A writing without a photo shows its title big on a tinted box.",
  stackslide: "Like Stack, but one writing at a time across the whole screen. It slides by itself and has arrows.",
  filmstrip: "One row of cards that runs to the edges of the screen. It slides by itself and has arrows.",
};

// The Articles section of Home (articles written inside the site). List is the original look.
// Mode, the title place, the fonts and the title sizes reuse the Design names above.
// The grid size reuses the Writing sizes.
export const articleViews = ["list", "index", "grid"] as const;
export type ArticleView = (typeof articleViews)[number];

export const articleViewLabels: Record<ArticleView, string> = {
  list: "List",
  index: "Index",
  grid: "Grid",
};

export const articleViewHints: Record<ArticleView, string> = {
  list: "The original: the newest articles in rows, each with its cover.",
  index: "Only type: a number, the big title and the date on one line. A quiet table of contents, like a book.",
  grid: "Cards side by side: cover on top, title and text below. One column on a phone.",
};

export const articleWideViews = ["stack", "stackslide", "lead"] as const;
export type ArticleWideView = (typeof articleWideViews)[number];

export const articleWideViewLabels: Record<ArticleWideView, string> = {
  stack: "Stack",
  stackslide: "Stack slide",
  lead: "Lead",
};

export const articleWideViewHints: Record<ArticleWideView, string> = {
  stack: "One article per row: one cover across the whole screen, then the title and text.",
  stackslide: "Like Stack, but one article at a time across the whole screen. It slides by itself and has arrows.",
  lead: "Like a magazine front page: the newest article big, its cover running to the edge of the screen, and the others as a numbered list below.",
};

// The Projects section of Home. List, Grid and Slider (Centered) are the original forms.
// Mode (Centered or Full width), the title place, the fonts, the title sizes and the Stack ratio reuse the names above.
export const projectWideViews = ["stack", "stackslide", "split", "filmstrip", "sheet"] as const;
export type ProjectWideView = (typeof projectWideViews)[number];

export const projectWideViewLabels: Record<ProjectWideView, string> = {
  stack: "Stack",
  stackslide: "Stack slide",
  split: "Split",
  filmstrip: "Filmstrip",
  sheet: "Contact sheet",
};

export const projectWideViewHints: Record<ProjectWideView, string> = {
  stack: "One project per row: one photo across the whole screen, then its number, title, text and buttons.",
  stackslide: "Like Stack, but one project at a time across the whole screen. It slides by itself and has arrows.",
  split: "Photo on one half of the screen, text on the other half. The sides swap on each project.",
  filmstrip: "One row of tall panels that slides by itself, with arrows.",
  sheet: "Photos that touch each other. The title shows on hover (always on a phone).",
};

// The Biblia section of Home (book covers from the library). Grid is the original look.
// Mode (Centered or Full width), the grid size, the title place, the fonts and the title sizes reuse the names above.
// No Ratio, Crop or Photo height: a cover is always shown whole.
export const bibliaViews = ["grid", "shelf", "list"] as const;
export type BibliaView = (typeof bibliaViews)[number];

export const bibliaViewLabels: Record<BibliaView, string> = {
  grid: "Grid",
  shelf: "Shelf",
  list: "List",
};

export const bibliaViewHints: Record<BibliaView, string> = {
  grid: "Covers in a grid (the original): 2 columns on a phone, up to 6 on a wide screen.",
  shelf: "One row of covers that slides by itself and has arrows.",
  list: "One book per row: a small cover, the big title, the author and year. A quiet library list.",
};

export const bibliaSizeHints: Record<WritingSize, string> = {
  small: "Six covers per row on a wide screen (the original).",
  medium: "Four covers per row on a wide screen.",
  large: "Three covers per row on a wide screen.",
};

export const bibliaWideViews = ["row", "feature"] as const;
export type BibliaWideView = (typeof bibliaWideViews)[number];

export const bibliaWideViewLabels: Record<BibliaWideView, string> = {
  row: "Row",
  feature: "Feature",
};

export const bibliaWideViewHints: Record<BibliaWideView, string> = {
  row: "All covers in one row, edge to edge. The title shows on hover (always on a phone).",
  feature:
    "One book big at a time across the whole screen, its cover whole and never cropped. It slides by itself and has arrows.",
};

// The GitHub section of Home (the profile, 30 days of commits and the newest repositories). Profile is the original look.
// Mode (Centered or Full width), the title place, the fonts and the title sizes reuse the names above.
// No Size, Ratio, Crop or Photo height: the section is made of numbers, bars and repository names, not photos.
export const githubViews = ["profile", "index", "stats"] as const;
export type GithubView = (typeof githubViews)[number];

export const githubViewLabels: Record<GithubView, string> = {
  profile: "Profile",
  index: "Index",
  stats: "Stats",
};

export const githubViewHints: Record<GithubView, string> = {
  profile: "Profile on the left, activity and the newest repositories on the right (the original).",
  index: "Only type: one repository per row with its name big, and a thin line of activity. A quiet index.",
  stats: "Three huge numbers (commits, repositories, followers), tall activity bars and the newest repositories.",
};

export const githubWideViews = ["pulse", "slide", "edge"] as const;
export type GithubWideView = (typeof githubWideViews)[number];

export const githubWideViewLabels: Record<GithubWideView, string> = {
  pulse: "Pulse",
  slide: "Repo slide",
  edge: "Edge index",
};

export const githubWideViewHints: Record<GithubWideView, string> = {
  pulse: "30 tall activity bars from the left edge of the screen to the right edge, then the profile and the repositories.",
  slide: "One repository at a time across the whole screen, its name huge. It slides by itself and has arrows.",
  edge: "Like Index, but the rows and the lines run edge to edge.",
};

// The Links section of Home (the list of links over the Index media). Index is the original look.
// Mode (Centered or Full width), the title place, the fonts and the title sizes reuse the names above.
// No Size, Ratio, Crop or Photo height: the section is a list of titles over one background media, not photos to crop.
export const linksViews = ["index", "table", "slider"] as const;
export type LinksView = (typeof linksViews)[number];

export const linksViewLabels: Record<LinksView, string> = {
  index: "Index",
  table: "Table",
  slider: "Slider",
};

export const linksViewHints: Record<LinksView, string> = {
  index: "Numbered rows with big titles and thin lines over the background media (the original).",
  table: "Tight rows: the number, a medium title and the site name on the right. Best when there are many links.",
  slider: "One link big at a time. It slides by itself and has arrows.",
};

export const linksWideViews = ["edge", "giant", "slide"] as const;
export type LinksWideView = (typeof linksWideViews)[number];

export const linksWideViewLabels: Record<LinksWideView, string> = {
  edge: "Edge index",
  giant: "Giant",
  slide: "Link slide",
};

export const linksWideViewHints: Record<LinksWideView, string> = {
  edge: "Like Index, but the rows and the lines run edge to edge.",
  giant: "Huge titles stacked from edge to edge. A title moves a little to the side when you point at it.",
  slide: "One link at a time across the whole screen, its title huge. It slides by itself and has arrows.",
};

// The Shop section of Home (product cards). Grid is the original look.
// Mode (Centered or Full width), the title place, the fonts, the title sizes and the Stack ratio reuse the names above.
// A product photo is square, so Ratio and Crop only matter in Stack and Stack slide.
export const shopViews = ["grid", "list", "slider"] as const;
export type ShopView = (typeof shopViews)[number];

export const shopViewLabels: Record<ShopView, string> = {
  grid: "Grid",
  list: "List",
  slider: "Slider",
};

export const shopViewHints: Record<ShopView, string> = {
  grid: "Cards side by side (the original): one column on a phone, up to five on a wide screen.",
  list: "One product per row: a small photo, the big name, the price and the button. Like a catalogue.",
  slider: "One row of cards that slides by itself and has arrows.",
};

export const shopSizeHints: Record<WritingSize, string> = {
  small: "Five cards per row on a wide screen (smaller cards).",
  medium: "Four cards per row on a wide screen.",
  large: "The original size: three cards per row on a wide screen.",
};

export const shopWideViews = ["stack", "stackslide", "split", "filmstrip", "sheet"] as const;
export type ShopWideView = (typeof shopWideViews)[number];

export const shopWideViewLabels: Record<ShopWideView, string> = {
  stack: "Stack",
  stackslide: "Stack slide",
  split: "Split",
  filmstrip: "Filmstrip",
  sheet: "Contact sheet",
};

export const shopWideViewHints: Record<ShopWideView, string> = {
  stack: "One product per row: one photo across the whole screen, then its number, name, price and button.",
  stackslide: "Like Stack, but one product at a time across the whole screen. It slides by itself and has arrows.",
  split: "Photo on one half of the screen, text on the other half. The sides swap on each product.",
  filmstrip: "One row of tall panels that runs to the edges of the screen. It slides by itself and has arrows.",
  sheet: "Square photos that touch each other. The name and price show on hover (always a label on a phone).",
};

// How the Countdown section looks.
export const countdownViews = ["section", "strip"] as const;
export type CountdownView = (typeof countdownViews)[number];

export const countdownViewLabels: Record<CountdownView, string> = {
  section: "Section",
  strip: "Strip",
};

export const countdownViewHints: Record<CountdownView, string> = {
  section: "The full block: message, title, text and big numbers.",
  strip: "One thin line: the title and the time left.",
};

// projectMedia = height of each Projects photo on Home in rem. 0 = Auto (the shape of each photo, as before).
export const layoutDefaults: {
  density: DensityMode;
  projectSize: ProjectSize;
  projectView: ProjectView;
  projectMedia: number;
  countdownView: CountdownView;
  designSize: DesignSize;
  designView: DesignView;
  designMode: DesignMode;
  designWideView: DesignWideView;
  designMedia: number;
  designCount: number;
  designTitleAlign: DesignTitleAlign;
  designTitleFont: DesignFont;
  designTitleSize: DesignTitleSize;
  designIntroFont: DesignFont;
  designIntroSize: DesignIntroSize;
  showcaseSize: ShowcaseSize;
  showcaseView: ShowcaseView;
  showcaseMode: DesignMode;
  showcaseWideView: ShowcaseWideView;
  showcaseMedia: number;
  showcaseTitleAlign: DesignTitleAlign;
  showcaseTitleFont: DesignFont;
  showcaseTitleSize: DesignTitleSize;
  showcaseIntroFont: DesignFont;
  showcaseIntroSize: DesignIntroSize;
  showcaseStackRatio: StackRatio;
  showcaseStackCrop: number;
  designStackRatio: StackRatio;
  designStackCrop: number;
  writingMode: DesignMode;
  writingView: WritingView;
  writingWideView: WritingWideView;
  writingSize: WritingSize;
  writingMedia: number;
  writingTitleAlign: DesignTitleAlign;
  writingTitleFont: DesignFont;
  writingTitleSize: DesignTitleSize;
  writingIntroFont: DesignFont;
  writingIntroSize: DesignIntroSize;
  writingStackRatio: StackRatio;
  writingStackCrop: number;
  articlesMode: DesignMode;
  articlesView: ArticleView;
  articlesWideView: ArticleWideView;
  articlesSize: WritingSize;
  articlesMedia: number;
  articlesTitleAlign: DesignTitleAlign;
  articlesTitleFont: DesignFont;
  articlesTitleSize: DesignTitleSize;
  articlesIntroFont: DesignFont;
  articlesIntroSize: DesignIntroSize;
  articlesStackRatio: StackRatio;
  articlesStackCrop: number;
  projectMode: DesignMode;
  projectWideView: ProjectWideView;
  projectTitleAlign: DesignTitleAlign;
  projectTitleFont: DesignFont;
  projectTitleSize: DesignTitleSize;
  projectIntroFont: DesignFont;
  projectIntroSize: DesignIntroSize;
  projectStackRatio: StackRatio;
  projectStackCrop: number;
  bibliaMode: DesignMode;
  bibliaView: BibliaView;
  bibliaWideView: BibliaWideView;
  bibliaSize: WritingSize;
  bibliaTitleAlign: DesignTitleAlign;
  bibliaTitleFont: DesignFont;
  bibliaTitleSize: DesignTitleSize;
  bibliaIntroFont: DesignFont;
  bibliaIntroSize: DesignIntroSize;
  githubMode: DesignMode;
  githubView: GithubView;
  githubWideView: GithubWideView;
  githubTitleAlign: DesignTitleAlign;
  githubTitleFont: DesignFont;
  githubTitleSize: DesignTitleSize;
  githubIntroFont: DesignFont;
  githubIntroSize: DesignIntroSize;
  linksMode: DesignMode;
  linksView: LinksView;
  linksWideView: LinksWideView;
  linksTitleAlign: DesignTitleAlign;
  linksTitleFont: DesignFont;
  linksTitleSize: DesignTitleSize;
  linksIntroFont: DesignFont;
  linksIntroSize: DesignIntroSize;
  shopMode: DesignMode;
  shopView: ShopView;
  shopWideView: ShopWideView;
  shopSize: WritingSize;
  shopMedia: number;
  shopTitleAlign: DesignTitleAlign;
  shopTitleFont: DesignFont;
  shopTitleSize: DesignTitleSize;
  shopIntroFont: DesignFont;
  shopIntroSize: DesignIntroSize;
  shopStackRatio: StackRatio;
  shopStackCrop: number;
} = {
  density: "comfortable",
  projectSize: "large",
  projectView: "list",
  projectMedia: 0,
  countdownView: "section",
  designSize: "large",
  designView: "grid",
  designMode: "centered",
  designWideView: "stack",
  designMedia: 0,
  designCount: 3,
  designTitleAlign: "center",
  designTitleFont: "default",
  designTitleSize: "auto",
  designIntroFont: "default",
  designIntroSize: "auto",
  showcaseSize: "large",
  showcaseView: "list",
  showcaseMode: "centered",
  showcaseWideView: "stack",
  showcaseMedia: 0,
  showcaseTitleAlign: "center",
  showcaseTitleFont: "default",
  showcaseTitleSize: "auto",
  showcaseIntroFont: "default",
  showcaseIntroSize: "auto",
  showcaseStackRatio: "default",
  showcaseStackCrop: 50,
  designStackRatio: "default",
  designStackCrop: 50,
  writingMode: "centered",
  writingView: "slider",
  writingWideView: "stack",
  writingSize: "large",
  writingMedia: 0,
  writingTitleAlign: "center",
  writingTitleFont: "default",
  writingTitleSize: "auto",
  writingIntroFont: "default",
  writingIntroSize: "auto",
  writingStackRatio: "default",
  writingStackCrop: 50,
  articlesMode: "centered",
  articlesView: "list",
  articlesWideView: "stack",
  articlesSize: "medium",
  articlesMedia: 0,
  articlesTitleAlign: "center",
  articlesTitleFont: "default",
  articlesTitleSize: "auto",
  articlesIntroFont: "default",
  articlesIntroSize: "auto",
  articlesStackRatio: "default",
  articlesStackCrop: 50,
  projectMode: "centered",
  projectWideView: "stack",
  projectTitleAlign: "center",
  projectTitleFont: "default",
  projectTitleSize: "auto",
  projectIntroFont: "default",
  projectIntroSize: "auto",
  projectStackRatio: "default",
  projectStackCrop: 50,
  bibliaMode: "centered",
  bibliaView: "grid",
  bibliaWideView: "row",
  bibliaSize: "small",
  bibliaTitleAlign: "center",
  bibliaTitleFont: "default",
  bibliaTitleSize: "auto",
  bibliaIntroFont: "default",
  bibliaIntroSize: "auto",
  githubMode: "centered",
  githubView: "profile",
  githubWideView: "pulse",
  githubTitleAlign: "center",
  githubTitleFont: "default",
  githubTitleSize: "auto",
  githubIntroFont: "default",
  githubIntroSize: "auto",
  linksMode: "centered",
  linksView: "index",
  linksWideView: "edge",
  linksTitleAlign: "center",
  linksTitleFont: "default",
  linksTitleSize: "auto",
  linksIntroFont: "default",
  linksIntroSize: "auto",
  shopMode: "centered",
  shopView: "grid",
  shopWideView: "stack",
  shopSize: "large",
  shopMedia: 0,
  shopTitleAlign: "center",
  shopTitleFont: "default",
  shopTitleSize: "auto",
  shopIntroFont: "default",
  shopIntroSize: "auto",
  shopStackRatio: "default",
  shopStackCrop: 50,
};

// Safe reader: an unknown or missing value falls back to the default.
export function readChoice<T extends string>(value: unknown, list: readonly T[], fallback: T): T {
  return (list as readonly string[]).includes(value as string) ? (value as T) : fallback;
}

// The sections of Home the owner can hide and give extra space (Customize, "Sections").
// The hero and the footer are fixed and not in this list. The order here is the default order on the page;
// the owner can change it in Customize (readOrder).
export const sectionIds = [
  "countdown",
  "writing",
  "articles",
  "projects",
  "biblia",
  "github",
  "shop",
  "links",
  "showcase",
  "designs",
  "visit",
  "gallery",
] as const;
export type SectionId = (typeof sectionIds)[number];

export const sectionLabels: Record<SectionId, string> = {
  countdown: "Countdown",
  writing: "Writing",
  articles: "Articles",
  projects: "Projects",
  biblia: "Biblia",
  github: "GitHub",
  shop: "Shop",
  links: "Links",
  showcase: "Showcase",
  designs: "Design projects",
  visit: "Visit website",
  gallery: "Gallery",
};

// The gallery is one full frame without padding, so it only has the Show tick.
export const sectionHasSpace: Record<SectionId, boolean> = {
  countdown: true,
  writing: true,
  articles: true,
  projects: true,
  biblia: true,
  github: true,
  shop: true,
  links: true,
  showcase: true,
  designs: true,
  visit: true,
  gallery: false,
};

// Extra space (rem) added to, or taken from, the Spacing choice. 0 = unchanged.
export const sectionSpace = { min: -6, max: 6, step: 0.5 } as const;

// Background of one section: the Page color (as now), the Tertiary color, or the Secondary color.
export const sectionSurfaces = ["page", "tertiary", "band"] as const;
export type SectionSurface = (typeof sectionSurfaces)[number];

export const sectionSurfaceLabels: Record<SectionSurface, string> = {
  page: "Page",
  tertiary: "Tertiary",
  band: "Secondary",
};

export const sectionSurfaceHints: Record<SectionSurface, string> = {
  page: "The page color (as now).",
  tertiary: "The Tertiary color, like the top of the footer.",
  band: "The Secondary color, like the news bar and the bottom of the footer.",
};

// GitHub and Links paint their own black background, so a Background choice would not show there.
export const sectionHasSurface: Record<SectionId, boolean> = {
  countdown: true,
  writing: true,
  articles: true,
  projects: true,
  biblia: true,
  github: false,
  shop: true,
  links: false,
  showcase: true,
  designs: true,
  visit: true,
  gallery: false,
};

export type SectionSetting = {
  hidden: boolean;
  top: number;
  bottom: number;
  surface: SectionSurface;
  line: boolean;
};
export type SectionSettings = Record<SectionId, SectionSetting>;

const none = (): SectionSetting => ({ hidden: false, top: 0, bottom: 0, surface: "page", line: false });

export const sectionDefaults: SectionSettings = {
  countdown: none(),
  writing: none(),
  articles: none(),
  projects: none(),
  biblia: none(),
  github: none(),
  shop: none(),
  links: none(),
  showcase: none(),
  designs: none(),
  visit: none(),
  gallery: none(),
};

function space(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  const n = Math.min(sectionSpace.max, Math.max(sectionSpace.min, value));
  return Math.round(n / sectionSpace.step) * sectionSpace.step;
}

// Safe reader: missing or dirty data gives the default. Unknown ids are dropped. Never throws.
export function readSections(raw: unknown): SectionSettings {
  const all = typeof raw === "object" && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const out = { ...sectionDefaults };
  for (const id of sectionIds) {
    const e = all[id];
    const o = typeof e === "object" && e !== null && !Array.isArray(e) ? (e as Record<string, unknown>) : {};
    out[id] = {
      hidden: o.hidden === true,
      top: space(o.top),
      bottom: space(o.bottom),
      surface: sectionHasSurface[id] ? readChoice(o.surface, sectionSurfaces, "page") : "page",
      line: sectionHasSpace[id] && o.line === true,
    };
  }
  return out;
}

// The order of the sections on Home. Safe reader: unknown ids and repeats are dropped, and any section
// that is missing is added at the end in its default place. Missing or dirty data gives the default order.
export function readOrder(raw: unknown): SectionId[] {
  const list = Array.isArray(raw) ? raw : [];
  const seen = new Set<SectionId>();
  for (const value of list) {
    if ((sectionIds as readonly string[]).includes(value as string)) seen.add(value as SectionId);
  }
  for (const id of sectionIds) seen.add(id);
  return [...seen];
}