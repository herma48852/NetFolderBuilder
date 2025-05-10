// --- Imports ---
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// --- Constants ---
// App 1 Constants
const SNAP_DISTANCE = 10;
const TARGET_SIDE_LENGTH = 50;
const SNAP_THRESHOLD = 15;
const ANGLE_SNAP_THRESHOLD = 0.1;
const POLYGON_TYPES = {
    3: "Triangle",
    4: "Square",
    5: "Pentagon",
    6: "Hexagon",
    8: "Octagon",
    10: "Decagon", // Removed 9 for consistency
};
const DEFAULT_COLORS = {
    3: "#FFADAD",
    4: "#FFD6A5",
    5: "#FDFFB6",
    6: "#CAFFBF",
    8: "#A0C4FF",
    10: "#BDB2FF",
};
function calculateRadiusForSideLength(sides, sideLength) {
    if (sides < 3) return 0;
    return sideLength / (2 * Math.sin(Math.PI / sides));
}

// App 2 Folding Data Tables
const COLOR_NAME_TO_HEX = {
    // Kept for parseColor robustness, though App 1 uses hex
    red: 0xff0000,
    yellow: 0xffff00,
    green: 0x00ff00,
    blue: 0x0000ff,
    cyan: 0x00ffff,
    magenta: 0xff00ff,
    pink: 0xffc0cb,
    purple: 0x800080,
    teal: 0x008080,
    orange: 0xffa500,
    lime: 0x00ff00,
    indigo: 0x4b0082,
    violet: 0xee82ee,
    gold: 0xffd700,
    silver: 0xc0c0c0,
    gray: 0x808080,
    grey: 0x808080,
    white: 0xffffff,
    black: 0x000000,
};

// *** UPDATED Polyhedron data table - Formatted ***
const POLYHEDRON_DATA = {
    // --- Platonic Solids ---
    "3.3.3": {
        name: "Tetrahedron",
        faceCounts: {
            3: 4,
        },
        foldAngles: {
            "3-3": Math.acos(-1 / 3),
        },
    },
    "4.4.4": {
        name: "Cube (Hexahedron)",
        faceCounts: {
            4: 6,
        },
        foldAngles: {
            "4-4": Math.PI / 2,
        },
    },
    "3.3.3.3": {
        name: "Octahedron",
        faceCounts: {
            3: 8,
        },
        foldAngles: {
            "3-3": Math.acos(1 / 3),
        },
    },
    "5.5.5": {
        name: "Dodecahedron",
        faceCounts: {
            5: 12,
        },
        foldAngles: {
            "5-5": Math.acos(Math.sqrt(5) / 5),
        },
    },
    "3.3.3.3.3": {
        name: "Icosahedron",
        faceCounts: {
            3: 20,
        },
        foldAngles: {
            "3-3": Math.acos(Math.sqrt(5) / 3),
        },
    },
    // --- Archimedean Solids ---
    "3.6.6": {
        name: "Truncated Tetrahedron",
        faceCounts: {
            3: 4,
            6: 4,
        },
        foldAngles: {
            "3-6": Math.acos(1 / 3),
            "6-3": Math.acos(1 / 3),
            "6-6": Math.acos(-1 / 3),
        },
    },
    "3.8.8": {
        name: "Truncated Cube",
        faceCounts: {
            3: 8,
            8: 6,
        },
        foldAngles: {
            "3-8": Math.acos(Math.sqrt(3) / 3),
            "8-3": Math.acos(Math.sqrt(3) / 3),
            "8-8": Math.PI / 2,
        },
    },
    "4.6.6": {
        name: "Truncated Octahedron",
        faceCounts: {
            4: 6,
            6: 8,
        },
        foldAngles: {
            "4-6": Math.acos(1 / Math.sqrt(3)),
            "6-4": Math.acos(1 / Math.sqrt(3)),
            "6-6": Math.acos(1 / 3),
        },
    },
    "3.10.10": {
        name: "Truncated Dodecahedron",
        faceCounts: {
            3: 20,
            10: 12,
        },
        foldAngles: {
            "3-10": 0.6524, // ~37.38
            "10-3": 0.6524, // ~37.38
            "10-10": Math.acos(Math.sqrt(5) / 5)
        },
    },
    "5.6.6": {
        name: "Truncated Icosahedron",
        faceCounts: {
            5: 12,
            6: 20,
        },
        foldAngles: {
            "5-6": Math.acos(Math.sqrt((5 + 2 * Math.sqrt(5)) / 15)),
            "6-5": Math.acos(Math.sqrt((5 + 2 * Math.sqrt(5)) / 15)),
            "6-6": Math.acos(Math.sqrt(5) / 3)
        },
    },
    "3.4.3.4": {
        name: "Cuboctahedron",
        faceCounts: {
            3: 8,
            4: 6,
        },
        foldAngles: {
            "3-4": Math.acos(1 / Math.sqrt(3)),
            "4-3": Math.acos(1 / Math.sqrt(3)),
        },
    },
    "4.6.8": {
        name: "Truncated Cuboctahedron",
        faceCounts: {
            4: 12,
            6: 8,
            8: 6,
        },
        foldAngles: {
            "6-4": 0.6155, // ~35.26
            "4-6": 0.6155, // ~35.26
            "8-4": 0.7854, // 45
            "4-8": 0.7854, // 45
            "8-6": Math.acos(Math.sqrt(3) / 3),
            "6-8": Math.acos(Math.sqrt(3) / 3),
        },
    },
    "3.5.3.5": {
        name: "Icosidodecahedron",
        faceCounts: {
            3: 20,
            5: 12,
        },
        foldAngles: {
            "3-5": 0.6524, // ~37.37
            "5-3": 0.6524, // ~37.37
        },
    },
    "3.4.4.4": {
        name: "Rhombicuboctahedron",
        faceCounts: {
            3: 8,
            4: 18,
        },
        foldAngles: {
            "3-4": Math.acos(Math.sqrt(2 / 3)),
            "4-3": Math.acos(Math.sqrt(2 / 3)),
            "4-4": Math.PI / 4,
        },
    },
    "3.4.5.4": {
        name: "Rhombicosidodecahedron",
        faceCounts: {
            3: 20,
            4: 30,
            5: 12,
        },
        foldAngles: {
            "3-4": Math.acos(Math.sqrt((3 + Math.sqrt(5)) / 6)),
            "4-3": Math.acos(Math.sqrt((3 + Math.sqrt(5)) / 6)),
            "4-5": Math.acos(Math.sqrt((5 + Math.sqrt(5)) / 10)),
            "5-4": Math.acos(Math.sqrt((5 + Math.sqrt(5)) / 10)),
            "4-4": Math.acos((1 + Math.sqrt(5)) / (2 * Math.sqrt(3))),
        },
    },
    "4.6.10": {
	name: "Truncated Icosidodecahedron",
	faceCounts: {
            4: 30,
            6: 20,
            10: 12,
	},
	foldAngles: {
            "4-6":  Math.acos((Math.sqrt(3) + Math.sqrt(15)) / 6), 
            "6-4":  Math.acos((Math.sqrt(3) + Math.sqrt(15)) / 6), 
            "4-10": Math.acos(Math.sqrt((5 + Math.sqrt(5)) / 10)),
            "10-4": Math.acos(Math.sqrt((5 + Math.sqrt(5)) / 10)),
            "10-6": Math.acos(Math.sqrt((5 + (2 * Math.sqrt(5))) / 15)),
            "6-10": Math.acos(Math.sqrt((5 + (2 * Math.sqrt(5))) / 15)),
	},
    },
    "3.3.3.3.4": {
        name: "Snub Cube",
        faceCounts: {
            3: 32,
            4: 6,
        },
        foldAngles: {
            "3-3": 0.4672, // ~26.77 deg
            "3-4": 0.6462, // ~37.02 deg
            "4-3": 0.6462,
        },
    },
    "3.3.3.3.5": {
        name: "Snub Dodecahedron",
        faceCounts: {
            3: 80,
            5: 12,
        },
        foldAngles: {
            "3-3": 0.2762, // ~15.82 deg
            "3-5": 0.4725, // ~27.07 deg
            "5-3": 0.4725,
        },
    },
};

function getFaceCountSignature(counts) {
    return Object.keys(counts)
        .map((key) => parseInt(key))
        .sort((a, b) => a - b)
        .map((key) => `${key}:${counts[key.toString()]}`)
        .join("_");
}
const faceCountSigToVertexConfigKey = {};
for (const key in POLYHEDRON_DATA) {
    if (POLYHEDRON_DATA[key].faceCounts) {
        const signature = getFaceCountSignature(
            POLYHEDRON_DATA[key].faceCounts,
        );
        faceCountSigToVertexConfigKey[signature] = key;
    }
}

// --- DOM Elements ---
export const canvas = document.getElementById("netCanvas");
export const ctx = canvas ? canvas.getContext("2d") : null;
export const paletteDiv = document.getElementById("palette");
export const paletteControlsDiv = document.getElementById("palette-controls");
export const paletteButtonsDiv = document.getElementById("palette-buttons");
export const colorSelectorsDiv = document.getElementById("color-selectors");
export const saveButton = document.getElementById("saveButton"); // Saves App 1 format
export const loadFileInput = document.getElementById("loadFileInput"); // Loads App 1 format
export const clearButton = document.getElementById("clearButton");
export const exportTopologicalButton = document.getElementById(
    "exportTopologicalButton",
); // Exports App 2 format
export const switchTo3DButton = document.getElementById("switchTo3DButton"); // Switches to folding view
export const backTo2DButton = document.getElementById("backTo2DButton");
export const threeContainer = document.getElementById("threeContainer"); // Container for folding view

// --- App 1 State ---
let editorState = {
    netPolygons: [],
    nextPolygonId: 0,
    selectedPolygonId: null,
    draggedPolygon: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    isDragging: false,
    currentPaletteSelection: null,
    currentSnapTarget: null,
    viewOffsetX: 0,
    viewOffsetY: 0,
    isPanning: false,
    isActivelyPanning: false,
    panStartX: 0,
    panStartY: 0,
    polygonColors: { ...DEFAULT_COLORS },
};

// --- App 2 (Folding Viewer) State (Encapsulated) ---
let foldingState = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null, // Core Three objects
    pivots: {},
    allVertices: {},
    f1Mesh: null,
    normalHelpers: {}, // Geometry state
    sideLength: 3, // Configuration (can be adjusted)
    NUM_ANIMATION_STAGES: 0,
    currentAnimationDuration: 500, // Config/Animation
    isFolded: false,
    isAnimating: false,
    isPaused: false, // Animation state
    animationStartTime: 0,
    pausedElapsedTime: 0,
    currentAnimationStage: 0, // Animation state
    startQuaternions: {},
    targetQuaternions: {},
    pivotsInCurrentStage: [], // Animation state
    currentFoldAngles: null,
    currentNetName: "No Net Loaded", // Loaded net data
    threeInitialized: false,
    animationFrameId: null, // Internal state
    foldingControlsDiv: null, // Add this to hold the element reference
    // DOM Elements for folding controls
    foldButton: null,
    pauseButton: null,
    speedSlider: null,
    speedValueSpan: null,
    toggleNormalsCheckbox: null,
    infoDisplay: null,
};

// --- State Update Function (App 1) ---
export function updateState(newState) {
    editorState = { ...editorState, ...newState };
}

// --- App 1 State Accessor/Helper Functions ---
export function getPolygonById(id) {
    return editorState.netPolygons.find((p) => p.id === id);
}
export function removePolygonById(id) {
    const originalLength = editorState.netPolygons.length;
    const updatedPolygons = editorState.netPolygons.filter((p) => p.id !== id);
    if (updatedPolygons.length < originalLength) {
        updateState({ netPolygons: updatedPolygons });
        return true;
    }
    return false;
}
export function addPolygon(polygon) {
    updateState({ netPolygons: [...editorState.netPolygons, polygon] });
}
export function getSelectedPolygon() {
    if (editorState.selectedPolygonId === null) return null;
    return getPolygonById(editorState.selectedPolygonId);
}
export function bringToFront(polygon) {
    if (!polygon) return;
    const updatedPolygons = editorState.netPolygons.filter(
        (p) => p.id !== polygon.id,
    );
    updatedPolygons.push(polygon);
    updateState({ netPolygons: updatedPolygons });
}
export function deselectAllPolygons() {
    let selectionChanged = false;
    const updatedPolygons = editorState.netPolygons.map((p) => {
        if (p.isSelected) {
            selectionChanged = true;
            // Faster to just update property if we allow mutation
            p.isSelected = false;
            // If immutable:
            // const newP = Object.assign(Object.create(Object.getPrototypeOf(p)), p);
            // newP.isSelected = false;
            // return newP;
        }
        return p;
    });
    if (selectionChanged) {
        // If immutable: updateState({ netPolygons: updatedPolygons, selectedPolygonId: null });
        // If mutable:
        updateState({ selectedPolygonId: null });
    }
    return selectionChanged;
}
export function normalizeAngle(angle) {
    let result = angle % (2 * Math.PI);
    if (result < 0) result += 2 * Math.PI;
    return result;
}

/////////////////////////
// start of Polygon Class (App 1)
/////////////////////////
export class Polygon {
    constructor(
        id,
        sides,
        centerPosition,
        rotationAngle = 0,
        color = editorState.polygonColors[sides] || DEFAULT_COLORS[sides],
        connections = {},
    ) {
        this.id = id;
        this.sides = sides;
        this.centerPosition = centerPosition;
        this.rotationAngle = normalizeAngle(rotationAngle);
        this.radius = calculateRadiusForSideLength(sides, TARGET_SIDE_LENGTH);
        this.sideLength = TARGET_SIDE_LENGTH;
        this.color = color;
        this.connections =
            typeof connections === "object" && connections !== null
                ? connections
                : {};
        this.isSelected = false;
        this.vertices = this.calculateVertices(); // Local coords
        this.edges = this.calculateEdges(); // Edge definitions
    }

    calculateVertices() {
        const vertices = [];
        const angleStep = (2 * Math.PI) / this.sides;
        const startAngle = -Math.PI / 2 - angleStep / 2;
        for (let i = 0; i < this.sides; i++) {
            const angle = startAngle + i * angleStep;
            vertices.push({
                x: this.radius * Math.cos(angle),
                y: this.radius * Math.sin(angle),
            });
        }
        return vertices;
    }

    calculateEdges() {
        const edges = [];
        const localVertices = this.vertices;
        for (let i = 0; i < this.sides; i++) {
            const p1Index = i;
            const p2Index = (i + 1) % this.sides;
            const p1 = localVertices[p1Index];
            const p2 = localVertices[p2Index];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            edges.push({
                p1Index: p1Index,
                p2Index: p2Index,
                length: Math.sqrt(dx * dx + dy * dy),
                midpoint: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
            });
        }
        return edges;
    }

    getAbsoluteVertices() {
        const cosA = Math.cos(this.rotationAngle);
        const sinA = Math.sin(this.rotationAngle);
        return this.vertices.map((v) => ({
            x: v.x * cosA - v.y * sinA + this.centerPosition.x,
            y: v.x * sinA + v.y * cosA + this.centerPosition.y,
        }));
    }

