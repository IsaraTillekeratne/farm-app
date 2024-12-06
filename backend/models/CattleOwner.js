// models/CattleOwner.js
module.exports = (sequelize, DataTypes) => {
    const CattleOwner = sequelize.define("CattleOwner", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'Users',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        employmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        isadmin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        operationLocation: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        civilIdentification: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        cattleType: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        shepherdingLevel: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        cattleQuantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        timestamps: false,
        tableName: 'CattleOwner'
    });

    CattleOwner.associate = (models) => {
        CattleOwner.belongsTo(models.Users, {
            foreignKey: 'userId',
            as: 'user',
        });
        CattleOwner.hasMany(models.Appointments, {
            foreignKey: 'cattleOwnerId',
            as: 'appointments',
        });
        CattleOwner.hasMany(models.Certificates, {
            foreignKey: 'cattleOwnerId',
            as: 'certificates',
        });
        CattleOwner.hasMany(models.Invoices, {
            foreignKey: 'cattleOwnerId',
            as: 'invoices',
        });
        CattleOwner.hasMany(models.Livestock, {
            foreignKey: 'cattleOwnerId',
            as: 'livestock',
        });

    };

    return CattleOwner;
};
