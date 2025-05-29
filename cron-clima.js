const cron = require('node-cron');
const { exec } = require('child_process');

console.log("⏳ Cron configurado: ejecutará el script cada día a las 02:00...");

cron.schedule('0 2 * * *', () => {
  console.log(`🕑 Ejecutando guardar-clima-hourly.js - ${new Date().toLocaleString()}`);
  exec('node guardar-clima-hourly.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️ STDERR: ${stderr}`);
      return;
    }
    console.log(stdout);
  });
});
