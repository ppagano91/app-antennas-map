import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


export const fetchAndConvertExcel = async () => {
    try {
      const response = await fetch('/src/assets/xlsx/Archivo Demo Datos.xlsx');
      const arrayBuffer = await response.arrayBuffer();

      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      return json
    } catch (error) {
      console.error('Error al cargar o convertir el archivo:', error);
    }
  };

  export const fetchAndProcessJson = async () => {
    try {
        // Cambia la URL al archivo JSON
        const response = await fetch('/src/assets/json/data.json');
        
        // Verifica si la solicitud fue exitosa
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Obtén el JSON de la respuesta
        const json = await response.json();

        // Opcional: Procesa los datos JSON aquí
        // console.log(json);

        return json;
    } catch (error) {
        console.error('Error al cargar o procesar el archivo JSON:', error);
    }
};
