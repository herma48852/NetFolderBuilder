# 2D Net Builder & 3D Folder

This web application allows users to design and construct 2D nets of polyhedra and then visualize them folding into their 3D forms. It's a tool for exploring geometric shapes, understanding their construction, and experimenting with coloring schemes.

This was an learning exercise in using LLMs. I first tried to one shot the entire app but it became obvious that I needed to break it down into small pieces. It had very little understanding of the more complex Archimedian solids and was unable to animate a spinning icosidodecahedron. That's why I though if I could get it fold a proper 2D net, this limitation would no longer be
critical.

I used the Gemini 2.5 Pro chatbot for much of the actual code. It was a good choice as it had great knowledge about css, javascript and 3D animation. I had no previous experience with either which made the choice of this app more interesting. There were quite a few bugs it introduced and several times the chatbot would hallucinate.
When this happened, I would have it write a design note up to and including the feature or bug it was stuck on and use this in a new context. A few times when even this didn't work I would switch to the Perplexity chatbot which was also a very strong LLM. All the javascript that "we" wrote is contained in a single large
file with over 4000 LOC. Although originally the javascript code was quite modular with over 12  files,  I had to merge them due to the file upload limit of 10 files. Gemini was very strong in understanding screenshots when there were rendering errors. It was also excellent in adding necessary console logging to assist in debug. 


## Features

### I. 2D Net Editor

The 2D editor is where you build or load the flat patterns (nets) of polyhedra.

* **Polygon Palette:**
    * Select standard polygons (Triangles, Squares, Pentagons, Hexagons, Octagons, Decagons) from the palette.
    * Click on the canvas to place the selected polygon.
* **Net Manipulation:**
    * **Move:** Click and drag any polygon to reposition it on the canvas.
    * **Rotate:** Select a polygon by clicking on it, then use the 'R' (rotate right) or 'L' (rotate left) keys to rotate it in 5-degree increments.
    * **Snap to Edges:** When dragging a polygon, its edges will automatically snap to the edges of nearby polygons if they are close and aligned. Snapping edges will glow magenta.
    * **Delete:** Select a polygon and press the 'Delete' or 'Backspace' key to remove it.
* **Canvas Navigation:**
    * **Pan View:** Hold the `SPACEBAR` and drag the mouse to pan across the 2D canvas.
* **Color Customization:**
    * **Change Color:** Right-click on any polygon to open a context menu. From here, you can:
        * Select a default color associated with polygon types.
        * Choose "Palette Choice..." to open a native color picker for any custom color.
        * Select from recently used custom colors.
* **Face Numbering:**
    * **Show Face Numbers:** Toggle the "Show Face Numbers" checkbox to display a unique numerical identifier (1-based) on each polygon in the 2D net. These numbers are consistent with the 3D view, aiding in face identification and complex coloring.
* **File Operations:**
    * **Save 2D Net:** Saves the current 2D net layout (polygons, positions, connections, colors) to a local `.json` file.
    * **Load 2D Net:** Loads a previously saved 2D net from a `.json` file.
    * **Load Preset Nets:** Select from a dropdown list of pre-defined polyhedra nets consisting of all Platonic and Archimedian Solids to quickly load common structures.
    * **Clear Net:** Clears all polygons from the 2D canvas and resets the editor.
* **3D Preparation:**
    * **Export Topological:** Converts the current 2D net into a topological JSON format. This format describes the connections and properties of the faces, suitable for the 3D folding mechanism. (This step is done automatically when switching to the 3D view).

### II. View Switching

* **Fold Net in 3D:** After building or loading a 2D net, click this button to switch to the 3D folding viewer. The application will automatically convert the 2D net to the required 3D format.
* **Back to 2D Editor:** From the 3D view, click this button to return to the 2D net editor.

### III. 3D Folding Viewer

The 3D viewer animates the folding of the 2D net into its corresponding polyhedron.

* **Animated Folding/Unfolding:**
    * **Fold/Unfold Button:** Click to initiate the folding animation. If folded, click again to unfold.
* **Camera Controls:**
    * **Orbit:** Click and drag with the left mouse button to rotate the camera around the 3D model.
    * **Zoom:** Use the mouse scroll wheel to zoom in and out.
    * **Pan:** Click and drag with the right mouse button (or middle mouse button, or Shift + Left Click, depending on OrbitControls configuration) to pan the camera.
* **Animation Controls:**
    * **Pause/Resume:** Pause the current folding/unfolding animation or resume a paused animation.
    * **Speed Slider:** Adjust the duration of the folding/unfolding animation stages.
* **Visual Aids:**
    * **Show Normals:** Toggle a checkbox to display arrow helpers indicating the outward normal vector for each face in the 3D model.
    * **Face Numbers:** If "Show Face Numbers" was enabled in the 2D view, the corresponding 1-based numbers will be displayed on the 3D faces, maintaining consistency.
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
