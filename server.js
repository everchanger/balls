const express = require('express')
const app = express()
const port = 3000

app.get('/*', (req, res) => {
  let fileToGet = req.path
  if (req.path === '/') {
    fileToGet = '/index.html'
  }
  res.sendFile(__dirname + fileToGet);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})