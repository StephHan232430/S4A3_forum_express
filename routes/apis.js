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

// 後台瀏覽個別餐廳
router.get('/admin/restaurants/:id', adminController.getRestaurant)

// 後台瀏覽全部類別
router.get('/admin/categories', categoryController.getCategories)

// 後台刪除單一餐廳
router.delete('/admin/restaurants/:id', adminController.deleteRestaurant)

module.exports = router
