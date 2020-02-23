'use strict'
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      isAdmin: DataTypes.BOOLEAN,
      image: DataTypes.STRING
    },
    {}
  )
  User.associate = function(models) {
    // User.hasMany(models.Comment)
    User.belongsToMany(models.Restaurant, {
      through: models.Favorite,
      foreignKey: 'UserId',
      as: 'FavoritedRestaurants'
    })

    // 1.註冊關聯
    User.belongsToMany(models.Restaurant, {
      through: models.Like,
      foreignKey: 'UserId',
      // 2.passport.js中，兩model互相include時，要說清楚用哪張join table
      as: 'LikedRestaurants'
    })

    User.belongsToMany(User, {
      through: models.Followship,
      foreignKey: 'followingId',
      as: 'Followers'
    })

    User.belongsToMany(User, {
      through: models.Followship,
      foreignKey: 'followerId',
      as: 'Followings'
    })

    User.belongsToMany(models.Restaurant, {
      through: models.Comment,
      foreignKey: 'UserId',
      as: 'CommentedRestaurants'
    })
  }
  return User
}
