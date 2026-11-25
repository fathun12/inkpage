import { common, createLowlight } from "lowlight";

// One highlighter shared by the editor (in the browser) and the reader (on the server).
export const lowlight = createLowlight(common);