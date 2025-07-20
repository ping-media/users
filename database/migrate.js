const fs = require('fs').promises;
const path = require('path');
const { initializeDatabase } = require('./init');
const userRepository = require('./userRepository');

/**
 * Migration Script
 * Migrates existing JSON data to SQLite database
 */

async function migrateFromJSON() {
    try {
        console.log('🔄 Starting migration from JSON to SQLite...');

        // Initialize database
        await initializeDatabase();
        console.log('✅ Database initialized');

        // Check if JSON file exists
        const jsonFilePath = path.join(__dirname, '..', 'data', 'data.json');
        
        try {
            await fs.access(jsonFilePath);
        } catch (error) {
            console.log('ℹ️  No existing JSON data found. Migration not needed.');
            return;
        }

        // Read JSON data
        const jsonData = await fs.readFile(jsonFilePath, 'utf8');
        const users = JSON.parse(jsonData);

        if (!Array.isArray(users) || users.length === 0) {
            console.log('ℹ️  No users found in JSON file. Migration not needed.');
            return;
        }

        console.log(`📊 Found ${users.length} users to migrate`);

        // Migrate each user
        let migratedCount = 0;
        let errorCount = 0;

        for (const user of users) {
            try {
                // Check if user already exists (by email)
                const existingUser = await userRepository.getUserByEmail(user.email);
                
                if (existingUser) {
                    console.log(`⚠️  User with email ${user.email} already exists, skipping...`);
                    continue;
                }

                // Ensure user has required fields
                if (!user.id || !user.name || !user.email || !user.phone || !user.city || !user.gender || !user.age) {
                    console.log(`⚠️  User missing required fields, skipping: ${user.email || 'unknown'}`);
                    continue;
                }

                // Migrate user
                await userRepository.createUser({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    city: user.city,
                    gender: user.gender,
                    age: user.age
                });

                migratedCount++;
                console.log(`✅ Migrated user: ${user.name} (${user.email})`);

            } catch (error) {
                errorCount++;
                console.error(`❌ Error migrating user ${user.email || 'unknown'}:`, error.message);
            }
        }

        console.log('\n📈 Migration Summary:');
        console.log(`✅ Successfully migrated: ${migratedCount} users`);
        console.log(`❌ Errors: ${errorCount} users`);
        console.log(`📊 Total processed: ${users.length} users`);

        if (migratedCount > 0) {
            // Backup original JSON file
            const backupPath = jsonFilePath + '.backup';
            await fs.copyFile(jsonFilePath, backupPath);
            console.log(`💾 Original JSON data backed up to: ${backupPath}`);
        }

        console.log('🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    migrateFromJSON();
}

module.exports = { migrateFromJSON }; 