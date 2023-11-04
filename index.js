require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();


const port = 9000;

//middlewares
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kitiq8p.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {

    try {

        const foodsCollection = client.db('dineinDB').collection('foods');


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