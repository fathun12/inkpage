import QRCode from "qrcode";

// Black on white SVG, the safest combination for phone cameras.
export async function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { type: "svg", margin: 1, errorCorrectionLevel: "M" });
}
