import {Sequelize} from "sequelize-typescript";
import {envConfig} from "./envConfig";
import User from "../models/auth/userModel";
import Role from "../models/auth/roleModel";
import UserRole from "../models/auth/userRole";
import IncomeCategory from "../models/category/incomeCategory";
import {applyRelationship} from "../models/relationship";

const DATABASE_URL = envConfig.databaseUrl

const sequelize = new Sequelize(DATABASE_URL as string, {
     dialect: 'postgres',
    protocol: 'postgres',
    models: [User,Role,UserRole,IncomeCategory],
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
        applyRelationship();
        await sequelize.sync({alter: true,force: false});
        console.log('Database synchronized successfully.');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

export {sequelize, connectDb};