require('dotenv').config();
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error', err));

const dressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  sold: { type: Boolean, default: false }
});
const Dress = mongoose.model('Dress', dressSchema);

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'geno-thrifts' },
      (error, result) => error ? reject(error) : resolve(result)
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

app.get('/api/dresses', async (req, res) => {
  const dresses = await Dress.find({ sold: false }).sort({ _id: -1 });
  res.json(dresses);
});

app.get('/api/admin/dresses', async (req, res) => {
  const dresses = await Dress.find().sort({ _id: -1 });
  res.json(dresses);
});

app.post('/api/admin/dresses', upload.single('image'), async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || !price || !req.file) {
      return res.status(400).json({ error: 'Name, price, and image are required' });
    }
    const result = await uploadToCloudinary(req.file.buffer);
    const dress = new Dress({
      name,
      price: Number(price),
      image: result.secure_url,
      sold: false
    });
    await dress.save();
    res.json(dress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.put('/api/admin/dresses/:id/sold', async (req, res) => {
  const dress = await Dress.findByIdAndUpdate(req.params.id, { sold: true }, { new: true });
  if (!dress) return res.status(404).json({ error: 'Not found' });
  res.json(dress);
});

app.put('/api/admin/dresses/:id/unsold', async (req, res) => {
  const dress = await Dress.findByIdAndUpdate(req.params.id, { sold: false }, { new: true });
  if (!dress) return res.status(404).json({ error: 'Not found' });
  res.json(dress);
});

app.delete('/api/admin/dresses/:id', async (req, res) => {
  await Dress.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));