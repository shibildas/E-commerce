var mongoose = require('mongoose');
var db = mongoose.connection;


mongoose.set('strictQuery', true);
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser:true, 
    useUnifiedTopology:true})

    db.once('open',()=> console.log('Connected to Mongoose '));
    db.on('error',error=> console.error(error));
    db.on('disconnected',()=>{
        console.log('Mongoose Disconnected');
    });

    // process.on('SIGINT', async()=>{
    //     await mongoose.connection.close();
    //     process.exit(0);
    // })
module.exports = mongoose.connection







