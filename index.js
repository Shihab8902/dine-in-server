require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');



const port = 9000;

//middlewares
app.use(cors({
    origin: [
        'http://localhost:5173'
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kitiq8p.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



//Verify a token
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send({ message: "unauthorized" });
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (error, decoded) => {
        if (error) {
            return res.status(401).send({ message: "unauthorized" });
        }
        req.user = decoded;
        next();
    })
}






async function run() {

    try {


        const foodsCollection = client.db('dineinDB').collection('foods');
        const usersCollection = client.db('dineinDB').collection("users");



        //create a token
        app.post("/jwt", async (req, res) => {
            try {
                const user = req.body;
                const token = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: "1h" });
                res.cookie("token", token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none"
                }).send({ message: "success" });
            }
            catch (error) {
                console.log(error);
            }
        });


        //Clear token
        app.get("/logout", (req, res) => {
            res.clearCookie('token').send({ message: "success" });
        });


        //Get top selling foods
        app.get("/topSelling", async (req, res) => {
            try {
                const result = await foodsCollection.find().sort({ purchaseCount: -1 }).limit(6).toArray();
                res.send(result);
            }
            catch (error) {
                console.log(error)
            }
        });

        //Get individual food
        app.get("/food/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await foodsCollection.findOne(query);
                res.send(result);
            }
            catch (error) {
                console.log(error)
            }

        });

        //Get specific user added food
        app.get("/myFood", verifyToken, async (req, res) => {
            try {
                const userEmail = req.query?.email;
                if (req.user.email !== userEmail) {
                    return res.status(403).send({ message: "forbidden" });
                }

                const query = { email: userEmail };
                const result = await foodsCollection.find(query).toArray();
                res.send(result);
            }
            catch (error) {
                console.log(error)
            }


        });

        //Get users
        app.get("/users", verifyToken, async (req, res) => {
            try {
                const result = await usersCollection.find().toArray();
                res.send(result);
            }
            catch (error) {
                console.log(error);
            }
        });


        //Add a new user
        app.post("/users", async (req, res) => {
            try {
                const user = req.body;
                await usersCollection.insertOne(user);
                res.send({ message: "success" })
            }
            catch (error) {
                console.log(error);
            }
        });


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);








app.get("/", (req, res) => {
    res.send({ status: "The server is up and running...." });
});

app.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`);
});