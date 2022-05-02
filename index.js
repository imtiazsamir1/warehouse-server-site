const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// midleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rl4hc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const fruitCollection = client.db("warehouse").collection("fruits");
    app.get("/fruit", async (req, res) => {
      const query = {};
      const cursor = fruitCollection.find(query);
      const fruits = await cursor.toArray();
      res.send(fruits);
    });
  } finally {
  }
}
run().catch(console.dir);
// client.connect((err) => {
//   const collection = client.db("test").collection("devices");
//   console.log("db connected");
//   // perform actions on the collection object
//   client.close("db connected");
// });

app.get("/", (req, res) => {
  res.send("Running Server");
});

app.listen(port, () => {
  console.log("lis to port", port);
});
