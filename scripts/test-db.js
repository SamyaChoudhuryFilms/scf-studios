import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
      // Remove surrounding quotes if any
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[match[1]] = value;
    }
  });
  return env;
}

async function testConnection() {
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

  console.log("Initializing Firebase Client SDK with Config:", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
  });

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log("\nAttempting to fetch 'movies' collection from Firestore...");
  try {
    const querySnapshot = await getDocs(collection(db, "movies"));
    console.log(`Success! Fetched ${querySnapshot.size} movie documents.`);
    querySnapshot.forEach((doc) => {
      console.log(` - ID: ${doc.id} | Title: ${doc.data().title} | Published: ${doc.data().published} | isKids: ${doc.data().isKids} | isComingSoon: ${doc.data().isComingSoon}`);
    });
  } catch (error) {
    console.error("\nFAIL: Error loading movies from Firestore!");
    console.error(error);
  }

  console.log("\nAttempting to fetch 'series' collection from Firestore...");
  try {
    const querySnapshot = await getDocs(collection(db, "series"));
    console.log(`Success! Fetched ${querySnapshot.size} series documents.`);
    querySnapshot.forEach((doc) => {
      console.log(` - ID: ${doc.id} | Title: ${doc.data().title} | Seasons: ${doc.data().seasons?.length || 0}`);
    });
  } catch (error) {
    console.error("\nFAIL: Error loading series from Firestore!");
    console.error(error);
  }
}

testConnection();
