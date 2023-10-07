import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs'

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

const upload = multer({
  dest: './upload/',
  fileFilter: (_req, file, callback) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/svg+xml'
    ) {
      callback(null, true)
    } else {
      callback(null, false)
    }
  },
  storage: multer.diskStorage({
    filename: function (_req, file, callback) {
      if (!/^[a-zA-Z]/.test(file.originalname)) {
        return callback(null, Date.now() + '-file')
      }
      callback(null, Date.now() + '-' + file.originalname)
    },
    destination: function (_req, _file, callback) {
      callback(null, 'upload')
    },
  }),
  limits: { fieldSize: 5 * 1024 * 1024 },
})

app.post('/upload', upload.single('image'), (_req, res) => {
  res.send('File uploaded')
})

app.get('/get', async (_req, res) => {
  const files = fs.readdirSync('./upload/')
  let fileList: string[] = []
  files.forEach((file) => {
    fileList.push('http://localhost:8080/display?name=' + file)
  })
  res.send(fileList)
})

app.get('/display', async (req, res) => {
  const name = req.query.name
  res.sendFile(name as string, { root: './upload' })
})

app.delete('/delete', async (req, res) => {
  const name = req.query.name
  fs.unlinkSync('./upload/' + name)
  res.send('File deleted')
})

app.listen(8080, () => {
  console.log('Listening on port 8080')
})
