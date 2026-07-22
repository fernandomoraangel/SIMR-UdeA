const https = require('https');
const fs = require('fs');
const path = require('path');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function baseCode(code) {
  return code.replace(/[-+].*$/, '');
}

async function main() {
  const flat = await fetch('https://raw.githubusercontent.com/modavis-project/musical-instrument-classes/main/hornbostelSachs.json');
  
  const entries = Object.entries(flat).map(([code, data]) => ({
    code,
    name: data.Label,
    description: data.Description || '',
    instruments: data.Instruments || []
  }));
  
  const sorted = [...entries].sort((a, b) => {
    if (a.code.length !== b.code.length) return a.code.length - b.code.length;
    return a.code.localeCompare(b.code);
  });
  
  // Map code -> node
  const nodeMap = new Map();
  sorted.forEach(e => { nodeMap.set(e.code, { ...e, children: [] }); });
  
  // For each non-root, find the best parent
  // Parent must be a proper prefix and represent exactly one level deeper
  sorted.forEach(e => {
    const code = e.code;
    if (/^[1-5]$/.test(code)) return;
    
    let best = null;
    let bestLen = 0;
    
    for (const pc of nodeMap.keys()) {
      if (pc === code) continue;
      if (!code.startsWith(pc)) continue;
      if (pc.length <= bestLen) continue;
      
      const rem = code.slice(pc.length);
      let ok = false;
      if (rem.startsWith('.') && /^\d+$/.test(rem.slice(1))) ok = true;
      else if (/^\d$/.test(rem)) ok = true;
      else if (rem.startsWith('-') || rem.startsWith('+')) ok = true;
      
      if (ok) { best = pc; bestLen = pc.length; }
    }
    
    if (best && nodeMap.has(best)) {
      nodeMap.get(best).children.push(nodeMap.get(code));
    }
  });
  
  // Collect roots
  const roots = [];
  nodeMap.forEach(node => {
    if (/^[1-5]$/.test(node.code)) roots.push(node);
  });
  
  // Sort all children by code
  function sortTree(nodes) {
    nodes.sort((a, b) => a.code.localeCompare(b.code));
    nodes.forEach(n => sortTree(n.children));
  }
  sortTree(roots);
  
  // Count tree nodes (recursive)
  function countTree(nodes) {
    let c = 0;
    for (const n of nodes) { c += 1 + countTree(n.children); }
    return c;
  }
  
  const treeCount = countTree(roots);
  console.log('Tree roots:', roots.length);
  console.log('Total tree nodes:', treeCount);
  
  // Count total from flat data for comparison
  const flatCount = entries.length;
  console.log('Flat data count:', flatCount);
  console.log('Missing from tree:', flatCount - treeCount);
  
  // Build universal instruments
  const seen = new Set();
  const instruments = [];
  
  entries.forEach(e => {
    e.instruments.forEach(inst => {
      const name = inst.trim();
      if (!name || name.length < 3 || seen.has(name.toLowerCase())) return;
      const n = name.toLowerCase();
      if (n.includes('idiophone') || n.includes('membranophone') || n.includes('chordophone') || n.includes('aerophone') || n.includes('electrophone')) return;
      if (n.startsWith('sets of') || n.startsWith('(individual)') || n.startsWith('(sets of)')) return;
      if (n.includes('instrument') || n.includes('percussion')) return;
      seen.add(n);
      instruments.push({ name, code: e.code });
    });
  });
  
  const manual = [
    {name:'Violin',code:'321.322'},{name:'Viola',code:'321.322'},{name:'Cello',code:'321.322'},{name:'Violoncello',code:'321.322'},
    {name:'Contrabass',code:'321.322'},{name:'Double bass',code:'321.322'},{name:'Guitar',code:'321.322'},{name:'Guitarra',code:'321.322'},
    {name:'Piano',code:'314.122'},{name:'Harpsichord',code:'314.122'},{name:'Clavicordio',code:'314.122'},
    {name:'Harp',code:'322'},{name:'Arpa',code:'322'},{name:'Flute',code:'421.1'},{name:'Flauta',code:'421.1'},
    {name:'Piccolo',code:'421.1'},{name:'Flautín',code:'421.1'},{name:'Recorder',code:'421.2'},
    {name:'Oboe',code:'422.2'},{name:'Cor anglais',code:'422.2'},{name:'Clarinet',code:'422.1'},{name:'Clarinete',code:'422.1'},
    {name:'Bass clarinet',code:'422.1'},{name:'Bassoon',code:'422.2'},{name:'Contrabassoon',code:'422.2'},
    {name:'Saxophone',code:'422.1'},{name:'Saxofón',code:'422.1'},{name:'Trumpet',code:'423.2'},{name:'Trompeta',code:'423.2'},
    {name:'Cornet',code:'423.2'},{name:'Horn',code:'423.1'},{name:'Trompa',code:'423.1'},{name:'French horn',code:'423.1'},
    {name:'Trombone',code:'423.3'},{name:'Trombón',code:'423.3'},{name:'Tuba',code:'423.4'},{name:'Euphonium',code:'423.4'},
    {name:'Organ',code:'422'},{name:'Pipe organ',code:'422'},{name:'Órgano',code:'422'},
    {name:'Accordion',code:'412.132'},{name:'Bandoneón',code:'412.132'},{name:'Harmonica',code:'412.132'},
    {name:'Timpani',code:'211.1'},{name:'Bass drum',code:'211.2'},{name:'Snare drum',code:'211.2'},{name:'Tambor',code:'211.2'},
    {name:'Cymbals',code:'111.142'},{name:'Platillos',code:'111.142'},{name:'Triangle',code:'111.211'},{name:'Triángulo',code:'111.211'},
    {name:'Tambourine',code:'211.2'},{name:'Pandereta',code:'211.2'},{name:'Xylophone',code:'111.212'},{name:'Xilófono',code:'111.212'},
    {name:'Marimba',code:'111.222'},{name:'Vibraphone',code:'111.222'},{name:'Glockenspiel',code:'111.222'},
    {name:'Castanets',code:'111.141'},{name:'Castañuelas',code:'111.141'},{name:'Celesta',code:'111.222'},
    {name:'Gong',code:'111.241'},{name:'Cowbell',code:'111.242'},{name:'Woodblock',code:'111.243'},{name:'Cajón',code:'111.243'},
    {name:'Maracas',code:'112.13'},{name:'Guiro',code:'112.23'},{name:'Claves',code:'111.11'},
    {name:'Mandolin',code:'321.322'},{name:'Mandolina',code:'321.322'},{name:'Banjo',code:'321.322'},{name:'Ukulele',code:'321.322'},
    {name:'Lute',code:'321.322'},{name:'Laúd',code:'321.322'},{name:'Vihuela',code:'321.322'},{name:'Charango',code:'321.322'},
    {name:'Cuatro',code:'321.322'},{name:'Sitar',code:'321.322'},{name:'Bagpipes',code:'422.1'},{name:'Gaita',code:'422.1'},
    {name:'Theremin',code:'53'},{name:'Synthesizer',code:'54'},{name:'Sintetizador',code:'54'},{name:'Hammond organ',code:'53'},
    {name:'Electric guitar',code:'513'},{name:'Guitarra eléctrica',code:'513'},{name:'Electric bass',code:'513'},{name:'Bajo eléctrico',code:'513'},
    {name:'Kalimba',code:'122.12'},{name:'Mbira',code:'122.1'},{name:'Panpipes',code:'421.1'},{name:'Zampoñas',code:'421.1'},
    {name:'Ocarina',code:'421.2'},{name:'Didgeridoo',code:'423.1'},{name:'Quena',code:'421.1'},{name:'Sikus',code:'421.1'},
    {name:'Bombo',code:'211.2'},{name:'Djembe',code:'211.2'},{name:'Conga',code:'211.2'},{name:'Bongos',code:'211.2'},
    {name:'Timbales',code:'211.2'},{name:'Steel drum',code:'111.241'},{name:'Harmonium',code:'412.132'},{name:'Melodica',code:'412.132'},
    {name:'Clavinet',code:'314.122'},{name:'Celtic harp',code:'322'},{name:'Lyre',code:'321'},{name:'Kora',code:'322'},
    {name:'Balalaika',code:'321.322'},{name:'Bandura',code:'321'},{name:'Cimbalom',code:'314.122'},{name:'Tiple',code:'321.322'},
    {name:'Requinto',code:'321.322'},{name:'Jarana',code:'321.322'},{name:'Rondador',code:'421.1'},{name:'Erke',code:'423.1'},
    {name:'Wankara',code:'211.2'},{name:'Tinya',code:'211.2'},{name:'Cencerro',code:'111.242'},{name:'Bandolín',code:'321.322'},
    {name:'Santur',code:'314.122'},{name:'Pinquillo',code:'421.1'},{name:'Kenacho',code:'423.1'},{name:'Chajchas',code:'112.13'},
    {name:'Piano de cola',code:'314.122'},{name:'Acordeón',code:'412.132'},{name:'Armónica',code:'412.132'},{name:'Violín',code:'321.322'},
    {name:'Viola da gamba',code:'321.322'},{name:'Guitarrón',code:'321.322'},{name:'Arpa llanera',code:'322'},{name:'Bandola llanera',code:'321.322'},
    {name:'Bandola andina',code:'321.322'},{name:'Tuyu',code:'423.1'},{name:'Erkencho',code:'422.1'},{name:'Pututo',code:'423.1'},
    {name:'Waira',code:'421.1'},{name:'Moxeño',code:'421.1'},
  ];
  
  manual.forEach(inst => {
    const key = inst.name.toLowerCase();
    if (!seen.has(key)) { seen.add(key); instruments.push(inst); }
  });
  
  const dataDir = path.join(__dirname, 'simr-front', 'src', 'assets', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  
  fs.writeFileSync(path.join(dataDir, 'hs-taxonomy.json'), JSON.stringify({ version: 'MIMO 2011', roots }, null, 0));
  fs.writeFileSync(path.join(dataDir, 'hs-universal-instruments.json'), JSON.stringify({ version: '1.0', instruments }, null, 0));
  
  console.log('Files saved to', dataDir);
  const tSize = fs.statSync(path.join(dataDir, 'hs-taxonomy.json')).size;
  const uSize = fs.statSync(path.join(dataDir, 'hs-universal-instruments.json')).size;
  console.log('hs-taxonomy.json size:', (tSize / 1024).toFixed(1), 'KB');
  console.log('hs-universal-instruments.json size:', (uSize / 1024).toFixed(1), 'KB');
}

main().catch(e => { console.error(e); process.exit(1); });
