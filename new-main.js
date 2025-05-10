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

// --- UPDATED DEFAULT_COLORS ---
// Using standard HTML color names where available
const DEFAULT_COLORS = {
    3: "yellow",   // Triangle
    4: "red",      // Square
    5: "blue",     // Pentagon
    6: "green",    // Hexagon
    8: "pink",     // Octagon
    10: "orange",  // Decagon
};

// Constant for the Palette Choice option value
const PALETTE_CHOICE_VALUE = "__palette_choice__";


function calculateRadiusForSideLength(sides, sideLength) {
    if (sides < 3) return 0;
    return sideLength / (2 * Math.sin(Math.PI / sides));
}

// App 2 Folding Data Tables
// COLOR_NAME_TO_HEX is already defined and useful for the 3D viewer, keep it.
const COLOR_NAME_TO_HEX = {
    // Kept for parseColor robustness, supports common names and adds default colors
    red: 0xff0000,
    yellow: 0xffff00,
    green: 0x0fe645, // Bright green
    blue: 0x0000ff,
    cyan: 0x00ffff,
    magenta: 0xff00ff,
    pink: 0xffc0cb,
    purple: 0x800080,
    teal: 0x008080,
    orange: 0xffa500, // Standard orange
    lime: 0x00ff00,
    indigo: 0x4b0082,
    violet: 0xee82ee,
    gold: 0xffd700,
    silver: 0xc0c0c0,
    gray: 0x808080,
    grey: 0x808080, // Corrected grey hex
    white: 0xffffff,
    black: 0x000000,
    // Add hex for original defaults just in case
    "#FFADAD": 0xffadad,
    "#FFD6A5": 0xffd6a5,
    "#FDFFB6": 0xfdffb6,
    "#CAFFBF": 0xcaffbf,
    "#A0C4FF": 0xa0c4ff,
    "#BDB2FF": 0xbdb2ff,
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
let canvas, ctx, paletteDiv, paletteControlsDiv, paletteButtonsDiv;
let saveButton, loadFileInput, clearButton, exportTopologicalButton;
let switchTo3DButton, backTo2DButton, threeContainer;



// --- DOM Elements for Color Context Menu ---
// Declare variables here, but initialize them in the initialize function
let colorContextMenu = null;
let colorMenuList = null;

let pureColor = 0;

// --- App 1 State ---
let editorState = {
    netPolygons: [],
    nextPolygonId: 0,
    selectedPolygonId: null, // Keep selectedPolygonId for rotation/deletion
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

    // --- State for Color Context Menu ---
    colorMenuPolygonId: null, // ID of the polygon that was right-clicked
    customColorsHistory: [], // Array to store custom colors chosen via the palette picker
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
        }
        return p;
    });
    if (selectionChanged) {
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
        // Get default color directly from the global constant
        color = DEFAULT_COLORS[sides],
        connections = {},
    ) {
        this.id = id;
        this.sides = sides;
        this.centerPosition = centerPosition;
        this.rotationAngle = normalizeAngle(rotationAngle);
        this.radius = calculateRadiusForSideLength(sides, TARGET_SIDE_LENGTH);
        this.sideLength = TARGET_SIDE_LENGTH;
        // The color can be a string (name or hex)
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
    // Method to update the color of a specific polygon instance
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
            `[DEBUG PolyDraw] Drawing Polygon ID ${this.id}. Center: (${this.centerPosition.x.toFixed(1)}, ${this.centerPosition.y.toFixed(1)}), Color: ${this.color}, Selected: ${this.isSelected}`,
        );
        ctx.save();
        // Canvas fillStyle supports color names and hex strings directly
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
            // Save the color value (which could be a name or hex)
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
            // Load the color directly from data (name or hex)
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
        `[DEBUG DrawNet] Drawing ${editorState.netPolygons.length} polygons. Offset: (${editorState.viewOffsetX.toFixed(0)}, ${editorState.viewOffsetY.toFixed(0)})`,
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
    // Hide context menu if open
    hideColorContextMenu();
}