    getEdgeAbsoluteVertices(edgeIndex) {
        if (edgeIndex < 0 || edgeIndex >= this.sides) {
            console.error(
                `Invalid edge index ${edgeIndex} for polygon ID ${this.id} with ${this.sides} sides.`,
            );
            return null;
        }
        const edgeDef = this.edges[edgeIndex];
        const p1Local = this.vertices[edgeDef.p1Index];
        const p2Local = this.vertices[edgeDef.p2Index];
        const cosA = Math.cos(this.rotationAngle);
        const sinA = Math.sin(this.rotationAngle);
        const p1Abs = {
            x: p1Local.x * cosA - p1Local.y * sinA + this.centerPosition.x,
            y: p1Local.x * sinA + p1Local.y * cosA + this.centerPosition.y,
        };
        const p2Abs = {
            x: p2Local.x * cosA - p2Local.y * sinA + this.centerPosition.x,
            y: p2Local.x * sinA + p2Local.y * cosA + this.centerPosition.y,
        };
        return [p1Abs, p2Abs];
    }

    getEdgeVertices(edgeIndex) {
        if (edgeIndex < 0 || edgeIndex >= this.sides) {
            console.error(
                `Invalid edge index ${edgeIndex} requested for polygon ID ${this.id} with ${this.sides} sides.`,
            );
            return null;
        }
        const startIndex = edgeIndex;
        const endIndex = (edgeIndex + 1) % this.sides;
        return [startIndex, endIndex];
    }

    getAbsoluteEdgeInfo(edgeIndex) {
        if (edgeIndex < 0 || edgeIndex >= this.edges.length) return null;
        const edge = this.edges[edgeIndex];
        const absVertices = this.getEdgeAbsoluteVertices(edgeIndex);
        if (!absVertices) return null;
        const absP1 = absVertices[0];
        const absP2 = absVertices[1];
        const absMidpoint = {
            x: (absP1.x + absP2.x) / 2,
            y: (absP1.y + absP2.y) / 2,
        };
        const angle = Math.atan2(absP2.y - absP1.y, absP2.x - absP1.x);
        return {
            p1: absP1,
            p2: absP2,
            midpoint: absMidpoint,
            length: edge.length,
            angle: angle,
            originalEdgeIndex: edgeIndex,
            polygonId: this.id,
        };
    }

    updatePosition(newCenter) {
        this.centerPosition = newCenter;
    }
    updateRotation(newAngle) {
        this.rotationAngle = normalizeAngle(newAngle);
    }
    updateColor(newColor) {
        this.color = newColor;
    }

    isPointInside(point) {
        const absVertices = this.getAbsoluteVertices();
        let inside = false;
        for (
            let i = 0, j = absVertices.length - 1;
            i < absVertices.length;
            j = i++
        ) {
            const xi = absVertices[i].x;
            const yi = absVertices[i].y;
            const xj = absVertices[j].x;
            const yj = absVertices[j].y;
            const intersect =
                yi > point.y !== yj > point.y &&
                point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
            if (intersect) inside = !inside;
        }
        return inside;
    }

