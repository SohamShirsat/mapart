import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './MapView.css'

const CARTO_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const ATTRIBUTION = '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://osm.org/copyright">OSM</a>'

export default function MapView({ center, zoom = 15, children, className = '', onMapReady }) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`map-view ${className}`}
      zoomControl={true}
      ref={onMapReady}
    >
      <TileLayer
        url={CARTO_DARK}
        attribution={ATTRIBUTION}
        maxZoom={19}
        subdomains="abcd"
      />
      {children}
    </MapContainer>
  )
}
