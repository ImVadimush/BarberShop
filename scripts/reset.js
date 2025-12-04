// scripts/activateAdmin.js
require('dotenv').config(); // Załaduj .env
const { MongoClient } = require('mongodb');

// Pobierz z .env
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
const DATABASE_NAME = process.env.DB_NAME || 'barber_shop'; // Zmień jeśli masz inną nazwę

async function activateAdmin() {
  let client;
  
  try {
    if (!MONGODB_URI) {
      console.log('❌ Brak MONGODB_URI w pliku .env!');
      console.log('💡 Dodaj linię: MONGODB_URI=twoj-connection-string');
      return;
    }
    
    console.log('🔄 Łączenie z MongoDB...');
    client = await MongoClient.connect(MONGODB_URI);
    
    const db = client.db(DATABASE_NAME);
    
    console.log('🔍 Szukam konta admina w kolekcji "admins"...');
    
    // Sprawdź czy admin istnieje w kolekcji admins
    const admin = await db.collection('admins').findOne({});
    
    if (!admin) {
      console.log('❌ Nie znaleziono żadnego konta w kolekcji "admins"!');
      console.log('💡 Sprawdź czy kolekcja admins zawiera jakieś dokumenty');
      return;
    }
    
    console.log('✅ Znaleziono admina:', admin.username || admin.email);
    console.log('📊 Obecny status isActive:', admin.isActive);
    
    // Aktywuj wszystkie konta adminów
    const result = await db.collection('admins').updateMany(
      {},
      { $set: { isActive: true } }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Aktywowano ${result.modifiedCount} kont admina!`);
      console.log('🎉 Możesz się teraz zalogować');
    } else {
      console.log('ℹ️  Konta już były aktywne lub nie wymagały zmian');
    }
    
    // Pokaż zaktualizowane dane
    const updatedAdmin = await db.collection('admins').findOne({});
    console.log('\n📋 Zaktualizowane dane:');
    console.log({
      username: updatedAdmin.username,
      email: updatedAdmin.email,
      role: updatedAdmin.role,
      isActive: updatedAdmin.isActive
    });
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
    console.log('\n💡 Upewnij się że:');
    console.log('1. Plik .env zawiera MONGODB_URI');
    console.log('2. MongoDB działa');
    console.log('3. Connection string jest poprawny');
    console.log('4. Masz zainstalowane: npm install mongodb dotenv');
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Rozłączono z bazą danych');
    }
  }
}

// Opcjonalnie: aktywuj WSZYSTKIE konta we wszystkich kolekcjach
async function activateAllUsers() {
  let client;
  
  try {
    console.log('🔄 Łączenie z MongoDB...');
    client = await MongoClient.connect(MONGODB_URI);
    
    const db = client.db(DATABASE_NAME);
    
    // Aktywuj w kolekcji admins
    const adminsResult = await db.collection('admins').updateMany(
      {},
      { $set: { isActive: true } }
    );
    
    // Aktywuj w kolekcji users (jeśli istnieje)
    const usersResult = await db.collection('users').updateMany(
      {},
      { $set: { isActive: true } }
    );
    
    console.log(`✅ Aktywowano ${adminsResult.modifiedCount} adminów`);
    console.log(`✅ Aktywowano ${usersResult.modifiedCount} użytkowników`);
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Uruchom skrypt
console.log('🚀 Skrypt aktywacji konta admina\n');

// Odkomentuj którą funkcję chcesz uruchomić:
activateAdmin(); // Aktywuje tylko admina
// activateAllUsers(); // Aktywuje wszystkich użytkowników