    draw(ctx, offsetX = 0, offsetY = 0) {
        if (!ctx) return;
        const absVertices = this.getAbsoluteVertices();
        if (absVertices.length === 0) return;
        console.log(
            `[DEBUG PolyDraw] Drawing Polygon ID <span class="math-inline">\{this\.id\}\. Center\: \(</span>{this.centerPosition.x.toFixed(1)}, ${this.centerPosition.y.toFixed(1)}), Color: ${this.color}, Selected: ${this.isSelected}`,
        );
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.isSelected ? "#0000FF" : "#333333";
        ctx.lineWidth = this.isSelected ? 3 : 1;
        ctx.beginPath();
        ctx.moveTo(absVertices[0].x + offsetX, absVertices[0].y + offsetY);
        for (let i = 1; i < absVertices.length; i++) {
            ctx.lineTo(absVertices[i].x + offsetX, absVertices[i].y + offsetY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    drawEdgeHighlight(
        ctx,
        edgeIndex,
        color = "#FF00FF",
        lineWidth = 4,
        offsetX = 0,
        offsetY = 0,
    ) {
        const edgeInfo = this.getAbsoluteEdgeInfo(edgeIndex);
        if (!edgeInfo) return;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(edgeInfo.p1.x + offsetX, edgeInfo.p1.y + offsetY);
        ctx.lineTo(edgeInfo.p2.x + offsetX, edgeInfo.p2.y + offsetY);
        ctx.stroke();
        ctx.restore();
    }

    getSaveData() {
        return {
            id: this.id,
            sides: this.sides,
            centerPosition: { ...this.centerPosition },
            rotationAngle: this.rotationAngle,
            color: this.color,
            connections: { ...this.connections },
        };
    }

    static fromJSON(data) {
        const poly = new Polygon(
            data.id,
            data.sides,
            data.centerPosition,
            data.rotationAngle,
            data.color,
            data.connections || {},
        );
        return poly;
    }
} // *** End of Polygon Class ***
/////////////////////////
// end of polygon.js section
/////////////////////////

/////////////////////////
// start of drawing.js section
/////////////////////////
export function clearCanvas() {
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}
export function drawNet() {
    if (!ctx || !canvas) return;
    console.log(
        `[DEBUG DrawNet] Drawing <span class="math-inline">\{editorState\.netPolygons\.length\} polygons\. Offset\: \(</span>{editorState.viewOffsetX.toFixed(0)}, ${editorState.viewOffsetY.toFixed(0)})`,
    );
    clearCanvas();
    // Draw non-selected polygons first
    editorState.netPolygons.forEach((poly) => {
        if (!poly.isSelected)
            poly.draw(ctx, editorState.viewOffsetX, editorState.viewOffsetY);
    });
    // Draw selected polygon last
    const selectedPoly = getSelectedPolygon();
    if (selectedPoly)
        selectedPoly.draw(
            ctx,
            editorState.viewOffsetX,
            editorState.viewOffsetY,
        );
    // Draw snap highlights
    if (editorState.currentSnapTarget && editorState.draggedPolygon) {
        const { poly1, edge1Index, poly2, edge2Index } =
            editorState.currentSnapTarget;
        if (
            poly1 &&
            poly2 &&
            edge1Index >= 0 &&
            edge1Index < poly1.sides &&
            edge2Index >= 0 &&
            edge2Index < poly2.sides
        ) {
            const edgeInfo1 = poly1.getAbsoluteEdgeInfo(edge1Index);
            const edgeInfo2 = poly2.getAbsoluteEdgeInfo(edge2Index);
            if (edgeInfo1 && edgeInfo2) {
                const angleDiff = Math.abs(
                    normalizeAngle(
                        edgeInfo1.angle - (edgeInfo2.angle + Math.PI),
                    ),
                );
                const isAntiParallel =
                    angleDiff < ANGLE_SNAP_THRESHOLD ||
                    angleDiff > 2 * Math.PI - ANGLE_SNAP_THRESHOLD;
                if (isAntiParallel) {
                    poly1.drawEdgeHighlight(
                        ctx,
                        edge1Index,
                        "#FF00FF",
                        4,
                        editorState.viewOffsetX,
                        editorState.viewOffsetY,
                    );
                    poly2.drawEdgeHighlight(
                        ctx,
                        edge2Index,
                        "#FF00FF",
                        4,
                        editorState.viewOffsetX,
                        editorState.viewOffsetY,
                    );
                }
            }
        }
    }
}
/////////////////////////
// end of drawing.js section
/////////////////////////

/////////////////////////
// start of palette.js section
/////////////////////////

export function createPaletteButtons() {
    if (!paletteButtonsDiv) return;
    paletteButtonsDiv.innerHTML = "";
    const paletteFragment = document.createDocumentFragment();
    // Corrected Destructuring: [sides, name]
    Object.entries(POLYGON_TYPES).forEach(([sides, name]) => {
        const button = document.createElement("button");
        button.textContent = name; // Now 'name' correctly holds "Triangle", "Square", etc.
        button.dataset.sides = sides; // 'sides' correctly holds "3", "4", etc.
        button.addEventListener("click", handlePaletteClick);
        paletteFragment.appendChild(button);
    });
    paletteButtonsDiv.appendChild(paletteFragment);
    console.log("Palette buttons created.");
}

function handlePaletteClick(event) {
    const sides = parseInt(event.target.dataset.sides, 10);
    updateState({ currentPaletteSelection: sides, draggedPolygon: null }); // Clear any previous drag state
    if (canvas) canvas.style.cursor = "copy";
    console.log(`Selected: ${POLYGON_TYPES[sides]} (${sides} sides)`);
    console.log(
        `[DEBUG PaletteClick] Set currentPaletteSelection to: ${sides}`,
    );
    deselectAllPolygons();
    // drawNet(); // No need to redraw yet
}

export function createColorPickers() {
    if (!colorSelectorsDiv) return;
    colorSelectorsDiv.innerHTML = "";
    const colorFragment = document.createDocumentFragment();
    const heading = document.createElement("h3");
    heading.textContent = "Colors:";
    colorFragment.appendChild(heading);

    // Corrected Destructuring: [sides, name]
    Object.entries(POLYGON_TYPES).forEach(([sides, name]) => {
        const sideNum = parseInt(sides, 10); // Now 'sides' correctly holds "3", "4", etc.
        // Check if sideNum is a valid key before proceeding
        if (isNaN(sideNum) || !editorState.polygonColors[sideNum]) {
            console.warn(
                `Skipping color picker for invalid side number: ${sides}`,
            );
            return; // Use return instead of continue in forEach callback
        }
        const colorDiv = document.createElement("div");
        const label = document.createElement("label");
        label.textContent = `${name}:`; // Now 'name' correctly holds "Triangle", etc.
        label.htmlFor = `color-${sideNum}`;
        const picker = document.createElement("input");
        picker.type = "color";
        picker.id = `color-${sideNum}`;
        picker.value = editorState.polygonColors[sideNum]; // Use correct sideNum key
        picker.dataset.sides = sideNum;
        picker.addEventListener("input", handleColorChange);
        picker.addEventListener("change", handleColorChange);
        colorDiv.appendChild(label);
        colorDiv.appendChild(picker);
        colorFragment.appendChild(colorDiv);
    });
    colorSelectorsDiv.appendChild(colorFragment);
    console.log("Color pickers created.");
}
function handleColorChange(event) {
    const newColor = event.target.value;
    const sideKey = parseInt(event.target.dataset.sides, 10);
    updateState({
        polygonColors: { ...editorState.polygonColors, [sideKey]: newColor },
    });
    editorState.netPolygons.forEach((p) => {
        if (p.sides === sideKey) p.color = newColor;
    }); // Mutate directly
    drawNet();
}
export function placeNewPolygon(mousePos) {
    // mousePos is world coordinates
    console.log(
        `[DEBUG PlaceNew] Entered function. currentPaletteSelection = ${editorState.currentPaletteSelection}`,
    );
    if (editorState.currentPaletteSelection !== null) {
        const sides = editorState.currentPaletteSelection;
        const newPolygon = new Polygon(
            editorState.nextPolygonId,
            sides,
            { x: mousePos.x, y: mousePos.y },
            0,
            editorState.polygonColors[sides],
        );
        console.log(`Placed ${POLYGON_TYPES[sides]} ID ${newPolygon.id}`);
        const currentLength = editorState.netPolygons.length; // Declare currentLength BEFORE using it
        updateState({
            netPolygons: [...editorState.netPolygons, newPolygon],
            nextPolygonId: editorState.nextPolygonId + 1,
            currentPaletteSelection: null,
            selectedPolygonId: newPolygon.id,
        });
        console.log(
            `[DEBUG PlaceNew] Placed ${POLYGON_TYPES[sides]} ID ${newPolygon.id}. Polygons array length: ${currentLength} -> ${editorState.netPolygons.length}`,
        );
        if (canvas)
            canvas.style.cursor = editorState.isPanning ? "grab" : "default";
        console.log("[DEBUG PlaceNew] Calling drawNet...");
        drawNet();
    }
}
/////////////////////////
// end of palette.js section
/////////////////////////

/////////////////////////
// start of interaction.js section
/////////////////////////
export function getMousePos(canvasElement, event) {
    if (!canvasElement) return { x: 0, y: 0 };
    const rect = canvasElement.getBoundingClientRect();
    return {
        x: event.clientX - rect.left - editorState.viewOffsetX,
        y: event.clientY - rect.top - editorState.viewOffsetY,
    };
}
function getRawMousePos(canvasElement, event) {
    if (!canvasElement) return { x: 0, y: 0 };
    const rect = canvasElement.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}
export function handleMouseDown(event) {
    if (!canvas) return;
    const rawMousePos = getRawMousePos(canvas, event);
    const worldMousePos = getMousePos(canvas, event);
    if (editorState.isPanning) {
        updateState({
            isActivelyPanning: true,
            panStartX: rawMousePos.x,
            panStartY: rawMousePos.y,
        });
        canvas.classList.remove("pan-grab");
        canvas.classList.add("pan-grabbing");
        return;
    }
    if (editorState.currentPaletteSelection !== null) {
        console.log(
            `[DEBUG MouseDown] Palette selection detected. Calling placeNewPolygon at:`,
            worldMousePos,
        );
        placeNewPolygon(worldMousePos);
        canvas.style.cursor = editorState.isPanning ? "grab" : "default";
        return;
    }
    let clickedPolygon = null;
    for (let i = editorState.netPolygons.length - 1; i >= 0; i--) {
        const poly = editorState.netPolygons[i];
        if (poly.isPointInside(worldMousePos)) {
            clickedPolygon = poly;
            break;
        }
    }
    if (clickedPolygon) {
        bringToFront(clickedPolygon);
        if (editorState.selectedPolygonId !== clickedPolygon.id) {
            deselectAllPolygons();
            clickedPolygon.isSelected = true;
        }
        const dragOffsetX = worldMousePos.x - clickedPolygon.centerPosition.x;
        const dragOffsetY = worldMousePos.y - clickedPolygon.centerPosition.y;
        updateState({
            selectedPolygonId: clickedPolygon.id,
            draggedPolygon: clickedPolygon,
            dragOffsetX: dragOffsetX,
            dragOffsetY: dragOffsetY,
            isDragging: true,
        });
        canvas.style.cursor = "grabbing";
        console.log(
            `Selected/Dragging polygon ID: ${editorState.selectedPolygonId}`,
        );
    } else {
        if (deselectAllPolygons()) {
            drawNet();
        }
        updateState({ draggedPolygon: null, isDragging: false });
    }
    updateState({ currentSnapTarget: null });
    drawNet();
}
export function handleMouseMove(event) {
    if (!canvas) return;
    const rawMousePos = getRawMousePos(canvas, event);
    const worldMousePos = getMousePos(canvas, event);
    if (editorState.isActivelyPanning) {
        const dx = rawMousePos.x - editorState.panStartX;
        const dy = rawMousePos.y - editorState.panStartY;
        updateState({
            viewOffsetX: editorState.viewOffsetX + dx,
            viewOffsetY: editorState.viewOffsetY + dy,
            panStartX: rawMousePos.x,
            panStartY: rawMousePos.y,
        });
        drawNet();
        return;
    }
    if (editorState.isDragging && editorState.draggedPolygon) {
        const newCenter = {
            x: worldMousePos.x - editorState.dragOffsetX,
            y: worldMousePos.y - editorState.dragOffsetY,
        };
        editorState.draggedPolygon.updatePosition(newCenter); // Direct mutation
        const snapTarget = findSnapTarget(editorState.draggedPolygon);
        updateState({ currentSnapTarget: snapTarget });
        drawNet();
    }
}
export function handleMouseUp(event) {
    if (!canvas) return;
    if (editorState.isActivelyPanning) {
        updateState({ isActivelyPanning: false });
        canvas.classList.remove("pan-grabbing");
        if (editorState.isPanning) canvas.classList.add("pan-grab");
        else {
            canvas.classList.remove("pan-grab");
            canvas.style.cursor = "default";
        }
        return;
    }
    if (editorState.isDragging) {
        if (editorState.currentSnapTarget) {
            finalizeSnap(editorState.currentSnapTarget);
        }
        updateState({
            isDragging: false,
            draggedPolygon: null,
            currentSnapTarget: null,
        }); // Clear snap target here too
        canvas.style.cursor = editorState.isPanning ? "grab" : "default";
        console.log("Stopped dragging.");
        // finalizeSnap calls drawNet, so only call if no snap occurred? Or call always for safety.
        drawNet();
    }
    if (canvas.style.cursor === "copy") {
        canvas.style.cursor = editorState.isPanning ? "grab" : "default";
        updateState({ currentPaletteSelection: null });
    }
}
export function handleMouseLeave(event) {
    if (editorState.isActivelyPanning) {
        updateState({ isActivelyPanning: false });
        canvas.classList.remove("pan-grabbing");
        canvas.style.cursor = editorState.isPanning ? "grab" : "default";
    }
    if (editorState.isDragging && editorState.draggedPolygon) {
        handleMouseUp(event);
        console.log("Mouse left canvas during drag, action stopped.");
    }
    if (editorState.currentPaletteSelection !== null) {
        console.log("Placement cancelled (mouse left canvas).");
        updateState({ currentPaletteSelection: null, draggedPolygon: null });
        if (canvas)
            canvas.style.cursor = editorState.isPanning ? "grab" : "default";
        drawNet();
    }
    if (editorState.currentSnapTarget) {
        updateState({ currentSnapTarget: null });
        drawNet();
    }
}
export function handleKeyDown(event) {
    if (event.code === "Space" || event.key === " ") {
        if (!editorState.isPanning) {
            updateState({ isPanning: true });
            if (
                !editorState.isDragging &&
                !editorState.isActivelyPanning &&
                canvas
            ) {
                canvas.classList.add("pan-grab");
            }
        }
        event.preventDefault();
        return;
    }
    const selectedPoly = getSelectedPolygon();
    if (!selectedPoly) return;
    let needsRedraw = false;
    const rotationStep = 5 * (Math.PI / 180);
    if (event.key === "r" || event.key === "R") {
        selectedPoly.updateRotation(selectedPoly.rotationAngle + rotationStep);
        console.log(`Rotated polygon ${selectedPoly.id} right`);
        breakConnections(selectedPoly);
        needsRedraw = true;
    } else if (event.key === "l" || event.key === "L") {
        selectedPoly.updateRotation(selectedPoly.rotationAngle - rotationStep);
        console.log(`Rotated polygon ${selectedPoly.id} left`);
        breakConnections(selectedPoly);
        needsRedraw = true;
    }
    if (event.key === "Delete" || event.key === "Backspace") {
        const deletedId = editorState.selectedPolygonId;
        console.log(`Attempting to delete polygon ${deletedId}`);
        breakConnections(selectedPoly, true); // Break connections involving the deleted polygon
        if (removePolygonById(deletedId)) {
            updateState({
                selectedPolygonId: null,
                draggedPolygon: null,
                isDragging: false,
                currentSnapTarget: null,
            });
            console.log(`Deleted polygon ID ${deletedId}`);
            needsRedraw = true;
        }
    }
    if (needsRedraw) {
        updateState({ currentSnapTarget: null });
        drawNet();
    }
}
export function handleKeyUp(event) {
    if (event.code === "Space" || event.key === " ") {
        updateState({ isPanning: false });
        if (!editorState.isActivelyPanning && canvas) {
            canvas.classList.remove("pan-grab");
            canvas.classList.remove("pan-grabbing");
            canvas.style.cursor =
                editorState.isDragging && editorState.draggedPolygon
                    ? "grabbing"
                    : "default";
        }
        event.preventDefault();
    }
}
function breakConnections(polygon, breakIncoming = false) {
    if (!polygon) return;
    console.warn(
        `Breaking connections for polygon ${polygon.id} due to manual transform.`,
    );
    for (const edgeIndex in polygon.connections) {
        // Break outgoing
        const conn = polygon.connections[edgeIndex];
        const neighbor = getPolygonById(conn.polyId);
        if (
            neighbor &&
            neighbor.connections[conn.edgeIndex]?.polyId === polygon.id
        ) {
            delete neighbor.connections[conn.edgeIndex];
            console.log(
                ` Broke connection from neighbor ${neighbor.id}[${conn.edgeIndex}]`,
            );
        }
    }
    polygon.connections = {};
    if (breakIncoming) {
        // Break incoming
        editorState.netPolygons.forEach((otherPoly) => {
            if (otherPoly.id === polygon.id) return;
            for (const edgeIndex in otherPoly.connections) {
                if (otherPoly.connections[edgeIndex].polyId === polygon.id) {
                    delete otherPoly.connections[edgeIndex];
                    console.log(
                        ` Broke connection from other ${otherPoly.id}[${edgeIndex}]`,
                    );
                }
            }
        });
    }
}
/////////////////////////
// end of interaction.js section
/////////////////////////

/////////////////////////
// start of snapping.js section
/////////////////////////
function distanceSq(p1, p2) {
    if (!p1 || !p2) return Infinity;
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return dx * dx + dy * dy;
}
export function findSnapTarget(draggedPoly) {
    if (!draggedPoly) return null;
    let closestSnap = null;
    let minMidpointDistSq = SNAP_THRESHOLD * SNAP_THRESHOLD;
    for (const staticPoly of editorState.netPolygons) {
        if (staticPoly.id === draggedPoly.id) continue;
        for (let i = 0; i < draggedPoly.sides; i++) {
            if (draggedPoly.connections[i] !== undefined) continue;
            const draggedEdgeInfo = draggedPoly.getAbsoluteEdgeInfo(i);
            if (!draggedEdgeInfo) continue;
            for (let j = 0; j < staticPoly.sides; j++) {
                if (staticPoly.connections[j] !== undefined) continue;
                const staticEdgeInfo = staticPoly.getAbsoluteEdgeInfo(j);
                if (!staticEdgeInfo) continue;
                const lengthTolerance = 1.0;
                if (
                    Math.abs(draggedEdgeInfo.length - staticEdgeInfo.length) >
                    lengthTolerance
                )
                    continue;
                const midDistSq = distanceSq(
                    draggedEdgeInfo.midpoint,
                    staticEdgeInfo.midpoint,
                );
                if (midDistSq < minMidpointDistSq) {
                    const angleDiff = Math.abs(
                        normalizeAngle(
                            draggedEdgeInfo.angle -
                                (staticEdgeInfo.angle + Math.PI),
                        ),
                    );
                    const isAntiParallel =
                        angleDiff < ANGLE_SNAP_THRESHOLD ||
                        angleDiff > 2 * Math.PI - ANGLE_SNAP_THRESHOLD;
                    if (isAntiParallel) {
                        minMidpointDistSq = midDistSq;
                        closestSnap = {
                            poly1: draggedPoly,
                            edge1Index: i,
                            poly2: staticPoly,
                            edge2Index: j,
                        };
                    }
                }
            }
        }
    }
    return closestSnap;
}
export function finalizeSnap(snapTarget) {
    console.log("--- finalizeSnap START ---");
    const poly1 = snapTarget.poly1;
    const poly2 = snapTarget.poly2;
    const edge1Index = snapTarget.edge1Index;
    const edge2Index = snapTarget.edge2Index;
    if (!poly1 || !poly2) {
        console.error("finalizeSnap: Missing poly1 or poly2");
        updateState({ currentSnapTarget: null });
        return;
    }
    console.log(
        `Snapping Poly ${poly1.id} (moving) edge ${edge1Index} to Poly ${poly2.id} (static) edge ${edge2Index}`,
    );
    console.log(
        `  Poly ${poly1.id} initial: center=(${poly1.centerPosition.x.toFixed(2)}, ${poly1.centerPosition.y.toFixed(2)}), angle=${poly1.rotationAngle.toFixed(3)} rad`,
    );
    console.log(
        `  Poly ${poly2.id} static: center=(${poly2.centerPosition.x.toFixed(2)}, ${poly2.centerPosition.y.toFixed(2)}), angle=${poly2.rotationAngle.toFixed(3)} rad`,
    );
    const edge1Info = poly1.getAbsoluteEdgeInfo(edge1Index);
    const edge2Info = poly2.getAbsoluteEdgeInfo(edge2Index);
    if (!edge1Info || !edge2Info) {
        console.error("finalizeSnap: Could not get edge info");
        updateState({ currentSnapTarget: null });
        return;
    }
    const currentAngle1 = edge1Info.angle;
    const staticAngle2 = edge2Info.angle;
    console.log(`  Angle Edge 1 (World): ${currentAngle1.toFixed(3)} rad`);
    console.log(`  Angle Edge 2 (World): ${staticAngle2.toFixed(3)} rad`);
    const targetAngle1 = normalizeAngle(staticAngle2 + Math.PI);
    console.log(
        `  Target Angle for Edge 1 (World): ${targetAngle1.toFixed(3)} rad`,
    );
    let angleDiff = targetAngle1 - currentAngle1;
    angleDiff = normalizeAngle(angleDiff);
    if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    console.log(
        `  Required Rotation Diff for Polygon 1: ${angleDiff.toFixed(3)} rad`,
    );
    const finalAnglePoly1 = normalizeAngle(poly1.rotationAngle + angleDiff);
    console.log(
        `  Final Calculated Angle for Poly 1: ${finalAnglePoly1.toFixed(3)} rad`,
    );
    const originalAngle = poly1.rotationAngle;
    poly1.rotationAngle = finalAnglePoly1; // Temp set
    const edge1InfoAfterRotation = poly1.getAbsoluteEdgeInfo(edge1Index);
    poly1.rotationAngle = originalAngle; // Restore
    if (!edge1InfoAfterRotation) {
        console.error(
            "finalizeSnap: Error recalculating edge after temp rotation.",
        );
        updateState({ currentSnapTarget: null });
        return;
    }
    const midpoint1_afterRotation = edge1InfoAfterRotation.midpoint;
    const midpoint2_static = edge2Info.midpoint;
    console.log(
        `  Midpoint Edge 1 (World, after temp rotation): (${midpoint1_afterRotation.x.toFixed(2)}, ${midpoint1_afterRotation.y.toFixed(2)})`,
    );
    console.log(
        `  Midpoint Edge 2 (Static World Target): (${midpoint2_static.x.toFixed(2)}, ${midpoint2_static.y.toFixed(2)})`,
    );
    const deltaX = midpoint2_static.x - midpoint1_afterRotation.x;
    const deltaY = midpoint2_static.y - midpoint1_afterRotation.y;
    console.log(
        `  Required Translation (dx, dy): (${deltaX.toFixed(2)}, ${deltaY.toFixed(2)})`,
    );
    const finalCenterPoly1 = {
        x: poly1.centerPosition.x + deltaX,
        y: poly1.centerPosition.y + deltaY,
    };
    console.log(
        `  Final Calculated Center for Poly 1: (${finalCenterPoly1.x.toFixed(2)}, ${finalCenterPoly1.y.toFixed(2)})`,
    );
    console.log("--- Applying Updates to Poly 1 ---");
    poly1.updateRotation(finalAnglePoly1);
    poly1.updatePosition(finalCenterPoly1);
    console.log(
        `  Poly ${poly1.id} UPDATED: center=(${poly1.centerPosition.x.toFixed(2)}, ${poly1.centerPosition.y.toFixed(2)}), angle=${poly1.rotationAngle.toFixed(3)} rad`,
    );
    breakConnectionsForEdge(poly1, edge1Index);
    breakConnectionsForEdge(poly2, edge2Index);
    poly1.connections[edge1Index] = { polyId: poly2.id, edgeIndex: edge2Index };
    poly2.connections[edge2Index] = { polyId: poly1.id, edgeIndex: edge1Index };
    console.log(
        `Connection created: ${poly1.id}[${edge1Index}] <-> ${poly2.id}[${edge2Index}]`,
    );
    console.log("--- finalizeSnap END ---");
    updateState({ currentSnapTarget: null });
    drawNet();
}
function breakConnectionsForEdge(polygon, edgeIndex) {
    if (!polygon || polygon.connections[edgeIndex] === undefined) return;
    const conn = polygon.connections[edgeIndex];
    const neighbor = getPolygonById(conn.polyId);
    if (
        neighbor &&
        neighbor.connections[conn.edgeIndex]?.polyId === polygon.id
    ) {
        console.log(
            `  Broke old connection: ${neighbor.id}[${conn.edgeIndex}] -> ${polygon.id}[${edgeIndex}]`,
        );
        delete neighbor.connections[conn.edgeIndex];
    }
    delete polygon.connections[edgeIndex];
}
/////////////////////////
// end of snapping.js section
/////////////////////////

/////////////////////////
// start of fileUtils.js section (App 1 Load/Save)
/////////////////////////
function clearNet() {
    // Use window.confirm to be explicit about scope
    if (window.confirm("Are you sure you want to clear the entire net?")) {
        console.log("Clearing net...");

        // Add this call to ensure the 3D scene is also cleared
        clearFoldingSceneGeometry();
        clearNetInternal();
        // --- End Clear 3D State ---

        // Ensure 2D view is active and redraw the empty canvas
        show2DView(false); // Switch to 2D view without redraw (drawNet called next)
        drawNet(); // Redraw the (now empty) 2D canvas

        console.log("Net cleared.");
    } else {
        console.log("Clear net cancelled.");
    }
}
function clearNetInternal() {
    updateState({
        netPolygons: [],
        selectedPolygonId: null,
        draggedPolygon: null,
        currentPaletteSelection: null,
        currentSnapTarget: null,
        nextPolygonId: 0,
        viewOffsetX: 0,
        viewOffsetY: 0,
        isPanning: false,
        isActivelyPanning: false,
    });
    if (canvas) {
        canvas.classList.remove("pan-grab", "pan-grabbing");
        canvas.style.cursor = "default";
    }
    if (foldingState.threeInitialized) clearFoldingSceneGeometry(); // Use folding specific clear
    show2DView(false);
    drawNet();
}
export function saveNetToFile() {
    // Saves App 1 format
    console.log("Saving net (App 1 format)...");
    if (editorState.netPolygons.length === 0) {
        alert("Net is empty.");
        return;
    }
    const saveData = {
        version: 1.0,
        polygons: editorState.netPolygons.map((poly) => poly.getSaveData()),
        nextId: editorState.nextPolygonId,
        viewOffset: { x: editorState.viewOffsetX, y: editorState.viewOffsetY },
        polygonColors: editorState.polygonColors,
    };
    const defaultFilename = `poly_net_${Date.now()}.json`;
    let userFilename = window.prompt("Save App 1 Net As:", defaultFilename);
    if (userFilename === null || userFilename.trim() === "") {
        console.log("Save cancelled.");
        return;
    }
    if (!userFilename.toLowerCase().endsWith(".json")) userFilename += ".json";
    downloadJson(saveData, userFilename);
    console.log("App 1 Net saved.");
}
export function handleFileLoad(event) {
    // Loads App 1 format
    const file = event.target.files[0];
    if (!file) {
        console.log("No file selected.");
        return;
    }
    console.log(`Loading App 1 Net file: ${file.name}`);
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const loadedData = JSON.parse(e.target.result);
            if (
                !loadedData ||
                !Array.isArray(loadedData.polygons) ||
                typeof loadedData.nextId !== "number"
            ) {
                throw new Error("Invalid App 1 net file format.");
            }
            clearNetInternal();
            let maxId = -1;
            const loadedPolygons = loadedData.polygons
                .map((polyData) => {
                    try {
                        const poly = Polygon.fromJSON(polyData);
                        if (poly.id > maxId) maxId = poly.id;
                        return poly;
                    } catch (polyError) {
                        console.error(
                            "Error creating polygon from data:",
                            polyData,
                            polyError,
                        );
                        return null;
                    }
                })
                .filter((p) => p !== null);
            updateState({
                netPolygons: loadedPolygons,
                nextPolygonId: Math.max(maxId + 1, loadedData.nextId || 0),
                viewOffsetX: loadedData.viewOffset?.x || 0,
                viewOffsetY: loadedData.viewOffset?.y || 0,
                polygonColors: loadedData.polygonColors || {
                    ...DEFAULT_COLORS,
                },
            });
            createColorPickers();
            console.log(
                `App 1 Net loaded. ${editorState.netPolygons.length} polygons.`,
            );
            show2DView(false);
            drawNet();
            console.log("DrawNet called after load.");
        } catch (error) {
            console.error("Error loading or parsing net file:", error);
            alert(`Error loading file: ${error.message}`);
            clearNetInternal();
        } finally {
            if (loadFileInput) loadFileInput.value = "";
        }
    };
    reader.onerror = (e) => {
        console.error("Error reading file:", e);
        alert("Error reading file.");
        if (loadFileInput) loadFileInput.value = "";
    };
    reader.readAsText(file);
}
/////////////////////////
// end of fileUtils.js section
/////////////////////////

///////////////////////////////////
// start of topological export section
///////////////////////////////////
function convertNetToTopologicalFormat() {
    const polygons = editorState.netPolygons;
    if (!polygons || polygons.length === 0) {
        console.warn("Cannot convert empty net.");
        alert("Net is empty.");
        return null;
    }
    let basePolygonApp1 = null;
    try {
        basePolygonApp1 = polygons.reduce(
            (minPoly, currentPoly) =>
                !minPoly || currentPoly.id < minPoly.id ? currentPoly : minPoly,
            null,
        );
    } catch (e) {
        console.error("Error finding base polygon:", e);
        alert("Error finding base polygon.");
        return null;
    }
    if (!basePolygonApp1) {
        console.error("Could not determine base polygon.");
        alert("Error finding base polygon.");
        return null;
    }
    console.log(
        `Using App 1 polygon ID ${basePolygonApp1.id} as base face (will be exported as ID 1).`,
    );
    const oldIdToNewId = new Map();
    const connectionsApp2 = [];
    let nextNewId = 2;
    const queue = [basePolygonApp1];
    const visitedApp1Ids = new Set([basePolygonApp1.id]);
    oldIdToNewId.set(basePolygonApp1.id, 1);
    const topologicalNet = {
        description: `User-generated Net (App 1 Base ID: ${basePolygonApp1.id})`,
        baseFace: {
            noSides: basePolygonApp1.sides,
            color: basePolygonApp1.color,
        },
        connections: connectionsApp2,
    };
    const polygonMapApp1 = new Map(polygons.map((p) => [p.id, p]));
    while (queue.length > 0) {
        const currentPolyApp1 = queue.shift();
        const currentNewId = oldIdToNewId.get(currentPolyApp1.id);
        for (const edgeIndexStr in currentPolyApp1.connections) {
            const edgeIndexApp1 = parseInt(edgeIndexStr, 10);
            const connectionInfo = currentPolyApp1.connections[edgeIndexApp1];
            const neighborIdApp1 = connectionInfo.polyId;
            const neighborEdgeIndexApp1 = connectionInfo.edgeIndex;
            if (
                polygonMapApp1.has(neighborIdApp1) &&
                !visitedApp1Ids.has(neighborIdApp1)
            ) {
                const neighborPolyApp1 = polygonMapApp1.get(neighborIdApp1);
                visitedApp1Ids.add(neighborIdApp1);
                const neighborNewId = nextNewId++;
                oldIdToNewId.set(neighborIdApp1, neighborNewId);
                queue.push(neighborPolyApp1);
                const toEdgeVertices =
                    currentPolyApp1.getEdgeVertices(edgeIndexApp1);
                const fromEdgeVertices = neighborPolyApp1.getEdgeVertices(
                    neighborEdgeIndexApp1,
                );
                if (!toEdgeVertices || !fromEdgeVertices) {
                    console.error(
                        `Failed to get edge vertices for connection: App1 IDs ${currentPolyApp1.id}[${edgeIndexApp1}] <-> ${neighborIdApp1}[${neighborEdgeIndexApp1}]`,
                    );
                    continue;
                }
                const reversedFromEdgeVertices = [
                    fromEdgeVertices[1],
                    fromEdgeVertices[0],
                ];
                connectionsApp2.push({
                    from: neighborNewId,
                    noSides: neighborPolyApp1.sides,
                    color: neighborPolyApp1.color,
                    fromEdge: reversedFromEdgeVertices,
                    to: currentNewId,
                    toEdge: toEdgeVertices,
                });
            } else if (!polygonMapApp1.has(neighborIdApp1)) {
                console.warn(
                    `Connection references non-existent App 1 polygon ID ${neighborIdApp1} from polygon ${currentPolyApp1.id}`,
                );
            }
        }
    }
    if (visitedApp1Ids.size !== polygons.length) {
        console.warn(
            `Topological export incomplete. Visited ${visitedApp1Ids.size}/${polygons.length} polygons.`,
        );
        alert(
            `Warning: Exported net may be incomplete (${visitedApp1Ids.size}/${polygons.length} included).`,
        );
    }
    topologicalNet.description += ` (${connectionsApp2.length} connections)`;
    console.log(
        "Generated Topological Net (Renumbered):",
        JSON.stringify(topologicalNet, null, 2),
    );
    console.log(
        "--- Output from convertNetToTopologicalFormat (for export/internal use) ---",
    );
    console.log(JSON.stringify(topologicalNet, null, 2));
    return topologicalNet;
}
function downloadJson(data, filename) {
    if (!data) {
        console.error("No data for download.");
        return;
    }
    let jsonString;
    try {
        jsonString = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error("Failed to stringify data:", error);
        alert("Error preparing download.");
        return;
    }
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`Data downloaded as ${filename}`);
}
function exportTopologicalNet() {
    console.log("Exporting net in topological format...");
    const topologicalData = convertNetToTopologicalFormat();
    if (topologicalData) {
        const defaultFilename = `topological_net_${Date.now()}.json`;
        let userFilename = window.prompt(
            "Enter filename for topological net:",
            defaultFilename,
        );
        if (userFilename === null || userFilename.trim() === "") {
            console.log("Export cancelled.");
            return;
        }
        if (!userFilename.toLowerCase().endsWith(".json"))
            userFilename += ".json";
        downloadJson(topologicalData, userFilename);
    } else {
        console.log("Topological export cancelled or failed.");
    }
}
///////////////////////////////////
// end of topological export section
///////////////////////////////////

