// Terminal version of the rotating inv.no banner.
//   node demo/rotating-ascii.js           animate
//   node demo/rotating-ascii.js --frames  print 4 still frames and exit

const FONT = {
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  N: ["10001", "11001", "11001", "10101", "10011", "10011", "10001"],
  V: ["10001", "10001", "10001", "10001", "01010", "01010", "00100"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
};

const TEXT = "INV.NO";
const GLYPH_W = 5, GLYPH_H = 7, TRACK = 6;
const DEPTH = 3;
const RAMP = "@#%x*+=~:-. ";

const W = Math.min(process.stdout.columns || 120, 150);
const H = 19;
const SX = (W / 150) * 2.6, SY = 1.3;
const FOV = 90;

const pts = [];
{
  const totalW = TEXT.length * TRACK - 1;
  const cx = totalW / 2, cy = GLYPH_H / 2;
  TEXT.split("").forEach((ch, i) => {
    const g = FONT[ch];
    if (!g) return;
    for (let r = 0; r < GLYPH_H; r++)
      for (let c = 0; c < GLYPH_W; c++)
        if (g[r][c] === "1")
          for (let d = -DEPTH; d <= DEPTH; d++)
            pts.push({ x: i * TRACK + c - cx, y: r - cy, z: d * 0.6 });
  });
}

function render(angle) {
  const sin = Math.sin(angle), cos = Math.cos(angle);
  const chars = new Array(W * H).fill(" ");
  const zbuf = new Array(W * H).fill(-Infinity);

  for (const p of pts) {
    const rx = p.x * cos + p.z * sin;
    const rz = -p.x * sin + p.z * cos;
    const tilt = Math.sin(angle * 0.5) * 0.22;
    const ry = p.y * Math.cos(tilt) - rz * Math.sin(tilt);
    const rz2 = p.y * Math.sin(tilt) + rz * Math.cos(tilt);

    const f = FOV / (FOV + rz2 + 25);
    const sx = Math.round(rx * SX * f + W / 2);
    const sy = Math.round(ry * SY * f + H / 2);
    if (sx < 0 || sx >= W || sy < 0 || sy >= H) continue;

    const i = sy * W + sx;
    if (-rz2 > zbuf[i]) {
      zbuf[i] = -rz2;
      const t = (rz2 + 22) / 44;
      chars[i] = RAMP[Math.max(0, Math.min(RAMP.length - 1, Math.round(t * (RAMP.length - 1))))];
    }
  }

  let out = "";
  for (let y = 0; y < H; y++)
    out += chars.slice(y * W, y * W + W).join("").replace(/\s+$/, "") + "\n";
  return out;
}

if (process.argv.includes("--frames")) {
  for (const a of [0, Math.PI / 4, Math.PI / 2, Math.PI * 0.75]) {
    console.log(`--- angle ${(a * 180 / Math.PI).toFixed(0)}deg ---`);
    console.log(render(a));
  }
  console.log(`points: ${pts.length}, grid: ${W}x${H}`);
} else {
  let angle = 0;
  process.stdout.write("\x1b[?25l");
  const timer = setInterval(() => {
    process.stdout.write("\x1b[H\x1b[2J" + render(angle));
    angle += 0.05;
  }, 40);
  const quit = () => {
    clearInterval(timer);
    process.stdout.write("\x1b[?25h\n");
    process.exit(0);
  };
  process.on("SIGINT", quit);
}
