import {Sequelize} from "sequelize-typescript";
import {envConfig} from "./envConfig";
import User from "../models/userModel";

const DATABASE_URL = envConfig.databaseUrl

const sequelize = new Sequelize(DATABASE_URL as string, {
     dialect: 'postgres',
    protocol: 'postgres',
    models: [User],
    logging: console.log,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
})

const connectDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.sync({alter: true,force: false});
        console.log('Database synchronized successfully.');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

export {sequelize, connectDb};