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

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: (req, res) => {
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(
              req.body.password,
              bcrypt.genSaltSync(10),
              null
            )
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  // 瀏覽profile
  getUser: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        // { model: Comment, include: [Restaurant] },
        { model: Restaurant, as: 'CommentedRestaurants' },
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    }).then(user => {
      // console.log(user.CommentedRestaurants[0].Comment)
      // const { Comments } = user
      // let uniqueRestaurants = new Map()
      // Comments.map(comment =>
      //   uniqueRestaurants.set(comment.RestaurantId, comment.Restaurant)
      // )

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

      return res.render('profile', {
        profileUser: user.get({ plain: true })
        // uniqueRestaurants: [...uniqueRestaurants.values()]
      })
    })
  },
  // 瀏覽編輯profile頁面
  editUser: (req, res) => {
    // 不得透過改網址列切換到其他使用者的profile編輯頁面，若更改則導回登入頁面
    if (Number(req.params.id) === req.user.id) {
      User.findByPk(req.params.id, { raw: true }).then(user => {
        return res.render('editProfile', { user })
      })
    } else {
      req.flash('error_messages', '非法操作，請重新登入！')
      req.logout()
      res.redirect('/signin')
    }
  },
  // 編輯profile
  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', 'Name欄位不得空白！')
      return res.redirect('back')
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
              req.flash(
                'success_messages',
                'Your profile was successfully updated!'
              )
              res.redirect(`/users/${user.id}`)
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
            req.flash(
              'success_messages',
              'Your profile was successfully updated!'
            )
            res.redirect(`/users/${user.id}`)
          })
      })
    }
  },
  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(restaurant => {
      return res.redirect('back')
    })
  },
  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(favorite => {
      favorite.destroy().then(restaurant => {
        return res.redirect('back')
      })
    })
  },
  addLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(restaurant => {
      // 為什麼是傳restaurant進來?
      return res.redirect('back')
    })
  },
  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(Like => {
      Like.destroy().then(restaurant => {
        // why restaurant again?
        return res.redirect('back')
      })
    })
  },
  getTopUser: (req, res) => {
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
      console.log(users)
      return res.render('topUser', { users })
    })
  },
  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    }).then(followship => {
      return res.redirect('back')
    })
  },
  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    }).then(followship => {
      followship.destroy().then(followship => {
        // 為何和removeFavorite不同，改傳入followship？
        return res.redirect('back')
      })
    })
  }
}

module.exports = userController