////////////////////////////////////////////////////////////////////////////
// START OF FOLDING LOGIC (Adapted from App 2 / script.js)
////////////////////////////////////////////////////////////////////////////

// --- Folding Helper Functions ---
function parseColorFolding(colorInput) {
    // Renamed, uses foldingState.COLOR_NAME_TO_HEX if needed
    const defaultColorHex = 0xaaaaaa;
    // console.log(`[DEBUG FOLDING] parseColor received input: "${colorInput}" (type: ${typeof colorInput})`);
    if (colorInput === null || colorInput === undefined) {
        console.warn(`Folding parseColor: null/undefined input.`);
        return defaultColorHex;
    }
    let processedColorInput = colorInput;
    if (
        typeof processedColorInput === "string" &&
        processedColorInput.length === 6 &&
        !processedColorInput.startsWith("#") &&
        !processedColorInput.startsWith("0x") &&
        /^[0-9A-Fa-f]{6}$/i.test(processedColorInput)
    ) {
        console.log(
            `[DEBUG FOLDING] Adding '#' prefix to suspected hex string: "${processedColorInput}"`,
        );
        processedColorInput = "#" + processedColorInput;
    }
    try {
        const color = new THREE.Color(processedColorInput);
        const hexValue = color.getHex();
        return hexValue;
    } catch (error) {
        console.warn(
            `Folding parseColor: Invalid color "${processedColorInput}" (original: "${colorInput}"). Using default gray. Error: ${error.message}`,
        );
        return defaultColorHex;
    }
}
function getFoldingMeshWorldVertices(faceIndex) {
    // Uses foldingState
    let mesh;
    if (faceIndex === 1) mesh = foldingState.f1Mesh;
    else if (foldingState.pivots[faceIndex]?.children.length > 0)
        mesh = foldingState.pivots[faceIndex].children[0];
    else return null;
    if (!mesh?.geometry?.attributes?.position) return null;
    const positions = mesh.geometry.attributes.position;
    const uniqueVerts = new Map();
    const tempVec = new THREE.Vector3();
    for (let i = 0; i < positions.count; i++) {
        tempVec.fromBufferAttribute(positions, i);
        const key = `${tempVec.x.toFixed(5)},${tempVec.y.toFixed(5)},${tempVec.z.toFixed(5)}`;
        if (!uniqueVerts.has(key)) uniqueVerts.set(key, tempVec.clone());
    }
    const uniqueLocalVertices = Array.from(uniqueVerts.values());
    mesh.updateWorldMatrix(true, false);
    const worldVertices = uniqueLocalVertices.map((v) =>
        v.clone().applyMatrix4(mesh.matrixWorld),
    );
    if (foldingState.allVertices[faceIndex])
        worldVertices.numSides = foldingState.allVertices[faceIndex].numSides;
    return worldVertices;
}
function calculateWorldNormal(worldVerts) {
    if (!worldVerts || worldVerts.length < 3) return new THREE.Vector3(0, 1, 0);
    const [vA, vB, vC] = worldVerts;
    if (
        !(
            vA instanceof THREE.Vector3 &&
            vB instanceof THREE.Vector3 &&
            vC instanceof THREE.Vector3
        )
    )
        return new THREE.Vector3(0, 1, 0);
    const edge1 = new THREE.Vector3().subVectors(vB, vA);
    const edge2 = new THREE.Vector3().subVectors(vC, vA);
    return new THREE.Vector3().crossVectors(edge1, edge2).normalize();
}
function calculateWorldCentroid(worldVerts) {
    const center = new THREE.Vector3();
    let count = 0;
    if (!worldVerts) return center;
    for (let i = 0; i < worldVerts.length; ++i) {
        if (worldVerts[i] instanceof THREE.Vector3) {
            center.add(worldVerts[i]);
            count++;
        }
    }
    return count > 0 ? center.divideScalar(count) : center.set(0, 0, 0);
}
function calculateLocalNormal(localVerts) {
    if (!localVerts || localVerts.length < 3) return new THREE.Vector3(0, 1, 0);
    const [vA, vB, vC] = localVerts;
    if (
        !(
            vA instanceof THREE.Vector3 &&
            vB instanceof THREE.Vector3 &&
            vC instanceof THREE.Vector3
        )
    )
        return new THREE.Vector3(0, 1, 0);
    const edge1 = new THREE.Vector3().subVectors(vB, vA);
    const edge2 = new THREE.Vector3().subVectors(vC, vA);
    const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();
    if (normal.y < -0.1) normal.negate();
    return normal;
}
function calculateLocalCenter(localVerts) {
    const center = new THREE.Vector3();
    let count = 0;
    if (!localVerts) return center;
    localVerts.forEach((v) => {
        if (v instanceof THREE.Vector3) {
            center.add(v);
            count++;
        }
    });
    return count > 0 ? center.divideScalar(count) : center;
}
function calculateHypotheticalWorldVertices(faceIndex, angle) {
    // Uses foldingState
    const pivot = foldingState.pivots[faceIndex];
    const mesh = pivot?.children[0];
    const parent = pivot?.parent;
    if (!pivot || !mesh || !mesh.geometry || !parent) return null;
    const positions = mesh.geometry.attributes.position;
    const uniqueVerts = new Map();
    const tempVec = new THREE.Vector3();
    for (let i = 0; i < positions.count; i++) {
        tempVec.fromBufferAttribute(positions, i);
        const key = `${tempVec.x.toFixed(5)},${tempVec.y.toFixed(5)},${tempVec.z.toFixed(5)}`;
        if (!uniqueVerts.has(key)) uniqueVerts.set(key, tempVec.clone());
    }
    const uniqueLocalVertices = Array.from(uniqueVerts.values());
    if (uniqueLocalVertices.length < 3) return null;
    const hypotheticalLocalQuat = new THREE.Quaternion().setFromAxisAngle(
        pivot.userData.axis,
        angle,
    );
    parent.updateWorldMatrix(true, true);
    const hypotheticalPivotWorldMatrix = parent.matrixWorld.clone();
    const pivotLocalTransform = new THREE.Matrix4().compose(
        pivot.position,
        hypotheticalLocalQuat,
        pivot.scale,
    );
    hypotheticalPivotWorldMatrix.multiply(pivotLocalTransform);
    const worldVertices = uniqueLocalVertices.map((v) =>
        v.clone().applyMatrix4(hypotheticalPivotWorldMatrix),
    );
    if (foldingState.allVertices[faceIndex])
        worldVertices.numSides = foldingState.allVertices[faceIndex].numSides;
    const validWorldVertices = worldVertices.filter(
        (v) => v instanceof THREE.Vector3,
    );
    return validWorldVertices.length >= 3 ? validWorldVertices : null;
}

// Inside new-main.js

