require("dotenv").config();
const mongoose = require("mongoose");
const { ServerApiVersion } = require('mongodb');

const dbHost = process.env.DATABASE_HOST;
const dbPort = process.env.DATABASE_PORT;
const dbName = process.env.DATABASE_NAME;

const username = process.env.DATABASE_USER;
const password = process.env.DATABASE_PASS;

// const dbURI = `mongodb+srv://${username}:${password}@clusterName.mongodb.net/${dbName}?retryWrites=true&w=majority`
// `mongodb+srv://${username}:${password}@clusterName.mongodb.net/${dbName}?retryWrites=true&w=majority`
// const mongoDBUrl =  `mongodb://${username}:${password}@${dbHost}:${dbPort}/${dbName}`  

const uri = `mongodb+srv://${username}:${password}@cluster0.5mmm8ns.mongodb.net/?retryWrites=true&w=majority`;

async function connectDB() {

  console.log(uri)


  mongoose.connect(uri, {

    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
      useCreateIndex: true
    }

  });

  const db = mongoose.connection;

  // Event handling for successful MongoDB connection
  db.on("connected", () => {
    console.log("Connected to MongoDB");
  });

  // Event handling for MongoDB connection error
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
}


module.exports = connectDB 

