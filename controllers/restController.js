const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const restService = require('../services/restService')
const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
    restService.getRestaurants(req, res, data => {
      return res.render('restaurants', data)
    })
  },
  getRestaurant: (req, res) => {
    restService.getRestaurant(req, res, data => {
      return res.render('restaurant', data)
    })
  },
  getFeeds: (req, res) => {
    restService.getFeeds(req, res, data => {
      return res.render('feeds', data)
    })
  },
  getStat: (req, res) => {
    restService.getStat(req, res, data => {
      return res.render('dashboard', data)
    })
  },
  getTopRestaurant: (req, res) => {
    restService.getTopRestaurant(req, res, data => {
      return res.render('topRestaurant', data)
    })
  }
}

module.exports = restController