// --- Folding Initialization Function (Streamlined) ---
// --- Folding Initialization Function (Uses #threeCanvas) ---
function initFoldingViewer() {
    if (foldingState.threeInitialized || !threeContainer) {
        if (!threeContainer)
            console.error("Folding init skipped: threeContainer not found.");
        return;
    }
    const canvas3D = document.getElementById("threeCanvas"); // Get the dedicated 3D canvas
    if (!canvas3D) {
        console.error("Folding init skipped: #threeCanvas not found.");
        return;
    }

    console.log("Initializing Folding Viewer Scene...");
    try {
        foldingState.scene = new THREE.Scene();
        foldingState.scene.background = new THREE.Color(0xffffff);
        // Use canvas3D dimensions for aspect/size
        const aspect = canvas3D.clientWidth / canvas3D.clientHeight || 1;
        foldingState.camera = new THREE.PerspectiveCamera(
            60,
            aspect,
            0.1,
            1000,
        );
        foldingState.camera.position.set(0, 15, 30);

	foldingState.camera.lookAt(0, 0, 0); 
        // Pass canvas3D to the renderer
        foldingState.renderer = new THREE.WebGLRenderer({
            canvas: canvas3D,
            antialias: true,
        });
        foldingState.renderer.setSize(
            canvas3D.clientWidth || 1,
            canvas3D.clientHeight || 1,
        );
        // No need to appendChild if canvas is passed in constructor

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        foldingState.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        foldingState.scene.add(directionalLight);

        // Pass renderer DOM element (the canvas) to OrbitControls
        foldingState.controls = new OrbitControls(
            foldingState.camera,
            foldingState.renderer.domElement,
        );
        foldingState.controls.enableDamping = true;
        foldingState.controls.dampingFactor = 0.1;
        foldingState.controls.target.set(0, 0, 0);

        const axesHelper = new THREE.AxesHelper(5);
        foldingState.scene.add(axesHelper);

        // Resize observer still observes the container for layout changes
        const threeResizeObserver = new ResizeObserver(() => {
            onThreeResize();
        });
        threeResizeObserver.observe(threeContainer);

        foldingState.threeInitialized = true;
        console.log("Folding Viewer Scene Initialized (using #threeCanvas).");
    } catch (error) {
        console.error("Folding Viewer Initialization failed:", error);
        alert("Failed to initialize 3D folding view.");
        foldingState.threeInitialized = false;
    }
}

// --- Event Listeners Setup (Updated) ---
// --- Event Listeners Setup (Gets controls, sets initial state) ---
function setupEventListeners() {
    // ... (App 1 listeners as before) ...
    saveButton.addEventListener("click", saveNetToFile);
    loadFileInput.addEventListener("change", handleFileLoad);
    clearButton.addEventListener("click", clearNet);
    exportTopologicalButton.addEventListener("click", exportTopologicalNet);
    switchTo3DButton.addEventListener("click", switchToFoldingView);
    backTo2DButton.addEventListener("click", () => show2DView(true));

    // THESE LINES WERE MISSING FROM setupEventListeners in the previous response:
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // ---> Global Listeners Section <---
    window.addEventListener("keydown", handleKeyDown); // <<< Listener IS attached here
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", resizeCanvas);

    // --- Get Folding Control Elements ---
    foldingState.foldingControlsDiv =
        document.getElementById("foldingControls");
    foldingState.foldButton = document.getElementById("foldButton3D");
    foldingState.pauseButton = document.getElementById("pauseButton3D");
    foldingState.speedSlider = document.getElementById("speedSlider3D");
    foldingState.speedValueSpan = document.getElementById("speedValue3D");
    foldingState.toggleNormalsCheckbox =
        document.getElementById("toggleNormals3D");
    foldingState.infoDisplay = document.getElementById("foldingInfo");

    // --- Set Initial UI State for Folding Controls ---
    if (foldingState.speedSlider) {
        foldingState.speedSlider.value = foldingState.currentAnimationDuration;
        if (foldingState.speedValueSpan) {
            foldingState.speedValueSpan.textContent = `${foldingState.currentAnimationDuration} ms`;
        }
    } else {
        console.warn("#speedSlider3D not found");
    }

    if (foldingState.pauseButton) {
        foldingState.pauseButton.disabled = true; // Start disabled
    } else {
        console.warn("#pauseButton3D not found");
    }

    if (foldingState.foldButton) {
        foldingState.foldButton.disabled = true; // Start disabled until net loaded
        foldingState.foldButton.textContent = "Fold";
    } else {
        console.warn("#foldButton3D not found");
    }

    if (foldingState.toggleNormalsCheckbox) {
        foldingState.toggleNormalsCheckbox.checked = false; // Start unchecked
    } else {
        console.warn("#toggleNormals3D not found");
    }

    if (foldingState.infoDisplay) {
        foldingState.infoDisplay.textContent = "Create/Export Net"; // Initial text
    } else {
        console.warn("#foldingInfo not found");
    }

    // Ensure folding controls container is initially hidden using class
    if (foldingState.foldingControlsDiv) {
        foldingState.foldingControlsDiv.classList.add("hidden"); // Add hidden class
    } else {
        console.warn("#foldingControls div not found");
    }

    // --- Add Listeners for Folding Controls ---
    if (foldingState.foldButton)
        foldingState.foldButton.addEventListener("click", toggleFolding);
    if (foldingState.pauseButton)
        foldingState.pauseButton.addEventListener("click", toggleFoldingPause);
    if (foldingState.speedSlider)
        foldingState.speedSlider.addEventListener("input", handleSpeedChange);
    if (foldingState.toggleNormalsCheckbox)
        foldingState.toggleNormalsCheckbox.addEventListener(
            "change",
            toggleNormalHelpersVisibility,
        );

    console.log("Event listeners set up (including folding controls).");
}

// --- Load Net Data into Folding State ---
function loadNet(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const netData = JSON.parse(e.target.result);
            if (!netData.placedShapes)
                throw new Error("Invalid net file format.");

            // --- Clear existing state ---
            console.log("loadNet: initializing placedShapes");
            placedShapes = []; // Clear 2D shapes
            connections = []; // Clear 2D connections
            selectedShapeId = null;
            // Clear existing 3D state to prevent conflicts with the new 2D net
            clearFoldingSceneGeometry(); // <--- ADD THIS CALL
            // --- End clear state ---

            // --- Load new 2D state ---
            netData.placedShapes.forEach((shapeData) => {
                const radius = calculateRadiusForSideLength(
                    shapeData.sides,
                    TARGET_SIDE_LENGTH,
                );
                const baseVertices = generatePolygonVertices(
                    shapeData.sides,
                    radius,
                );
                placedShapes.push({
                    ...shapeData,
                    baseVertices: baseVertices, // Regenerate base vertices
                });
            });

            connections = netData.connections || [];
            nextShapeId =
                netData.nextShapeId ||
                Math.max(0, ...placedShapes.map((s) => s.id)) + 1;
            viewTransform = netData.viewTransform || { x: 0, y: 0, scale: 1.0 }; // Load view state or reset

            isDragging = false;
            isPanning = false;
            console.log("Net loaded successfully.");
            drawNet(); // Draw the newly loaded net
            // --- End load new state ---
        } catch (error) {
            console.error("Failed to load or parse net file:", error);
            alert(`Error loading net file: ${error.message}`);
            // Also clear 3D scene on error? Maybe, depends on desired state after failed load.
            // clearFoldingSceneGeometry();
        } finally {
            // Reset the input value so the same file can be loaded again if needed
            event.target.value = null;
        }
    };
    reader.onerror = () => {
        console.error("Error reading file:", reader.error);
        alert("Error reading file.");
        event.target.value = null; // Reset input on error too
    };
    reader.readAsText(file);
}

// --- Load Net Data into Folding State ---
function loadNetForFolding(netData) {
    // Accepts parsed topological data object
    console.log("--- Input to loadNetForFolding (internal folding) ---");
    console.log(JSON.stringify(netData, null, 2));
    if (!foldingState.threeInitialized) {
        console.error("Folding viewer not initialized.");
        return false;
    }
    console.log(
        `Processing net for folding: ${netData.description || "Unnamed Net"}`,
    );
    foldingState.isFolded = false;
    foldingState.isAnimating = false;
    foldingState.isPaused = false;
    foldingState.currentAnimationStage = 0;
    if (foldingState.foldButton) foldingState.foldButton.textContent = "Fold";
    if (foldingState.pauseButton) {
        foldingState.pauseButton.disabled = true;
        foldingState.pauseButton.textContent = "Pause";
    }

    try {
        const faceCounts = {};
        if (!netData.baseFace?.noSides)
            throw new Error("Invalid net data: Missing/invalid baseFace");
        const baseSides = netData.baseFace.noSides.toString();
        faceCounts[baseSides] = 1;
        if (!netData.connections || !Array.isArray(netData.connections))
            throw new Error(
                "Invalid net data: Missing/invalid connections array",
            );
        netData.connections.forEach((conn, index) => {
            if (!conn.noSides)
                throw new Error(
                    `Invalid connection data at index ${index}: Missing noSides`,
                );
            const sides = conn.noSides.toString();
            faceCounts[sides] = (faceCounts[sides] || 0) + 1;
        });
        console.log("Folding: Detected Face Counts:", faceCounts);

        const signature = getFaceCountSignature(faceCounts);
        console.log("Folding: Generated Signature:", signature);
        const vertexConfigKey = faceCountSigToVertexConfigKey[signature];
        if (!vertexConfigKey)
            throw new Error(
                `Unknown polyhedron signature: ${signature}. Add data to POLYHEDRON_DATA.`,
            );
        console.log("Folding: Matched Vertex Configuration:", vertexConfigKey);

        const polyhedronInfo = POLYHEDRON_DATA[vertexConfigKey];
        if (!polyhedronInfo?.foldAngles)
            throw new Error(
                `Fold angle data not found for config: ${vertexConfigKey}`,
            );
        foldingState.currentFoldAngles = polyhedronInfo.foldAngles;
        foldingState.currentNetName =
            polyhedronInfo.name || netData.description || "Loaded Net";
        console.log(
            "Folding: Using Fold Angles:",
            foldingState.currentFoldAngles,
        );

        foldingState.NUM_ANIMATION_STAGES = netData.connections.length;
        console.log(
            `Folding: Set NUM_ANIMATION_STAGES to: ${foldingState.NUM_ANIMATION_STAGES}`,
        );

        createFoldingNetGeometry(netData); // Create geometry in folding scene

        if (foldingState.infoDisplay)
            foldingState.infoDisplay.textContent = `${foldingState.currentNetName}`;
        return true; // Indicate success
    } catch (error) {
        console.error("Folding: Failed to process net data:", error);
        alert(
            `Error processing net data for folding: ${error.message}. Check console.`,
        );
        clearFoldingSceneGeometry(); // Clear the folding scene
        if (foldingState.infoDisplay)
            foldingState.infoDisplay.textContent = `Error Loading Net`;
        foldingState.currentFoldAngles = null;
        foldingState.NUM_ANIMATION_STAGES = 0;
        return false; // Indicate failure
    }
}

// --- Clear Folding Scene Geometry ---
function clearFoldingSceneGeometry() {
    // --- ADD LOGGING HERE ---
    console.log("[ViewSwitch] Entering clearFoldingSceneGeometry...");
    const pivotCountBefore = Object.keys(foldingState.pivots).length;
    // --- END LOGGING ---

    if (!foldingState.scene) return;
    console.log("Clearing folding scene geometry...");
    Object.keys(foldingState.pivots).forEach((key) => {
        const pivot = foldingState.pivots[key];
        if (!pivot) return;
        while (pivot.children.length > 0) {
            const child = pivot.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material))
                    child.material.forEach((m) => m.dispose());
                else child.material.dispose();
            }
            pivot.remove(child);
        }
        if (pivot.parent) pivot.parent.remove(pivot);
        delete foldingState.pivots[key];
    });
    if (foldingState.f1Mesh) {
        while (foldingState.f1Mesh.children.length > 0) {
            const child = foldingState.f1Mesh.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material))
                    child.material.forEach((m) => m.dispose());
                else child.material.dispose();
            }
            foldingState.f1Mesh.remove(child);
        }
        foldingState.scene.remove(foldingState.f1Mesh);
        if (foldingState.f1Mesh.geometry)
            foldingState.f1Mesh.geometry.dispose();
        if (foldingState.f1Mesh.material)
            foldingState.f1Mesh.material.dispose();
        foldingState.f1Mesh = null;
    }
    Object.keys(foldingState.allVertices).forEach(
        (key) => delete foldingState.allVertices[key],
    );
    Object.keys(foldingState.normalHelpers).forEach(
        (key) => delete foldingState.normalHelpers[key],
    );
    // Reset folding animation state variables
    foldingState.isFolded = false;
    foldingState.isAnimating = false;
    foldingState.isPaused = false;
    foldingState.currentAnimationStage = 0;
    foldingState.pivotsInCurrentStage = [];
    foldingState.startQuaternions = {};
    foldingState.targetQuaternions = {};
    if (foldingState.foldButton) foldingState.foldButton.textContent = "Fold";
    if (foldingState.pauseButton) foldingState.pauseButton.disabled = true;
    console.log("Folding scene clear complete.");
    const pivotCountAfter = Object.keys(foldingState.pivots).length;
    console.log(
        `[ViewSwitch] Exiting clearFoldingSceneGeometry. Pivots before: ${pivotCountBefore}, Pivots after: ${pivotCountAfter}`,
    );
}

// --- Folding Geometry & Base Vertex Functions ---
function calculateBaseRegularPolygonVertices(numSides, sideLength) {
    // Used by folding
    const vertices = [];
    if (numSides < 3) return vertices;
    const R = sideLength / (2 * Math.sin(Math.PI / numSides));
    const angleStep = (2 * Math.PI) / numSides;
    // Align flat side with negative Z axis, center at origin
    const startAngle = -Math.PI / 2 - Math.PI / numSides; // Start angle to make bottom edge horizontal
    for (let i = 0; i < numSides; i++) {
        const angle = startAngle + i * angleStep;
        const x = R * Math.cos(angle);
        const z = R * Math.sin(angle);
        vertices.push(
            new THREE.Vector3(
                Math.abs(x) < 1e-9 ? 0 : x,
                0,
                Math.abs(z) < 1e-9 ? 0 : z,
            ),
        ); // Create on XZ plane
    }
    return vertices;
}
function createRegularPolygonGeometry(vertices) {
    // Used by folding
    const geometry = new THREE.BufferGeometry();
    if (!vertices || vertices.length < 3) return geometry;
    const numSides = vertices.length;
    const positions = [];
    const v0 = vertices[0];
    // Triangulate the polygon
    for (let i = 1; i <= numSides - 2; i++) {
        positions.push(v0.x, v0.y, v0.z);
        positions.push(vertices[i].x, vertices[i].y, vertices[i].z); // Note vertex order swap for correct facing normal
        positions.push(vertices[i + 1].x, vertices[i + 1].y, vertices[i + 1].z);
    }
    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.computeVertexNormals(); // Calculate normals for lighting
    return geometry;
}

