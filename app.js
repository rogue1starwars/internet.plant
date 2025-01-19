//app.js

const express = require("express");
const fileUpload = require("express-fileupload");

const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(
  fileUpload({
    limits: {
      fileSize: 10000000,
    },
    abordOnLimit: true,
  })
);
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use((err, req, res, next) => {
  if (err) {
    res.status(500).send("Something went wrong");
  }
});

process.on("uncaughtException", (err) => {
  console.error("There was an uncaught error", err);
  gracefulShutdown();
});

process.on("unhandledRejection", (err) => {
  console.error("There was an unhandled rejection", err);
  gracefulShutdown();
});

const gracefulShutdown = () => {
  console.log("Server is shutting down");
  server.close(() => {
    console.log("Server is shut down");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Server is not shutting down gracefully");
    process.exit(1);
  }, 10000);
};

app.set("view engine", "ejs");
app.set("views", "./views");

const FILE_PATH = path.join(__dirname, "file.txt");
const UPLOAD_PATH = path.join(__dirname, "public", "upload");

app.get("/", async (req, res) => {
  try {
    // Check if directories exist
    if (!fs.existsSync(UPLOAD_PATH)) {
      fs.mkdirSync(UPLOAD_PATH, { recursive: true });
    }

    console.log("Reading file from:", FILE_PATH); // Debug log

    const data = await fs.promises.readFile(FILE_PATH, "utf8");
    const files = await fs.promises.readdir(UPLOAD_PATH);

    const sortedFiles = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .sort()
      .reverse()
      .slice(0, 10);

    res.render("index", {
      message: data,
      images: sortedFiles,
    });
  } catch (error) {
    console.error("Error details:", {
      error: error.message,
      path: FILE_PATH,
      stack: error.stack,
    });
    res.status(500).send(`Server Error: ${error.message}`);
  }
});

app.get("/images", (req, res) => {
  res.render("upload");
});

app.post("/upload", async (req, res) => {
  const { image } = req.files;

  if (!image) return res.status(400).send("No image");

  if (!/^image/.test(image.mimetype))
    return res.status(400).send("Image not supported");

  const fileExt = path.extname(image.name);

  try {
    await image.mv(
      __dirname +
        "/public/upload/" +
        new Date()
          .toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
          .replaceAll("/", "-") +
        fileExt
    );
  } catch (error) {
    res.status(500).send("Error Uploading Image");
  }
  res.status(200).send("Data sent Successfully");
});

app.post("/send", (req, res) => {
  const { message } = req.body;
  fs.writeFile("file.txt", message, (err) => {
    if (err) {
      res.status(500).send("Error Sending Data");
    } else {
      res.send("Data sent successfully");
    }
  });
});

const server = app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running,and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});
