// 🔄 Keep-Alive System - Empêche le bot de se déconnecter
const http = require('http');

// Crée un serveur ping interne pour maintenir la connexion
const keepAliveServer = http.createServer((req, res) => {
    if (req.url === '/ping') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'alive', timestamp: new Date().toISOString() }));
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Bot is running')
    }
});

function startKeepAlive() {
    const PORT = process.env.KEEP_ALIVE_PORT || 8000;
    keepAliveServer.listen(PORT, () => {
        console.log(`🔄 Keep-Alive server démarré sur le port ${PORT}`);
    });
}

module.exports = { startKeepAlive };
