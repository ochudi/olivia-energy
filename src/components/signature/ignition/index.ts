/**
 * Ignition (P5): the About hero's signature. The client wrapper decides
 * eligibility and lazily loads the WebGL canvas (./ignition-canvas) and the
 * baked points (public/data/mark-points.bin) only on capable desktops.
 */
export { IgnitionLazy } from "./ignition-lazy";
