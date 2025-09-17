import app from './app';




const port = 3000;
// Server setup
app.listen(port, () => {
    console.log(`Graveller hosting on http://localhost:${port}/`);
});
