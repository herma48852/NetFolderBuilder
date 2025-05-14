# 2D Net Builder & 3D Folder

This web application allows users to design and construct 2D nets of polyhedra and then visualize them folding into their 3D forms.
It's a tool for exploring geometric shapes, understanding their construction, and experimenting with coloring schemes.

## Features

### I. 2D Net Editor

The 2D editor is where you build or load the flat patterns (nets) of polyhedra.

* **Polygon Palette:**
    * Select standard polygons (Triangles, Squares, Pentagons, Hexagons, Octagons, Decagons) from the palette.
    * Click on the canvas to place the selected polygon.
* **Net Manipulation:**
    * **Move:** Click and drag any polygon to reposition it on the canvas.
    * **Rotate:** Select a polygon by clicking on it, then use the 'R' (rotate right) or 'L' (rotate left) keys to
    rotate it in 5-degree increments.
    * **Snap to Edges:** When dragging a polygon, its edges will automatically snap to the edges of nearby
    polygons if they are close and aligned. Snapping edges will glow magenta.
    * **Delete:** Select a polygon and press the 'Delete' or 'Backspace' key to remove it.
* **Canvas Navigation:**
    * **Pan View:** Hold the `SPACEBAR` and drag the mouse to pan across the 2D canvas.
* **Color Customization:**
    * **Change Color:** Right-click on any polygon to open a context menu. From here, you can:
        * Select a default color associated with polygon types.
        * Choose "Palette Choice..." to open a native color picker for any custom color.
        * Select from recently used custom colors.
* **Face Numbering:**
    * **Show Face Numbers:** Toggle the "Show Face Numbers" checkbox to display a unique numerical identifier (1-based)
    on each polygon in the 2D net. These numbers are consistent with the 3D view, aiding in face identification and complex coloring.
* **File Operations:**
    * **Save 2D Net:** Saves the current 2D net layout (polygons, positions, connections, colors) to a local `.json` file.
    * **Load 2D Net:** Loads a previously saved 2D net from a `.json` file.
    * **Load Preset Nets:** Select from a dropdown list of pre-defined polyhedra nets (e.g., Tetrahedron, Cube, Icosahedron,
    various Archimedean solids) to quickly load common structures.
    * **Clear Net:** Clears all polygons from the 2D canvas and resets the editor.
* **3D Preparation:**
    * **Export Topological:** Converts the current 2D net into a topological JSON format. This format describes
    the connections and properties of the faces, suitable for the 3D folding mechanism. (This step is done
    automatically when switching to the 3D view).

### II. View Switching

* **Fold Net in 3D:** After building or loading a 2D net, click this button to switch to the 3D folding viewer.
The application will automatically convert the 2D net to the required 3D format.
* **Back to 2D Editor:** From the 3D view, click this button to return to the 2D net editor.

### III. 3D Folding Viewer

The 3D viewer animates the folding of the 2D net into its corresponding polyhedron.

* **Animated Folding/Unfolding:**
    * **Fold/Unfold Button:** Click to initiate the folding animation. If folded, click again to unfold.
* **Camera Controls:**
    * **Orbit:** Click and drag with the left mouse button to rotate the camera around the 3D model.
    * **Zoom:** Use the mouse scroll wheel to zoom in and out.
    * **Pan:** Click and drag with the right mouse button (or middle mouse button, or Shift + Left Click,
    depending on OrbitControls configuration) to pan the camera.
* **Animation Controls:**
    * **Pause/Resume:** Pause the current folding/unfolding animation or resume a paused animation.
    * **Speed Slider:** Adjust the duration of the folding/unfolding animation stages.
* **Visual Aids:**
    * **Show Normals:** Toggle a checkbox to display arrow helpers indicating the outward normal vector for each face in the 3D model.
    * **Face Numbers:** If "Show Face Numbers" was enabled in the 2D view, the corresponding 1-based numbers
    will be displayed on the 3D faces, maintaining consistency.
* **Information Display:**
    * The name of the loaded polyhedron (if recognized from presets or data) is displayed.

## Controls Summary

**2D Editor:**

* **Place Polygon:** Click polygon type in Palette -> Click on Canvas.
* **Move Polygon:** Click and Drag polygon.
* **Select Polygon:** Click on polygon.
* **Rotate Selected Polygon:** 'R' key (right), 'L' key (left).
* **Delete Selected Polygon:** 'Delete' or 'Backspace' key.
* **Pan View:** Hold `SPACEBAR` + Mouse Drag.
* **Change Polygon Color:** Right-Click on polygon.
* **Toggle Face Numbers:** Use "Show Face Numbers" checkbox.
* **Load Preset:** Select from "Preset Nets" dropdown.

