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

export default MarkerInfo