function createFoldingNetGeometry(netData) {
    // --- Create Folding Net Geometry ---
    console.log("Creating net geometry from loaded data...");
    const L = foldingState.sideLength;
    clearFoldingSceneGeometry();

    try {
        const baseFaceSides = netData.baseFace.noSides;
        const baseFaceColorValue = parseColorFolding(netData.baseFace.color);
        foldingState.allVertices[1] = calculateBaseRegularPolygonVertices(baseFaceSides, L);
        foldingState.allVertices[1].numSides = baseFaceSides;
        const baseGeom = createRegularPolygonGeometry(foldingState.allVertices[1]);
        if (
            !baseGeom.attributes.position ||
            baseGeom.attributes.position.count === 0
        )
            throw new Error("Base geometry creation failed.");
        const baseMat = new THREE.MeshStandardMaterial({
            color: baseFaceColorValue,
            side: THREE.DoubleSide,
            roughness: 0.8,
        });
        foldingState.f1Mesh = new THREE.Mesh(baseGeom, baseMat);
        foldingState.scene.add(foldingState.f1Mesh);

        const f1LocalCenter = calculateLocalCenter(foldingState.allVertices[1]);
        const f1LocalNormal = calculateLocalNormal(foldingState.allVertices[1]);
        const arrowHelper1 = new THREE.ArrowHelper(
            f1LocalNormal,
            f1LocalCenter,
            L / 2,
            0x000000,
            L / 4,
            L / 8,
        );
        foldingState.f1Mesh.add(arrowHelper1);
        foldingState.normalHelpers[1] = arrowHelper1;

        const connections = netData.connections;
        const tempVec1 = new THREE.Vector3();
        const tempVec2 = new THREE.Vector3();
        const Q = new THREE.Vector3();
        const tempMatrix = new THREE.Matrix4();
        const tempQuatInv = new THREE.Quaternion();
        const tempWorldPos = new THREE.Vector3();

        for (const conn of connections) {
            const i = conn.from;
            const j = conn.to;
            const k = conn.noSides;
            const colorInput = conn.color;
            // Corrected Check: Allow 'to' ID (j) to be 0, but check types and minimum sides
            if (
                typeof i !== "number" ||
                typeof j !== "number" ||
                j < 0 ||
                typeof k !== "number" ||
                k < 3
            ) {
                console.warn(
                    `Skipping invalid connection definition (missing or invalid type/value):`,
                    conn,
                );
                continue;
            }

            let parentVertices = j === 1 ? foldingState.allVertices[1] : foldingState.allVertices[j];
	    
            if (!parentVertices?.numSides) {
                console.error(
                    `Net Gen Error: Parent F${j} vertices not found for F${i}`,
                );
                continue;
            }

            const Fi_base_vertices = calculateBaseRegularPolygonVertices(k, L);
            const Fi_M_vertex_index = conn.fromEdge[0];
            const Fi_N_vertex_index = conn.fromEdge[1];
            if (
                Fi_M_vertex_index === undefined ||
                Fi_M_vertex_index < 0 ||
                Fi_M_vertex_index >= k ||
                Fi_N_vertex_index === undefined ||
                Fi_N_vertex_index < 0 ||
                Fi_N_vertex_index >= k
            ) {
                console.warn(
                    `Skipping F${i}: Invalid fromEdge indices ${conn.fromEdge}`,
                );
                continue;
            }
            const W = tempVec1.subVectors(
                Fi_base_vertices[Fi_N_vertex_index],
                Fi_base_vertices[Fi_M_vertex_index],
            );

            const parentNumSides = parentVertices.numSides;
            const Fj_R_vertex_index = conn.toEdge[0];
            const Fj_S_vertex_index = conn.toEdge[1];
            if (
                Fj_R_vertex_index === undefined ||
                Fj_R_vertex_index < 0 ||
                Fj_R_vertex_index >= parentNumSides ||
                Fj_S_vertex_index === undefined ||
                Fj_S_vertex_index < 0 ||
                Fj_S_vertex_index >= parentNumSides
            ) {
                console.warn(
                    `Skipping F${i}: Invalid toEdge indices ${conn.toEdge} for parent F${j}`,
                );
                continue;
            }
            const Fj_R_vertex = parentVertices[Fj_R_vertex_index];
            const Fj_S_vertex = parentVertices[Fj_S_vertex_index];
            if (!Fj_R_vertex || !Fj_S_vertex) {
                console.error(
                    `Net Gen Error: Parent F${j} R/S vertices missing for F${i}`,
                );
                continue;
            }
            const V = tempVec2.subVectors(Fj_S_vertex, Fj_R_vertex);

            const dot = W.x * V.x + W.z * V.z;
            const det = W.x * V.z - W.z * V.x;
            let alpha = Math.atan2(det, dot);
            if (W.lengthSq() < 1e-9 || V.lengthSq() < 1e-9) alpha = 0;

            const cosA = Math.cos(alpha);
            const sinA = Math.sin(alpha);
            const Fi_rotated_vertices = Fi_base_vertices.map(
                (v) =>
                    new THREE.Vector3(
                        v.x * cosA - v.z * sinA,
                        0,
                        v.x * sinA + v.z * cosA,
                    ),
            );
            const Fi_M_rotated_vertex = Fi_rotated_vertices[Fi_M_vertex_index];
            Q.subVectors(Fj_R_vertex, Fi_M_rotated_vertex);
            const Fi_final_world_vertices = Fi_rotated_vertices.map((v) =>
                v.clone().add(Q),
            );

            foldingState.allVertices[i] = Fi_final_world_vertices;
            foldingState.allVertices[i].numSides = k;
            foldingState.allVertices[i].conn = {
                R_idx: Fi_M_vertex_index,
                S_idx: Fi_N_vertex_index,
            };

	    const fi_worldVertices = foldingState.allVertices[i];
	    let parentObject = j === 1 ? foldingState.scene : foldingState.pivots[j];
	    if (!parentObject) {
		console.error(
		    `Net Gen Error: Parent object not found for F${i}`,
		);
		continue;
	    }
	    const fj_R_target = Fj_R_vertex;
	    const fj_S_target = Fj_S_vertex;
	    const edgeMidpointWorld = fj_R_target
		.clone()
		.add(fj_S_target)
		.multiplyScalar(0.5);
	    const edgeAxisWorld = fj_R_target
		.clone()
		.sub(fj_S_target)
		.normalize();
	    const pivot = new THREE.Group();
	    foldingState.pivots[i] = pivot;
	    parentObject.updateWorldMatrix(true, true);
	    tempMatrix.copy(parentObject.matrixWorld).invert();
	    pivot.position.copy(edgeMidpointWorld).applyMatrix4(tempMatrix);
	    tempQuatInv
		.copy(
		    parentObject.getWorldQuaternion(new THREE.Quaternion()),
		)
		.invert();
	    pivot.userData.axis = edgeAxisWorld
		.clone()
		.applyQuaternion(tempQuatInv);
	    pivot.quaternion.identity();
	    parentObject.add(pivot);
	    pivot.getWorldPosition(tempWorldPos);
	    const pivotWorldQuaternionInv = pivot
		.getWorldQuaternion(new THREE.Quaternion())
		.invert();
	    const fi_localVertices = fi_worldVertices.map((worldVert) =>
		worldVert
		    .clone()
		    .sub(tempWorldPos)
		    .applyQuaternion(pivotWorldQuaternionInv),
	    );
	    const geometry = createRegularPolygonGeometry(fi_localVertices);
	    if (
		!geometry.attributes.position ||
		geometry.attributes.position.count === 0
	    )
		throw new Error(`Geometry creation failed for F${i}`);
	    const colorValue = parseColorFolding(colorInput);
	    const material = new THREE.MeshStandardMaterial({
		color: colorValue,
		side: THREE.DoubleSide,
		roughness: 0.8,
	    });
	    const faceMesh = new THREE.Mesh(geometry, material);
	    faceMesh.position.set(0, 0, 0);
	    pivot.add(faceMesh);
	    const localCenter = calculateLocalCenter(fi_localVertices);
	    const localNormal = calculateLocalNormal(fi_localVertices);
	    const arrowHelper = new THREE.ArrowHelper(
		localNormal,
		localCenter,
		L / 2,
		0x000000,
		L / 4,
		L / 8,
	    );
	    pivot.add(arrowHelper);
	    foldingState.normalHelpers[i] = arrowHelper;

        }
        console.log("Finished creating net geometry.");

        if (foldingState.toggleNormalsCheckbox)
            setNormalHelpersVisibility(
		    foldingState.toggleNormalsCheckbox.checked);

        else setNormalHelpersVisibility(false);
    } catch (error) {
        console.error("Error during net creation:", error);
        alert(
            "An error occurred while creating the net geometry. Check console.",
        );
        clearFoldingSceneGeometry();
    }
}

function createFoldingNetGeometry2(netData) {
    // Adapted from script.js, uses foldingState
    console.log("Creating folding net geometry...");
    const L = foldingState.sideLength;
    clearFoldingSceneGeometry(); // Clear specific folding geometry

    try {
        const baseFaceSides = netData.baseFace.noSides;
        const baseFaceColorValue = parseColorFolding(netData.baseFace.color); // Use specific parseColor
        foldingState.allVertices[1] = calculateBaseRegularPolygonVertices(
            baseFaceSides,
            L,
        ); // Store base at key 1
        foldingState.allVertices[1].numSides = baseFaceSides;
        const baseGeom = createRegularPolygonGeometry(
            foldingState.allVertices[1],
        );
        if (
            !baseGeom.attributes.position ||
            baseGeom.attributes.position.count === 0
        )
            throw new Error("Base geometry creation failed.");
        const baseMat = new THREE.MeshStandardMaterial({
            color: baseFaceColorValue,
            side: THREE.DoubleSide,
            roughness: 0.8,
        });
        foldingState.f1Mesh = new THREE.Mesh(baseGeom, baseMat);
        foldingState.scene.add(foldingState.f1Mesh); // Add to folding scene

        const f1LocalCenter = calculateLocalCenter(foldingState.allVertices[1]);
        const f1LocalNormal = calculateLocalNormal(foldingState.allVertices[1]);
        const arrowHelper1 = new THREE.ArrowHelper(
            f1LocalNormal,
            f1LocalCenter,
            L / 2,
            0x000000,
            L / 4,
            L / 8,
        );
        foldingState.f1Mesh.add(arrowHelper1); // Add helper to mesh
        foldingState.normalHelpers[1] = arrowHelper1;

        const connections = netData.connections;
        const tempVec1 = new THREE.Vector3();
        const tempVec2 = new THREE.Vector3();
        const Q = new THREE.Vector3();
        const tempMatrix = new THREE.Matrix4();
        const tempQuatInv = new THREE.Quaternion();
        const tempWorldPos = new THREE.Vector3();

        for (const conn of connections) {
            // Use NEW IDs from the renumbered JSON (conn.from and conn.to start from 1 or 2)
            const i = conn.from; // ID of polygon being added (e.g., 2, 3, ...)
            const j = conn.to; // ID of parent polygon (e.g., 1 for base, or 2, 3, ...)
            const k = conn.noSides;
            const colorInput = conn.color;

            // Validation check (already fixed to allow j=0, but now j should be >= 1)
            if (
                typeof i !== "number" ||
                typeof j !== "number" ||
                j < 1 ||
                typeof k !== "number" ||
                k < 3
            ) {
                console.warn(
                    `Folding: Skipping invalid connection definition (IDs should be >= 1):`,
                    conn,
                );
                continue;
            }

            let parentVertices = foldingState.allVertices[j]; // Directly use ID j (should be >= 1)
            if (!parentVertices?.numSides) {
                console.error(
                    `Folding Net Gen Error: Parent F${j} vertices not found for F${i}`,
                );
                continue;
            }

            const Fi_base_vertices = calculateBaseRegularPolygonVertices(k, L);
            const Fi_M_vertex_index = conn.fromEdge[0];
            const Fi_N_vertex_index = conn.fromEdge[1];
            if (
                Fi_M_vertex_index === undefined ||
                Fi_M_vertex_index < 0 ||
                Fi_M_vertex_index >= k ||
                Fi_N_vertex_index === undefined ||
                Fi_N_vertex_index < 0 ||
                Fi_N_vertex_index >= k
            ) {
                console.warn(
                    `Folding: Skipping F${i}: Invalid fromEdge indices ${conn.fromEdge}`,
                );
                continue;
            }
            const W = tempVec1.subVectors(
                Fi_base_vertices[Fi_N_vertex_index],
                Fi_base_vertices[Fi_M_vertex_index],
            );

            const parentNumSides = parentVertices.numSides;
            const Fj_R_vertex_index = conn.toEdge[0];
            const Fj_S_vertex_index = conn.toEdge[1];
            if (
                Fj_R_vertex_index === undefined ||
                Fj_R_vertex_index < 0 ||
                Fj_R_vertex_index >= parentNumSides ||
                Fj_S_vertex_index === undefined ||
                Fj_S_vertex_index < 0 ||
                Fj_S_vertex_index >= parentNumSides
            ) {
                console.warn(
                    `Folding: Skipping F${i}: Invalid toEdge indices ${conn.toEdge} for parent F${j}`,
                );
                continue;
            }
            const Fj_R_vertex = parentVertices[Fj_R_vertex_index];
            const Fj_S_vertex = parentVertices[Fj_S_vertex_index];
            if (!Fj_R_vertex || !Fj_S_vertex) {
                console.error(
                    `Folding Net Gen Error: Parent F${j} R/S vertices missing for F${i}`,
                );
                continue;
            }
            const V = tempVec2.subVectors(Fj_S_vertex, Fj_R_vertex);

            const dot = W.x * V.x + W.z * V.z;
            const det = W.x * V.z - W.z * V.x;
            let alpha = Math.atan2(det, dot);
            if (W.lengthSq() < 1e-9 || V.lengthSq() < 1e-9) alpha = 0;

            const cosA = Math.cos(alpha);
            const sinA = Math.sin(alpha);
            const Fi_rotated_vertices = Fi_base_vertices.map(
                (v) =>
                    new THREE.Vector3(
                        v.x * cosA - v.z * sinA,
                        0,
                        v.x * sinA + v.z * cosA,
                    ),
            );
            const Fi_M_rotated_vertex = Fi_rotated_vertices[Fi_M_vertex_index];
            Q.subVectors(Fj_R_vertex, Fi_M_rotated_vertex);
            const Fi_final_world_vertices = Fi_rotated_vertices.map((v) =>
                v.clone().add(Q),
            );

            foldingState.allVertices[i] = Fi_final_world_vertices;
            foldingState.allVertices[i].numSides = k;
            // Store connecting edge indices for potential future use (e.g., fold direction)
            foldingState.allVertices[i].conn = {
                R_idx_local: Fi_M_vertex_index,
                S_idx_local: Fi_N_vertex_index,
                parent_R_idx: Fj_R_vertex_index, // XXX
                parent_S_idx: Fj_S_vertex_index, // XXX
            };

            // --- Create Pivot and Mesh ---
            const fi_worldVertices = foldingState.allVertices[i];
            let parentObject =
                j === 1 ? foldingState.scene : foldingState.pivots[j]; // Get parent from folding state
            if (!parentObject) {
                console.error(
                    `Folding Net Gen Error: Parent object (ID ${j}) not found for F${i}`,
                );
                continue;
            }
            const fj_R_target = Fj_R_vertex;
            const fj_S_target = Fj_S_vertex; // These are vertices on the parent's local coordinate system
            const edgeMidpointWorld = fj_R_target
                .clone()
                .add(fj_S_target)
                .multiplyScalar(0.5); // Midpoint in parent's local space
            const edgeAxisWorld = fj_R_target
                .clone()
                .sub(fj_S_target)
                .normalize(); // Axis in parent's local space

            const pivot = new THREE.Group();
            foldingState.pivots[i] = pivot; // Store pivot in folding state
            parentObject.updateWorldMatrix(true, true); // Ensure parent matrix is up-to-date
            tempMatrix.copy(parentObject.matrixWorld).invert(); // Get inverse world matrix of parent
            pivot.position.copy(edgeMidpointWorld); // Position pivot at edge midpoint (relative to parent)
            //   pivot.position.copy(edgeMidpointWorld).applyMatrix4(tempMatrix); // XXX

            tempQuatInv
                .copy(parentObject.getWorldQuaternion(new THREE.Quaternion()))
                .invert(); // Inverse world quaternion of parent
            pivot.userData.axis = edgeAxisWorld.clone(); // Store axis relative to pivot's parent
	    // pivot.userData.axis = edgeAxisWorld
            //     .clone()
            //     .applyQuaternion(tempQuatInv);  // XXX

            pivot.quaternion.identity();
            parentObject.add(pivot); // Add pivot to parent

            // Calculate local vertices relative to the pivot
            pivot.updateWorldMatrix(true, false); // Ensure pivot matrix is up-to-date
            pivot.getWorldPosition(tempWorldPos); // Get pivot's world position
            const pivotWorldQuaternionInv = pivot
                .getWorldQuaternion(new THREE.Quaternion())
                .invert(); // Pivot's inverse world rotation
            // Transform final WORLD vertices of the face into the PIVOT's LOCAL space
            const fi_localVertices = fi_worldVertices.map((worldVert) =>
                worldVert
                    .clone()
                    .sub(tempWorldPos)
                    .applyQuaternion(pivotWorldQuaternionInv),
            );

            const geometry = createRegularPolygonGeometry(fi_localVertices);
            if (
                !geometry.attributes.position ||
                geometry.attributes.position.count === 0
            )
                throw new Error(`Geometry creation failed for F${i}`);
            const colorValue = parseColorFolding(colorInput); // Use folding parser
            const material = new THREE.MeshStandardMaterial({
                color: colorValue,
                side: THREE.DoubleSide,
                roughness: 0.8,
            });
            const faceMesh = new THREE.Mesh(geometry, material);
            // faceMesh.position.set(0, 0, 0); XXX
            pivot.add(faceMesh); // Add mesh as child of pivot

            // Add normal helper relative to pivot
            const localCenter = calculateLocalCenter(fi_localVertices);
            const localNormal = calculateLocalNormal(fi_localVertices);
            const arrowHelper = new THREE.ArrowHelper(
                localNormal,
                localCenter,
                L / 2,
                0x000000,
                L / 4,
                L / 8,
            );
            pivot.add(arrowHelper);
            foldingState.normalHelpers[i] = arrowHelper; // Store in folding state
        }
        console.log("Finished creating folding net geometry.");

        setNormalHelpersVisibility(
            foldingState.toggleNormalsCheckbox
                ? foldingState.toggleNormalsCheckbox.checked
                : false,
        ); // Set initial visibility
        // Adjust camera to view the newly created net
        fitFoldingCameraToNet();
    } catch (error) {
        console.error("Error during folding net creation:", error);
        alert(
            "An error occurred while creating the folding net geometry. Check console.",
        );
        clearFoldingSceneGeometry(); // Clear scene on error
    }
}

