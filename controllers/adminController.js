const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const adminService = require('../services/adminService')

const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, data => {
      return res.render('admin/restaurants', data)
    })
  },
  createRestaurant: (req, res) => {
    Category.findAll({
      raw: true
    }).then(categories => {
      return res.render('admin/create', {
        categories
      })
    })
  },
  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, data => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/restaurants')
    })
  },
  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, data => {
      return res.render('admin/restaurant', data)
    })
  },
  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [Category],
      nest: true,
      raw: true
    }).then(restaurant => {
      Category.findAll({
        raw: true
      }).then(categories => {
        return res.render('admin/create', {
          restaurant,
          categories
        })
      })
    })
  },
  putRestaurant: (req, res) => {
    let {
      name,
      tel,
      address,
      opening_hours,
      description,
      categoryId
    } = req.body
    if (!name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id).then(restaurant => {
          restaurant
            .update({
              name,
              tel,
              address,
              opening_hours,
              description,
              image: file ? img.data.link : restaurant.image,
              CategoryId: categoryId
            })
            .then(restaurant => {
              req.flash(
                'success_messages',
                'restaurant was successfully updated'
              )
              res.redirect('/admin/restaurants')
            })
        })
      })
    } else {
      return Restaurant.findByPk(req.params.id).then(restaurant => {
        restaurant
          .update({
            name,
            tel,
            address,
            opening_hours,
            description,
            image: restaurant.image,
            CategoryId: categoryId
          })
          .then(restaurant => {
            req.flash('success_messages', 'restaurant was successfully updated')
            res.redirect('/admin/restaurants')
          })
      })
    }
  },
  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, data => {
      if (data['status'] === 'success') {
        return res.redirect('/admin/restaurants')
      }
    })
  },

  // 使用者權限管理
  // 顯示使用者清單
  getUsers: (req, res) => {
    return User.findAll({
      raw: true
    }).then(users => {
      // 登入中使用者不顯示權限變換選項
      let loggedUserId = req.user.id
      for (user of users) {
        if (user.id === loggedUserId) {
          user.showLink = false
        } else {
          user.showLink = true
        }
      }
      return res.render('admin/users', {
        users
      })
    })
  },
  // 修改使用者權限
  putUser: (req, res) => {
    return User.findByPk(req.params.id).then(user => {
      user
        .update({
          isAdmin: !user.isAdmin
        })
        .then(user => {
          req.flash(
            'success_messages',
            `Role of ${user.email} was successfully changed`
          )
          res.redirect('/admin/users')
        })
    })
  }
}

module.exports = adminController
