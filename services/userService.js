const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userService = {
  addFavorite: (req, res, callback) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(restaurant => {
      return callback({ status: 'success', message: '' })
    })
  },
  removeFavorite: (req, res, callback) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(favorite => {
      favorite.destroy().then(restaurant => {
        return callback({ status: 'success', message: '' })
      })
    })
  },
  addLike: (req, res, callback) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(restaurant => {
      return callback({ status: 'success', message: '' })
    })
  },
  removeLike: (req, res, callback) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(Like => {
      Like.destroy().then(restaurant => {
        return callback({ status: 'success', message: '' })
      })
    })
  },
  getTopUser: (req, res, callback) => {
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      for (let user of users) {
        user.id === req.user.id
          ? (user.isLogged = true)
          : (user.isLogged = false)
      }
      return callback({ users })
    })
  },
  getUser: (req, res, callback) => {
    User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: [Restaurant] },
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    }).then(user => {
      const { Comments } = user
      let uniqueRestaurants = new Map()
      Comments.map(comment =>
        uniqueRestaurants.set(comment.RestaurantId, comment.Restaurant)
      )

      const loggedUserId = req.user.id
      const profileId = Number(req.params.id)
      if (loggedUserId === profileId) {
        user.dataValues.isLogged = true
      } else {
        user.dataValues.isFollowed = user.Followers.map(r => r.id).includes(
          req.user.id
        )
        user.dataValues.isLogged = false
      }

      return callback({
        profileUser: user.get({ plain: true }),
        uniqueRestaurants: [...uniqueRestaurants.values()]
      })
    })
  },
  putUser: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: "name didn't exist" })
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id).then(user => {
          user
            .update({
              name: req.body.name,
              image: file ? img.data.link : user.image
            })
            .then(user => {
              return callback({
                status: 'success',
                message: 'profile was successfully updated',
                userId: user.id
              })
            })
        })
      })
    } else {
      return User.findByPk(req.params.id).then(user => {
        user
          .update({
            name: req.body.name,
            image: user.image
          })
          .then(user => {
            return callback({
              status: 'success',
              message: 'profile was successfully updated',
              userId: user.id
            })
          })
      })
    }
  },
  addFollowing: (req, res, callback) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    }).then(followship => {
      return callback({ status: 'success', message: '' })
    })
  },
  removeFollowing: (req, res, callback) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    }).then(followship => {
      followship.destroy().then(followship => {
        return callback({ status: 'success', message: '' })
      })
    })
  }
}

module.exports = userService
