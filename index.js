const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const http = require('http');

// ESTO ES VITAL: Un servidor web para que Render vea que el bot está vivo
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Bot Online');
}).listen(process.env.PORT || 3000);

console.log('Iniciando proceso...');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ],
    }
});

client.on('qr', (qr) => {
    console.log('--- ¡ESCANEAME! ---');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('¡Conexión exitosa!');
});

// Mensaje de diagnóstico
console.log('Llamando a initialize...');
client.initialize().catch(err => console.log('Error al iniciar:', err));


