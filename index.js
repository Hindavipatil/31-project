const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const url = process.env.MONGODB_URL;
const con = new MongoClient(url);
const db = con.db("smarteditor");
const coll = db.collection("texts");

// 💾 Save Text
app.post("/save", (req, res) => {
  const doc = {
    originalText: req.body.originalText,
    correctedText: req.body.correctedText,
    translatedText: req.body.translatedText,
    errors: req.body.errors,
    bookmark: false,
    createdAt: new Date()
  };

  coll.insertOne(doc)
    .then(response => res.send(response))
    .catch(() => res.send("Save failed"));
});

// 📖 Get All
app.get("/history", (req, res) => {
  coll.find().sort({ createdAt: -1 }).toArray()
    .then(response => res.send(response))
    .catch(() => res.send("Failed to fetch"));
});

// ❌ Delete by ID
app.delete("/delete", (req, res) => {
  const id = req.body.id;
  coll.deleteOne({ _id: new ObjectId(id) })
    .then(response => res.send(response))
    .catch(() => res.send("Delete failed"));
});

// ✅ Update by ID
app.put("/update", (req, res) => {
  const id = req.body.id;
  const update = req.body.update;

  coll.updateOne(
    { _id: new ObjectId(id) },
    { $set: update }
  )
    .then(response => res.send(response))
    .catch(() => res.send("Update failed"));
});

app.listen(5000, () => {
  console.log("✅ Server ready at http://localhost:5000");
});
