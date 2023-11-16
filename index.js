require("dotenv").config()
const express = require("express");
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');

const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors())


const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }
  const token = authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}
app.get('/', (req, res) => {
  res.send('summer server is running')

})
const uri = `mongodb+srv://${process.env.PRO_USER}:${process.env.PRO_PASS}@cluster0.nlw4swl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
  try {


    const usersCollection = client.db('creative_zone').collection('users');
    const courseCollection = client.db('creative_zone').collection('courses');
    


    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d'
      })

      res.send({ token })
    })

    app.get('/users', verifyJWT, async (req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })
    app.get('/createCourse', async (req, res) => {
      const result = await courseCollection.find().toArray()
   
      res.send(result)
    })

   app.post('/users', async (req, res) => {
      const user = req.body;
      console.log(user)
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query)
      console.log('existing user', existingUser)
      if (existingUser) {
        return res.json('user already exist ')

      }
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })
    app.patch('/users/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { email: email }
      const updateRole = req.body;
      console.log(updateRole)
      const updateDoc = {
        $set: {
          role: updateRole.role,
        }
      }
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.send(result)
    })
    app.get('/users/:email', async (req, res) => {
        const userEmail = req.params.email;
      
        try {

      
          const user = await usersCollection.findOne({ email: userEmail });
      
          if (user) {
            res.json(user);
          } else {
            res.status(404).json({ message: 'User not found' });
          }
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      });


    app.post('/createCourse', async (req, res) => {
      const course = req.body;
      const result = await courseCollection.insertOne(course)
      res.send(result)
    })
    
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log('creative zone port console is running')
})