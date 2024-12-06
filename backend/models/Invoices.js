module.exports = (sequelize, DataTypes) => {
    const Invoices = sequelize.define("Invoices", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },

        status: {
            type: DataTypes.ENUM(["pending", "paid", "overdue", "failed"]),
            allowNull: false,
            defaultValue: "pending",
        },

        generatedDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },

        paidDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        sentToOwner: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
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

        veterinarianId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Veterinarian',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },

        appointmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Appointments',
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

        livestockId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Livestock',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
    }, {
        timestamps: false
    });

    Invoices.associate = (models) => {
        Invoices.belongsTo(models.CattleOwner, {
            foreignKey: 'cattleOwnerId',
            as: 'cattleOwner',
        });

        Invoices.belongsTo(models.Veterinarian, {
            foreignKey: 'veterinarianId',
            as: 'veterinarian',
        });

        Invoices.belongsTo(models.Appointments, {
            foreignKey: 'appointmentId',
            as: 'appointment',
        });

        Invoices.belongsTo(models.Farms, {
            foreignKey: 'farmId',
            as: 'farm',
        });

        Invoices.belongsTo(models.Livestock, {
            foreignKey: 'livestockId',
            as: 'livestock',
        });
    };

    return Invoices;
};
