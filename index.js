const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();
const cors = require("cors");
// middleware

app.use(express.json());
app.use(cors());

// database connect
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const client = new MongoClient(process.env.URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Hiring server is working good");
});

async function run() {
  try {
    await client.connect();

    const db = client.db("dev_hire_collection");
    const userCollection = db.collection("users");
    const jobCollection = db.collection("jobs");

    app.post("/users", async (req, res) => {
      try {
        const user = req.body;

        const existingUser = await userCollection.findOne({
          email: user.email,
        });

        if (existingUser) {
          return res.status(200).json({
            message: "User Already Exist",
            success: true,
          });
        }

        const result = await userCollection.insertOne(user);

        res.status(201).json({
          message: "user saved successfully",
          data: result.insertedId,
          success: true,
        });
      } catch (error) {
        res.status(500).json({
          message: "Something went wrong",
          success: false,
        });
      }
    });

    app.get("/users", async (req, res) => {
      try {
        const email = req.query.email;
        const query = {};
        if (email) {
          query.email = email;
        }
        const cursor = userCollection.find(query);
        const result = await cursor.toArray();
        res.status(200).json({
          message: "users get successfully",
          data: result,
          success: true,
        });
      } catch (error) {
        res.status(500).json({
          message: "Something went wrong",
          success: false,
        });
      }
    });

    app.delete("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const result = await userCollection.deleteOne(query);
        res.status(200).json({
          message: "user deleted successfully",
          data: result,
          success: true,
        });
      } catch (error) {
        res.status(500).json({
          message: "Something went wrong",
          res: error,
          succces: false,
        });
      }
    });

    app.post("/jobs", async (req, res) => {
      try {
        const jobs = req.body;
        const result = await jobCollection.insertOne(jobs);
        res.status(201).json({
          message: "successfully posted job",
          data: result.insertedId,
          success: true,
        });
      } catch (error) {
        res.status(500).json({
          message: "Something went wrong",
          error: error,
          success: false,
        });
      }
    });

    app.get("/jobs", async (req, res) => {
      const cursor = jobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // client close
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on the port of ${port}`);
});
