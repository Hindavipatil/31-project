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
    .then(response => res.status(201).send(response))
    .catch(err => {
      console.error("❌ Save failed:", err);
      res.status(500).send("Save failed");
    });
});

// 📖 Get All
app.get("/history", (req, res) => {
  coll.find().sort({ createdAt: -1 }).toArray()
    .then(response => res.status(200).send(response))
    .catch(err => {
      console.error("❌ Fetch failed:", err);
      res.status(500).send("Failed to fetch");
    });
});

// ❌ Delete by ID
app.delete("/delete", (req, res) => {
  const id = req.body.id;
  if (!id) {
    return res.status(400).json({ error: "Missing ID" });
  }

  coll.deleteOne({ _id: new ObjectId(id) })
    .then(response => {
      if (response.deletedCount === 0) {
        return res.status(404).json({ error: "Entry not found" });
      }
      res.status(200).send(response);
    })
    .catch(err => {
      console.error("❌ Delete failed:", err);
      res.status(500).send("Delete failed");
    });
});

// ✅ Update by ID
app.put("/update", (req, res) => {
  const id = req.body.id;
  const update = req.body.update;

  if (!id || !update) {
    return res.status(400).json({ error: "Missing id or update object" });
  }

  coll.updateOne(
    { _id: new ObjectId(id) },
    { $set: update }
  )
    .then(result => {
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Document not found" });
      }

      if (result.modifiedCount === 0) {
        return res.status(200).json({ message: "No changes made" });
      }

      res.status(200).json({ message: "Updated successfully" });
    })
    .catch(err => {
      console.error("❌ Update error:", err);
      res.status(500).json({ error: "Update failed on server" });
    });
});

// ✅ Start server
app.listen(5000, () => {
  console.log("✅ Server ready at http://localhost:5000");
});