**3D Viewer:**

* **Orbit Camera:** Left Mouse Drag.
* **Zoom Camera:** Mouse Scroll Wheel.
* **Pan Camera:** Right Mouse Drag / Middle Mouse Drag / Shift + Left Drag.
* **Fold/Unfold:** "Fold" / "Unfold" button.
* **Pause/Resume Animation:** "Pause" / "Resume" button.
* **Adjust Animation Speed:** Use the "Speed" slider.
* **Toggle Face Normals:** Use "Show Normals" checkbox.

## How to Use

1.  **Build or Load:**
    * Use the **Palette** to select polygon types and click on the canvas to place them.
    * Drag polygons to connect their edges (they will snap when aligned).
    * Alternatively, use **Load 2D Net** to open a saved `.json` file or select a **Preset Net**.
2.  **Customize (Optional):**
    * Right-click polygons to change their colors.
    * Toggle "Show Face Numbers" for easier identification.
3.  **Fold:**
    * Click **Fold Net in 3D**.
4.  **Interact in 3D:**
    * Use the mouse to explore the 3D model.
    * Use the animation controls (Fold/Unfold, Pause, Speed) as desired.
5.  **Return to Editor:**
    * Click **Back to 2D Editor** to make further changes to the net.

Enjoy exploring the world of polyhedra!

## Limitations and Future Plans

* **Net Construction:** Users are free to construct and save any 2D net arrangement using the provided regular polygons.
* **Folding Capability:** The 3D folding animation feature is currently implemented for the **Platonic solids** and the **Archimedean solids**. While you can build nets for other polyhedra, the application may not be able to correctly identify or animate their folding if they fall outside these categories.
* **Future Plans:** There are plans to extend the folding capabilities to include the **Johnson solids**. The long-term goal is for the folding mechanism to support all convex polyhedra composed of non-coplanar regular polygons, excluding the infinite families of prisms and anti-prisms.

## Development Notes & LLM Experience

This application served as a valuable learning exercise in collaborating with Large Language Models (LLMs), primarily using Gemini 1.5 Pro for significant portions of the code generation and problem-solving.

The initial approach of attempting to generate the entire application in a single step proved less effective than breaking the development process into smaller, manageable features. A key challenge encountered was the LLMs' understanding of complex geometric concepts, particularly concerning Archimedean solids. For instance, directly instructing the AI to animate a spinning icosidodecahedron yielded unsatisfactory results. This led to the strategy of focusing on the 2D net construction first, allowing the LLM to then generate the 3D folding animation from a well-defined, correct net, which proved to be a more successful approach.

This project was also an exploration into web development technologies like CSS, JavaScript, and 3D animation with Three.js, areas where I had limited prior experience. The LLM demonstrated strong capabilities in these domains, though the development process was not without its challenges. Bugs were introduced at times, and instances of "hallucination" (where the AI generates incorrect or nonsensical information) occurred.

A crucial strategy for overcoming these hurdles was to periodically reset the LLM's context. When the AI seemed stuck or the quality of its responses degraded, I would prompt it to generate a "design note" summarizing the current feature, its intended behavior, and the state of debugging. This summary, along with the relevant code files, would then be used to start a new, fresh conversation context. This method significantly improved the AI's ability to focus and resolve issues. On a few occasions, when a particular problem proved very challenging for one model, switching to an alternative LLM (like Perplexity) provided a different perspective and helped overcome the block.

The JavaScript codebase, currently contained in a single file (`new-main.js`) of over 4000 lines of code, was originally more modular, spread across approximately 12 files. This consolidation was a practical measure due to file upload limitations in the development environment.

Throughout the process, Gemini's ability to interpret screenshots for diagnosing rendering errors was particularly impressive. Its proficiency in adding necessary `console.log` statements for debugging also proved invaluable in pinpointing and resolving issues.

## Acknowledgements & Libraries Used

This project utilizes the following open-source libraries:

* **Three.js:** A comprehensive 3D graphics library for creating and displaying animated 3D computer graphics in a web browser.
    * Copyright 2010-2023 Three.js Authors
    * License: MIT
    * Website: [https://threejs.org/](https://threejs.org/)
    * Includes `OrbitControls.js` from the Three.js examples.

* **TWEEN.js:** A JavaScript tweening engine for easy animations. 
    * License: MIT
    * Repository: [https://github.com/tweenjs/tween.js/](https://github.com/tweenjs/tween.js/)



