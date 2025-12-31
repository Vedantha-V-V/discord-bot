import express from 'express';

const app = express();
const PORT = process.env.PORT || 10000;

app.all('/', (req, res) => {
  res.send('Event Manager Bot is online.');
});

function keepAlive(){
    app.listen(PORT,()=>{
        console.log(`Server is ready on port ${PORT}.`);
    });
}

export default keepAlive;