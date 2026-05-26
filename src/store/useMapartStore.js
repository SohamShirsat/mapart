import { create } from 'zustand'

const useMapartStore = create((set) => ({
  // Location
  selectedLocation: null, // { lat, lng, displayName }

  // Art creation
  mode: 'text',
  inputText: '',
  selectedFont: 'block',
  selectedShape: null,
  artSizeMeter: 1200,

  // Generated route
  rawWaypoints: [],
  snappedRoute: [],
  routeDistance: 0,
  routeStatus: 'idle', // 'idle'|'loading'|'success'|'error'|'low_quality'
  routeError: null,

  // Navigation
  currentScreen: 'home', // 'home'|'location'|'creator'|'preview'|'export'

  // Actions
  setSelectedLocation: (loc) => set({ selectedLocation: loc }),
  setMode: (mode) => set({ mode }),
  setInputText: (text) => set({ inputText: text }),
  setSelectedFont: (font) => set({ selectedFont: font }),
  setSelectedShape: (shape) => set({ selectedShape: shape }),
  setArtSizeMeter: (size) => set({ artSizeMeter: size }),
  setRawWaypoints: (pts) => set({ rawWaypoints: pts }),
  setSnappedRoute: (route) => set({ snappedRoute: route }),
  setRouteDistance: (d) => set({ routeDistance: d }),
  setRouteStatus: (s) => set({ routeStatus: s }),
  setRouteError: (e) => set({ routeError: e }),
  navigateTo: (screen) => set({ currentScreen: screen }),
  resetRoute: () => set({ rawWaypoints: [], snappedRoute: [], routeDistance: 0, routeStatus: 'idle', routeError: null }),
}))

export default useMapartStore
