const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

console.log('--- INICIANDO BOT ---');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        // En Render, el ejecutable suele estar aquí
        executablePath: '/usr/bin/google-chrome-stable',
        headless: true, // IMPORTANTE: siempre true en la nube
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--gpu-sandbox',
            '--binaries-prefix=/usr/bin'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('--- NUEVO QR GENERADO ---');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('--- ¡BOT CONECTADO Y LISTO! ---');
});

client.on('auth_failure', msg => {
    console.error('--- ERROR DE AUTENTICACIÓN ---', msg);
});

console.log('Conectando a WhatsApp...');
client.initialize();

