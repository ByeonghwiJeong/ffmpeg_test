const express = require("express");
const ffmpeg = require("fluent-ffmpeg");
const app = express();
const path = require("path");
const fs = require("fs");
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

const uri =
  "mongodb+srv://<username>:<password>@cluster0.mongodb.net/test?retryWrites=true&w=majority";

app.get("/video", (req, res) => {
  try {
    const imagePath = req.query.image;
    const videoName = `video-${Date.now()}.mp4`;
    const videoPath = path.join(__dirname, videoName);

    ffmpeg().input(imagePath).inputFPS(1).duration(2).output(videoPath).run();

    MongoClient.connect(uri, { useUnifiedTopology: true }, (error, client) => {
      if (error) {
        console.error(error);
        res
          .status(500)
          .json({ success: false, message: "Failed to connect to MongoDB" });
        return;
      }

      const db = client.db("test");
      const videos = db.collection("videos");

      videos.insertOne(
        { name: videoName, path: videoPath },
        (error, result) => {
          if (error) {
            console.error(error);
            res.status(500).json({
              success: false,
              message: "Failed to insert video information into MongoDB",
            });
            return;
          }

          res.sendFile(videoPath, (error) => {
            if (error) {
              console.error(error);
              res
                .status(500)
                .json({ success: false, message: "Failed to send video" });
              return;
            }

            client.close();
          });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create video" });
  }
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
