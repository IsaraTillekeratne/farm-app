// models/PAAFEmp.js
module.exports = (sequelize, DataTypes) => {
    const PAAFEmp = sequelize.define("PAAFEmp", {
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

    }, {
        timestamps: false,
        tableName: 'PAAFEmp'
    });

    PAAFEmp.associate = (models) => {

        PAAFEmp.belongsTo(models.Users, {
            foreignKey: 'userId',
            as: 'user',
        });

        PAAFEmp.hasMany(models.Certificates, {
            foreignKey: 'paafEmpId',
            as: 'certificates',
        });
    };

    return PAAFEmp;
};
