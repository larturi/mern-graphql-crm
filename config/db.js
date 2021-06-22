const mongoose = require('mongoose');

require('dotenv').config({ path: '.env' });

const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.DB_MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
        console.info('DB Conectada');
    } catch (error) {
        console.error('Hubo un error');
        console.error(error);
        process.exit(1);
    }
};

module.exports = conectarDB;