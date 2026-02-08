// FORZAMOS LAS VARIABLES DE ENTORNO
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_EXECUTABLE_PATH = '/usr/bin/google-chrome-stable';

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const http = require('http');

// 1. UN SOLO SERVIDOR WEB (Esto es lo que Render necesita)
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.write('Bot Activo y Funcionando');
    res.end();
}).listen(port, () => {
    console.log('Servidor web escuchando en puerto:', port);
});

// 2. CONFIGURACIÓN DEL CLIENTE
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: process.platform === 'win32' 
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' 
            : '/usr/bin/google-chrome-stable',
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    }
});

// 3. EVENTOS
client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('--- ESCANEA EL QR ABAJO ---');
});

client.on('ready', () => {
    console.log('¡TODO LISTO! Bot conectado a WhatsApp');
});

// 4. CEREBRO UNIFICADO (Lógica de mensajes)
client.on('message', async (message) => {
    const msgLower = message.body.toLowerCase();
    console.log(`Mensaje de ${message.from}: ${message.body}`);

    try {
        const data = JSON.parse(fs.readFileSync('./links.json', 'utf8'));

        // COMANDO: /lista
        if (msgLower === '/lista') {
            let respuesta = '📂 *CONTENIDO DISPONIBLE* 📂\n\n';
            respuesta += '📦 *APKs:*\n';
            Object.keys(data.apks).forEach(app => respuesta += `- ${app}\n`);
            
            respuesta += '\n🖼️ *Fondos:*\n';
            Object.keys(data.fondos).forEach(f => respuesta += `- ${f}\n`);

            respuesta += '\nUsa: */descargar [nombre]*';
            return message.reply(respuesta);
        }

        // COMANDO: /descargar
        if (msgLower.startsWith('/descargar ')) {
            const nombrePedido = msgLower.split('/descargar ')[1].trim();
            const todasLasKeys = { ...data.apks, ...data.fondos };
            const llaveReal = Object.keys(todasLasKeys).find(k => k.toLowerCase() === nombrePedido);

            if (llaveReal) {
                const link = todasLasKeys[llaveReal];
                return message.reply(`✅ *${llaveReal.toUpperCase()}*\n\n🚀 *Link:* ${link}`);
            } else {
                return message.reply(`❌ No encontré: *${nombrePedido}*`);
            }
        }
    } catch (err) {
        console.error('Error:', err);
    }
});

// 5. INICIALIZAR
console.log('Iniciando sistema...');
client.initialize();
