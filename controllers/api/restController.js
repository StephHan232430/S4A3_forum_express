const db = require('../../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const restService = require('../../services/restService')
const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
    restService.getRestaurants(req, res, data => {
      return res.json(data)
    })
  },
  getFeeds: (req, res) => {
    restService.getFeeds(req, res, data => {
      return res.json(data)
    })
  },
  getTopRestaurant: (req, res) => {
    restService.getTopRestaurant(req, res, data => {
      return res.json(data)
    })
  },
  getStat: (req, res) => {
    restService.getStat(req, res, data => {
      return res.json(data)
    })
  },
  getRestaurant: (req, res) => {
    restService.getRestaurant(req, res, data => {
      return res.json(data)
    })
  }
}

module.exports = restController
