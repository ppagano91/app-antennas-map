import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import { fetchAndConvertExcel } from './fetchData';

const App = () => {
  const [jsonData, setJsonData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const antennaIcon = L.icon({
    iconUrl: 'antenna.png',

    iconSize:     [25, 25]
});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const json = await fetchAndConvertExcel();
        setJsonData(json);
        setFilteredData(json);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      }
    };

    fetchData();
  }, []);

  const filterData = () => {
    if (!jsonData) return;

    const filtered = jsonData.filter(item => {
      const itemDate = new Date(item.datetime);
      const inputDate = new Date(date);
      const inputTime = time ? new Date(`1970-01-01T${time}:00`) : null;

      return (
        (phoneNumber === '' || phoneNumber.split(',').map(s => s.trim()).includes(item.caller)) &&
        (date === '' || itemDate.toDateString() === inputDate.toDateString()) &&
        (time === '' || (inputTime && itemDate.getHours() === inputTime.getHours() && itemDate.getMinutes() === inputTime.getMinutes()))
      );
    });

    setFilteredData(filtered);
  };

  const calculateCoveragePolygon = (latitude, longitude, azimuth, horizontalAperture, coverageRadius) => {
    const points = [];
    const numberOfPoints = 36; // Número de puntos para aproximar el sector
    const startAngle = azimuth - (horizontalAperture / 2);
    const endAngle = azimuth + (horizontalAperture / 2);
    const angleStep = horizontalAperture / numberOfPoints;

    for (let angle = startAngle; angle <= endAngle; angle += angleStep) {
      const rad = (angle * Math.PI) / 180;
      const dx = coverageRadius * Math.cos(rad);
      const dy = coverageRadius * Math.sin(rad);
      points.push([latitude + (dy / 111320), longitude + (dx / (Math.cos(latitude * Math.PI / 180) * 111320))]);
    }

    points.push([latitude, longitude]); // Cierra el polígono

    return points;
  };

  const markers = filteredData.map((item, index) => {
    const coveragePolygon = calculateCoveragePolygon(item.latitude, item.longitude, item.azimuth, item.horizontalAperture, item.coverageRadius);

    return (
      <div key={index}>
        <Marker position={[item.latitude, item.longitude]} icon={antennaIcon}>
          <Popup>
            Teléfono: {item.caller}<br />
            Fecha y Hora: {item.datetime}<br />
            Lat: {item.latitude}, Lng: {item.longitude}
          </Popup>
        </Marker>
        <Polygon positions={coveragePolygon} color="blue" opacity={0.5} />
      </div>
    );
  });

  return (
    <div>
      <h1>Datos en Mapa</h1>
      <div className="controls">
        <label htmlFor="phoneNumber">Número de Teléfono:</label>
        <input
          type="text"
          id="phoneNumber"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          placeholder="Ingrese número(s) de teléfono (separados por coma)"
        />
        <label htmlFor="date">Fecha:</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <label htmlFor="time">Hora:</label>
        <input
          type="time"
          id="time"
          value={time}
          onChange={e => setTime(e.target.value)}
        />
        <button onClick={filterData}>Filtrar</button>
      </div>
      {jsonData ? (
        <MapContainer center={filteredData.length > 0 ? [filteredData[0].latitude, filteredData[0].longitude] : [51.505, -0.09]} zoom={13} style={{ height: '100vh', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {markers}
        </MapContainer>
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
};

export default App;