export function placeNewPolygon(mousePos) {
    // mousePos is world coordinates
    console.log(
        `[DEBUG PlaceNew] Entered function. currentPaletteSelection = ${editorState.currentPaletteSelection}`,
    );
    if (editorState.currentPaletteSelection !== null) {
        const sides = editorState.currentPaletteSelection;
        // Polygon constructor now defaults to the color from DEFAULT_COLORS
        const newPolygon = new Polygon(
            editorState.nextPolygonId,
            sides,
            { x: mousePos.x, y: mousePos.y },
            0,
            // No need to pass color here, constructor uses DEFAULT_COLORS
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

// --- Handle Right-Click for Color Context Menu ---
function handleContextMenu(event) {
    // Only show context menu in 2D view
    if (threeContainer && threeContainer.style.display !== 'none') {
         return;
    }

    event.preventDefault(); // Prevent the default browser context menu

    if (!canvas) return;

    const rawMousePos = getRawMousePos(canvas, event);
    const worldMousePos = getMousePos(canvas, event);

    // Find if a polygon was clicked at this position
    let clickedPolygon = null;
    // Iterate from the end to check the topmost drawn polygon first
    for (let i = editorState.netPolygons.length - 1; i >= 0; i--) {
        const poly = editorState.netPolygons[i];
        if (poly.isPointInside(worldMousePos)) {
            clickedPolygon = poly;
            break;
        }
    }

    if (clickedPolygon) {
        // Store the ID of the polygon being colored
        updateState({ colorMenuPolygonId: clickedPolygon.id });
        // Populate and show the custom menu
        populateColorContextMenu(clickedPolygon);
        showColorContextMenu(rawMousePos.x, rawMousePos.y);
         console.log(`Right-clicked polygon ID: ${clickedPolygon.id}`);
    } else {
        // Hide the custom menu if no polygon was clicked
        hideColorContextMenu();
         console.log("Right-clicked canvas, no polygon found.");
    }
}

// --- Show/Hide Color Context Menu ---
function showColorContextMenu(x, y) {
    if (!colorContextMenu) {
        console.error("Cannot show color context menu: Element not found.");
        return;
    }

    // Set display to block first so offsetWidth/Height are accurate
    colorContextMenu.style.display = 'block';

    // Now measure
    const menuWidth = colorContextMenu.offsetWidth;
    const menuHeight = colorContextMenu.offsetHeight;
    const canvasRect = canvas.getBoundingClientRect();

    let finalX = x;
    let finalY = y;

    colorContextMenu.style.left = x + 'px';
    colorContextMenu.style.top = y + 'px';

}

function hideColorContextMenu() {
    // Check if the color context menu element was found during initialization
    console.trace('hideColorContextMenu called');
    if (!colorContextMenu) return;
    colorContextMenu.style.display = 'none';
    updateState({ colorMenuPolygonId: null }); // Clear the stored polygon ID
}

// --- Populate Color Context Menu ---
function populateColorContextMenu(polygon) {
    // Check if the color menu list element was found during initialization
    if (!colorMenuList || !polygon) {
        console.error("Cannot populate color context menu: List element or polygon not found.");
        return;
    }

    console.log("Populating menu, colorMenuList:", colorMenuList);
    colorMenuList.innerHTML = ''; // Clear existing menu items

    // Get polygon's current color for display in menu
    const currentPolyColor = polygon.color;

    // Add Default Colors
    const defaultColorNames = Object.values(DEFAULT_COLORS); // Get array of color names
    const defaultColorKeys = Object.keys(DEFAULT_COLORS); // Get array of side numbers (keys)

    defaultColorNames.forEach((colorName, index) => {
        const sides = defaultColorKeys[index];
        const readableName = POLYGON_TYPES[sides] + " Default"; // e.g., "Triangle Default"
        addColorMenuItem(colorName, readableName, colorName === currentPolyColor);
    });

    // Add Separator
    addMenuSeparator();

    // Add Palette Choice option
    // Check if the color menu list element was found before adding items
    if (colorMenuList) {
        const paletteChoiceItem = addColorMenuItem(PALETTE_CHOICE_VALUE, "Palette Choice...");
        if (paletteChoiceItem) {
            paletteChoiceItem.classList.add('palette-choice-option'); // Add class for styling/identification
        }
    } else {
         console.error("Cannot add palette choice item: colorMenuList element not found.");
    }


    // Add history of Custom Colors
    if (editorState.customColorsHistory.length > 0) {
         addMenuSeparator();
         // Check if the color menu list element was found before adding header
         if (colorMenuList) {
             const historyHeader = document.createElement('li');
             historyHeader.textContent = "Recent Custom:";
             historyHeader.style.fontWeight = 'bold';
             historyHeader.style.cursor = 'default'; // Not clickable
             historyHeader.style.backgroundColor = 'transparent'; // No hover effect
             colorMenuList.appendChild(historyHeader);
         } else {
              console.error("Cannot add history header: colorMenuList element not found.");
         }


         editorState.customColorsHistory.forEach(colorValue => {
             addColorMenuItem(colorValue, colorValue, colorValue === currentPolyColor);
         });
    }
    console.log("Menu items:", colorMenuList.children.length);
}

// Helper function to add a menu item
function addColorMenuItem(value, text, isCurrent = false) {
    // Check if the color menu list element was found before creating items
    if (!colorMenuList) {
        console.error("Cannot add color menu item: colorMenuList element not found.");
        return null;
    }

    const li = document.createElement('li');
    li.dataset.colorValue = value;
    li.textContent = text; // Display text

    // Add color swatch
    const colorBox = document.createElement('span');
    colorBox.classList.add('color-box');
    // Use the value itself as the background color (works for names and hex)
    colorBox.style.backgroundColor = value;
    li.insertBefore(colorBox, li.firstChild); // Add box before text

    if (isCurrent) {
        li.style.fontWeight = 'bold'; // Highlight the current color
        // Optionally add a checkmark or other indicator
    }

    // Add event listener to the list item
    li.addEventListener('click', handleColorMenuItemClick);

    // Append the created list item to the menu list
    colorMenuList.appendChild(li);

    return li; // Return the created list item
}

// Helper function to add a separator line
function addMenuSeparator() {
     // Check if the color menu list element was found before adding separator
     if (!colorMenuList) {
         console.error("Cannot add menu separator: colorMenuList element not found.");
         return;
     }
     const li = document.createElement('li');
     li.classList.add('separator');
     colorMenuList.appendChild(li);
}


// --- Handle Color Menu Item Click ---
function handleColorMenuItemClick(event) {
    const clickedItem = event.target.closest('li'); // Get the list item clicked
    if (!clickedItem) return; // Ignore clicks not on list items

    const colorValue = clickedItem.dataset.colorValue;
    const polygonId = editorState.colorMenuPolygonId;
    const polygon = getPolygonById(polygonId);

    hideColorContextMenu(); // Hide the menu immediately

    if (!polygon) {
        console.error("Color menu clicked, but no polygon ID was stored or found.");
        return;
    }

    if (colorValue === PALETTE_CHOICE_VALUE) {
        // Handle "Palette Choice..."
        triggerPaletteColorPicker(polygon);
    } else {
        // Handle selection of a default or history color
        console.log(`Changing color of polygon ${polygonId} to: ${colorValue}`);
        polygon.updateColor(colorValue);
        drawNet(); // Redraw the canvas with the new color
    }
}

// --- Trigger Standard Palette Color Picker ---
function triggerPaletteColorPicker(polygon) {
    if (!polygon) {
        console.error("Cannot trigger palette color picker: Polygon not found.");
        return;
    }

    // Create a temporary hidden color input element
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    // Position it off-screen
    colorInput.style.position = 'fixed';
    colorInput.style.top = '-100px';
    colorInput.style.left = '-100px';
    // Set initial value: use current color if it's a hex, otherwise default to black
    colorInput.value = polygon.color.startsWith('#') ? polygon.color : "#000000";

    document.body.appendChild(colorInput); // Add it to the DOM temporarily

    // Listen for the change event when the user selects a color and closes the picker
    colorInput.addEventListener('change', (event) => {
        const newColor = event.target.value; // Get the chosen hex color (e.g., "#RRGGBB")

        console.log(`Palette color chosen for polygon ${polygon.id}: ${newColor}`);
        polygon.updateColor(newColor); // Update the polygon's color

        // Add the new custom color (hex value) to history if it's not already there
        // Ensure we add the hex value, even if the user picked a named color initially
        if (!editorState.customColorsHistory.includes(newColor)) {
             // Limit history size (e.g., keep the last 10 custom colors)
             const updatedHistory = [newColor, ...editorState.customColorsHistory.slice(0, 9)];
             updateState({ customColorsHistory: updatedHistory });
             console.log("Custom color added to history:", newColor);
        }

        drawNet(); // Redraw with the new color

        // Clean up the temporary input element
        document.body.removeChild(colorInput);
    });

    // Listen for the user canceling the picker (e.g., pressing Escape)
    colorInput.addEventListener('cancel', () => {
         console.log("Color picker cancelled.");
         // Clean up the temporary input element
         document.body.removeChild(colorInput);
    });


    // Programmatically trigger the native color picker dialog
    colorInput.click();
}

// --- Handle Mouse Down (Modified to Hide Menu and filter right-click) ---
// This function handles left clicks for panning, placing, and dragging.
// It also hides the color context menu if a click occurs outside it.
export function handleMouseDown(event) {
    // Hide the color context menu if it's visible and the click is outside it.
    // This needs to happen for *any* mouse button click outside the menu.
    if (colorContextMenu && colorContextMenu.style.display !== 'none') {
        const rect = colorContextMenu.getBoundingClientRect();
        const clickedOutsideMenu = event.clientX < rect.left || event.clientX > rect.right ||
                                   event.clientY < rect.top || event.clientY > rect.bottom;

        if (clickedOutsideMenu) {
            hideColorContextMenu();
            // If a click outside hides the menu, we should stop here
            // to prevent this click from also triggering a drag/place action.
             // However, if it was a right-click outside, handleContextMenu already prevented default.
             // If it was a left-click outside, we just hide the menu.
             // Let's let the click continue ONLY IF it's a left click and it was NOT handled by the menu itself.
             // The logic below already filters for event.button === 0, so we just need to return if clicked inside.
        } else {
             // Click was inside the menu. handleColorMenuItemClick will handle the action.
             // Stop propagation here to prevent the canvas's mousedown from firing.
             // Note: This assumes handleColorMenuItemClick is attached correctly and fires first.
             // event.stopPropagation(); // Might be needed depending on exact event flow
             return; // Stop here if clicked inside the menu
         }
    }


    // --- Only proceed with the rest of the handleMouseDown logic for LEFT clicks (event.button === 0) ---
    if (event.button === 0) {

        if (!canvas) return;
        const rawMousePos = getRawMousePos(canvas, event);
        const worldMousePos = getMousePos(canvas, event);

        // Check for panning mode
        if (editorState.isPanning) {
            updateState({
                isActivelyPanning: true,
                panStartX: rawMousePos.x,
                panStartY: rawMousePos.y,
            });
            // Update cursor class for visual feedback
            canvas.classList.remove("pan-grab");
            canvas.classList.add("pan-grabbing");
            return; // Stop here if panning
        }

        // Check for palette placement mode
        if (editorState.currentPaletteSelection !== null) {
            console.log(
                `[DEBUG MouseDown] Palette selection detected. Calling placeNewPolygon at:`,
                worldMousePos,
            );
            placeNewPolygon(worldMousePos); // Place the new polygon
            // Reset cursor after placement
            canvas.style.cursor = editorState.isPanning ? "grab" : "default";
            return; // Stop here if placing a polygon
        }

        // If not panning or placing, check for clicking on an existing polygon to select/drag
        let clickedPolygon = null;
        // Iterate through polygons from the end (topmost) to the beginning
        for (let i = editorState.netPolygons.length - 1; i >= 0; i--) {
            const poly = editorState.netPolygons[i];
            if (poly.isPointInside(worldMousePos)) {
                clickedPolygon = poly; // Found a clicked polygon
                break; // Stop searching once the topmost is found
            }
        }

        // Handle polygon selection and start drag
        if (clickedPolygon) {
            bringToFront(clickedPolygon); // Move the clicked polygon to the end of the array for drawing order
            // Deselect previously selected polygons if the clicked one is different
            if (editorState.selectedPolygonId !== clickedPolygon.id) {
                deselectAllPolygons(); // Deselect all others
                clickedPolygon.isSelected = true; // Select the clicked one
            }
            // Calculate drag offset
            const dragOffsetX = worldMousePos.x - clickedPolygon.centerPosition.x;
            const dragOffsetY = worldMousePos.y - clickedPolygon.centerPosition.y;
            updateState({
                selectedPolygonId: clickedPolygon.id, // Set the newly selected polygon as dragged
                draggedPolygon: clickedPolygon,
                dragOffsetX: dragOffsetX,
                dragOffsetY: dragOffsetY,
                isDragging: true,
            });
            canvas.style.cursor = "grabbing"; // Change cursor
            console.log(
                `Selected/Dragging polygon ID: ${editorState.selectedPolygonId}`,
            );
        } else {
            // If no polygon was clicked, deselect all polygons
            if (deselectAllPolygons()) {
                drawNet(); // Redraw if selection changed
            }
            // Ensure dragging state is false if no polygon was clicked
            updateState({ draggedPolygon: null, isDragging: false });
        }

        // Reset snap target state on any mousedown that isn't an active drag/place
        updateState({ currentSnapTarget: null });

        // Redraw the net to show selection changes or clear highlights
        drawNet();

    } // End of left mouse button actions
}


export function handleMouseMove(event) {
    if (!canvas) return;
    const rawMousePos = getRawMousePos(canvas, event);
    const worldMousePos = getMousePos(canvas, event);

    // Existing logic for active panning
    if (editorState.isActivelyPanning) {
        const dx = rawMousePos.x - editorState.panStartX;
        const dy = rawMousePos.y - editorState.panStartY;
        updateState({
            viewOffsetX: editorState.viewOffsetX + dx,
            viewOffsetY: editorState.viewOffsetY + dy,
            panStartX: rawMousePos.x,
            panStartY: rawMousePos.y,
        });
        drawNet(); // Redraw during panning
        return; // Stop here if panning
    }

    // Existing logic for dragging a polygon
    if (editorState.isDragging && editorState.draggedPolygon) {
        const newCenter = {
            x: worldMousePos.x - editorState.dragOffsetX,
            y: worldMousePos.y - editorState.dragOffsetY,
        };
        editorState.draggedPolygon.updatePosition(newCenter); // Update polygon position (mutate directly)

        // Find a snap target for the dragged polygon
        const snapTarget = findSnapTarget(editorState.draggedPolygon);
        updateState({ currentSnapTarget: snapTarget }); // Update snap target state

        drawNet(); // Redraw to show dragging and potential snap highlights
    }
    // Note: Mouse move doesn't interact with the context menu visibility directly,
    // but if a drag was in progress and the mouse leaves the canvas, handleMouseLeave will handle it.
}
export function handleMouseUp(event) {
    if (!canvas) return;

     // --- Only handle left mouse button for these actions ---
     if (event.button === 0) {

        // Existing logic for ending active panning
        if (editorState.isActivelyPanning) {
            updateState({ isActivelyPanning: false }); // End active panning
            canvas.classList.remove("pan-grabbing"); // Update cursor class
            // Set cursor back to grab if still in panning mode, or default
            canvas.style.cursor = editorState.isPanning ? "grab" : "default";
            return; // Stop here if ending panning
        }

        // Existing logic for finishing drag
        if (editorState.isDragging) {
            // If there's a snap target, finalize the snap connection
            if (editorState.currentSnapTarget) {
                finalizeSnap(editorState.currentSnapTarget); // Finalizes position, rotation, connections, and redraws
            } else {
                 // If no snap occurred, just ensure position is updated and redraw
                 // (updatePosition already happened in mousemove, but redraw is needed to clear drag visuals)
                 drawNet();
            }

            // Reset dragging state
            updateState({
                isDragging: false,
                draggedPolygon: null,
                currentSnapTarget: null, // Clear snap target state after mouse up
            });
            canvas.style.cursor = editorState.isPanning ? "grab" : "default"; // Reset cursor
            console.log("Stopped dragging.");
            // drawNet() is called either by finalizeSnap or here if no snap.
        }

        // Existing logic for cancelling palette placement if mouse was in copy mode
        if (canvas.style.cursor === "copy") {
            canvas.style.cursor = editorState.isPanning ? "grab" : "default"; // Reset cursor
            updateState({ currentPaletteSelection: null }); // Cancel palette selection
            // No redraw needed here unless a new polygon was placed (handled in placeNewPolygon)
        }
     } // End of left mouse button actions
}
export function handleMouseLeave(event) {
    // If actively panning and mouse leaves, stop panning
    if (editorState.isActivelyPanning) {
        updateState({ isActivelyPanning: false });
        canvas.classList.remove("pan-grabbing");
        // Reset cursor based on panning mode
        canvas.style.cursor = editorState.isPanning ? "grab" : "default";
    }

    // If dragging a polygon and mouse leaves, simulate mouse up to finalize the drag
    // This uses a synthetic event object with button 0 to trigger the left-click mouseup logic
    if (editorState.isDragging && editorState.draggedPolygon) {
        handleMouseUp({ button: 0 });
        console.log("Mouse left canvas during drag, action stopped.");
    }


    // If in palette placement mode and mouse leaves, cancel placement
    if (editorState.currentPaletteSelection !== null) {
        console.log("Placement cancelled (mouse left canvas).");
        updateState({ currentPaletteSelection: null, draggedPolygon: null });
        // Reset cursor
        if (canvas)
            canvas.style.cursor = editorState.isPanning ? "grab" : "default";
        drawNet(); // Redraw to remove potential preview if it existed
    }

    // If a snap target was highlighted, clear it when mouse leaves
    if (editorState.currentSnapTarget) {
        updateState({ currentSnapTarget: null });
        drawNet(); // Redraw to remove highlight
    }
}


export function handleKeyDown(event) {
    // Hide the color context menu on any key press
    hideColorContextMenu();

    // Check for Spacebar press to toggle panning mode
    if (event.code === "Space" || event.key === " ") {
        if (!editorState.isPanning) { // If not already panning mode
            updateState({ isPanning: true }); // Enter panning mode
            // Update cursor if not currently dragging or actively panning
            if (
                !editorState.isDragging &&
                !editorState.isActivelyPanning &&
                canvas
            ) {
                canvas.classList.add("pan-grab");
            }
        }
        event.preventDefault(); // Prevent default spacebar action (like scrolling)
        return; // Stop here if spacebar was pressed
    }

    // Get the currently selected polygon
    const selectedPoly = getSelectedPolygon();
    if (!selectedPoly) return; // Do nothing if no polygon is selected

    let needsRedraw = false; // Flag to indicate if a redraw is needed
    const rotationStep = 5 * (Math.PI / 180); // Rotation amount in radians (5 degrees)

    // Check for 'r' or 'R' key for right rotation
    if (event.key === "r" || event.key === "R") {
        selectedPoly.updateRotation(selectedPoly.rotationAngle + rotationStep); // Increase rotation angle
        console.log(`Rotated polygon ${selectedPoly.id} right`);
        breakConnections(selectedPoly); // Break connections on rotation
        needsRedraw = true;
    }
    // Check for 'l' or 'L' key for left rotation
    else if (event.key === "l" || event.key === "L") {
        selectedPoly.updateRotation(selectedPoly.rotationAngle - rotationStep); // Decrease rotation angle
        console.log(`Rotated polygon ${selectedPoly.id} left`);
        breakConnections(selectedPoly); // Break connections on rotation
        needsRedraw = true;
    }

    // Check for Delete or Backspace key for deletion
    if (event.key === "Delete" || event.key === "Backspace") {
        const deletedId = editorState.selectedPolygonId; // Get ID of the selected polygon
        console.log(`Attempting to delete polygon ${deletedId}`);
        breakConnections(selectedPoly, true); // Break all connections involving this polygon before deleting
        if (removePolygonById(deletedId)) { // Remove the polygon from the state array
            // Reset selection and dragging state
            updateState({
                selectedPolygonId: null,
                draggedPolygon: null,
                isDragging: false,
                currentSnapTarget: null, // Clear snap target state
            });
            console.log(`Deleted polygon ID ${deletedId}`);
            needsRedraw = true; // Indicate redraw is needed
        }
    }

    // If any changes were made that require a redraw, call drawNet
    if (needsRedraw) {
        updateState({ currentSnapTarget: null }); // Clear snap target state before redraw
        drawNet();
    }
}
export function handleKeyUp(event) {
    // Check for Spacebar key up to exit panning mode
    if (event.code === "Space" || event.key === " ") {
        // We only update panning state here; the actual active panning stops on mouse up/leave.
        updateState({ isPanning: false }); // Exit panning mode

        // Update cursor appearance if not actively panning anymore and not dragging
        if (!editorState.isActivelyPanning && canvas) {
            canvas.classList.remove("pan-grab");
            canvas.classList.remove("pan-grabbing"); // Remove grabbing cursor if active
            // Set cursor back to default, unless dragging is in progress
            canvas.style.cursor =
                editorState.isDragging && editorState.draggedPolygon
                    ? "grabbing"
                    : "default";
        }
        event.preventDefault(); // Prevent default spacebar action
    }
}
function breakConnections(polygon, breakIncoming = false) {
    if (!polygon) return;
    console.warn(
        `Breaking connections for polygon ${polygon.id} due to manual transform.`,
    );
    // Iterate through the polygon's own connections
    for (const edgeIndex in polygon.connections) {
        // Get the connection info for this edge
        const conn = polygon.connections[edgeIndex];
        // Find the neighbor polygon based on the connection info
        const neighbor = getPolygonById(conn.polyId);

        // If the neighbor exists AND the neighbor's connection back to this polygon exists and is correct
        if (
            neighbor &&
            neighbor.connections[conn.edgeIndex]?.polyId === polygon.id
        ) {
            console.log(
                ` Broke connection from neighbor ${neighbor.id}[${conn.edgeIndex}] to ${polygon.id}[${edgeIndex}]`,
            );
            // Delete the connection from the neighbor's side
            delete neighbor.connections[conn.edgeIndex];
        }
    }
    // Clear all connections from the current polygon's side
    polygon.connections = {};

    // If breakIncoming is true, also iterate through ALL other polygons
    // and break any connections they might have pointing TO this polygon.
    if (breakIncoming) {
        editorState.netPolygons.forEach((otherPoly) => {
            // Skip the polygon itself
            if (otherPoly.id === polygon.id) return;

            // Iterate through the other polygon's connections
            for (const edgeIndex in otherPoly.connections) {
                // If this connection points to the polygon being processed
                if (otherPoly.connections[edgeIndex].polyId === polygon.id) {
                    // Delete the connection from the other polygon's side
                    delete otherPoly.connections[edgeIndex];
                    console.log(
                        ` Broke connection from other ${otherPoly.id}[${edgeIndex}] to ${polygon.id}`,
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


// --- Event Listeners Setup (Gets controls, sets initial state, adds right-click listener) ---
function setupEventListeners() {
    // --- App 1 (2D Editor) Listeners ---
    saveButton.addEventListener("click", saveNetToFile);
    loadFileInput.addEventListener("change", handleFileLoad);
    clearButton.addEventListener("click", clearNet);
    exportTopologicalButton.addEventListener("click", exportTopologicalNet);
    switchTo3DButton.addEventListener("click", switchToFoldingView);
    backTo2DButton.addEventListener("click", () => show2DView(true));

    // Mouse listeners for 2D canvas interaction (pan, drag, place)
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // --- ADD Right-Click Context Menu Listener ---
    // Only add the listener if the context menu element was found
    if (colorContextMenu) {
       canvas.addEventListener("contextmenu", handleContextMenu);
    } else {
       console.warn("Context menu element not found, right-click color feature disabled.");
    }


    // --- Global Listeners ---
    window.addEventListener("keydown", handleKeyDown); // Keyboard input (rotate, delete, pan toggle)
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", resizeCanvas); // Window resize handling

    // --- Listener to hide context menu on any LEFT click outside it ---
    // Use the entire window document to catch left clicks anywhere
    window.addEventListener('click', (event) => {
        // Check if it was a left click (button === 0)
        if (event.button === 0) {
            // Check if the color context menu is visible (and was found during init)
            if (colorContextMenu && colorContextMenu.style.display !== 'none') {
                // Check if the click target is outside the menu itself
                const isClickInsideMenu = colorContextMenu.contains(event.target);
                if (!isClickInsideMenu) {
                    hideColorContextMenu(); // Hide the menu on left click outside
                }
                 // If the left click was inside the menu, handleColorMenuItemClick will handle it.
            }
        }
    });


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
        // Set initial speed value
        foldingState.speedSlider.value = foldingState.currentAnimationDuration;
        if (foldingState.speedValueSpan) {
            // Display initial speed value
            foldingState.speedValueSpan.textContent = `${foldingState.currentAnimationDuration} ms`;
        }
    } else {
        console.warn("[EVENT SETUP] #speedSlider3D not found");
    }

    if (foldingState.pauseButton) {
        foldingState.pauseButton.disabled = true; // Start paused button disabled
        foldingState.pauseButton.textContent = "Pause"; // Initial text
    } else {
        console.warn("[EVENT SETUP] #pauseButton3D not found");
    }

    if (foldingState.foldButton) {
        foldingState.foldButton.disabled = true; // Start fold button disabled until net loaded
        foldingState.foldButton.textContent = "Fold"; // Initial text
    } else {
        console.warn("[EVENT SETUP] #foldButton3D not found");
    }

    if (foldingState.toggleNormalsCheckbox) {
        foldingState.toggleNormalsCheckbox.checked = false; // Start normals checkbox unchecked
    } else {
        console.warn("[EVENT SETUP] #toggleNormals3D not found");
    }

    if (foldingState.infoDisplay) {
        foldingState.infoDisplay.textContent = "Create/Export Net"; // Initial info text
    } else {
        console.warn("[EVENT SETUP] #foldingInfo not found");
    }

    // Ensure folding controls container is initially hidden using the CSS class
    if (foldingState.foldingControlsDiv) {
        foldingState.foldingControlsDiv.classList.add("hidden"); // Add hidden class
    } else {
        console.warn("[EVENT SETUP] #foldingControls div not found!");
    }

    // --- Add Listeners for Folding Controls ---
    if (foldingState.foldButton)
        foldingState.foldButton.addEventListener("click", toggleFolding); // Toggle folding/unfolding animation
    if (foldingState.pauseButton)
        foldingState.pauseButton.addEventListener("click", toggleFoldingPause); // Pause/resume animation
    if (foldingState.speedSlider)
        foldingState.speedSlider.addEventListener("input", handleSpeedChange); // Change animation speed
    if (foldingState.toggleNormalsCheckbox)
        foldingState.toggleNormalsCheckbox.addEventListener(
            "change",
            toggleNormalHelpersVisibility, // Toggle visibility of normal arrows
        );

    console.log("Event listeners set up (including folding controls and context menu).");
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

	let baseMat;
	if (pureColor) {
            baseMat = new THREE.MeshBasicMaterial({
		color: baseFaceColorValue,
		side: THREE.DoubleSide,
	    });
	}
	else {
            baseMat = new THREE.MeshStandardMaterial({
		color: baseFaceColorValue,
		side: THREE.DoubleSide,
		roughness: 0.8,
            });
	}
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

	    let material;
	    if (pureColor) {
		material = new THREE.MeshBasicMaterial({
		    color: colorValue,
		    side: THREE.DoubleSide,
		});
	    } else {
		material = new THREE.MeshStandardMaterial({
		    color: colorValue,
		    side: THREE.DoubleSide,
		    roughness: 0.8,
		});
	    }
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

/////////////////////////
// end of folding logic
/////////////////////////


/////////////////////////
// start of view switching section
/////////////////////////

// --- Switches the display from the 2D editor to the 3D folding viewer ---
export function switchToFoldingView() {
    console.log("[ViewSwitch] Entering switchToFoldingView...");
    console.log("[DEBUG] Attempting to switch to Folding View...");

    // Check if essential DOM elements are available for view switching
    if (!canvas || !threeContainer || !backTo2DButton || !switchTo3DButton) {
        console.error("[ViewSwitch] Missing essential DOM elements for view switching. Aborting switch.");
        alert("Application error: Cannot find view elements.");
        return; // Abort if elements are missing
    }

    // Before switching, check if there are any polygons in the net to fold
    if (editorState.netPolygons.length === 0) {
         alert("Add polygons to the net before folding.");
         console.log("[ViewSwitch] No polygons in net, folding cancelled.");
         return; // Abort if net is empty
    }

    // --- Hide the color context menu if open ---
    hideColorContextMenu();


    // --- 1. Generate topological data from the current 2D net ---
    console.log("[DEBUG] Generating topological data...");
    console.log("[ViewSwitch] Step 1: Generating topological data...");
    const topologicalData = convertNetToTopologicalFormat();
    if (!topologicalData) {
        // Error message is already shown inside convertNetToTopologicalFormat
        console.error("[ViewSwitch] Step 1 Failed: Topological data generation failed. Aborting switch.");
        return; // Abort if topological data could not be generated
    }
    console.log("[ViewSwitch] Step 1 Complete.");
    console.log("[DEBUG] Topological data generated.");


    // --- 2. Ensure the 3D Folding Viewer is initialized ---
    console.log("[ViewSwitch] Step 2: Checking/Initializing Folding Viewer...");
    // If not initialized, call the initialization function
    if (!foldingState.threeInitialized) initFoldingViewer();
    // Check again after attempting initialization
    if (!foldingState.threeInitialized) {
         console.error("[ViewSwitch] Step 2 Failed: Folding Viewer Initialization failed. Aborting switch.");
         // Error message is already shown inside initFoldingViewer
         return; // Abort if initialization failed
    }
    console.log("[ViewSwitch] Step 2 Complete.");
    console.log("[DEBUG] Folding viewer initialized.");


    // --- 3. Load the generated topological data into the folding viewer logic ---
    console.log("[DEBUG] Loading net data into folding viewer...");
    console.log("[ViewSwitch] Step 3: Loading net data into folding viewer...");
    // This function creates the 3D geometry and sets up the folding state based on the topological data
    if (!loadNetForFolding(topologicalData)) {
         console.error("[ViewSwitch] Step 3 Failed: Loading net data for folding failed. Aborting switch.");
         // Error message is already shown inside loadNetForFolding
         return; // Abort if loading net data failed
    }
    console.log("[ViewSwitch] Step 3 Complete.");
    console.log("[DEBUG] Net data loaded for folding.");


    // --- 4. Switch DOM visibility ---
    console.log("[DEBUG] Switching visibility: Hiding 2D, Showing 3D...");
    console.log("[ViewSwitch] Step 4: Switching DOM visibility...");

    // Hide the 2D canvas
    canvas.style.display = "none";
    // Show the 3D container
    threeContainer.style.display = "block";

    // Show and enable folding controls. Use the CSS 'hidden' class.
    if (foldingState.foldingControlsDiv) {
        foldingState.foldingControlsDiv.classList.remove("hidden"); // Remove hidden class to make it visible
        console.log("[DEBUG] Removed 'hidden' class from foldingControlsDiv.");
    } else {
        console.error("[ViewSwitch] Cannot show foldingControlsDiv - element not found.");
    }
    // Enable the fold button (it was disabled when returning to 2D)
    if (foldingState.foldButton) foldingState.foldButton.disabled = false;
    // Pause button state is managed by the animation logic

    // Swap visibility of the view switching buttons
    backTo2DButton.style.display = "block";
    switchTo3DButton.style.display = "none";

    console.log("[DEBUG] Visibility switched.");
    console.log("[ViewSwitch] Step 4 Complete.");


    // --- 5. Resize 3D view and start the animation loop ---
    // Use a small timeout (e.g., 10ms) to give the browser time to update DOM visibility
    // before attempting to get the container size for resizing and starting the animation loop.
    setTimeout(() => {
        console.log("[ViewSwitch] setTimeout callback executing...");
        console.log(
            "[DEBUG] Executing setTimeout for resize/animation start...",
        );
        try {
            // Ensure 3D viewer is still initialized before proceeding
            if (foldingState.threeInitialized) {
                console.log(
                    "[ViewSwitch] setTimeout: Calling onThreeResize()...",
                );
                onThreeResize(); // Resize the 3D folding view canvas and renderer to fit the container

                // Start the animation loop if it's not already running.
                // animateFolding() includes the requestAnimationFrame call for the next frame.
                if (foldingState.animationFrameId === null) {
                    console.log(
                        "[ViewSwitch] setTimeout: Starting animateFolding() loop...",
                    );
                    console.log("[DEBUG] Starting folding animation loop...");
                    animateFolding(); // Start the animation loop
                } else {
                     // If animationFrameId is not null, the loop is already running.
                     // This might happen if switching views quickly.
                     // Just log a message and let the existing loop continue.
                     console.log("[ViewSwitch] setTimeout: animateFolding() loop already running.");
                }
                console.log("[ViewSwitch] setTimeout callback complete.");
                console.log(
                    "[DEBUG] Switched to Folding 3D View (setTimeout complete).",
                );
            } else {
                console.error("[DEBUG] Folding view not ready in setTimeout. Aborting switch.");
                // If initialization somehow failed within the timeout, switch back to 2D
                show2DView(false); // Pass false to avoid immediate redraw before potential error display
            }
        } catch (e) {
            console.error("[DEBUG] Error during 3D view switch timeout:", e);
            alert("Error switching view.");
            // Switch back to 2D on error during the timeout processing
            show2DView(false);
        }
    }, 10); // Small delay in milliseconds


    console.log(
        "[ViewSwitch] Exiting switchToFoldingView (setTimeout scheduled).",
    ); // Function exits after scheduling the timeout
}


// --- Switches the display back from the 3D folding viewer to the 2D editor ---
export function show2DView(doRedraw = true) {
    console.log("[ViewSwitch] Entering show2DView...");
    console.log("Switching back to 2D Editor view...");

    // Check if essential DOM elements are available
    if (!canvas || !threeContainer || !backTo2DButton || !switchTo3DButton) {
        console.error("[ViewSwitch] Missing essential DOM elements for view switching. Aborting switch back.");
        alert("Application error: Cannot find view elements.");
        return; // Abort if elements are missing
    }


    // --- Stop 3D animation and clear 3D geometry ---
    console.log("[ViewSwitch] Stopping folding animation...");
    stopFoldingAnimation(); // Stop the animation loop


    console.log("[ViewSwitch] Cleared folding scene geometry.");


    // --- Switch DOM visibility ---
    console.log("[ViewSwitch] Switching DOM visibility for 2D...");

    // Hide the 3D container
    threeContainer.style.display = "none";
    // Hide the folding controls using the CSS 'hidden' class
    if (foldingState.foldingControlsDiv) {
        foldingState.foldingControlsDiv.classList.add("hidden");
    }
    // Disable folding controls buttons
    if (foldingState.foldButton) foldingState.foldButton.disabled = true;
    if (foldingState.pauseButton) foldingState.pauseButton.disabled = true;


    // Show the 2D canvas
    canvas.style.display = "block";

    // Swap visibility of the view switching buttons
    backTo2DButton.style.display = "none";
    switchTo3DButton.style.display = "block";

    // Hide the color context menu if it's visible
    hideColorContextMenu();


    console.log("[DEBUG] Visibility switched back to 2D.");

    // --- Resize and redraw the 2D canvas ---
    // Always call resizeCanvas when switching to 2D to ensure the canvas dimensions are correct.
    // resizeCanvas will call drawNet() internally.
    console.log("[ViewSwitch] Resizing/Redrawing 2D canvas via resizeCanvas()...");
    resizeCanvas(); // This function handles the 2D canvas resize and calls drawNet internally

    console.log("Switched to 2D Editor view.");
    console.log("[ViewSwitch] Exiting show2DView.");
}

// --- Handle Resize for 3D View ---
// This function is called by the ResizeObserver and resizeCanvas when the window/container resizes.
// It updates the 3D renderer and camera to match the new size.
function onThreeResize() {
    // Get the dedicated 3D canvas element
    const canvas3D = document.getElementById("threeCanvas");

    // Check if essential elements and state are ready, and if the 3D container is currently visible.
    if (
        !foldingState.renderer ||
        !foldingState.camera ||
        !threeContainer ||
        !canvas3D ||
        !foldingState.threeInitialized ||
        threeContainer.style.display === "none" // Only resize the 3D view if its container is displayed
    ) {
         // console.log("[onThreeResize] Skipping 3D resize: Not visible, not initialized, or elements missing.");
        return; // Abort if conditions are not met
    }

    // Get the current dimensions of the threeContainer div.
    // The canvas inside it is set to 100% width/height via CSS.
    const width = threeContainer.clientWidth;
    const height = threeContainer.clientHeight;

    // Only proceed if the dimensions are valid (greater than zero)
    if (width > 0 && height > 0) {
        // Update the camera's aspect ratio based on the new container dimensions
        foldingState.camera.aspect = width / height;
        // Update the camera's projection matrix to apply the new aspect ratio
        foldingState.camera.updateProjectionMatrix();

        // Update the size of the WebGLRenderer to match the new dimensions
        console.log(
            `[onThreeResize] Setting renderer size to: ${width} x ${height}`,
        );
        foldingState.renderer.setSize(width, height);

         // Optional: If you need to adjust the camera position/target after resize, call fitFoldingCameraToNet() here.
         // This can be useful if drastic resizes cause the model to go out of view.
         // fitFoldingCameraToNet();
    } else {
        console.warn(
            "[onThreeResize] Attempted to resize 3D view container with zero dimensions. Skipping resize.",
        );
    }
}


/////////////////////////
// end of view switching section
/////////////////////////


/////////////////////////
// start of main initialization section
/////////////////////////

// Combined resize handler for both 2D and 3D views.
// Called when the window is resized or explicitly when switching views.
export function resizeCanvas() {
    console.log("[resizeCanvas] called.");
    // Check if the 3D container is currently visible
    if (threeContainer && threeContainer.style.display !== "none") {
        // If 3D is visible, call the 3D resize handler
        console.log("[resizeCanvas] Resizing 3D canvas.");
        onThreeResize();
    }
    // Check if the 2D canvas is currently visible
    else if (canvas && canvas.style.display !== "none") {
        // If 2D is visible, resize the 2D canvas to fit its container (.view-area)
        console.log("[resizeCanvas] Resizing 2D canvas.");
        const viewArea = document.querySelector(".view-area");
        if (!viewArea) {
             console.error("[resizeCanvas] .view-area element not found for 2D resize.");
             return; // Abort if container is missing
        }
        const viewRect = viewArea.getBoundingClientRect(); // Get the dimensions of the container

        // Only resize if the dimensions are valid (greater than zero)
        if (viewRect.width > 0 && viewRect.height > 0) {
            canvas.width = viewRect.width; // Set canvas width attribute
            canvas.height = viewRect.height; // Set canvas height attribute
            console.log(
                `Resized 2D canvas to ${canvas.width}x${canvas.height}`,
            );
            drawNet(); // Redraw the 2D net after resizing the canvas
        } else {
            console.warn("[resizeCanvas] View area has zero dimensions during 2D resize. Skipping resize and redraw.");
             // Optionally, set canvas dimensions to 0 if container is 0, or keep a default small size.
             // Setting to 0 will prevent drawing errors but nothing will be visible.
             // Keeping last valid size might show content if container briefly goes to 0.
             // Let's keep the console warn for now.
        }
    } else {
         console.log("[resizeCanvas] Neither 2D canvas nor 3D container is visible. Skipping resize.");
    }
}


// --- Application Initialization Function ---
// Called once the DOM is fully loaded.
function initialize() {
    try {
        console.log("Initializing Net Builder / Folder (Version 1.3)..."); // Added version log

	canvas = document.getElementById("netCanvas");
	ctx = canvas ? canvas.getContext("2d") : null;
	paletteDiv = document.getElementById("palette");
	paletteControlsDiv = document.getElementById("palette-controls");
	paletteButtonsDiv = document.getElementById("palette-buttons");
	saveButton = document.getElementById("saveButton");
	loadFileInput = document.getElementById("loadFileInput");
	clearButton = document.getElementById("clearButton");
	exportTopologicalButton = document.getElementById("exportTopologicalButton");
	switchTo3DButton = document.getElementById("switchTo3DButton");
	backTo2DButton = document.getElementById("backTo2DButton");
	threeContainer = document.getElementById("threeContainer");
	console.log("Looking for colorContextMenu:", document.getElementById("colorContextMenu"));
        colorContextMenu = document.getElementById("colorContextMenu");
        colorMenuList = document.getElementById("colorMenuList");
	
        // Check if essential context menu DOM elements were found and log warnings if not
        if (!colorContextMenu) console.error("Initialization warning: #colorContextMenu div not found! Color context menu feature will not work.");
        if (!colorMenuList) console.error("Initialization warning: #colorMenuList ul not found! Color context menu feature will not work.");
        if (!paletteButtonsDiv) console.error("Initialization warning: #palette-buttons div not found!");
	
	
        // Add the contextmenu listener ONLY after elements are found
        if (colorContextMenu && canvas) {
            canvas.addEventListener("contextmenu", handleContextMenu);
            console.log("Context menu listener added.");
	    
        } else if (canvas) {
            console.warn("Context menu element not found, right-click color feature disabled.");
        }

        if (paletteButtonsDiv) createPaletteButtons();
        else console.error("#palette-buttons div not found!");

        // Setup all other event listeners (for 2D interaction, view switching, keyboard, window resize, folding controls)
        // This function also finds and stores references to folding control DOM elements and sets their initial state.
        // NOTE: We moved the contextmenu listener setup out of here into the timeout above.
        setupEventListeners();

        // Initialize the 3D environment objects (scene, camera, renderer, controls).
        // This prepares the 3D viewer even if it's not immediately visible.
        initFoldingViewer();

        // --- Initial View Setup and Canvas Resize ---
        // Set the initial view to 2D. This involves setting display styles for containers and buttons.
        // Do NOT call show2DView(false) here, as it calls resizeCanvas/drawNet inside, which we handle explicitly next.
        console.log("[Initialize] Setting initial view to 2D.");
        if (canvas) canvas.style.display = "block";
        if (threeContainer) threeContainer.style.display = "none";
        if (backTo2DButton) backTo2DButton.style.display = "none";
        if (switchTo3DButton) switchTo3DButton.style.display = "block";
        if (foldingState.foldingControlsDiv) foldingState.foldingControlsDiv.classList.add("hidden");


        // Perform the initial resize of the canvas. This is CRUCIAL to set the canvas's width/height attributes
        // based on its container's size BEFORE the first draw call happens.
        // resizeCanvas() also calls drawNet() internally, which will draw any initial polygons (though the net starts empty).
        console.log("[Initialize] Performing initial canvas resize and draw via resizeCanvas().");
        resizeCanvas(); // This will set canvas dimensions and call drawNet()

        console.log("Net Builder / Folder Initialized successfully.");

    } catch (error) {
        // Catch any errors during the initialization process and log/alert them.
        console.error("Initialization failed:", error);
        alert(`Application initialization failed: ${error.message}`);
    }
}

// Add an event listener to call the initialize function once the DOM is fully loaded.
// This ensures all HTML elements are available before the script tries to access them.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
/////////////////////////
// end of main initialization section
/////////////////////////


// Call initialize after DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
