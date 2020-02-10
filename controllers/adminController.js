const db = require('../models')
const Restaurant = db.Restaurant


const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll().then(restaurants => {
      return res.render('admin/restaurants', { restaurants: JSON.parse(JSON.stringify(restaurants)) })
    })
  }
}

module.exports = adminController