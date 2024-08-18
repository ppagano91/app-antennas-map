import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import { fetchAndProcessJson } from './fetchData';
import chroma from 'chroma-js';
import MarkerClusterGroup from '@christopherpickering/react-leaflet-markercluster';
import '@christopherpickering/react-leaflet-markercluster/dist/styles.min.css';
import './App.css';


const FitMarkersToBounds = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(marker => [marker.latitude, marker.longitude]));
      map.fitBounds(bounds);
    }
  }, [markers, map]);

  return null;
};

const ZoomToMarker = ({ position, polygonPoints }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      const bounds = L.latLngBounds(polygonPoints);
      map.flyToBounds(bounds, { padding: [50, 50] });
    }
  }, [position, polygonPoints, map]);

  return null;
};

const MarkerInfo = ({ marker }) => {
  if (!marker) return null;

  const handleCopyCoordinates = () => {
    const coordinates = `${marker.latitude}, ${marker.longitude}`;
    navigator.clipboard.writeText(coordinates)
      .catch(err => console.error('Error al copiar coordenadas: ', err));
  };

  return (
    <>
      <div className="bg-gray-700 p-4 rounded-lg shadow-lg mt-4">
        <div className='flex justify-between'>
          <h3 className="text-l font-bold mb-2">Información de Antena</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="ml-2 h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 11-10 10 10 10 0 0110-10z" />
          </svg>
          </div>
        <div className="flex flex-row justify-between gap-2 m-1"><strong>Id:</strong> <div>{marker.antennaId}</div></div>
        <div className="flex flex-row justify-between gap-2 m-1"><strong>Teléfono:</strong> <div>{marker.caller}</div></div>
        <div className="flex flex-row justify-between gap-2 m-1"><strong>Fecha y Hora:</strong> <div>{marker.datetime}</div></div>
        <div className="flex flex-row justify-between gap-2 m-1"><strong>Azimuth:</strong> <div>{marker.azimuth}</div></div>
        <div className="flex flex-row justify-between gap-2 m-1"><strong>Apertura Horizontal:</strong> <div>{marker.horizontalAperture}</div></div>
        <div className="flex flex-row justify-between gap-2 m-1"><strong>Radio de Cobertura:</strong> <div>{marker.coverageRadius}</div></div>
        <hr />

        <div className='flex justify-center gap-2 mt-1'>
          <div className="">{marker.latitude}, {marker.longitude}</div>
            <button
              onClick={handleCopyCoordinates}
              className="text-white rounded hover:bg-blue-700"
              title="Copiar coordenadas"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>
            </button>
        </div>
      </div>
    </>
  );
};

