import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, LayersControl, Polygon, Tooltip} from 'react-leaflet';
import L from 'leaflet';
import chroma from 'chroma-js';
import MarkerClusterGroup from '@christopherpickering/react-leaflet-markercluster';
import '@christopherpickering/react-leaflet-markercluster/dist/styles.min.css';
import { data } from './assets/json/data';
import 'leaflet/dist/leaflet.css';
import './App.css';
import MarkerInfo from './components/MarkerInfo';
import ZoomToMarker from './components/ZoomToMarker';
import FitMarkersToBounds from './components/FitMarkersToBounds';

const { BaseLayer } = LayersControl;

const App = () => {
  const [jsonData, setJsonData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [activeMarker, setActiveMarker] = useState(null);
  const [phoneNumbers, setPhoneNumbers] = useState('');

  const antennaIcon = L.icon({
    iconUrl: 'antenna.png',
    iconSize: [25, 25]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setJsonData(data);
        setFilteredData(data);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      }
    };

    fetchData();
  }, []);

  const resetView = () => {
    setDate('');
    setTime('');
    setFilteredData(jsonData);
    setActiveMarker(null);
  };

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
    const phoneNumbersArray = phoneNumbers.split(',').map(num => num.trim());

    const filtered = jsonData.filter(item => {
      const itemDate = parseDate(item.datetime);
      const formattedItemDate = formatDate(itemDate);
      const inputTime = time ? new Date(`1970-01-01T${time}:00Z`) : null;

      return (
        (date === '' || formattedItemDate === formattedInputDate) &&
        (time === '' || (inputTime && itemDate.getUTCHours() === inputTime.getUTCHours() && itemDate.getUTCMinutes() === inputTime.getUTCMinutes())) &&
        (phoneNumbers === '' || phoneNumbersArray.includes(item.caller.toString()))
      );
    });
  
    setFilteredData(filtered);
  };

  const generatePolygonPoints = (lat, lng, azimuth, aperture, radius) => {
    const points = [];
    const startAngle = azimuth - aperture / 2;
    const endAngle = azimuth + aperture / 2;
    const numPoints = 20;
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
  const colorScale = chroma.scale('YlOrRd').domain([minCoverage, maxCoverage]);

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
          <h2 className="text-center font-bold m-1">Filtros</h2>
          <label htmlFor="phones" className="block">Números de Teléfono: </label>
          <span className='text-xs mb-2'>(separados por comas)</span>
          <input
            type="text"
            id="phones"
            placeholder='1111111, 5050505'
            value={phoneNumbers}
            onChange={e => setPhoneNumbers(e.target.value)}
            className="block w-full mb-4 p-2 bg-gray-800 rounded text-white"
          />
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
          <button
            onClick={resetView}
            className="w-full bg-slate-500 hover:bg-slate-800 p-2 rounded font-bold text-white mt-4"
          >
            Reiniciar Filtros
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
            <LayersControl position="topright">
              <BaseLayer checked name="Mapa Base">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
              </BaseLayer>
              <BaseLayer name="Satélite">
                <TileLayer
                  url='https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg'
                  attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                />
              </BaseLayer>
            </LayersControl>
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
