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
      
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      saveAs(blob, 'data.json');
      return json
    } catch (error) {
      console.error('Error al cargar o convertir el archivo:', error);
    }
  };