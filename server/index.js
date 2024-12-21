const express = require("express");
const cors = require("cors");
var jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

app.use(
  cors({
    origin: "https://amerjob.web.app",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
const uri = `mongodb+srv://${process.env.DB_UserName}:${process.env.DB_Pass}@cluster0.ocbhdf0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const Database = client.db("SoloSphere");
const collection = Database.collection("jobs");

async function run() {
  try {
    // Send a ping to confirm a successful connection
    // await client.db('admin').command({ ping: 1 })
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.post("/jwt", (req, res) => {
  const payload = req.body;
  var token = jwt.sign(payload, process.env.jwt_secret, { expiresIn: '2d' });

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    })
    .send({ success: true });
});
app.post("/LogOut", (req, res) => {
  res
    .clearCookie("token", {
      maxAge: 0,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    })
    .send({ success: true });
});

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(403).send({ message: "Unauthorized Access!" });
  }
  jwt.verify(token, process.env.jwt_secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized Access!" });
    }

    req.user = decoded;
    next();
  });
};


app.get("/", async (req, res) => {
  
  const Alljobs = await collection.find().toArray();
  res.send(Alljobs);
 
});
app.get("/All_jobs", async (req, res) => {
  const { filter,search, sort } = req.query;
 
  let options = {}
  if (sort) options = { sort: { deadline: sort === 'asc' ? 1 : -1 } }
  let query = {
    job_title: {
      $regex: search,
      $options: 'i',
    },
  }
  if (filter) query.category = filter
  const Alljobs = await collection.find(query,options).toArray();
  res.send(Alljobs);
 
});
app.post("/Add_jobs", async (req, res) => {
  const jobs = req.body;
  const result = await collection.insertOne(jobs);

  res.send(result);
});
app.get("/jobDetails/:id", async (req, res) => {
  const id = req.params.id;
  const job_Details = await collection.findOne({ _id: new ObjectId(id) });
  res.send(job_Details);
});
app.get("/myPostedJobs/:email", verifyToken,  async (req, res) => {

   if(req.user.user !== req.params.email){
    return res.status(401).send({message: "Unauthorized Access!"})
   }

  const email = req.params.email;
  const job_Details = await collection
    .find({ "Bayerinfo.email": email })
    .toArray();
  res.send(job_Details);
});
app.delete("/deletePostedJob/:id", async (req, res) => {
  const id = req.params.id;
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});
app.patch("/UpdateJob/:id", async (req, res) => {
  const id = req.params.id;
  const updateData = req.body;
  const { category, job_title } = updateData;
  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) }, // Match the document
      {
        $set: {
          ...updateData, // Update other fields from the request body
          "bid.$[].category": category,
          "bid.$[].job_title": job_title,
          
          // Set the category for all items in the `bid` array
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({ message: "No matching document found." });
    }

    res.send({ message: "Job updated successfully", result });
  } catch (error) {
    res.status(500).send({ message: "Error updating job", error });
  }
});

app.put("/bids", async (req, res) => {
  const bidData = req.body;

  try {
    const check = await collection.findOne({
      _id: new ObjectId(bidData?.job_id),
    });

    if (check?.bid && check?.bid?.find((i) => i.email === bidData?.email)) {

      return res.status(400).send("You have already bid on this project");
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(bidData.job_id) },
      { $push: { bid: bidData } }
    );
  

    if (result.modifiedCount === 1) {
      res
        .status(200)
        .json({ message: " you have bided on this project successfully" });
    } else {
      res.status(400).json({ message: "something went wrong!" });
    }
  } catch (error) {
   
    res.status(400).json({ message: "error ocourd!" });
  }
});

app.get("/bids/:email", async (req, res) => {
  const email = req.params.email;

  const result = await collection.find({ "bid.email": email }).toArray();

  // Filter matching bids for the email
  const filteredBids = result.map((doc) => {
    return {
      ...doc,
      bid: doc.bid.filter((b) => b.email === email),
    };
  });

  res.send(filteredBids);
});

app.patch("/bids/complete/:id/:email", async (req, res) => {
  const job_id = req.params.id;
  const email = req.params.email;
  const status = req.query.status;

  const result = await collection.updateOne(
    { _id: new ObjectId(job_id), "bid.email": email },
    {
      $set: { "bid.$.status": status },
    }
  );
  res.send(result);
});
app.get("/bidrequests/:email", async (req, res) => {
  const email = req.params.email;
  const result = await collection.find({ "Bayerinfo.email": email }).toArray();

  const bidRequests = result.filter((job) => job.bid.length > 0 && job.bid);
  let bids = bidRequests.map((item) => item.bid);

  res.send(bids);
});
app.patch("/acceptBidRequest/:id", async (req, res) => {
  const job_id = req.params.id;
  const result = await collection.updateOne(
    { _id: new ObjectId(job_id) },
    {
      $set: { "bid.$.status": "processing" },
    }
  );
  res.send(result);
});

app.listen(port, () => console.log(`Server running on port ${port}`));
