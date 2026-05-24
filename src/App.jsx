import useMapartStore from './store/useMapartStore'
import Home from './screens/Home'
import LocationPicker from './screens/LocationPicker'
import ArtCreator from './screens/ArtCreator'
import RoutePreview from './screens/RoutePreview'
import Export from './screens/Export'

const SCREENS = {
  home:     Home,
  location: LocationPicker,
  creator:  ArtCreator,
  preview:  RoutePreview,
  export:   Export,
}

export default function App() {
  const currentScreen = useMapartStore((s) => s.currentScreen)
  const Screen = SCREENS[currentScreen] || Home
  return <Screen />
}
