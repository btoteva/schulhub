/**
 * Splits the summary test page image into 3 regions:
 * - joints (Q16: joint models + arm diagram)
 * - muscles (Q17: back muscle diagram)
 * - injuries (Q18: injury illustrations)
 *
 * Usage:
 *   1. Save the full page image as:  public/images/summary-full.png
 *   2. Run:  node scripts/split-summary-image.js
 *
 * You can adjust the percentage values below if the crop regions don't match.
 */

const path = require("path");
const sharp = require("sharp");

const PUBLIC_IMAGES = path.join(__dirname, "..", "public", "images");
const INPUT = path.join(PUBLIC_IMAGES, "summary-full.png");

// Crop regions as percentage of image height (0–100). Tune these to match your page layout.
const REGIONS = {
  joints:  { top: 18, height: 28 },  // Question 16: joint types + arm
  muscles: { top: 46, height: 22 },  // Question 17: muscle diagram (back)
  injuries: { top: 68, height: 30 }, // Question 18: injury figures
};

async function main() {
  let meta;
  try {
    meta = await sharp(INPUT).metadata();
  } catch (e) {
    console.error("Error: Could not read image.");
    console.error("  Place the full test page image at: public/images/summary-full.png");
    console.error("  Then run: node scripts/split-summary-image.js");
    process.exit(1);
  }

  const w = meta.width;
  const h = meta.height;
  console.log(`Image size: ${w}x${h}`);

  for (const [name, { top: topPct, height: heightPct }] of Object.entries(REGIONS)) {
    const top = Math.round((topPct / 100) * h);
    const height = Math.round((heightPct / 100) * h);
    const outPath = path.join(PUBLIC_IMAGES, `summary-${name}.png`);
    await sharp(INPUT)
      .extract({ left: 0, top, width: w, height })
      .toFile(outPath);
    console.log(`  Written: public/images/summary-${name}.png (y=${top}-${top + height})`);
  }

  console.log("Done. Use summary-joints.png, summary-muscles.png, summary-injuries.png in the test.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
