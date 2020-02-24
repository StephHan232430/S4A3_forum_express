const db = require('../models')
const Category = db.Category

const categoryService = {
  getCategories: (req, res, callback) => {
    return Category.findAll({
      raw: true
    }).then(categories => {
      if (req.params.id) {
        Category.findByPk(req.params.id, {
          raw: true
        }).then(category => {
          return res.render('admin/categories', {
            categories,
            category
          })
        })
      } else {
        return callback({ categories })
      }
    })
  },
  postCategory: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: "name didn't exist" })
    } else {
      return Category.create({
        name: req.body.name
      }).then(category => {
        return callback({
          status: 'success',
          message: 'category was successfully created'
        })
      })
    }
  }
}

module.exports = categoryService
