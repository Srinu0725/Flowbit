# How to Use the AOI Application

## Fixed Issues:

### 1. **Base Image Toggle**
- Click "Base Image" to show satellite imagery (WMS)
- Click "Map View" to show OpenStreetMap tiles
- Toggle should work immediately

### 2. **Drawing Polygons**
- Click the **Pen icon** (Draw polygon) in the right toolbox
- Click multiple points on the map to create polygon vertices
- **Double-click** to finish the polygon
- The polygon will appear in blue with transparency

### 3. **Search Functionality**
- Type in the search box and press Enter
- Shows alert (placeholder for geocoding integration)

### 4. **Apply Outline & Confirm AOI**
- "Apply outline as base image" button now shows alert
- "Confirm Area of Interest" button enables after drawing AOIs
- Click to confirm selected areas

### 5. **Other Tools**
- **Edit**: Click to modify existing polygons
- **Select**: Click to select polygons
- **Erase**: Click to delete polygons by selecting them

### 6. **Zoom Controls**
- **+** button zooms in
- **-** button zooms out

## Drawing Instructions:
1. Click the Pen tool (first icon in right toolbox)
2. Click points on the map to create polygon corners
3. Double-click the last point to complete the polygon
4. The "Confirm Area of Interest" button will become enabled

## Troubleshooting:
- If tiles don't load, the drawing functionality still works
- Polygons are stored in localStorage and persist on reload
- Use "Clear All" to remove all AOIs