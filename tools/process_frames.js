const fs = require('fs');
const path = require('path');
const sharp = require('./node_modules/sharp');

const outDirs = [
  '../assets/frames/hero',
  '../assets/frames/hero-mobile',
  '../assets/frames/dismantle',
  '../assets/frames/dismantle-mobile'
];

for (const d of outDirs) {
  fs.mkdirSync(path.join(__dirname, d), { recursive: true });
}

function getNaturalSortedFiles(dir) {
  const files = fs.readdirSync(path.join(__dirname, '..', dir))
    .filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.png'));
  return files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

async function processBatch(tasks, concurrency = 8) {
  let index = 0;
  const workers = Array(concurrency).fill(0).map(async () => {
    while (index < tasks.length) {
      const taskIndex = index++;
      const task = tasks[taskIndex];
      await task();
      if (taskIndex % 50 === 0 || taskIndex === tasks.length - 1) {
        process.stdout.write(`\rProgress: ${taskIndex + 1}/${tasks.length}`);
      }
    }
  });
  await Promise.all(workers);
  console.log('\nBatch completed.');
}

async function main() {
  console.log('Gathering hero frames...');
  const clip1Files = getNaturalSortedFiles('clip1frame.zip').map(f => path.join('clip1frame.zip', f));
  const clip2Files = getNaturalSortedFiles('clip2frame.zip').map(f => path.join('clip2frame.zip', f));
  const clip3Files = getNaturalSortedFiles('clip3frame.zip').map(f => path.join('clip3frame.zip', f));

  // Skip frame 1 of clip 2 and clip 3 to avoid join stutter
  const heroList = [
    ...clip1Files,
    ...clip2Files.slice(1),
    ...clip3Files.slice(1)
  ];
  console.log(`Hero total frames: ${heroList.length}`);

  console.log('Gathering dismantle frames...');
  const dismantleList = getNaturalSortedFiles('flowclipframes.zip').map(f => path.join('flowclipframes.zip', f));
  console.log(`Dismantle total frames: ${dismantleList.length}`);

  const allTasks = [];

  // Hero desktop and mobile tasks
  heroList.forEach((relPath, idx) => {
    const frameNum = String(idx + 1).padStart(4, '0');
    const inputPath = path.join(__dirname, '..', relPath);
    const destDesktop = path.join(__dirname, '../assets/frames/hero', `frame_${frameNum}.webp`);
    const destMobile = path.join(__dirname, '../assets/frames/hero-mobile', `frame_${frameNum}.webp`);

    allTasks.push(async () => {
      await sharp(inputPath).resize(1600).webp({ quality: 78 }).toFile(destDesktop);
      await sharp(inputPath).resize(960).webp({ quality: 72 }).toFile(destMobile);
    });
  });

  // Dismantle desktop and mobile tasks
  dismantleList.forEach((relPath, idx) => {
    const frameNum = String(idx + 1).padStart(4, '0');
    const inputPath = path.join(__dirname, '..', relPath);
    const destDesktop = path.join(__dirname, '../assets/frames/dismantle', `frame_${frameNum}.webp`);
    const destMobile = path.join(__dirname, '../assets/frames/dismantle-mobile', `frame_${frameNum}.webp`);

    allTasks.push(async () => {
      await sharp(inputPath).resize(1600).webp({ quality: 78 }).toFile(destDesktop);
      await sharp(inputPath).resize(960).webp({ quality: 72 }).toFile(destMobile);
    });
  });

  console.log(`Starting conversion of ${allTasks.length} frames (desktop + mobile pairs)...`);
  const t0 = Date.now();
  await processBatch(allTasks, 10);
  console.log(`Completed all conversions in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  // Report folder stats
  function getFolderStats(dirRel) {
    const p = path.join(__dirname, dirRel);
    const files = fs.readdirSync(p);
    let totalBytes = 0;
    for (const f of files) {
      totalBytes += fs.statSync(path.join(p, f)).size;
    }
    return { count: files.length, totalMB: (totalBytes / (1024 * 1024)).toFixed(2) };
  }

  const heroStats = getFolderStats('../assets/frames/hero');
  const heroMobStats = getFolderStats('../assets/frames/hero-mobile');
  const disStats = getFolderStats('../assets/frames/dismantle');
  const disMobStats = getFolderStats('../assets/frames/dismantle-mobile');

  console.log('Stats:');
  console.log(`assets/frames/hero: ${heroStats.count} frames, ${heroStats.totalMB} MB`);
  console.log(`assets/frames/hero-mobile: ${heroMobStats.count} frames, ${heroMobStats.totalMB} MB`);
  console.log(`assets/frames/dismantle: ${disStats.count} frames, ${disStats.totalMB} MB`);
  console.log(`assets/frames/dismantle-mobile: ${disMobStats.count} frames, ${disMobStats.totalMB} MB`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
