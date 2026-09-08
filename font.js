// Bitmap faces for the inv.no banner. Proportional widths, uniform 2px stems.
//
// Each face declares its own row height; buildPoints normalises both axes via
// baseSX/baseSY so switching faces never changes how large the banner sits on
// screen. Faces may declare multi-character `tokens` so a ligature counts as a
// single glyph.

const XSPAN = 91;    // target horizontal span, in grid units * scale
const YSPAN = 11.5;  // target vertical span

const FACES = {
  // ---- Helvetica-ish lowercase -------------------------------------------
  // rows 0-2 ascender band (only the i's dot), rows 3-9 x-height body
  lower: {
    text: "inv.no",
    height: 10,
    track: 2,
    glyphs: {
      i: ["00","11","00","11","11","11","11","11","11","11"],
      n: ["000000","000000","000000",
          "111110","110011","110011","110011","110011","110011","110011"],
      v: ["000000","000000","000000",
          "110011","110011","110011","011110","011110","001100","001100"],
      o: ["000000","000000","000000",
          "011110","110011","110011","110011","110011","110011","011110"],
      ".": ["00","00","00","00","00","00","00","00","11","11"],
    },
  },

  // ---- Helvetica-ish caps ------------------------------------------------
  upper: {
    text: "INV.NO",
    height: 10,
    track: 2,
    glyphs: {
      I: ["11","11","11","11","11","11","11","11","11","11"],
      N: ["11110011","11110011","11110011","11011011","11011011",
          "11011011","11001111","11001111","11000011","11000011"],
      V: ["11000011","11000011","11000011","01100110","01100110",
          "01100110","00111100","00111100","00011000","00011000"],
      O: ["00111100","01111110","11100111","11000011","11000011",
          "11000011","11000011","11100111","01111110","00111100"],
      ".": ["00","00","00","00","00","00","00","00","11","11"],
    },
  },

  // ---- NASA "worm" ------------------------------------------------------
  // 14 rows, so there is room for rounded elbows and the blunt cut terminals
  // the worm is built from. "inv" is ONE glyph: the i's stem doubles as the
  // n's left stem, and the n's right stem peels off the vertical to become the
  // v's left arm. Nothing in it is a separate letter.
  worm: {
    text: "inv.no",
    tokens: ["inv", ".", "n", "o"],
    height: 14,
    track: 3,
    glyphs: {
      inv: [
        "110000000000000000",   // dot
        "110000000000000000",
        "000000000000000000",
        "000000000000000000",
        "011111110000000011",   // rounded shoulder; v's right arm starts level
        "111111111000000011",
        "110000011000000110",   // n's right stem holds vertical long enough
        "110000011000000110",   // to read as an n ...
        "110000011000001100",
        "110000011000001100",
        "110000001100110000",   // ... then peels off into the v's left arm
        "110000001100110000",
        "110000000111000000",   // arms touch at the vertex
        "110000000111000000",
      ],
      n: [
        "000000000","000000000","000000000","000000000",
        "011111110",            // rounded top
        "111111111",
        "110000011","110000011","110000011","110000011",
        "110000011","110000011","110000011","110000011",
      ],
      o: [
        "000000000","000000000","000000000","000000000",
        "001111100",            // rounded bowl
        "011111110",
        "110000011","110000011","110000011","110000011",
        "110000011","110000011",
        "011111110",
        "001111100",
      ],
      ".": ["00","00","00","00","00","00","00","00","00","00","00","00","11","11"],
    },
  },
};

function buildPoints(faceName, DEPTH) {
  const face = FACES[faceName];
  const height = face.height;
  const chars = face.tokens || face.text.split("");
  const widths = chars.map(ch => face.glyphs[ch][0].length);
  const totalW = widths.reduce((a, b) => a + b, 0) + face.track * (chars.length - 1);
  const cx = totalW / 2, cy = height / 2;

  const pts = [];
  let x = 0;
  chars.forEach((ch, gi) => {
    const g = face.glyphs[ch], w = widths[gi];
    for (let r = 0; r < height; r++)
      for (let c = 0; c < w; c++)
        if (g[r][c] === "1")
          for (let d = -DEPTH; d <= DEPTH; d++)
            pts.push({ x: x + c - cx, y: r - cy, z: d * 0.6 });
    x += w + face.track;
  });

  return { pts, totalW, height, baseSX: XSPAN / totalW, baseSY: YSPAN / height };
}

// sanity: every row of every glyph must be the same width, or the grid shears
function validate() {
  const bad = [];
  for (const [name, face] of Object.entries(FACES))
    for (const [ch, g] of Object.entries(face.glyphs)) {
      if (g.length !== face.height) bad.push(`${name}.${ch}: ${g.length} rows, expected ${face.height}`);
      const w = g[0].length;
      g.forEach((row, i) => {
        if (row.length !== w) bad.push(`${name}.${ch} row ${i}: width ${row.length}, expected ${w}`);
      });
    }
  return bad;
}

if (typeof module !== "undefined") module.exports = { FACES, XSPAN, YSPAN, buildPoints, validate };
