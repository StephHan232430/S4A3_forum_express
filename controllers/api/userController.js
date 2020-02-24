const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User

const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

let userController = {
  signUp: (req, res) => {
    const { passwordCheck, password, email } = req.body
    if (passwordCheck !== password) {
      return res.json({ status: 'error', message: '兩次密碼輸入不同！' })
    } else {
      User.findOne({ email }).then(user => {
        if (user) {
          return res.json({ status: 'error', message: '信箱重複！' })
        } else {
          User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            return res.json({ status: 'success', message: '成功註冊帳號！' })
          })
        }
      })
    }
  },

  signIn: (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
      return res.json({
        status: 'error',
        message: "required fields didn't exist"
      })
    }

    User.findOne({ where: { email } }).then(user => {
      if (!user)
        return res
          .status(401)
          .json({ status: 'error', message: 'no such user found' })
      if (!bcrypt.compareSync(password, user.password)) {
        return res
          .status(401)
          .json({ status: 'error', message: 'password did not match' })
      }

      const { id, name, email, isAdmin } = user
      let payload = { id }
      const token = jwt.sign(payload, process.env.JWT_SECRET)
      return res.json({
        status: 'success',
        message: 'ok',
        token,
        user: { id, name, email, isAdmin }
      })
    })
  }
}

module.exports = userController