// --- End Replace ---

// --- Replace entire function (Manual BBox, Aspect Corrected Dist, Origin Target) ---
function fitFoldingCameraToNet() {
    console.log("[FitCamera] Attempting camera fit...");
    if (!foldingState.scene || !foldingState.camera || !foldingState.controls) {
        console.warn("[FitCamera Error] Scene, camera, or controls not ready.");
        return;
    }

    // --- Declare and Populate objectsToMeasure ---
    const objectsToMeasure = [];
    try {
        if (foldingState.f1Mesh) {
            objectsToMeasure.push(foldingState.f1Mesh);
        }
        Object.values(foldingState.pivots).forEach((pivot) => {
            // Add the MESH inside the pivot for measurement
            if (pivot?.children[0] instanceof THREE.Mesh) {
                objectsToMeasure.push(pivot.children[0]);
            }
        });
    } catch (gatherError) {
        console.error(
            "[FitCamera Error] Error gathering objects to measure:",
            gatherError,
        );
        return;
    }

    if (objectsToMeasure.length === 0) {
        console.warn("[FitCamera Warn] No mesh objects found to measure.");
        // Optional: Reset camera to a default view?
        foldingState.controls.target.set(0, 0, 0);
        foldingState.camera.position.set(0, 15, 30);
        foldingState.controls.update();
        return;
    }
    console.log(
        `[FitCamera Check] Measuring bounding box for ${objectsToMeasure.length} mesh objects.`,
    );

    // --- Log Scale Factors ---
    if (foldingState.f1Mesh) {
        console.log(
            `[FitCamera Check] f1Mesh scale: (${foldingState.f1Mesh.scale.x}, ${foldingState.f1Mesh.scale.y}, ${foldingState.f1Mesh.scale.z})`,
        );
    }
    const firstPivotKey = Object.keys(foldingState.pivots)[0];
    if (firstPivotKey && foldingState.pivots[firstPivotKey]) {
        const firstPivot = foldingState.pivots[firstPivotKey];
        console.log(
            `[FitCamera Check] Pivot ${firstPivotKey} scale: (${firstPivot.scale.x}, ${firstPivot.scale.y}, ${firstPivot.scale.z})`,
        );
    }
    // --- End Scale Logs ---

    // --- MANUAL BOUNDING BOX CALCULATION ---
    const box = new THREE.Box3();
    const tempVector = new THREE.Vector3();
    let firstVertex = true;

    try {
        objectsToMeasure.forEach((mesh) => {
            if (!mesh.geometry?.attributes?.position) {
                console.warn(
                    "[FitCamera Warn] Skipping mesh with missing geometry/position:",
                    mesh.name || mesh.uuid,
                );
                return;
            }
            const positionAttribute = mesh.geometry.attributes.position;
            mesh.updateWorldMatrix(true, false); // Ensure world matrix is up-to-date

            for (let i = 0; i < positionAttribute.count; i++) {
                tempVector.fromBufferAttribute(positionAttribute, i);
                tempVector.applyMatrix4(mesh.matrixWorld); // Transform vertex to world space

                if (firstVertex) {
                    box.min.copy(tempVector);
                    box.max.copy(tempVector);
                    firstVertex = false;
                } else {
                    box.expandByPoint(tempVector);
                }
            }
        });
    } catch (boxError) {
        console.error(
            "[FitCamera Error] Error during manual bounding box calculation:",
            boxError,
        );
        return;
    }

    if (firstVertex) {
        console.warn(
            "[FitCamera Warn] No vertices processed for bounding box.",
        );
        return;
    }
    // --- END MANUAL BOUNDING BOX ---

    if (!box.isEmpty()) {
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // --- Check FOV and Aspect ---
        console.log(`[FitCamera Check] Camera FOV: ${foldingState.camera.fov}`);
        console.log(
            `[FitCamera Check] Camera Aspect: ${foldingState.camera.aspect?.toFixed(3)}`,
        );
        // --- End Check ---

        // --- Aspect-Ratio Corrected Distance Calculation ---
        const vfov = foldingState.camera.fov * (Math.PI / 180);
        const aspect = foldingState.camera.aspect;
        let distanceForHeight = 0,
            distanceForWidth = 0;

        if (Math.tan(vfov / 2) > 1e-6) {
            distanceForHeight = size.z / 2 / Math.tan(vfov / 2);
        }
        const hfov = 2 * Math.atan(aspect * Math.tan(vfov / 2));
        if (Math.tan(hfov / 2) > 1e-6) {
            distanceForWidth = size.x / 2 / Math.tan(hfov / 2);
        }

        const requiredDistance = Math.max(distanceForHeight, distanceForWidth);
        const paddingFactor = 1.1; // Restore 10% padding
        const minDistance = 10;
        const distance = Math.max(
            requiredDistance * paddingFactor,
            minDistance,
        );
        // --- End Corrected Calculation ---

        // --- Log Final Values ---
        console.log(
            `[FitCamera MANUALLY CALC] Bounding Box Min: (${box.min.x.toFixed(2)}, ${box.min.y.toFixed(2)}, ${box.min.z.toFixed(2)})`,
        );
        console.log(
            `[FitCamera MANUALLY CALC] Bounding Box Max: (${box.max.x.toFixed(2)}, ${box.max.y.toFixed(2)}, ${box.max.z.toFixed(2)})`,
        );
        console.log(
            `[FitCamera MANUALLY CALC] Box Size: (${size.x.toFixed(2)}, ${size.y.toFixed(2)}, ${size.z.toFixed(2)})`,
        );
        console.log(
            `[FitCamera MANUALLY CALC] Box Center: (${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)})`,
        );
        console.log(
            `[FitCamera MANUALLY CALC] VFOV: ${vfov.toFixed(3)} rad (${foldingState.camera.fov} deg), HFOV: ${hfov.toFixed(3)} rad (${((hfov * 180) / Math.PI).toFixed(1)} deg)`,
        );
        console.log(
            `[FitCamera MANUALLY CALC] Distance for Width: ${distanceForWidth.toFixed(2)}, Dist for Height: ${distanceForHeight.toFixed(2)}`,
        );
        console.log(
            `[FitCamera MANUALLY CALC] Required Distance: ${requiredDistance.toFixed(2)}`,
        );
        console.log(
            `[FitCamera MANUALLY CALC] Final Camera Distance (Padding: ${paddingFactor}): ${distance.toFixed(2)}`,
        );
        // --- END LOGS ---

        // --- Set Camera Position and Target ---
        foldingState.camera.position.set(
            0, // Align camera X with target X (origin)
            center.y + size.y + distance * 0.1, // Position camera slightly above center y, offset proportional to distance
            center.z + distance, // Position camera Z relative to calculated distance AND box center Z
        );
        foldingState.controls.target.set(0, 0, 0); // Target origin
        foldingState.controls.update();
        console.log(
            "Folding camera adjusted (Manual BBox, Aspect Corrected, Origin Target).",
        );
    } else {
        console.warn(
            "[FitCamera Warn] Manual bounding box is empty after vertex iteration.",
        );
        foldingState.controls.target.set(0, 0, 0);
        foldingState.camera.position.set(0, 15, 30);
        foldingState.controls.update();
    }
}
// --- End Replace ---

// --- Folding Animation Logic ---
function setNormalHelpersVisibility(visible) {
    // Uses foldingState
    Object.values(foldingState.normalHelpers).forEach((helper) => {
        if (helper) helper.visible = visible;
    });
}
function toggleNormalHelpersVisibility() {
    // Uses foldingState
    if (foldingState.toggleNormalsCheckbox)
        setNormalHelpersVisibility(foldingState.toggleNormalsCheckbox.checked);
}
function getPivotsForStage(stage) {
    // Uses foldingState
    const effectiveStage = Math.abs(stage);
    if (
        effectiveStage >= 1 &&
        effectiveStage <= foldingState.NUM_ANIMATION_STAGES
    ) {
        const pivotIndex = effectiveStage + 1; // Assumes IDs are 1, 2, 3, ...
        return foldingState.pivots[pivotIndex] ? [pivotIndex] : [];
    } else {
        return [];
    }
}

function triggerAnimationStage(stage) {
    // Uses foldingState
    if (!foldingState.currentFoldAngles) {
        console.warn(
            "Folding: Cannot trigger animation: Fold angles not loaded.",
        );
        foldingState.isAnimating = false;
        return;
    }
    foldingState.currentAnimationStage = stage;
    foldingState.pivotsInCurrentStage = getPivotsForStage(stage);
    if (foldingState.pivotsInCurrentStage.length === 0) {
        foldingState.isAnimating = false;
        foldingState.currentAnimationStage = 0;
        if (foldingState.pauseButton) foldingState.pauseButton.disabled = true;
        if (foldingState.pauseButton)
            foldingState.pauseButton.textContent = "Pause";
        foldingState.isPaused = false;
        const endStageUnfold = -(foldingState.NUM_ANIMATION_STAGES + 1);
        if (stage === endStageUnfold)
            console.log(`Folding: Seq unfold complete.`);
        else if (stage === 0 && foldingState.isFolded)
            console.log("Folding: Seq fold complete.");
        return;
    }
    const unfolding = stage < 0;
    const mPointVec1 = new THREE.Vector3(),
        mPointVec2 = new THREE.Vector3(),
        mPointVec3 = new THREE.Vector3();

    for (const pivotIndex of foldingState.pivotsInCurrentStage) {
        const pivot = foldingState.pivots[pivotIndex];
        const faceIndex = pivotIndex;
        const faceData = foldingState.allVertices[faceIndex]; // Face being folded
        if (!pivot || !pivot.parent || !faceData) {
            foldingState.startQuaternions[pivotIndex] = null;
            foldingState.targetQuaternions[pivotIndex] = null;
            continue;
        }
        const parent = pivot.parent;
        // Find parent's ID (which is also the key in foldingState.pivots or 1 for base)
        const parentKey = Object.keys(foldingState.pivots).find(
            (key) => foldingState.pivots[key] === parent,
        );
        const parentIndex =
            parent === foldingState.scene
                ? 1
                : parentKey
                  ? parseInt(parentKey, 10)
                  : null;
        const parentData = parentIndex
            ? foldingState.allVertices[parentIndex]
            : null; // Parent face data

        if (
            !pivot.userData.axis ||
            !parentData ||
            !faceData.conn ||
            !parentData.numSides ||
            !faceData.numSides
        ) {
            console.warn(
                `Folding: Missing data for pivot ${pivotIndex} or parent ${parentIndex}. Axis:`,
                pivot.userData.axis,
                "ParentData:",
                parentData,
                "FaceData:",
                faceData,
            );
            foldingState.startQuaternions[pivotIndex] = null;
            foldingState.targetQuaternions[pivotIndex] = null;
            continue;
        }

        const sides_i = faceData.numSides;
        const sides_j = parentData.numSides;
        let baseFoldAngleKey = `${sides_i}-${sides_j}`;
        let baseTargetAngle = foldingState.currentFoldAngles[baseFoldAngleKey];
        if (baseTargetAngle === undefined) {
            baseFoldAngleKey = `${sides_j}-${sides_i}`;
            baseTargetAngle = foldingState.currentFoldAngles[baseFoldAngleKey];
        }
        if (baseTargetAngle === undefined) {
            console.warn(
                `Folding: Using default fold angle for key ${baseFoldAngleKey}.`,
            );
            baseTargetAngle = Math.PI / 2;
        } // Default to 90 deg if not found
        if (unfolding) baseTargetAngle = 0; // Target angle is 0 when unfolding

        let angleSign = 1;
        if (!unfolding) {
            // Determine fold direction only when folding
            const parentWorldVertices =
                getFoldingMeshWorldVertices(parentIndex);
            const centerF = parentWorldVertices
                ? calculateWorldCentroid(parentWorldVertices)
                : null;
            const normalF = parentWorldVertices
                ? calculateWorldNormal(parentWorldVertices)
                : null;
            const vertsG_plus = calculateHypotheticalWorldVertices(
                faceIndex,
                baseTargetAngle,
            );
            const centerG_plus = vertsG_plus
                ? calculateWorldCentroid(vertsG_plus)
                : null;
            const normalG_plus = vertsG_plus
                ? calculateWorldNormal(vertsG_plus)
                : null;
            const vertsG_minus = calculateHypotheticalWorldVertices(
                faceIndex,
                -baseTargetAngle,
            );
            const centerG_minus = vertsG_minus
                ? calculateWorldCentroid(vertsG_minus)
                : null;
            const normalG_minus = vertsG_minus
                ? calculateWorldNormal(vertsG_minus)
                : null;
            const M1 =
                centerF && normalF
                    ? mPointVec1.copy(centerF).add(normalF)
                    : null;
            const M2 =
                centerG_plus && normalG_plus
                    ? mPointVec2.copy(centerG_plus).add(normalG_plus)
                    : null;
            const M2_prime =
                centerG_minus && normalG_minus
                    ? mPointVec3.copy(centerG_minus).add(normalG_minus)
                    : null;
            if (M1 && M2 && M2_prime) {
                const dSq = M1.distanceToSquared(M2);
                const dPrimeSq = M1.distanceToSquared(M2_prime);
                angleSign = dSq > dPrimeSq ? 1 : -1;
            } // Original (potentially buggy) direction logic
            else {
                angleSign = 1;
                console.warn(
                    `Folding: Could not determine fold direction for face ${faceIndex}, defaulting to +1.`,
                );
            }
        }
        const targetAngleValue = angleSign * baseTargetAngle;
        foldingState.startQuaternions[pivotIndex] = pivot.quaternion.clone();
        foldingState.targetQuaternions[pivotIndex] =
            new THREE.Quaternion().setFromAxisAngle(
                pivot.userData.axis,
                targetAngleValue,
            );
    }
    foldingState.animationStartTime = performance.now();
    foldingState.pausedElapsedTime = 0;
    foldingState.isAnimating = true;
    foldingState.isPaused = false;
    if (foldingState.pauseButton) {
        foldingState.pauseButton.disabled = false;
        foldingState.pauseButton.textContent = "Pause";
    }
}

