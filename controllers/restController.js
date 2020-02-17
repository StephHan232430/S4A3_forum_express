const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const restController = {
  getRestaurants: (req, res) => {
    Restaurant.findAll({
      include: Category,
      nest: true,
      raw: true
    }).then(restaurants => {
      const data = restaurants.map(r => ({
        ...r,
        description: r.description.substring(0, 50)
      }))
      return res.render('restaurants', {
        restaurants: data
      })
    })
  },
  getRestaurant: (req, res) => {
    Restaurant.findByPk(req.params.id, {
      include: Category,
      nest: true,
      raw: true
    }).then(restaurant => {
      return res.render('restaurant', {
        restaurant
      })
    })
  }
}

module.exports = restController