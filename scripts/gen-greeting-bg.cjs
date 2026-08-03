// One-off generator for the Greeting Hero background.
// Outputs public/images/dashboard/greeting-bg.webp
const sharp = require('sharp');

const W = 1600;
const H = 900;

// Build the image as a composite of layered gradients.
async function main() {
  const layers = [];

  // 1. Base dark navy gradient (top-left deep navy -> bottom-right richer navy)
  const base = await sharp({
    create: {
      width: W,
      height: H,
      channels: 4,
      background: { r: 11, g: 15, b: 23, alpha: 1 },
    },
  })
    .composite([
      {
        input: await sharp({
          create: {
            width: W,
            height: H,
            channels: 4,
            background: { r: 17, g: 24, b: 39, alpha: 1 },
          },
        })
          .png()
          .toBuffer(),
        blend: 'over',
      },
    ])
    .png()
    .toBuffer();
  layers.push({ input: base, blend: 'over' });

  // 2. Soft golden glow — top-left
  const goldGlow = await makeRadial(W, H, 520, -80, 560, 900, [253, 182, 92, 0.28]);
  layers.push({ input: await fit(goldGlow, W, H), blend: 'screen' });

  // 3. Purple glow — bottom-right
  const purpleGlow = await makeRadial(W, H, 1250, 780, 620, 900, [124, 58, 237, 0.26]);
  layers.push({ input: await fit(purpleGlow, W, H), blend: 'screen' });

  // 4. Soft blue accent — right-center
  const blueGlow = await makeRadial(W, H, 1380, 220, 380, 900, [59, 130, 246, 0.16]);
  layers.push({ input: await fit(blueGlow, W, H), blend: 'screen' });

  // 5. Vignette — darker edges, brighter center-left (where content sits)
  const vignette = await makeVignette(W, H);
  layers.push({ input: vignette, blend: 'multiply' });

  await sharp({
    create: {
      width: W,
      height: H,
      channels: 4,
      background: { r: 11, g: 15, b: 23, alpha: 1 },
    },
  })
    .composite(layers)
    .webp({ quality: 82, effort: 4 })
    .toFile('public/images/dashboard/greeting-bg.webp');

  console.log('generated public/images/dashboard/greeting-bg.webp');
}

// Radial gradient as a PNG buffer
async function makeRadial(w, h, cx, cy, radius, maxR, [r, g, b, a]) {
  const size = radius * 2;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(${r},${g},${b},${a})"/>
          <stop offset="55%" stop-color="rgba(${r},${g},${b},${a * 0.45})"/>
          <stop offset="100%" stop-color="rgba(${r},${g},${b},0)"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

// Clamp any layer to fit within the canvas (sharp composite constraint)
async function fit(buf, w, h) {
  const meta = await sharp(buf).metadata();
  if (meta.width > w || meta.height > h) {
    return sharp(buf)
      .resize(Math.min(meta.width, w), Math.min(meta.height, h), { fit: 'inside' })
      .png()
      .toBuffer();
  }
  return buf;
}

// Vignette: dark edges, lighter center (with a left bias toward content)
async function makeVignette(w, h) {
  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="v" cx="32%" cy="46%" r="80%">
          <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
          <stop offset="60%" stop-color="rgba(0,0,0,0.10)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0.55)"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#v)"/>
    </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
