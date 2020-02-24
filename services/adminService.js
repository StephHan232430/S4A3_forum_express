const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({
      include: [Category],
      nest: true,
      raw: true
    }).then(restaurants => callback({ restaurants }))
  },
  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, {
      include: [Category],
      nest: true,
      raw: true
    }).then(restaurant => {
      callback({ restaurant })
    })
  },
  postRestaurant: (req, res, callback) => {
    let {
      name,
      tel,
      address,
      opening_hours,
      description,
      categoryId
    } = req.body
    if (!name) {
      return callback({ status: 'error', message: "name didn't exist" })
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name,
          tel,
          address,
          opening_hours,
          description,
          image: file ? img.data.link : null,
          CategoryId: categoryId
        }).then(restaurant => {
          callback({
            status: 'success',
            message: 'restaurant was successfully created'
          })
        })
      })
    } else {
      return Restaurant.create({
        name,
        tel,
        address,
        opening_hours,
        description,
        CategoryId: categoryId
      }).then(restaurant => {
        callback({
          status: 'success',
          message: 'restaurant was successfully created'
        })
      })
    }
  },

  // 後台修改個別餐廳
  putRestaurant: (req, res, callback) => {
    let {
      name,
      tel,
      address,
      opening_hours,
      description,
      categoryId
    } = req.body
    if (!name) {
      return callback({ status: 'error', message: "name didn't exist" })
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
              return callback({
                status: 'success',
                message: 'restaurant was successfully updated'
              })
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
            return callback({
              status: 'success',
              message: 'restaurant was successfully updated'
            })
          })
      })
    }
  },
  deleteRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      restaurant.destroy().then(restaurant => {
        callback({ status: 'success', message: '' })
      })
    })
  }
}

module.exports = adminService
