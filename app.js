// app.js
const http = require("http");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

const ffmpeg = require("fluent-ffmpeg");

// 핑퐁을 적극적으로 활용하기 위해 app의 express()메소드를 발동시킬 것이다
app = express();
//app.use는 수많은 패키지를 사용할 수 있게 하는 미들웨어이다
app.use(express.json());
app.use(cors());
app.use(morgan("combined")); // 로깅 패키지 | 옵션: dev, tiny, combined

// dotenv.config(): 환경변수를 활용할 수 있게 하는 메서드
dotenv.config();

// 기본 api : 사진 정적인
app.get("/video", async (req, res) => {
  const outputVideoPath = `video-${Date.now()}.mp4`;
  await ffmpeg()
    .input("pic.jpeg")
    .inputOptions(["-loop", "1"])
    // .inputOptions(["-loop", "1", "-t", "2", "-vf", "scale=320:240"])
    // .outputOptions(["-loop", "4", "-t", "4", "-vf", "scale=320:240"])
    // .outputOptions(["-t", "3", "-vf", "fade=out:50:25", "scale=320:240"])
    .outputOptions(["-t", "3", "-vf", "scale=320:240"])
    .videoFilters("fade=out:50:25")
    .output(outputVideoPath)
    .on("end", () => {
      // res.sendFile(outputVideoPath, { root: __dirname });
      res.json({ message: "success" });
    })
    .run();
  // res.json({ message: "success" });
});

// 기본 api : 사진 정적인
app.get("/video2", async (req, res) => {
  const imgurl = req.query.imgurl;
  const outputVideoPath = `video-${Date.now()}.mp4`;
  await ffmpeg()
    .input(imgurl)
    .inputOptions(["-loop", "1"])
    // .inputOptions(["-loop", "1", "-t", "2", "-vf", "scale=320:240"])
    // .outputOptions(["-loop", "4", "-t", "4", "-vf", "scale=320:240"])
    // .outputOptions(["-t", "3", "-vf", "fade=out:50:25", "scale=320:240"])
    .outputOptions(["-t", "3", "-vf", "scale=320:240"])
    .videoFilters("fade=out:50:25")
    .output(outputVideoPath)
    .on("end", () => {
      // res.sendFile(outputVideoPath, { root: __dirname });
      res.json({ message: "success" });
    })
    .run();
  // res.json({ message: "success" });
});

// fade out : API
app.get("/fade", async (req, res) => {
  const outputVideoPath = `video-${Date.now()}.mp4`;
  await ffmpeg()
    .input("video-1676228758492.mp4")
    .videoFilters("fade=out:50:25")
    .output(outputVideoPath)
    .on("end", () => {
      // res.sendFile(outputVideoPath, { root: __dirname });
      res.json({ message: "success" });
    })
    .run();
  // res.json({ message: "success" });
});

// Merge Video : API
app.get("/merge", async (req, res) => {
  // const outputVideoPath = `video-${Date.now()}.mp4`;
  const videoList = ["video-1676228758492.mp4", "video-1676228879302.mp4"];
  const mergedVideo = ffmpeg();

  videoList.forEach(function (v) {
    mergedVideo = mergedVideo.addInput(v);
  });

  mergedVideo
    .mergeToFile(`merged-${Date.now()}`)
    .on("end", () => {
      // res.sendFile(outputVideoPath, { root: __dirname });
      res.json({ message: "success" });
    })
    .run();
  // res.json({ message: "success" });
});

app.get("/merge2", async (req, res) => {
  var mergedVideo = ffmpeg();
  var videoNames = ["video-1676228758492.mp4", "video-1676228879302.mp4"];

  videoNames.forEach(function (videoName) {
    mergedVideo = mergedVideo.addInput(videoName);
  });

  mergedVideo
    .mergeToFile("./mergedVideo.mp4")
    .on("error", function (err) {
      console.log("Error " + err.message);
    })
    .on("end", function () {
      console.log("Finished!");
    });
});

app.get("/render", async (req, res, next) => {
  console.log(req.query);
  try {
    // const imagePath = req.query.image;
    const imagePath = "./pic.jpeg";
    console.log(imagePath);
    const videoName = `video-${Date.now()}.mp4`;

    //   ffmpeg('image1.png')
    // .loop(10)
    // .output('tmp/ouput.mp4')
    // .on('error', (error) => {...})
    // .on('end', () => {...}).run();

    ffmpeg(imagePath)
      .loop(20)
      .output(`./video/${videoName}`)
      .on("error", (error) => {
        console.log(error);
        // next(error)
      })
      .on("end", () => {
        console.log("file has been converted successfully");
      })
      .run();

    res.json({ message: "success" });
  } catch {
    console.log(imagePath, type(imagePath));
    res.json({ message: "fail" });
  }
});

// /ping 이라는 타겟 리소스에 요청이 들어오면 pong을 보낸다는 메시지
// health check
app.get("/ping", (req, res) => {
  console.log(req.query);
  res.json({ message: "pong" });
});

// 위에 선언한 http로 서버를 열어주어야 한다
const server = http.createServer(app);
//dotenv의 환경변수로 저장된 포트번호를 불러올 것이다
const PORT = process.env.PORT;

const start = async () => {
  // 포트번호에 맞게 서버를 잘 동작시켜 모든 것들을 서버로서 계속 듣고 있겠다
  server.listen(PORT, () => console.log(`Server is listening on ${PORT}`));
};
// start를 실행하겠다
start();
