const express = require('express');
const MentorImageModel = require('../Models/MentorImageModel');
const router = express.Router();
const model = require('../Models/MentorImageModel');

router.get('/', async (req, res) => {
  try {
    const images = await model.find();
    res.json(images);
  } catch (err) {
    res.json({ message: err });
  }
});

router.post('/', async (req, res) => {
  const newImage = new MentorImageModel({
    image_url: req.body.image_url,
  });

  try {
    const savedImage = await newImage.save();
    res.json(savedImage);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
