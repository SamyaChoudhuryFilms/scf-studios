import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log("\n========================================");
  console.log("   SCF STUDIOS Content Scaffolder Wizard");
  console.log("========================================\n");

  const type = (await ask("Choose content type (1 for Movie, 2 for Web Series): ")).trim();

  if (type === '1') {
    // Add Movie
    console.log("\n--- Add New Movie ---");
    const title = await ask("Title: ");
    const isComingSoonVal = (await ask("Is it Coming Soon? (y/n): ")).trim().toLowerCase() === 'y';
    const description = await ask("Description: ");
    const poster = await ask("Poster Image URL: ");
    const coverImage = await ask("Cover Image URL: ");
    const video = await ask("Video Stream URL: ");
    const trailer = await ask("Trailer Stream URL: ");
    const genre = await ask("Genre (e.g., Action, Thriller, Sci-Fi): ");
    const language = await ask("Language (e.g., Bengali, Hindi, English): ");
    const year = parseInt(await ask("Release Year: ") || new Date().getFullYear());
    const duration = await ask("Duration (e.g., 2h 15m): ");
    const rating = await ask("Age Rating (e.g., 13+): ");
    const cast = (await ask("Cast (comma-separated): ")).split(',').map(s => s.trim()).filter(Boolean);
    const director = await ask("Director: ");
    const isPremium = (await ask("Is Premium/Locked? (y/n): ")).trim().toLowerCase() === 'y';
    const isKids = (await ask("Is it for Kids? (y/n): ")).trim().toLowerCase() === 'y';
    const quality = await ask("Quality (4K or Full HD) [default: 4K]: ") || "4K";

    const moviesFilePath = path.join(__dirname, '../src/data/movies.js');
    let fileContent = fs.readFileSync(moviesFilePath, 'utf8');

    // Get current count to generate next ID
    const matches = fileContent.match(/"m-\d+"/g) || [];
    const ids = matches.map(m => parseInt(m.replace(/"m-(\d+)"/, '$1')));
    const maxId = ids.length > 0 ? Math.max(...ids) : 10;
    const nextId = `m-${maxId + 1}`;

    const newMovieObj = {
      id: nextId,
      title,
      ...(isComingSoonVal ? { isComingSoon: true } : {}),
      description,
      poster,
      coverImage,
      video,
      trailer,
      genre,
      language,
      year,
      duration,
      rating,
      cast,
      director,
      isPremium,
      isOriginal: true,
      isKids,
      quality
    };

    // Format new object as string
    const formattedObj = JSON.stringify(newMovieObj, null, 2);

    // Insert into the file array before the last ];
    const lastClosingBracket = fileContent.lastIndexOf('];');
    if (lastClosingBracket === -1) {
      console.error("Error: Could not parse movies.js array format!");
      process.exit(1);
    }

    const arrayStart = fileContent.indexOf('[');
    const hasItems = fileContent.substring(arrayStart + 1, lastClosingBracket).trim().length > 0;
    const insertString = (hasItems ? ',\n  ' : '  ') + formattedObj.replace(/\n/g, '\n  ');

    const updatedContent = fileContent.substring(0, lastClosingBracket) + insertString + '\n' + fileContent.substring(lastClosingBracket);
    fs.writeFileSync(moviesFilePath, updatedContent, 'utf8');
    console.log(`\n✔ Movie successfully added to database with ID: ${nextId}`);

    bumpVersion();

  } else if (type === '2') {
    // Add Series
    console.log("\n--- Add New Web Series ---");
    const title = await ask("Title: ");
    const description = await ask("Description: ");
    const poster = await ask("Poster Image URL: ");
    const coverImage = await ask("Cover Image URL: ");
    const genre = await ask("Genre (e.g., Action, Sci-Fi): ");
    const language = await ask("Language (e.g., Bengali, English): ");
    const isPremium = (await ask("Is Premium/Locked? (y/n): ")).trim().toLowerCase() === 'y';
    
    // Episodes wizard
    const episodes = [];
    console.log("\n--- Season 1 Episodes Wizard ---");
    let epNum = 1;
    while (true) {
      console.log(`\nConfiguring Episode ${epNum}:`);
      const epTitle = await ask(`Episode ${epNum} Title (or press Enter to finish): `);
      if (!epTitle) break;
      const epDesc = await ask("Episode Description: ");
      const epThumbnail = await ask("Episode Thumbnail URL: ");
      const epVideo = await ask("Episode Video URL: ");
      const epDur = await ask("Episode Duration (e.g., 25m): ");

      episodes.push({
        id: `s-next-e-${epNum}`,
        episodeNumber: epNum,
        title: epTitle,
        description: epDesc,
        thumbnail: epThumbnail,
        video: epVideo,
        duration: epDur
      });
      epNum++;
    }

    const seriesFilePath = path.join(__dirname, '../src/data/series.js');
    let fileContent = fs.readFileSync(seriesFilePath, 'utf8');

    // Get current series count
    const matches = fileContent.match(/"s-\d+"/g) || [];
    const ids = matches.map(m => parseInt(m.replace(/"s-(\d+)"/, '$1')));
    const maxId = ids.length > 0 ? Math.max(...ids) : 1;
    const nextId = `s-${maxId + 1}`;

    // Fix episode IDs using the new series ID
    episodes.forEach(ep => {
      ep.id = `${nextId}-e-${ep.episodeNumber}`;
    });

    const newSeriesObj = {
      id: nextId,
      title,
      description,
      poster,
      coverImage,
      genre,
      language,
      isPremium,
      isOriginal: true,
      seasons: [
        {
          seasonNumber: 1,
          name: "Season 1",
          episodes
        }
      ]
    };

    const formattedObj = JSON.stringify(newSeriesObj, null, 2);

    const lastClosingBracket = fileContent.lastIndexOf('];');
    if (lastClosingBracket === -1) {
      console.error("Error: Could not parse series.js array format!");
      process.exit(1);
    }

    const arrayStart = fileContent.indexOf('[');
    const hasItems = fileContent.substring(arrayStart + 1, lastClosingBracket).trim().length > 0;
    const insertString = (hasItems ? ',\n  ' : '  ') + formattedObj.replace(/\n/g, '\n  ');

    const updatedContent = fileContent.substring(0, lastClosingBracket) + insertString + '\n' + fileContent.substring(lastClosingBracket);
    fs.writeFileSync(seriesFilePath, updatedContent, 'utf8');
    console.log(`\n✔ Series successfully added to database with ID: ${nextId}`);

    bumpVersion();

  } else {
    console.log("Invalid choice. Exiting...");
  }

  rl.close();
}

function bumpVersion() {
  const contextFilePath = path.join(__dirname, '../src/context/ContentContext.jsx');
  if (fs.existsSync(contextFilePath)) {
    let content = fs.readFileSync(contextFilePath, 'utf8');
    const match = content.match(/version\s*!==\s*'v(\d+)'/);
    if (match) {
      const currentVerNum = parseInt(match[1]);
      const nextVerNum = currentVerNum + 1;
      const currentVerStr = `'v${currentVerNum}'`;
      const nextVerStr = `'v${nextVerNum}'`;
      content = content.split(currentVerStr).join(nextVerStr);
      fs.writeFileSync(contextFilePath, content, 'utf8');
      console.log(`✔ Bumped Content Database version key to: v${nextVerNum} (caches cleared)\n`);
    }
  }
}

main().catch(console.error);
