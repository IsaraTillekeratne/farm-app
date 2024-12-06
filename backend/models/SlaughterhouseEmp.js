// models/SlaughterhouseEmp.js
module.exports = (sequelize, DataTypes) => {
    const Slaughterhouse = sequelize.define("SlaughterhouseEmp", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
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

    }, {
        timestamps: false,
        tableName: 'SlaughterhouseEmp'
    });

    Slaughterhouse.associate = (models) => {
        Slaughterhouse.belongsTo(models.Users, {
            foreignKey: 'userId',
            as: 'user',
        });
    };

    return Slaughterhouse;
};
