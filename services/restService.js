const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10

const restService = {
  getRestaurants: (req, res, callback) => {
    let offset = 0 // 偏移幾筆後“開始”算
    let whereQuery = {}
    let categoryId = ''

    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }

    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery['CategoryId'] = categoryId
    }

    return Restaurant.findAndCountAll({
      include: Category,
      where: whereQuery,
      nest: true,
      raw: true,
      offset,
      limit: pageLimit
    }).then(result => {
      let page = Number(req.query.page) || 1
      let pages = Math.ceil(result.count / pageLimit)
      let totalPage = Array.from({ length: pages }).map(
        (item, index) => index + 1 // array是給handlebars的each-helper用的，產生分頁按鈕的數字
      )
      let prev = page - 1 < 1 ? 1 : page - 1
      let next = page + 1 > pages ? pages : page + 1
      const data = result.rows.map(r => ({
        ...r,
        description: r.description.substring(0, 50),
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(
          r.id
        ),
        isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
      }))
      Category.findAll({ raw: true }).then(categories => {
        callback({
          restaurants: data,
          categories,
          categoryId,
          page,
          totalPage,
          prev,
          next
        })
      })
    })
  },
  getFeeds: (req, res, callback) => {
    return Restaurant.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [Category],
      nest: true,
      raw: true
    }).then(restaurants => {
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant],
        nest: true,
        raw: true
      }).then(comments => {
        return callback({
          restaurants,
          comments
        })
      })
    })
  },
  getTopRestaurant: (req, res, callback) => {
    return Restaurant.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }]
    }).then(restaurants => {
      restaurants = restaurants.map(restaurant => ({
        ...restaurant.dataValues,
        description: restaurant.description.substring(0, 50),
        FavoritedCount: restaurant.FavoritedUsers.length,
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(
          restaurant.id
        )
      }))
      restaurants = restaurants
        .sort((a, b) => b.FavoritedCount - a.FavoritedCount)
        .slice(0, 10)
      return callback({ restaurants })
    })
  },
  getStat: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, {
      include: [Category],
      nest: true,
      raw: true
    }).then(restaurant => {
      Comment.findAndCountAll({
        where: { RestaurantId: restaurant.id },
        raw: true
      }).then(result => {
        return callback({
          restaurant,
          result
        })
      })
    })
  },
  getRestaurant: (req, res, callback) => {
    Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' },
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {
      const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(
        req.user.id
      )
      const isLiked = restaurant.LikedUsers.map(d => d.id).includes(req.user.id)
      restaurant.increment('viewCounts')
      return callback({
        restaurant: restaurant.get({ plain: true }),
        isFavorited,
        isLiked
      })
    })
  }
}

module.exports = restService
