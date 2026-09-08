// Helvetica-ish bitmap faces for the inv.no banner, 10 rows tall,
// proportional widths, 2px stems so the weight reads as a grotesque.
//
// lower: rows 0-2 are the ascender band (only the dot on "i" lives there),
//        rows 3-9 are the x-height body.
// upper: caps fill all 10 rows.
//
// Widths differ per glyph -- "i", "I" and "." are narrow -- which is the whole
// point of a proportional face. TRACK is the gap between glyphs.

const FACES = {
  lower: {
    text: "inv.no",
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

  upper: {
    text: "INV.NO",
    track: 2,
    glyphs: {
      I: ["11","11","11","11","11","11","11","11","11","11"],
      N: ["11110011",
          "11110011",
          "11110011",
          "11011011",
          "11011011",
          "11011011",
          "11001111",
          "11001111",
          "11000011",
          "11000011"],
      V: ["11000011",
          "11000011",
          "11000011",
          "01100110",
          "01100110",
          "01100110",
          "00111100",
          "00111100",
          "00011000",
          "00011000"],
      O: ["00111100",
          "01111110",
          "11100111",
          "11000011",
          "11000011",
          "11000011",
          "11000011",
          "11100111",
          "01111110",
          "00111100"],
      ".": ["00","00","00","00","00","00","00","00","11","11"],
    },
  },
};

const GLYPH_H = 10;

// Target on-screen span in grid units * scale. Holding this constant means the
// two faces render at the same physical width even though the uppercase one is
// wider in glyph units.
const SPAN = 91;

function buildPoints(faceName, DEPTH) {
  const face = FACES[faceName];
  const chars = face.text.split("");
  const widths = chars.map(ch => face.glyphs[ch][0].length);
  const totalW = widths.reduce((a, b) => a + b, 0) + face.track * (chars.length - 1);
  const cx = totalW / 2, cy = GLYPH_H / 2;

  const pts = [];
  let x = 0;
  chars.forEach((ch, gi) => {
    const g = face.glyphs[ch], w = widths[gi];
    for (let r = 0; r < GLYPH_H; r++)
      for (let c = 0; c < w; c++)
        if (g[r][c] === "1")
          for (let d = -DEPTH; d <= DEPTH; d++)
            pts.push({ x: x + c - cx, y: r - cy, z: d * 0.6 });
    x += w + face.track;
  });

  return { pts, totalW, baseSX: SPAN / totalW };
}

if (typeof module !== "undefined") module.exports = { FACES, GLYPH_H, SPAN, buildPoints };
