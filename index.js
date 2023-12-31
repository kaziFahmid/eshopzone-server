const express = require('express')
const app = express()
const port = process.env.PORT||5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var cors = require('cors')
app.use(cors())
app.use(express.json())

require('dotenv').config()





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f7zs7lw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const eshopzoneProductCollections = client.db("eshopzoneproductDB").collection("eshopzoneProductCollections");
    const eshopzoneUserCollections = client.db("eshopzoneUserDB").collection("eshopzoneUserCollections");

    const eshopzoneOrderCollections = client.db("eshopzoneOrderDB").collection("eshopzoneOrderCollections");
  

    app.get('/orderlists', async(req, res) => {
      let query={}
      if(req.query?.email){
        query={email:req.query?.email}
      }

      const result= await eshopzoneOrderCollections.find(query).toArray()
      res.send(result)
    
    })


    app.post('/orderlists', async (req, res) => {
      const order = req.body;
      const { productId, email } = order;
    
      try {
        const existingOrder = await eshopzoneOrderCollections.findOne({
          productId,
          email,
        });
    
        if (existingOrder) {
          const newQuantity = existingOrder.quantity + 1;
          const result = await eshopzoneOrderCollections.updateOne(
            { _id: existingOrder._id }, // Use '_id' of the existing order to identify it in the update query
            { $set: { quantity: newQuantity } } // Use '$set' to update the 'quantity' field
          );
          res.send(result);
        } else {
          const newOrder = { ...order, quantity: 1 };
          const result = await eshopzoneOrderCollections.insertOne(newOrder);
          res.send(result);
        }
      } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({ message: 'Error processing order' });
      }
    });




    app.delete('/orderlists/:id', async (req, res) => {
      const id=req.params.id

      const filter={_id: new ObjectId(id)}
   
      const result = await eshopzoneOrderCollections.deleteOne(filter);
      res.send(result)
    });

    app.delete('/orderlists', async (req, res) => {
      try {
        const result = await eshopzoneOrderCollections.deleteMany({});
        res.send(result);
      } catch (error) {
        console.error('Error deleting all orders:', error);
        res.status(500).json({ message: 'Error deleting all orders' });
      }
    });



    app.patch('/orderlists/:id', async (req, res) => {
      const id=req.params.id
      const increasing=req.body.increament
      const Decreasing=req.body.decrease
      const filter={_id: new ObjectId(id)}
      let order= await eshopzoneOrderCollections.findOne(filter)
   if(!order){
  res.send({message:"order not found"})
   }
   const updateDoc = {
    $set: {
      quantity: order.quantity+increasing||order.quantity-Decreasing
    },
    
  }
      const result = await eshopzoneOrderCollections.updateOne(filter,updateDoc);
      res.send(result)
    });
















  app.get('/products', async(req, res) => {
    let query={}
    if (req.query?.search) {
      query.title = { $regex: req.query.search, $options: "i" };
    }
    if (req.query?.category && req.query?.category!=='all' ) {
      query.category =  req.query.category
    }
      const result= await eshopzoneProductCollections.find(query).toArray()
      res.send(result)
    
    })


    app.post('/allusers',async (req, res) => {
      const users=req.body
      const existingUser=await eshopzoneUserCollections.findOne({email:users.email})
      if(existingUser){
          return res.send({message:"user already exist"})
      }
      const user=await eshopzoneUserCollections.insertOne(users)
      res.send(user)
    })
    







app.get('/allusers',async(req,res)=>{
  const result= await eshopzoneUserCollections.find().toArray()
  res.send(result)
})






    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})