import app from './app';


const port = process.env.GRAVELLER_PORT || 3000;
// Server setup
app.listen(port, () => {
    console.log(`Graveller hosting on http://localhost:${port}/`);
});
