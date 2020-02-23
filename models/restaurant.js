'use strict'
module.exports = (sequelize, DataTypes) => {
  const Restaurant = sequelize.define(
    'Restaurant',
    {
      name: DataTypes.STRING,
      tel: DataTypes.STRING,
      address: DataTypes.STRING,
      opening_hours: DataTypes.STRING,
      description: DataTypes.TEXT,
      image: DataTypes.STRING,
      viewCounts: DataTypes.INTEGER
    },
    {}
  )
  Restaurant.associate = function(models) {
    Restaurant.belongsTo(models.Category)
    // Restaurant.hasMany(models.Comment)
    Restaurant.belongsToMany(models.User, {
      through: models.Favorite,
      foreignKey: 'RestaurantId',
      as: 'FavoritedUsers'
    })

    // 1.註冊關聯
    Restaurant.belongsToMany(models.User, {
      through: models.Like,
      foreignKey: 'RestaurantId',
      // 2.透過這種關聯找出來的那群東西要叫什麼 => 意即passport.js中，兩model互相include時，要說清楚用哪張join table
      as: 'LikedUsers'
    })

    Restaurant.belongsToMany(models.User, {
      through: models.Comment,
      foreignKey: 'RestaurantId',
      as: 'CommentedUsers'
    })
  }
  return Restaurant
}