function toggleFolding() {
    // Uses foldingState
    if (!foldingState.currentFoldAngles) {
        alert("Load a net first by creating/exporting from 2D editor.");
        return;
    }
    if (foldingState.isAnimating && !foldingState.isPaused) return; // Don't interrupt animation
    if (foldingState.isAnimating && foldingState.isPaused) {
        toggleFoldingPause();
        return;
    } // Resume first
    foldingState.isPaused = false;
    if (foldingState.pauseButton)
        foldingState.pauseButton.textContent = "Pause";
    if (!foldingState.isFolded) {
        triggerAnimationStage(1);
        if (foldingState.foldButton)
            foldingState.foldButton.textContent = "Unfold";
    } else {
        triggerAnimationStage(-1);
        if (foldingState.foldButton)
            foldingState.foldButton.textContent = "Fold";
    }
    foldingState.isFolded = !foldingState.isFolded;
}
function toggleFoldingPause() {
    // Uses foldingState
    if (!foldingState.isAnimating) return;
    foldingState.isPaused = !foldingState.isPaused;
    if (foldingState.isPaused) {
        foldingState.pausedElapsedTime =
            performance.now() - foldingState.animationStartTime;
        if (foldingState.pauseButton)
            foldingState.pauseButton.textContent = "Resume";
    } else {
        foldingState.animationStartTime =
            performance.now() - foldingState.pausedElapsedTime;
        if (foldingState.pauseButton)
            foldingState.pauseButton.textContent = "Pause";
    }
}
function handleSpeedChange(event) {
    // Uses foldingState
    if (foldingState.speedSlider && foldingState.speedValueSpan) {
        foldingState.currentAnimationDuration = parseInt(
            event.target.value,
            10,
        );
        foldingState.speedValueSpan.textContent = `${foldingState.currentAnimationDuration} ms`;
    }
}
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
function animateFolding() {
    // Renamed, uses foldingState
    if (!foldingState.threeInitialized) {
        foldingState.animationFrameId = null;
        return;
    } // Stop if not initialized
    foldingState.animationFrameId = requestAnimationFrame(animateFolding); // Loop
    if (foldingState.isAnimating && !foldingState.isPaused) {
        const elapsedTime = performance.now() - foldingState.animationStartTime;
        let progress = Math.min(
            elapsedTime / foldingState.currentAnimationDuration,
            1,
        );
        const easedProgress = easeInOutQuad(progress);
        for (const pivotIndex of foldingState.pivotsInCurrentStage) {
            const pivot = foldingState.pivots[pivotIndex];
            if (
                pivot &&
                foldingState.startQuaternions[pivotIndex] &&
                foldingState.targetQuaternions[pivotIndex]
            ) {
                pivot.quaternion
                    .copy(foldingState.startQuaternions[pivotIndex])
                    .slerp(
                        foldingState.targetQuaternions[pivotIndex],
                        easedProgress,
                    );
            }
        }
        if (progress >= 1) {
            // Stage complete
            for (const pivotIndex of foldingState.pivotsInCurrentStage) {
                const pivot = foldingState.pivots[pivotIndex];
                if (pivot && foldingState.targetQuaternions[pivotIndex])
                    pivot.quaternion.copy(
                        foldingState.targetQuaternions[pivotIndex],
                    );
            } // Snap to target
            let nextStage = 0; // Determine next stage
            const currentStage = foldingState.currentAnimationStage;
            const numStages = foldingState.NUM_ANIMATION_STAGES;
            if (currentStage > 0 && currentStage < numStages)
                nextStage = currentStage + 1; // Folding next
            else if (currentStage < 0 && currentStage > -numStages)
                nextStage = currentStage - 1; // Unfolding next
            else if (currentStage === numStages)
                nextStage = 0; // End fold sequence
            else if (currentStage === -numStages) nextStage = -(numStages + 1); // End unfold sequence (triggers completion message)
            triggerAnimationStage(nextStage); // Trigger next stage (or completion)
        }
    }
    if (foldingState.controls) foldingState.controls.update(); // Update orbit controls
    if (foldingState.renderer && foldingState.scene && foldingState.camera)
        foldingState.renderer.render(foldingState.scene, foldingState.camera); // Render
}
function stopFoldingAnimation() {
    // Renamed
    if (foldingState.animationFrameId !== null) {
        cancelAnimationFrame(foldingState.animationFrameId);
        foldingState.animationFrameId = null;
        console.log("Stopped Folding animation loop.");
    }
}

////////////////////////////////////////////////////////////////////////////
// END OF FOLDING LOGIC
////////////////////////////////////////////////////////////////////////////

///////////////////////////////////
// start of topological export section (Already defined above)
///////////////////////////////////
// function convertNetToTopologicalFormat() { ... }
// function downloadJson(data, filename) { ... }
// function exportTopologicalNet() { ... }
///////////////////////////////////
// end of topological export section
///////////////////////////////////

/////////////////////////
// start of view switching section
/////////////////////////

// --- View Switching Logic (Uses classes now) ---
export function switchToFoldingView() {
    console.log("[ViewSwitch] Entering switchToFoldingView...");
    console.log("[DEBUG] Attempting to switch to Folding View...");
    if (!canvas || !threeContainer || !backTo2DButton || !switchTo3DButton) {
        /*...*/ return;
    }
    if (editorState.netPolygons.length === 0) {
        /*...*/ return;
    }

    // 1. Generate topological data
    console.log("[DEBUG] Generating topological data...");
    console.log("[ViewSwitch] Step 1: Generating topological data..."); // LOG
    const topologicalData = convertNetToTopologicalFormat();
    if (!topologicalData) {
        /*...*/ return;
    }
    console.log("[ViewSwitch] Step 1 Complete."); // LOG
    console.log("[DEBUG] Topological data generated.");

    // 2. Ensure Folding Viewer is initialized
    console.log("[ViewSwitch] Step 2: Checking/Initializing Folding Viewer..."); // LOG
    if (!foldingState.threeInitialized) initFoldingViewer();
    if (!foldingState.threeInitialized) {
        /*...*/ return;
    }
    console.log("[ViewSwitch] Step 2 Complete."); // LOG
    console.log("[DEBUG] Folding viewer initialized.");

    // 3. Load the generated data into the folding viewer logic
    console.log("[DEBUG] Loading net data into folding viewer...");
    console.log("[ViewSwitch] Step 3: Loading net data into folding viewer..."); // LOG
    if (!loadNetForFolding(topologicalData)) {
        /*...*/ return;
    }
    console.log("[ViewSwitch] Step 3 Complete."); // LOG
    console.log("[DEBUG] Net data loaded for folding.");

    // 4. Switch visibility
    console.log("[DEBUG] Switching visibility: Hiding 2D, Showing 3D...");
    console.log("[ViewSwitch] Step 4: Switching DOM visibility..."); // LOG
    canvas.style.display = "none";
    threeContainer.style.display = "block"; // Show the 3D container
    console.log("[ViewSwitch] Step 4 Complete."); // LOG

    // Show and enable controls using class and disabled property
    if (foldingState.foldingControlsDiv) {
        foldingState.foldingControlsDiv.classList.remove("hidden"); // Make container visible
        console.log("[DEBUG] Removed 'hidden' class from foldingControlsDiv.");
    } else {
        console.error("Cannot show foldingControlsDiv - element not found.");
    }
    if (foldingState.foldButton) foldingState.foldButton.disabled = false; // Enable fold button
    // Pause button state managed by animation logic

    backTo2DButton.style.display = "block";
    switchTo3DButton.style.display = "none";
    console.log("[DEBUG] Visibility switched.");

    // 5. Resize and start animation loop
    setTimeout(() => {
        console.log("[ViewSwitch] setTimeout callback executing...");
        console.log(
            "[DEBUG] Executing setTimeout for resize/animation start...",
        );
        try {
            if (foldingState.threeInitialized) {
                console.log(
                    "[ViewSwitch] setTimeout: Calling onThreeResize()...",
                ); // LOG
                onThreeResize(); // Resize the 3D folding view canvas
                if (foldingState.animationFrameId === null) {
                    console.log(
                        "[ViewSwitch] setTimeout: Starting animateFolding()...",
                    ); // LOG
                    console.log("[DEBUG] Starting folding animation loop...");
                    animateFolding();
                } else {
                    console.log(
                        "[ViewSwitch] setTimeout: animateFolding() loop already running?",
                    ); // LOG
                    console.log(
                        "[DEBUG] Folding animation loop already running?",
                    );
                }
                console.log("[ViewSwitch] setTimeout callback complete."); // LOG
                console.log(
                    "[DEBUG] Switched to Folding 3D View (setTimeout complete).",
                );
            } else {
                console.error("[DEBUG] Folding view not ready in setTimeout.");
                show2DView(false);
            }
        } catch (e) {
            console.error("[DEBUG] Error during 3D view switch timeout:", e);
            alert("Error switching view.");
            show2DView(false);
        }
    }, 0);
    console.log(
        "[ViewSwitch] Exiting switchToFoldingView (setTimeout scheduled).",
    ); // LOG
}

export function show2DView(doRedraw = true) {
    console.log("[ViewSwitch] Entering show2DView...");
    console.log("Switching back to 2D Editor view...");
    if (!canvas || !threeContainer || !backTo2DButton || !switchTo3DButton) {
        /*...*/ return;
    }

    console.log("[ViewSwitch] Stopping folding animation..."); // LOG
    // Stop the folding animation loop
    stopFoldingAnimation();

    console.log("[ViewSwitch] Switching DOM visibility for 2D..."); // LOG
    // Switch visibility
    threeContainer.style.display = "none"; // Hide 3D container
    if (foldingState.foldingControlsDiv) {
        foldingState.foldingControlsDiv.classList.add("hidden"); // Hide controls via class
    }
    // Disable folding controls when returning to 2D
    if (foldingState.foldButton) foldingState.foldButton.disabled = true;
    if (foldingState.pauseButton) foldingState.pauseButton.disabled = true;

    canvas.style.display = "block"; // Show 2D canvas
    backTo2DButton.style.display = "none";
    switchTo3DButton.style.display = "block";

    // Resize and redraw the 2D canvas if requested
    if (doRedraw) {
        console.log("[ViewSwitch] Resizing/Redrawing 2D canvas..."); // LOG
        resizeCanvas();
    }
    console.log("Switched to 2D Editor view.");
    console.log("[ViewSwitch] Exiting show2DView."); // LOG
}

// --- Handle Resize for 3D View ---
// --- Handle Resize for 3D View (Targets #threeCanvas now) ---
function onThreeResize() {
    const canvas3D = document.getElementById("threeCanvas"); // Get the 3D canvas
    if (
        !foldingState.renderer ||
        !foldingState.camera ||
        !threeContainer ||
        !canvas3D ||
        !foldingState.threeInitialized ||
        threeContainer.style.display === "none"
    ) {
        return;
    }
    // Use container dimensions to set canvas size (important for layout)
    const width = threeContainer.clientWidth;
    const height = threeContainer.clientHeight;

    if (width > 0 && height > 0) {
        // Update camera aspect based on container dimensions
        foldingState.camera.aspect = width / height;
        foldingState.camera.updateProjectionMatrix();
        // Update renderer size AND canvas style size
        console.log(
            `[onThreeResize] Setting renderer size to: ${width} x ${height}`,
        );
        foldingState.renderer.setSize(width, height);
        // canvas3D.style.width = `${width}px`; // Not usually needed if renderer handles size
        // canvas3D.style.height = `${height}px`;
        // console.log(`Resized 3D folding view to ${width}x${height}`);
    } else {
        console.warn(
            "Attempted to resize 3D view container with zero dimensions.",
        );
    }
}

/////////////////////////
// end of view switching section
/////////////////////////

/////////////////////////
// start of main initialization section
/////////////////////////
export function resizeCanvas() {
    // Combined resize handler
    if (threeContainer && threeContainer.style.display !== "none") {
        onThreeResize();
    } // Resize folding view if active
    else if (canvas && canvas.style.display !== "none") {
        // Resize 2D view if active
        const viewArea = document.querySelector(".view-area");
        if (!viewArea) return;
        const viewRect = viewArea.getBoundingClientRect();
        if (viewRect.width > 0 && viewRect.height > 0) {
            canvas.width = viewRect.width;
            canvas.height = viewRect.height;
            console.log(
                `Resized 2D canvas to ${canvas.width}x${canvas.height}`,
            );
            drawNet();
        } else {
            console.warn("View area has zero dimensions during 2D resize.");
        }
    }
}

// --- Initialize Function ---
function initialize() {
    try {
        console.log("Initializing Net Builder / Folder...");
        if (!ctx) {
            throw new Error("Failed to get 2D canvas context.");
        }
        // Create 2D UI
        if (paletteButtonsDiv) createPaletteButtons();
        else console.error("#palette-buttons div not found!");
        if (colorSelectorsDiv) createColorPickers();
        else console.error("#color-selectors div not found!");
        // Setup listeners (finds elements, sets initial UI state for folding controls)
        setupEventListeners();
        // Initialize 3D environment objects (doesn't touch controls DOM here)
        initFoldingViewer();
        // Set initial view to 2D
        show2DView(false);
        // Perform initial resize for the 2D canvas
        resizeCanvas();
        console.log("Net Builder / Folder Initialized");
    } catch (error) {
        console.error("Initialization failed:", error);
        alert(`Application initialization failed: ${error.message}`);
    }
}

document.addEventListener("DOMContentLoaded", initialize);
/////////////////////////
// end of main initialization section
/////////////////////////
