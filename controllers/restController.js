const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
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

    Restaurant.findAndCountAll({
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
        description: r.description.substring(0, 50)
      }))
      Category.findAll({ raw: true }).then(categories => {
        return res.render('restaurants', {
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
  getRestaurant: (req, res) => {
    Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        {
          model: Comment,
          include: [User]
        }
      ]
    }).then(restaurant => {
      restaurant.increment('viewCounts')
      return res.render('restaurant', {
        // nested eager loading時，似乎無法用options.nest和options.raw解決
        // 可用 restaurant: JSON.parse(JSON.stringify(restaurant))
        restaurant: restaurant.get({ plain: true })
      })
    })
  },
  getFeeds: (req, res) => {
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
        return res.render('feeds', {
          restaurants,
          comments
        })
      })
    })
  },
  getStat: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [Category],
      nest: true,
      raw: true
    }).then(restaurant => {
      Comment.findAndCountAll({
        where: { RestaurantId: restaurant.id },
        raw: true
      }).then(result => {
        return res.render('dashboard', {
          restaurant,
          result
        })
      })
    })
  }
}

module.exports = restController
