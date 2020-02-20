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
        description: r.description.substring(0, 50),
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(
          r.id
        ),
        isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
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
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' },
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {
      const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(
        req.user.id
      )
      // 把藉由註冊關聯時命名的屬性撈出來的資料，逐個丟進map()處理後，產生由LikedUser們的id組成的array，再把passport驗證過的req.user的id拿來比對array，若array中有id和req.user的id一樣，includes()回傳true，並把true存成常數，供view判斷用
      const isLiked = restaurant.LikedUsers.map(d => d.id).includes(req.user.id)
      restaurant.increment('viewCounts')
      return res.render('restaurant', {
        // nested eager loading時，似乎無法用options.nest和options.raw解決
        // 可用 restaurant: JSON.parse(JSON.stringify(restaurant))
        restaurant: restaurant.get({ plain: true }),
        isFavorited,
        isLiked
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
  },
  getTopRestaurant: (req, res) => {
    // 呼叫model/restaurant.js中定義的關聯、別名
    return Restaurant.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }]
    }).then(restaurants => {
      // 將撈出的餐廳資料進行整理：
      restaurants = restaurants.map(restaurant => ({
        ...restaurant.dataValues,
        // description裁短
        description: restaurant.description.substring(0, 50),
        // 將收藏過此restaurant的user數，設定為此restaurant的FavoritedCount屬性，供後續view呈現
        FavoritedCount: restaurant.FavoritedUsers.length,
        // 比對目前登入者(req.user)收藏過的餐廳id群中是否包含逐個傳入的restaurant.id，並設為restaurant的isFavorited屬性，供後續view判斷
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(
          restaurant.id
        )
      }))
      // 依FavoritedCount數值大小排序後，取前10筆
      restaurants = restaurants
        .sort((a, b) => b.FavoritedCount - a.FavoritedCount)
        .slice(0, 10)
      return res.render('topRestaurant', { restaurants })
    })
  }
}

module.exports = restController
