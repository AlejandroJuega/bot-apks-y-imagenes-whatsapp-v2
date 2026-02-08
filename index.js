// FORZAMOS LAS VARIABLES DE ENTORNO POR CÓDIGO
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_EXECUTABLE_PATH = '/usr/bin/google-chrome-stable';

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const http = require('http');

// Mantenemos el mini-servidor para que no se apague
http.createServer((req, res) => {
    res.write('Bot Activo');
    res.end();
}).listen(process.env.PORT || 3000);

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        // Si detecta Windows, usa tu ruta. Si no, usa la de la nube.
        executablePath: process.platform === 'win32' 
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' 
            : '/usr/bin/google-chrome-stable',
        headless: true, // En la nube DEBE ser true
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('Escanea el QR para iniciar sesión');
});

client.on('ready', () => {
    console.log('¡Bot Multimedia Listo!');
});

client.on('message', async (message) => {
    const msgLower = message.body.toLowerCase();

    // COMANDO: /lista
    if (msgLower === '/lista') {
        try {
            const data = JSON.parse(fs.readFileSync('./links.json', 'utf8'));
            
            let respuesta = '📂 *CONTENIDO DISPONIBLE* 📂\n\n';

            // Sección de APKs
            respuesta += '📦 *APKs Disponibles:*\n';
            Object.keys(data.apks).forEach(app => {
                respuesta += `- ${app}\n`;
            });

            // Sección de Fondos
            respuesta += '\n🖼️ *Fondos de Pantalla:*\n';
            Object.keys(data.fondos).forEach(fondo => {
                respuesta += `- ${fondo}\n`;
            });

            respuesta += '\nUsa: */descargar [nombre]*';
            message.reply(respuesta);
        } catch (err) {
            message.reply('❌ Error al generar la lista.');
        }
    }

    // COMANDO: /descargar [nombre]
    if (msgLower.startsWith('/descargar ')) {
        const nombrePedido = msgLower.split('/descargar ')[1].trim();
        
        try {
            const data = JSON.parse(fs.readFileSync('./links.json', 'utf8'));

            // Buscamos en ambas categorías (apks y fondos)
            const todasLasKeys = { ...data.apks, ...data.fondos };
            
            // Buscamos la coincidencia sin importar mayúsculas
            const llaveReal = Object.keys(todasLasKeys).find(k => k.toLowerCase() === nombrePedido);

            if (llaveReal) {
                const link = todasLasKeys[llaveReal];
                await message.reply(`✅ *${llaveReal.toUpperCase()}* localizado.\n\n🚀 *Link de descarga:* \n${link}`);
            } else {
                message.reply(`❌ No encontré nada llamado *${nombrePedido}*.\nEscribe */lista* para ver lo disponible.`);
            }
        } catch (err) {
            message.reply('❌ Error al procesar la descarga.');
        }
    }
});

// --- EL CEREBRO DEL BOT ---
client.on('message', async (msg) => {
    // Esto imprimirá en tu consola negra todo lo que te escriban
    console.log(`Mensaje recibido de ${msg.from}: ${msg.body}`);

    // Comando para ver la lista de APKs
    if (msg.body.toLowerCase() === '/lista') {
        try {
            // Leemos el archivo de links
            const data = JSON.parse(fs.readFileSync('./links.json', 'utf8'));
            
            let respuesta = '📂 *LISTA DE APKs DISPONIBLES:*\n\n';
            
            // Recorremos las claves del objeto 'apks' en tu JSON
            for (const nombre in data.apks) {
                respuesta += `⭐ *${nombre}*\n`;
            }
            
            respuesta += '\n_Escribe el nombre de la app para obtener el link._';
            
            await msg.reply(respuesta);
            console.log('Respuesta enviada: Lista de aplicaciones');
        } catch (error) {
            console.error('Error al procesar /lista:', error);
            msg.reply('❌ Hubo un error al leer la lista de enlaces.');
        }
    }
});

client.initialize();
http.createServer((req, res) => {
    res.write('Bot is running');
    res.end();
}).listen(process.env.PORT || 4000);
