require("dotenv").config();
const mongoose = require("mongoose");

const dbHost = process.env.DATABASE_HOST;
const dbPort = process.env.DATABASE_PORT;
const dbName = process.env.DATABASE_NAME;

const dbUser = process.env.DATABASE_USER;
const password = process.env.DATABASE_PASS;


const mongoDBUrl = `mongodb://${dbHost}:${dbPort}/${dbName}`; 

async function connectDB() {


  mongoose.connect(mongoDBUrl, {
    user: dbUser,

    pass: password,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;

  // Event handling for successful MongoDB connection
  db.on("connected", () => {
    console.log("Connected to MongoDB");
  });

  // Event handling for MongoDB connection error
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
}


export default connectDB

