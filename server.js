import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.all('/', (req, res) => {
  res.send('Event Manager Bot is online.');
});

function keepAlive(){
    app.listen(3000,()=>{
        console.log("Server is ready.")
    })
}

export default keepAlive