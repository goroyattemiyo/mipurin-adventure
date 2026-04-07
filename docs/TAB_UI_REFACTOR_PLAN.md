# Tab UI Refactor Plan

## Goal
Unify notebook/tab UI layout to eliminate overlapping, inconsistent spacing, and duplicated headers.

## Current Problems
- Header duplicated (main tabs + I/O/P + per-page titles)
- Each tab defines its own layout rules
- Hardcoded Y offsets cause overlap
- Encyclopedia tab has too many stacked header layers

## New Architecture

### Base Layer
`tab_ui_base.js`
- drawTabBase()
- getTabUILayout()
- shared panel drawing

### Page Layers
- tab_page_items.js
- tab_page_collection.js
- tab_page_equip.js

Each page MUST only render inside `ui.content`

## Migration Steps
1. Introduce base layout (done)
2. Wrap existing pages (done)
3. Replace inventory_ui.js dispatcher
4. Remove duplicated headers from pages
5. Normalize spacing rules

## Next Tasks
- Replace drawInventory() with wrapper calls
- Remove old header rendering from ui.js
- Rebuild collection layout into 3 rows
- Adjust equip left/right ratio

## Expected Result
- No overlapping elements
- Consistent margins
- Easier future extension
