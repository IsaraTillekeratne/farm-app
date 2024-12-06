module.exports = (sequelize, DataTypes) => {
    const Farms = sequelize.define("Farms", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        location: {
            type: DataTypes.STRING,
            primaryKey: true
        },

    }, {
        timestamps: false
    });

    Farms.associate = (models) => {
        Farms.hasMany(models.Appointments, {
            foreignKey: 'farmId',
            as: 'appointments',
        });
        Farms.hasMany(models.Livestock, {
            foreignKey: 'farmId',
            as: 'liveStocks',
        });
        Farms.hasMany(models.Invoices, {
            foreignKey: 'farmId',
            as: 'invoices',
        });
    };
    return Farms;
};