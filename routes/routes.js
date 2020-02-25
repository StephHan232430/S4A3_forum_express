const express = require('express')
const router = express.Router()

const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const categoryController = require('../controllers/categoryController')
const commentController = require('../controllers/commentController')
const passport = require('../config/passport')
const multer = require('multer')
const upload = multer({
  dest: 'temp/'
})

const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/signin')
}

const authenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin) {
      return next()
    }
    return res.redirect('/')
  }
  res.redirect('/signin')
}

// Done
router.get('/', authenticated, (req, res) => res.redirect('/restaurants'))

// Done
router.get('/restaurants', authenticated, restController.getRestaurants)

// Done
router.get('/restaurants/feeds', authenticated, restController.getFeeds)

// Done
router.get('/restaurants/top', authenticated, restController.getTopRestaurant)

// Done
router.get('/restaurants/:id/stat', authenticated, restController.getStat)

// Done
router.get('/restaurants/:id', authenticated, restController.getRestaurant)

// Done
router.post(
  '/favorite/:restaurantId',
  authenticated,
  userController.addFavorite
)

// Done
router.delete(
  '/favorite/:restaurantId',
  authenticated,
  userController.removeFavorite
)

// Done
router.post('/like/:restaurantId', authenticated, userController.addLike)

// Done
router.delete('/like/:restaurantId', authenticated, userController.removeLike)

// Done
router.post('/comments', authenticated, commentController.postComment)

// Done
router.delete(
  '/comments/:id',
  authenticatedAdmin,
  commentController.deleteComment
)

// Done
router.get('/users/top', authenticated, userController.getTopUser)

// Done
router.get('/users/:id', authenticated, userController.getUser)

// 免
router.get('/users/:id/edit', authenticated, userController.editUser)

// Done
router.put(
  '/users/:id',
  authenticated,
  upload.single('image'),
  userController.putUser
)

// Done
router.post('/following/:userId', authenticated, userController.addFollowing)

// Done
router.delete(
  '/following/:userId',
  authenticated,
  userController.removeFollowing
)

// Done
router.get('/admin', authenticatedAdmin, (req, res) =>
  res.redirect('/admin/restaurants')
)

// Done
router.get(
  '/admin/restaurants',
  authenticatedAdmin,
  adminController.getRestaurants
)

// 免
router.get(
  '/admin/restaurants/create',
  authenticatedAdmin,
  adminController.createRestaurant
)

// Done
router.post(
  '/admin/restaurants',
  authenticatedAdmin,
  upload.single('image'),
  adminController.postRestaurant
)

// Done
router.get(
  '/admin/restaurants/:id',
  authenticatedAdmin,
  adminController.getRestaurant
)

// 免
router.get(
  '/admin/restaurants/:id/edit',
  authenticatedAdmin,
  adminController.editRestaurant
)

// Done
router.put(
  '/admin/restaurants/:id',
  authenticatedAdmin,
  upload.single('image'),
  adminController.putRestaurant
)

// Done
router.delete(
  '/admin/restaurants/:id',
  authenticatedAdmin,
  adminController.deleteRestaurant
)

// Done
router.get('/admin/users', authenticatedAdmin, adminController.getUsers)

// Done
router.put('/admin/users/:id', authenticatedAdmin, adminController.putUser)

// Done
router.get(
  '/admin/categories',
  authenticatedAdmin,
  categoryController.getCategories
)

// Done
router.post(
  '/admin/categories',
  authenticatedAdmin,
  categoryController.postCategory
)

// Done
router.get(
  '/admin/categories/:id',
  authenticatedAdmin,
  categoryController.getCategories
)

// Done
router.put(
  '/admin/categories/:id',
  authenticatedAdmin,
  categoryController.putCategory
)

// Done
router.delete(
  '/admin/categories/:id',
  authenticatedAdmin,
  categoryController.deleteCategory
)

// 免？
router.get('/signup', userController.signUpPage)

// Done
router.post('/signup', userController.signUp)

// 免？
router.get('/signin', userController.signInPage)

// Done
router.post(
  '/signin',
  passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true
  }),
  userController.signIn
)

router.get('/logout', userController.logout)

module.exports = router
