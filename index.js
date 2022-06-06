const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const res = require("express/lib/response");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// midleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader?.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(403).send({ message: "Forbbiden" });
    }
    req.decoded = decoded;
  });
  console.log("inside verifyJWT", authHeader);
  next();
}

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

    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    app.get("/fruit", async (req, res) => {
      const query = {};
      const cursor = fruitCollection.find(query);
      const fruits = await cursor.toArray();
      res.send(fruits);
    });

    app.get("/manageInv", async (req, res) => {
      const query = {};
      const cursor = fruitCollection.find(query);
      const manageItem = await cursor.toArray();
      res.send(manageItem);
    });

    app.get("/fruit/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const fruit = await fruitCollection.findOne(query);
      res.send(fruit);
    });
    app.post("/fruit", async (req, res) => {
      const newItem = req.body;
      const result = await fruitCollection.insertOne(newItem);
      res.send(result);
    });
    app.get("/items", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded?.email;

      const email = req.query.email;

      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = fruitCollection.find(query);
        const item = await cursor.toArray();
        res.send(item);
      } else {
        res.status(403).send({ message: "Forbbiden" });
      }
    });
    app.get("/fruit/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await fruitCollection.findOne(query);
      res.send(result);
    });
    app.delete("/fruit/:id", async (req, res) => {
      const id = req.params;
      const query = { _id: ObjectId(id) };
      const result = await fruitCollection.deleteOne(query);
      res.send(result);
    });
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await fruitCollection.findOne(query);
      res.send(product);
    });
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log(data);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: data.quantity,
        },
      };

      const result = await fruitCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Server");
});
app.get("/hero", (req, res) => {
  res.send("Hero Meets hero ku");
});

app.listen(port, () => {
  console.log("lis to port", port);
});
// hello
