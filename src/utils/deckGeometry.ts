import * as THREE from "three";

/**
 * Procedural skateboard deck geometry.
 *
 * Everything is built from one shared 2D outline (the plan-view shape of
 * the board) so the body, the griptape cap, and the underside graphic all
 * share identical edges, and identical concave / kicktail deformation.
 *
 * Coordinate convention used throughout this file, AFTER the rotateX(-PI/2)
 * step every geometry goes through:
 *   x -> width  (across the board, trucks-to-trucks direction)
 *   z -> length (nose-to-tail direction)
 *   y -> thickness / vertical deformation (up)
 */

export interface DeckDimensions {
  /** overall width across the board, in scene units (~ inches) */
  width: number;
  /** overall length nose to tail, in scene units (~ inches) */
  length: number;
  /** plank thickness */
  thickness: number;
  /** how deep the transverse concave is */
  concaveDepth: number;
  /** how high the nose/tail kick rises */
  kickHeight: number;
  /** how sharply the kick is concentrated at the tips (higher = later kick) */
  kickPower: number;
}

export const DEFAULT_DECK: DeckDimensions = {
  width: 8.25,
  length: 31.85,
  thickness: 0.52,
  concaveDepth: 0.34,
  kickHeight: 1.55,
  kickPower: 4.5,
};

/** Half-width of the board at a given point along its length (-1..1 normalized). */
function halfWidthAt(t: number, halfWidth: number): number {
  const at = Math.abs(t);

  // Taper the nose/tail into a rounded point past this fraction of the length.
  const taperStart = 0.76;
  let w = halfWidth;

  if (at > taperStart) {
    const localT = (at - taperStart) / (1 - taperStart); // 0..1
    const eased = Math.sqrt(Math.max(0, 1 - localT * localT));
    w = halfWidth * (0.18 + 0.82 * eased);
  }

  // Subtle waist pinch near the truck mounting zone.
  const waistCenter = 0.55;
  const waistWidthT = 0.1;
  const waistDepth = halfWidth * 0.05;
  const waist =
    waistDepth * Math.exp(-Math.pow((at - waistCenter) / waistWidthT, 2));

  return Math.max(w - waist, halfWidth * 0.04);
}

/** Build the flat 2D plan-view outline of the deck as a THREE.Shape. */
export function buildDeckOutline(
  width: number,
  length: number,
  segments = 96
): THREE.Shape {
  const halfWidth = width / 2;
  const halfLength = length / 2;
  const shape = new THREE.Shape();

  const rightSide: THREE.Vector2[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * 2 - 1; // -1..1, tail to nose
    const z = t * halfLength;
    const x = halfWidthAt(t, halfWidth);
    rightSide.push(new THREE.Vector2(x, z));
  }

  shape.moveTo(rightSide[0].x, rightSide[0].y);
  for (let i = 1; i < rightSide.length; i++) {
    shape.lineTo(rightSide[i].x, rightSide[i].y);
  }
  for (let i = rightSide.length - 1; i >= 0; i--) {
    shape.lineTo(-rightSide[i].x, rightSide[i].y);
  }
  shape.closePath();

  return shape;
}

/** Vertical deformation (concave + kicktail) applied to any deck-derived geometry. */
function deformY(
  x: number,
  z: number,
  dims: DeckDimensions
): number {
  const halfWidth = dims.width / 2;
  const halfLength = dims.length / 2;

  const concave = dims.concaveDepth * Math.pow(x / halfWidth, 2);
  const kick =
    dims.kickHeight * Math.pow(Math.abs(z) / halfLength, dims.kickPower);

  return concave + kick;
}

function applyDeformation(
  geometry: THREE.BufferGeometry,
  dims: DeckDimensions
) {
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = pos.getY(i);
    pos.setY(i, y + deformY(x, z, dims));
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
}

/** The solid wooden body of the deck (extruded + bevelled + deformed). */
export function buildDeckBodyGeometry(
  dims: DeckDimensions = DEFAULT_DECK
): THREE.BufferGeometry {
  const shape = buildDeckOutline(dims.width, dims.length);

  const bevelThickness = dims.thickness * 0.28;
  const bevelSize = dims.thickness * 0.22;

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: dims.thickness,
    bevelEnabled: true,
    bevelThickness,
    bevelSize,
    bevelSegments: 4,
    curveSegments: 1,
    steps: 1,
  });

  geometry.rotateX(-Math.PI / 2);
  geometry.center();
  applyDeformation(geometry, dims);
  geometry.computeBoundingBox();

  return geometry;
}

/** A thin cap geometry (griptape or underside graphic) matching the outline exactly. */
export function buildDeckCapGeometry(
  dims: DeckDimensions,
  side: "top" | "bottom"
): THREE.BufferGeometry {
  const shape = buildDeckOutline(dims.width, dims.length);
  const geometry = new THREE.ShapeGeometry(shape, 1);

  geometry.rotateX(-Math.PI / 2);
  applyDeformation(geometry, dims);

  const offset =
    side === "top"
      ? dims.thickness / 2 + 0.012
      : -(dims.thickness / 2 + 0.012);

  const pos = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, pos.getY(i) + offset);
  }
  pos.needsUpdate = true;

  if (side === "bottom") {
    // The cap currently faces up (+y). Reverse triangle winding so it
    // faces down instead, and mirror U so the graphic reads correctly
    // when viewed from underneath the board.
    const index = geometry.getIndex();
    if (index) {
      const arr = index.array as Uint16Array | Uint32Array;
      for (let i = 0; i < arr.length; i += 3) {
        const tmp = arr[i + 1];
        arr[i + 1] = arr[i + 2];
        arr[i + 2] = tmp;
      }
      index.needsUpdate = true;
    }
    const uv = geometry.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) {
      uv.setX(i, 1 - uv.getX(i));
    }
    uv.needsUpdate = true;
  }

  geometry.computeVertexNormals();
  return geometry;
}
