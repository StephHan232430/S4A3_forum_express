const express = require('express')
const router = express.Router()

const adminController = require('../controllers/api/adminController')
const categoryController = require('../controllers/api/categoryController')
const multer = require('multer')
const upload = multer({
  dest: 'temp/'
})

router.get('/admin/restaurants', adminController.getRestaurants)

router.post(
  '/admin/restaurants',
  upload.single('image'),
  adminController.postRestaurant
)

// 後台修改個別餐廳
router.put(
  '/admin/restaurants/:id',
  upload.single('image'),
  adminController.putRestaurant
)

router.get('/admin/restaurants/:id', adminController.getRestaurant)

router.get('/admin/categories', categoryController.getCategories)

router.delete('/admin/restaurants/:id', adminController.deleteRestaurant)

module.exports = router
