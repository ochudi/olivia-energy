/**
 * Ignition shaders (WebGL1, GL_POINTS). Positions are in mark units (the
 * 72 x 100 box of src/lib/brand/mark.ts, y down); uBox maps them to canvas
 * CSS pixels. Each particle travels from its start to its target along an
 * arc about a pivot (the ring's centre for ring sparks, the flame's root for
 * flame sparks), easing into place; at rest it is a round dot in the exact
 * brand colour, so the canvas can hand over to the vector mark unseen.
 */

/** Per vertex: aPos = target.xy, start.xy; aMeta = colour (0 lime, 1 red, 2 ring), delay s, duration s, spin rad. */
export const VERTEX = `
attribute vec4 aPos;
attribute vec4 aMeta;
uniform float uTime;
uniform vec2 uView;
uniform vec3 uBox;
uniform float uDpr;
uniform float uSize;
uniform vec4 uPivots;
uniform vec3 uLime;
uniform vec3 uRed;
uniform vec3 uGreen;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float t = clamp((uTime - aMeta.y) / aMeta.z, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - t, 4.0);
  float ring = step(1.5, aMeta.x);
  vec2 pivot = mix(uPivots.zw, uPivots.xy, ring);
  float a = aMeta.w * (1.0 - e);
  float c = cos(a);
  float s = sin(a);
  vec2 r = mix(aPos.zw, aPos.xy, e) - pivot;
  vec2 p = pivot + vec2(c * r.x - s * r.y, s * r.x + c * r.y);
  vec2 px = uBox.xy + p * uBox.z;
  gl_Position = vec4(px.x / uView.x * 2.0 - 1.0, 1.0 - px.y / uView.y * 2.0, 0.0, 1.0);

  float spark = 1.6 + 1.6 * fract(aMeta.w * 37.0);
  float live = step(0.0001, t);
  gl_PointSize = mix(spark, uSize, smoothstep(0.35, 0.75, t)) * uDpr * live;

  vec3 col = mix(uLime, uRed, step(0.5, aMeta.x));
  col = mix(col, uGreen, ring);
  vColor = mix(col, vec3(1.0, 0.95, 0.84), 0.55 * pow(1.0 - e, 1.5));
  vAlpha = smoothstep(0.0, 0.1, t);
}`;

export const FRAGMENT = `
precision mediump float;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = vAlpha * (1.0 - smoothstep(0.4, 0.5, d));
  gl_FragColor = vec4(vColor * a, a);
}`;
