// models/Veterinarian.js
module.exports = (sequelize, DataTypes) => {
    const Veterinarian = sequelize.define("Veterinarian", {
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

        employmentStatus: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        timestamps: false,
        tableName: 'Veterinarian'
    });

    Veterinarian.associate = (models) => {
        Veterinarian.belongsTo(models.Users, {
            foreignKey: 'userId',
            as: 'user',
        });

        Veterinarian.hasMany(models.Invoices, {
            foreignKey: 'veterinarianId',
            as: 'issuedInvoices',
        });

        Veterinarian.hasMany(models.Certificates, {
            foreignKey: 'veterinarianId',
            as: 'issuedCertificates',
        });

        Veterinarian.hasMany(models.Appointments, {
            foreignKey: 'veterinarianId',
            as: 'appointments',
        });
    };

    return Veterinarian;
};
