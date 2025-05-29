const sqlite3 = require('sqlite3').verbose();
const fetch = require('node-fetch');
const { format, subDays } = require('date-fns');

const API_KEY = 'e19cf0d935fc49329cf0d935fc5932cc';
const STATION_ID = 'IALFAR30';

const db = new sqlite3.Database('./clima.db');

db.run(`
  CREATE TABLE IF NOT EXISTS registro_diario (
    fecha TEXT PRIMARY KEY,
    temp_max REAL,
    temp_min REAL,
    lluvia REAL
  )
`);

async function obtenerDatos(dia) {
  const url = `https://api.weather.com/v2/pws/history/hourly?stationId=${STATION_ID}&format=json&units=m&date=${dia}&apiKey=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    const horas = data.observations;
    if (!horas || horas.length === 0) {
      console.warn(`⚠️ No hay datos horarios para ${dia}`);
      return;
    }

    let tempMax = -Infinity;
    let tempMin = Infinity;
    let lluviaTotal = 0;

    for (const obs of horas) {
      const metric = obs.metric || {};
      const t = metric.temp ?? metric.tempHigh ?? metric.tempAvg;

      if (typeof t === 'number') {
        if (t > tempMax) tempMax = t;
        if (t < tempMin) tempMin = t;
      }

      const lluvia = metric.precipTotal ?? 0;
      if (typeof lluvia === 'number') {
        lluviaTotal = Math.max(lluviaTotal, lluvia);
      }
    }

    if (tempMax === -Infinity || tempMin === Infinity) {
      console.warn(`⚠️ Datos incompletos para ${dia}, no se guardan.`);
      return;
    }

    console.log(`✅ ${dia} | Max: ${tempMax.toFixed(1)} °C | Min: ${tempMin.toFixed(1)} °C | Lluvia: ${lluviaTotal.toFixed(2)} mm`);

    db.run(
      "INSERT OR REPLACE INTO registro_diario (fecha, temp_max, temp_min, lluvia) VALUES (?, ?, ?, ?)",
      [dia, tempMax, tempMin, lluviaTotal]
    );
  } catch (error) {
    console.error(`❌ Error en ${dia}:`, error.message);
  }
}

async function principal() {
  const dias = 7;
  for (let i = dias; i >= 0; i--) {
    const fecha = format(subDays(new Date(), i), 'yyyyMMdd');
    await obtenerDatos(fecha);
  }
  db.close();
}

principal();
