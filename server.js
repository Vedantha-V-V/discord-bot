import express from 'express';

const app = express();
const PORT = process.env.PORT || 10000;

app.all('/', (req, res) => {
  res.send('Event Manager Bot is online.');
});

function keepAlive(){
    app.listen(10000,()=>{
        console.log("Server is ready.")
    })
}

export default keepAlive