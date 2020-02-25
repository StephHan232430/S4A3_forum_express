const express = require('express')
const router = express.Router()

const adminController = require('../controllers/api/adminController')
const categoryController = require('../controllers/api/categoryController')
const userController = require('../controllers/api/userController')
const restController = require('../controllers/api/restController')
const commentController = require('../controllers/api/commentController')
const passport = require('../config/passport')

const multer = require('multer')
const upload = multer({
  dest: 'temp/'
})

const authenticated = passport.authenticate('jwt', { session: false })

const authenticatedAdmin = (req, res, next) => {
  if (req.user) {
    if (req.user.isAdmin) {
      return next()
    }
    return res.json({ status: 'error', message: 'permission denied' })
  } else {
    return res.json({ status: 'error', message: 'permission denied' })
  }
}

router.post('/signup', userController.signUp)

router.post('/signin', userController.signIn)

router.get('/', authenticated, (req, res) => res.redirect('/api/restaurants'))

router.get('/restaurants', authenticated, restController.getRestaurants)

router.get('/restaurants/feeds', authenticated, restController.getFeeds)

router.get('/restaurants/top', authenticated, restController.getTopRestaurant)

router.get('/restaurants/:id/stat', authenticated, restController.getStat)

router.get('/restaurants/:id', authenticated, restController.getRestaurant)

router.post(
  '/favorite/:restaurantId',
  authenticated,
  userController.addFavorite
)

router.delete(
  '/favorite/:restaurantId',
  authenticated,
  userController.removeFavorite
)

router.post('/like/:restaurantId', authenticated, userController.addLike)

router.delete('/like/:restaurantId', authenticated, userController.removeLike)

router.post('/comments', authenticated, commentController.postComment)

router.delete(
  '/comments/:id',
  authenticated,
  authenticatedAdmin,
  commentController.deleteComment
)

router.get('/users/top', authenticated, userController.getTopUser)

router.get('/users/:id', authenticated, userController.getUser)

router.put(
  '/users/:id',
  authenticated,
  upload.single('image'),
  userController.putUser
)

router.post('/following/:userId', authenticated, userController.addFollowing)

router.delete(
  '/following/:userId',
  authenticated,
  userController.removeFollowing
)

router.get('/admin', authenticatedAdmin, (req, res) =>
  res.redirect('/api/admin/restaurants')
)

router.get(
  '/admin/users',
  authenticated,
  authenticatedAdmin,
  adminController.getUsers
)

router.put(
  '/admin/users/:id',
  authenticated,
  authenticatedAdmin,
  adminController.putUser
)

router.get(
  '/admin/categories/:id',
  authenticated,
  authenticatedAdmin,
  categoryController.getCategories
)

router.get(
  '/admin/restaurants',
  authenticated,
  authenticatedAdmin,
  adminController.getRestaurants
)

router.post(
  '/admin/restaurants',
  authenticated,
  authenticatedAdmin,
  upload.single('image'),
  adminController.postRestaurant
)

router.put(
  '/admin/restaurants/:id',
  authenticated,
  authenticatedAdmin,
  upload.single('image'),
  adminController.putRestaurant
)

router.get(
  '/admin/restaurants/:id',
  authenticated,
  authenticatedAdmin,
  adminController.getRestaurant
)

router.get(
  '/admin/categories',
  authenticated,
  authenticatedAdmin,
  categoryController.getCategories
)

router.post(
  '/admin/categories',
  authenticated,
  authenticatedAdmin,
  categoryController.postCategory
)

router.put(
  '/admin/categories/:id',
  authenticated,
  authenticatedAdmin,
  categoryController.putCategory
)

router.delete(
  '/admin/categories/:id',
  authenticated,
  authenticatedAdmin,
  categoryController.deleteCategory
)

router.delete(
  '/admin/restaurants/:id',
  authenticated,
  authenticatedAdmin,
  adminController.deleteRestaurant
)

module.exports = router