const App = () => {
  const [jsonData, setJsonData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [activeMarker, setActiveMarker] = useState(null);

  const antennaIcon = L.icon({
    iconUrl: 'antenna.png',
    iconSize: [25, 25]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const json = await fetchAndProcessJson();
        setJsonData(json);
        setFilteredData(json);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      }
    };

    fetchData();
  }, []);

  const parseDate = (dateStr) => {
    try {
      const [day, month, year] = dateStr.split(' ')[0].split('-');
      const [hours, minutes, seconds] = dateStr.split(' ')[1].split(':');
      const formattedDateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours ? hours.padStart(2, '0') : "00"}:${minutes ? minutes.padStart(2, '0') : "00"}:${seconds ? seconds.padStart(2,'0') : "00"}Z`;
      return new Date(formattedDateStr);
    } catch (error) {
      console.error(error);
      return new Date();
    }
  };

  const formatDate = (date) => {
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  };

  const filterData = () => {
    if (!jsonData) return;
    const formattedInputDate = formatDate(new Date(date));
    const filtered = jsonData.filter(item => {
      const itemDate = parseDate(item.datetime);
      const formattedItemDate = formatDate(itemDate);
      const inputTime = time ? new Date(`1970-01-01T${time}:00Z`) : null;
      return (
        (date === '' || formattedItemDate === formattedInputDate) &&
        (time === '' || (inputTime && itemDate.getUTCHours() === inputTime.getUTCHours() && itemDate.getUTCMinutes() === inputTime.getUTCMinutes()))
      );
    });
    setFilteredData(filtered);
  };

  const generatePolygonPoints = (lat, lng, azimuth, aperture, radius) => {
    const points = [];
    const startAngle = azimuth - aperture / 2;
    const endAngle = azimuth + aperture / 2;
    const numPoints = 50;
    for (let i = 0; i <= numPoints; i++) {
      const angle = startAngle + (i * (endAngle - startAngle)) / numPoints;
      const radians = (Math.PI / 180) * angle;
      const pointLat = lat + (radius * Math.cos(radians)) / 111320;
      const pointLng = lng + (radius * Math.sin(radians)) / (111320 * Math.cos((Math.PI / 180) * lat));
      points.push([pointLat, pointLng]);
    }
    points.push([lat, lng]);
    return points;
  };

  const minCoverage = Math.min(...filteredData.map(item => item.coverageRadius));
  const maxCoverage = Math.max(...filteredData.map(item => item.coverageRadius));
  const colorScale = chroma.scale('Reds').domain([minCoverage, maxCoverage]);

  const markers = filteredData.map((item, index) => {
    const polygonPoints = generatePolygonPoints(item.latitude, item.longitude, item.azimuth, item.horizontalAperture, item.coverageRadius);
    const color = colorScale(item.coverageRadius).hex();

    const handleMarkerClick = () => {
      setActiveMarker(activeMarker === index ? null : index);
    };

    return (
      <div key={index}>
        <Marker position={[item.latitude, item.longitude]} icon={antennaIcon} eventHandlers={{ click: handleMarkerClick }}>
          <Tooltip className="custom-tooltip" direction="top" offset={[0, -10]}>
            <div className='m-1'>
              <div className='flex flex-row justify-between gap-2 m-1'><strong>Teléfono:</strong> <div>{item.caller}</div></div>
              <div className='flex flex-row justify-between gap-2 m-1'><strong>Fecha y Hora:</strong> <div>{item.datetime}</div></div>
              <div className='flex flex-row justify-between gap-2 m-1'><strong>Coordenadas:</strong> <div>{item.latitude}, {item.longitude}</div></div>
            </div>
          </Tooltip>
        </Marker>
        {activeMarker === index && (
          <>
            <Polygon positions={polygonPoints} pathOptions={{ color: color, fillOpacity: 0.4, stroke:false }} />
            <ZoomToMarker position={[item.latitude, item.longitude]} polygonPoints={polygonPoints} />
          </>
        )}
      </div>
    );
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 shadow-md">
        <h1 className="text-center text-3xl font-bold">Geolocalización de Antenas</h1>
      </header>
      <div className="container mx-auto p-4 flex flex-row gap-4">
        <div className="controls bg-gray-700 p-4 rounded-lg shadow-lg w-1/4">
          <h2 className="">Filtros</h2>
          <label htmlFor="date" className="block mb-2">Fecha:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="block w-full mb-4 p-2 bg-gray-800 rounded text-white"
          />
          <label htmlFor="time" className="block mb-2">Hora:</label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="block w-full mb-4 p-2 bg-gray-800 rounded text-white"
          />
          <button
            onClick={filterData}
            className="w-full bg-blue-500 hover:bg-blue-700 p-2 rounded font-bold"
          >
            Aplicar Filtros
          </button>
          <MarkerInfo marker={filteredData[activeMarker]} />
        </div>
        <div className="flex-1">
        <MapContainer
              center={filteredData.length > 0 ? [filteredData[0].latitude, filteredData[0].longitude] : [51.505, -0.09]}
              zoom={13}
              style={{ height: '80vh', width: '100%' }}
              className="rounded-lg shadow-lg"
            >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MarkerClusterGroup chunkedLoading>
              {markers}
            </MarkerClusterGroup>
            <FitMarkersToBounds markers={filteredData} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default App;
