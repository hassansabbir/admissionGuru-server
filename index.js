const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5ymoa2u.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const collegesCollection = client
      .db("admissionGuru")
      .collection("colleges");
    const researchesCollection = client
      .db("admissionGuru")
      .collection("researches");
    const bookingsCollection = client
      .db("admissionGuru")
      .collection("bookings");

    //colleges collection
    app.get("/searchColleges", async (req, res) => {
      const search = req.query.search;
      console.log(search);
      const query = { collegeName: { $regex: search, $options: "i" } };
      const result = await collegesCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/colleges", async (req, res) => {
      const result = await collegesCollection.find().toArray();
      res.send(result);
    });
    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await collegesCollection.findOne(query);
      res.send(result);
    });

    //researches collection
    app.get("/researches", async (req, res) => {
      const result = await researchesCollection.find().toArray();
      res.send(result);
    });

    //bookings collection
    app.get("/allBookings/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await bookingsCollection.find(query).toArray();

      const collegeName = result[0]?.collegeName;

      const collegeQuery = { collegeName: collegeName };
      const collegeData = await collegesCollection.findOne(collegeQuery);

      const combinedData = { ...result, collegeData };
      res.send(combinedData);
    });

    app.post("/bookings", async (req, res) => {
      const result = await bookingsCollection.insertOne(req.body);
      res.send(result);
    });

    app.put("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const updatedBooking = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const booking = {
        $set: {
          name: updatedBooking.name,
          email: updatedBooking.email,
          collegeName: updatedBooking.collegeName,
          subject: updatedBooking.subject,
          phone: updatedBooking.phone,
          bDate: updatedBooking.bDate,
          address: updatedBooking.bDate,
        },
      };
      const result = await bookingsCollection.updateOne(
        filter,
        booking,
        options
      );
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
  res.send("admissionGuru server is running...");
});

app.listen(port, () => {
  console.log(`admissionGuru server is running on port ${port}`);
});
