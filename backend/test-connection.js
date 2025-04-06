require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

async function testConnection() {
    try {
        const uri = process.env.MONGODB_URI;
        console.log('Attempting to connect to MongoDB...');
        console.log('Connection string exists:', !!uri);
        
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: true,
            w: 'majority'
        });
        
        console.log('Successfully connected to MongoDB!');
        
        // Test the connection with a simple query
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        
        await mongoose.connection.close();
        console.log('Connection closed successfully');
    } catch (error) {
        console.error('Connection test failed:', error);
    } finally {
        process.exit();
    }
}

testConnection();