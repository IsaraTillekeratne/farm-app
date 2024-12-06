module.exports = (sequelize, DataTypes) => {
  const Livestock = sequelize.define("Livestock", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    rfidTagSerialNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    cattleType: {
      type: DataTypes.ENUM(['cow', 'goat', 'sheep', 'camel', 'horse']),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(['deceased', 'healthy']),
      allowNull: false,
      defaultValue: 'healthy'
    },

    addedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updatedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    cattleOwnerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CattleOwner',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    farmId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Farms',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

  }, {
    timestamps: false,
    tableName: 'Livestock'
  });

  Livestock.associate = (models) => {
    Livestock.belongsTo(models.CattleOwner, {
      foreignKey: 'cattleOwnerId',
      as: 'cattleOwner',
    });
    Livestock.belongsTo(models.Farms, {
      foreignKey: 'farmId',
      as: 'farm',
    });
    Livestock.hasMany(models.Certificates, {
      foreignKey: 'livestockId',
      as: 'immunizationCertificates',
    });
    Livestock.hasMany(models.Invoices, {
      foreignKey: 'livestockId',
      as: 'invoices',
    });
    Livestock.hasMany(models.Appointments, {
      foreignKey: 'livestockId',
      as: 'appointments',
    });

  };

  return Livestock;
};
