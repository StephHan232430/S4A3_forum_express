const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
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
    // 不得透過改網址列params切換到其他使用者的profile頁面，若更改則導回登入頁面
    if (Number(req.params.id) === req.user.id) {
      User.findByPk(req.params.id, { raw: true }).then(user => {
        return res.render('profile', { user })
      })
    } else {
      req.flash('error_messages', '非法操作，請重新登入！')
      req.logout()
      res.redirect('/signin')
    }
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
  }
}

module.exports = userController
