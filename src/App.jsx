import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import { fetchAndProcessJson } from './fetchData';

const App = () => {
  const [jsonData, setJsonData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  // const [phoneNumber, setPhoneNumber] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

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
    /**
     * @dateStr formato del string yy-mm-yyyy hh:mm:ss
     */
    try {
      const [day, month, year] = dateStr.split(' ')[0].split('-');
      const [hours, minutes, seconds] = dateStr.split(' ')[1].split(':');


      const paddedMonth = month.padStart(2, '0');
      const paddedDay = day.padStart(2, '0');
      const paddedHours = hours.padStart(2, '0');
      const paddedMinutes = minutes.padStart(2, '0');
      const secondsValue = seconds !== undefined ? seconds.padStart(2,'0') : "00";

      const formattedDateStr = `${year}-${paddedMonth}-${paddedDay}T${paddedHours}:${paddedMinutes}:${secondsValue}Z`;
      const date = new Date(formattedDateStr);

      if (isNaN(date.getTime())) {
        throw new Error(`Invalid Date: ${formattedDateStr}`);
      }
      return date;
    } catch (error) {
      console.error(error);
      return new Date();
    }
  };

  const formatDate = (date) => {
    // Asume que `date` es un objeto Date y devuelve una cadena en formato 'dd-mm-yyyy'
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}-${month}-${year}`;
  };

  const formatDateToDDMMYYYY = (dateStr) => {
    const [year, day, month] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  const filterData = () => {
    if (!jsonData) return;
    const dateAux  = formatDateToDDMMYYYY(date)

    const filtered = jsonData.filter(item => {
      const itemDate = parseDate(item.datetime);

      const inputDate = new Date(dateAux);

      const formattedInputDate = formatDate(new Date(Date.UTC(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate())));
      const formattedItemDate = formatDate(new Date(Date.UTC(itemDate.getUTCFullYear(), itemDate.getUTCMonth(), itemDate.getUTCDate())));

      const inputTime = time ? new Date(`1970-01-01T${time}:00Z`) : null;

      return (
        (date === '' || formattedItemDate === formattedInputDate) &&
        (time === '' || (inputTime && itemDate.getUTCHours() === inputTime.getUTCHours() && itemDate.getUTCMinutes() === inputTime.getUTCMinutes()))
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
