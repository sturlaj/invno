// The "inv.no" wordmark as GLSL signed-distance functions, shared by any
// experiment that needs the mark in 3D. Helvetica-ish lowercase: flat terminal
// cuts on the stems, round i-dot and period, stress on the o.
//
// Exposed as a string rather than a .glsl file because fetch() is blocked on
// file:// -- experiments have to be openable by double-clicking them.
//
// Bounding box is measured, not eyeballed:
//   x: -0.1425 .. 4.8525   y: 0.0025 .. 1.4750
// so the centre offset is (2.355, 0.739) and the half-extent (2.498, 0.736).
// WORDMARK_CENTRE / WORDMARK_HALF below must match, or the mark sits off-centre
// and the bounding-sphere early-out clips its silhouette.

const WORDMARK_CENTRE = [2.355, 0.739];
const WORDMARK_HALF   = [2.498, 0.736];

const WORDMARK_GLSL = `
const float R  = 0.130;   // stem half-width
const float CR = 0.003;   // corner radius -- near-sharp, so edges read hard

float sdSeg(vec2 p, vec2 a, vec2 b, float r) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

// Helvetica cuts its terminals flat, never round, so stems are boxes.
float sdBox(vec2 p, vec2 c, vec2 h, float r) {
  vec2 q = abs(p - c) - h + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

// The o's stroke is thicker at 3 and 9 o'clock than top and bottom. That
// stress is most of what makes a grotesque look drawn rather than geometric.
float sdOh(vec2 p, vec2 c, float rad) {
  vec2 q = p - c;
  float L = length(q);
  return abs(L - rad) - (0.112 + 0.030 * abs(q.x) / max(L, 1e-4));
}

// lowercase n: full-height left stem, shoulder springing off it, short right
// stem. The shoulder's own caps sit inside the stems, so they never show.
float sdEnn(vec2 p, float x) {
  float d = sdBox(p, vec2(x, 0.50), vec2(R, 0.50), CR);
  vec2 q = p - vec2(x + 0.33, 0.54);
  d = min(d, (q.y >= 0.0)
    ? abs(length(q) - 0.33) - R
    : min(length(q - vec2(-0.33, 0.0)), length(q - vec2(0.33, 0.0))) - R);
  return min(d, sdBox(p, vec2(x + 0.66, 0.27), vec2(R, 0.27), CR));
}

// lowercase v: two strokes cut flat at x-height and at the baseline
float sdVee(vec2 p, float x) {
  float d = min(sdSeg(p, vec2(x, 1.10),         vec2(x + 0.34, -0.06), R),
                sdSeg(p, vec2(x + 0.34, -0.06), vec2(x + 0.68, 1.10),  R));
  d = max(d,  p.y - 1.00);
  return max(d, -p.y);
}

float sdWord(vec2 p) {
  float d = sdBox(p, vec2(0.0, 0.50), vec2(R, 0.50), CR);
  d = min(d, length(p - vec2(0.0, 1.33)) - 0.145);     // i dot, round
  d = min(d, sdEnn(p, 0.44));
  d = min(d, sdVee(p, 1.52));
  d = min(d, length(p - vec2(2.56, 0.145)) - 0.145);   // period, round
  d = min(d, sdEnn(p, 2.92));
  d = min(d, sdOh(p, vec2(4.342, 0.50), 0.37));
  return d;
}
`;

// ---------------------------------------------------------------------------
// "INV" in caps -- a separate glyph set from the lowercase wordmark above, not
// a restyling of it. Cap height is 1.0 with the baseline at y=0, so callers
// can scale it to whatever size they need.
//
// Depends on sdSeg / sdBox / R / CR from WORDMARK_GLSL, so include that first.
//
// Measured extent: x -0.130 .. 2.390, y 0.000 .. 1.000
// ---------------------------------------------------------------------------

const INV_CENTRE = [1.130, 0.500];
const INV_HALF   = [1.260, 0.500];

const INV_GLSL = `
// N: two full-height stems with the diagonal cut flat top and bottom
float sdEnnCap(vec2 p, float x) {
  float d = sdBox(p, vec2(x,        0.5), vec2(R, 0.5), CR);
  d = min(d, sdBox(p, vec2(x + 0.62, 0.5), vec2(R, 0.5), CR));
  float diag = sdSeg(p, vec2(x, 1.0), vec2(x + 0.62, 0.0), R * 1.05);
  diag = max(diag,  p.y - 1.0);
  diag = max(diag, -p.y);
  return min(d, diag);
}

// V: two strokes cut flat at cap height, meeting just below the baseline so
// the apex comes to a point rather than a stub
float sdVeeCap(vec2 p, float x) {
  float d = min(sdSeg(p, vec2(x, 1.12),        vec2(x + 0.37, -0.10), R),
                sdSeg(p, vec2(x + 0.37, -0.10), vec2(x + 0.74, 1.12), R));
  d = max(d,  p.y - 1.0);
  return max(d, -p.y);
}

float sdINV(vec2 p) {
  float d = sdBox(p, vec2(0.0, 0.5), vec2(R, 0.5), CR);   // I
  d = min(d, sdEnnCap(p, 0.52));
  d = min(d, sdVeeCap(p, 1.52));
  return d;
}
`;

if (typeof module !== "undefined")
  module.exports = {
    WORDMARK_GLSL, WORDMARK_CENTRE, WORDMARK_HALF,
    INV_GLSL, INV_CENTRE, INV_HALF,
  };
