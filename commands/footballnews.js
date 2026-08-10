// footballnews.js — ITACHI-XMD-V2
// Utilise TheSportsDB (100% gratuit, sans clé), filtré sur les grandes ligues.
const axios = require('axios');

const NEW_IMG = 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png';

// Grandes ligues suivies — noms exacts attendus par TheSportsDB
const LEAGUES = [
    { name: 'English Premier League', emoji: '🏴' },
    { name: 'Spanish La Liga', emoji: '🇪🇸' },
    { name: 'German Bundesliga', emoji: '🇩🇪' },
    { name: 'Italian Serie A', emoji: '🇮🇹' },
    { name: 'French Ligue 1', emoji: '🇫🇷' },
    { name: 'UEFA Champions League', emoji: '⭐' },
    { name: 'UEFA Europa League', emoji: '🟠' },
];

async function footballnewsCommand(sock, chatId, message) {
    try {
        await sock.sendMessage(chatId, { text: '⚽ Chargement des matchs des grandes ligues...' }, { quoted: message });

        const today = new Date();
        const dateISO = today.toISOString().split('T')[0];
        const dateFR = today.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const parLigue = {}; // { "Premier League": { enCours: [], aVenir: [], termines: [] } }

        await Promise.all(LEAGUES.map(async (league) => {
            try {
                const r = await axios.get(
                    'https://www.thesportsdb.com/api/v1/json/3/eventsday.php',
                    { params: { d: dateISO, l: league.name }, timeout: 12000 }
                );
                const events = r.data?.events;
                if (!events || events.length === 0) return;

                const bucket = { enCours: [], aVenir: [], termines: [] };

                events.forEach(e => {
                    const home = e.strHomeTeam || 'Équipe A';
                    const away = e.strAwayTeam || 'Équipe B';
                    const scoreH = e.intHomeScore;
                    const scoreA = e.intAwayScore;
                    const status = e.strStatus || '';
                    const time = e.strTime ? e.strTime.slice(0, 5) : '--:--';

                    const enDirect = ['1H', '2H', 'HT', 'LIVE', 'ET'].includes(status);
                    const termine = status === 'Match Finished' || status === 'FT' || (scoreH !== null && scoreA !== null && scoreH !== '' && !enDirect);

                    if (enDirect) {
                        bucket.enCours.push(`🔴 *${home}* ${scoreH ?? 0} - ${scoreA ?? 0} *${away}* (EN DIRECT)`);
                    } else if (termine) {
                        bucket.termines.push(`✅ *${home}* ${scoreH} - ${scoreA} *${away}*`);
                    } else {
                        bucket.aVenir.push(`⚽ *${home}* VS *${away}*  ⏰ ${time}`);
                    }
                });

                if (bucket.enCours.length || bucket.aVenir.length || bucket.termines.length) {
                    parLigue[league.name] = { ...bucket, emoji: league.emoji };
                }
            } catch (e) {
                console.error(`❌ [footballnews] ${league.name}:`, e.message);
            }
        }));

        let caption = `⚽ *FOOTBALL NEWS — ITACHI-XMD*\n📅 ${dateFR}\n🌐 Source : TheSportsDB\n`;
        caption += `\n━━━━━━━━━━━━━━━━━━\n`;

        const ligueNames = Object.keys(parLigue);

        if (ligueNames.length === 0) {
            caption += `❌ Aucun match dans les grandes ligues aujourd'hui.\n`;
        } else {
            for (const name of ligueNames) {
                const b = parLigue[name];
                caption += `\n${b.emoji} *${name.toUpperCase()}*\n━━━━━━━━━━━━━━━━━━\n`;
                if (b.enCours.length) caption += b.enCours.join('\n') + '\n';
                if (b.aVenir.length) caption += b.aVenir.slice(0, 6).join('\n') + '\n';
                if (b.termines.length) caption += b.termines.slice(0, 6).join('\n') + '\n';
            }
        }

        caption += `\n━━━━━━━━━━━━━━━━━━\n> 🥷 IBSACKO™ · CENTRAL-HEX`;

        await sock.sendMessage(chatId, {
            image: { url: NEW_IMG },
            caption
        }, { quoted: message });

    } catch (e) {
        await sock.sendMessage(chatId, { text: `❌ Erreur footballnews: ${e.message}` }, { quoted: message });
    }
}

module.exports = footballnewsCommand;
