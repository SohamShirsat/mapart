import { Polyline, CircleMarker, Tooltip } from 'react-leaflet'

export default function RouteLayer({ waypoints, variant = 'solid' }) {
  if (!waypoints || waypoints.length < 2) return null

  const startPt = waypoints[0]

  if (variant === 'preview') {
    return (
      <Polyline
        positions={waypoints}
        pathOptions={{ color: '#00E87A', weight: 2, opacity: 0.45, dashArray: '6 6' }}
      />
    )
  }

  return (
    <>
      <Polyline
        positions={waypoints}
        pathOptions={{ color: '#00E87A', weight: 4, opacity: 0.9 }}
      />
      <CircleMarker
        center={startPt}
        radius={9}
        pathOptions={{ color: '#09090E', fillColor: '#00E87A', fillOpacity: 1, weight: 2 }}
      >
        <Tooltip permanent direction="top" className="route-tooltip" offset={[0, -10]}>
          START
        </Tooltip>
      </CircleMarker>
    </>
  )
}
