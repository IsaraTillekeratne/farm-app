module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define("Users", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(["vet", "owner", "paaf", "slaught", "vetadmin", "paafadmin"]),
      allowNull: false,
      defaultValue: 'vet'
    },


  }, {
    timestamps: false
  });

  Users.associate = (models) => {
    Users.hasOne(models.CattleOwner, {
      foreignKey: 'userId',
      as: 'CattleOwner',
    });
    Users.hasOne(models.Veterinarian, {
      foreignKey: 'userId',
      as: 'Veterinarian',
    });
    Users.hasOne(models.PAAFEmp, {
      foreignKey: 'userId',
      as: 'PAAFEmp',
    });
    Users.hasOne(models.SlaughterhouseEmp, {
      foreignKey: 'userId',
      as: 'SlaughterhouseEmp',
    });
  };

  return Users;
};