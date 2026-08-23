import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { mockMovies } from '../src/data/movies.js';
import { mockSeries } from '../src/data/series.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to parse .env.local
function parseEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) {
    console.error("Error: .env.local not found!");
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[match[1]] = value;
    }
  });
  return env;
}

async function seedDatabase() {
  console.log("Loading environment configuration...");
  const env = parseEnv();
  
  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };

  console.log("Initializing Firebase Client SDK...");
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  const tempEmail = `temp-admin-${Date.now()}@scfstudios.com`;
  const tempPassword = `TempPassword123!`;
  console.log(`Registering temporary admin user: ${tempEmail}...`);
  const userCredential = await createUserWithEmailAndPassword(auth, tempEmail, tempPassword);
  console.log("Sign-in successful. Authenticated UID:", userCredential.user.uid);

  console.log("\n--- Seeding Movies ---");
  for (const movie of mockMovies) {
    const docId = movie.id;
    const movieRef = doc(db, "movies", docId);
    
    // Check if doc exists
    const snap = await getDoc(movieRef);
    if (!snap.exists()) {
      const data = {
        title: movie.title,
        description: movie.description || '',
        posterUrl: movie.posterUrl || movie.poster || '',
        coverImageUrl: movie.coverImageUrl || movie.coverImage || '',
        youtubeId: movie.youtubeId || '',
        language: movie.language || 'English',
        genre: movie.genre || 'Family',
        duration: movie.duration || '1h 30m',
        releaseDate: movie.releaseDate || '',
        featured: !!movie.featured,
        published: true, // Default to published for mock data
        isOriginal: !!movie.isOriginal,
        isPremium: !!movie.isPremium,
        isKids: !!movie.isKids,
        isComingSoon: !!movie.isComingSoon,
        year: parseInt(movie.year) || new Date().getFullYear(),
        rating: movie.rating || 'G',
        quality: movie.quality || '4K',
        audio: movie.audio || 'Stereo',
        director: movie.director || '',
        cast: Array.isArray(movie.cast) ? movie.cast : [],
        video: movie.video || '',
        trailer: movie.trailer || '',
        customCategory: movie.customCategory || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log(`Adding movie: ${movie.title} (${docId})`);
      await setDoc(movieRef, data);
    } else {
      console.log(`Movie already exists, skipping: ${movie.title} (${docId})`);
    }
  }

  console.log("\n--- Seeding Series ---");
  for (const item of mockSeries) {
    const docId = item.id;
    const seriesRef = doc(db, "series", docId);
    
    const snap = await getDoc(seriesRef);
    if (!snap.exists()) {
      const data = {
        title: item.title,
        description: item.description || '',
        posterUrl: item.posterUrl || item.poster || '',
        coverImageUrl: item.coverImageUrl || item.coverImage || '',
        genre: item.genre || 'Drama',
        language: item.language || 'English',
        isOriginal: !!item.isOriginal,
        isPremium: !!item.isPremium,
        isKids: !!item.isKids,
        isComingSoon: !!item.isComingSoon,
        year: parseInt(item.year) || new Date().getFullYear(),
        rating: item.rating || '13+',
        duration: item.duration || '1 Season',
        youtubeId: item.youtubeId || '',
        releaseDate: item.releaseDate || '',
        featured: !!item.featured,
        published: true,
        quality: item.quality || '4K',
        audio: item.audio || 'Stereo',
        director: item.director || '',
        cast: Array.isArray(item.cast) ? item.cast : [],
        video: item.video || '',
        trailer: item.trailer || '',
        seasons: item.seasons || [{ seasonNumber: 1, name: "Season 1", episodes: [] }],
        customCategory: item.customCategory || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log(`Adding series: ${item.title} (${docId})`);
      await setDoc(seriesRef, data);
    } else {
      console.log(`Series already exists, skipping: ${item.title} (${docId})`);
    }
  }

  console.log("\nDatabase seeding completed successfully!");
}

seedDatabase().catch(console.error);
