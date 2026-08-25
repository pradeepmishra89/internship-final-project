import mysql from "mysql2/promise";
import {env} from "./env.js";

export const db =await mysql.createConnection({
     host: env.DATABASE_HOST ,
     port: env.DATABASE_PORT ,
     user: env.DATABASE_USER ,
     password : env.DATABASE_PASSWORD ,
     database: env.DATABASE_NAME ,
})

