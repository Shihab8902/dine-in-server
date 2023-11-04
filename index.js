require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const port = 9000;

//middlewares
app.use(cors());
app.use(express.json());











app.get("/", (req, res) => {
    res.send({ status: "The server is up and running...." });
});

app.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`);
});