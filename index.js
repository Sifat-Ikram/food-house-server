const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 4321;

// middleware

app.use(cors({
  origin: [
    "http://localhost:8080"
  ],
  credentials: true,
}));
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jrqljyn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const menuCollection = client.db("foodHouse").collection("menu");
    const bookingCollection = client.db("foodHouse").collection("booking");

    // jwt api
    app.post('/jwt', async (req, res) => {
      console.log('Received request body:', req.body);
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
    
      const token = await jwt.sign({ email }, process.env.ACCESS_TOKEN, {
        expiresIn: '1h',
      });
      res.send({ token });
    });

    // menu api
    app.get("/menu", async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    });

    // booking api
    app.post("/booking", async (req, res) => {
      const cartInfo = req.body;
      const result = await bookingCollection.insertOne(cartInfo);
      res.send(result);
    });

    app.get("/booking", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("food house is running");
});

app.listen(port, () => {
  console.log(`food house restaurant is open on port ${port}`);
});
