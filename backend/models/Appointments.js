module.exports = (sequelize, DataTypes) => {
    const Appointments = sequelize.define("Appointments", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        status: {
            type: DataTypes.ENUM(["scheduled", "completed", "cancelled"]),
            allowNull: false,
            defaultValue: "scheduled",
        },

        appointmentType: {
            type: DataTypes.ENUM(["Immunization", "New Births", "Welfare Check"]),
            allowNull: false,
        },

        numCattle: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        scheduledDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },

        completionDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        comment: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        invoiceGenerated: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        certificateGenerated: {
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

    Appointments.associate = (models) => {
        Appointments.belongsTo(models.CattleOwner, {
            foreignKey: 'cattleOwnerId',
            as: 'cattleOwner',
        });
        Appointments.belongsTo(models.Farms, {
            foreignKey: 'farmId',
            as: 'farm',
        });
        Appointments.hasOne(models.Invoices, {
            foreignKey: 'appointmentId',
            as: 'invoice',
        });
        Appointments.hasOne(models.Certificates, {
            foreignKey: 'appointmentId',
            as: 'immunizationCertificate',
        });
        Appointments.belongsTo(models.Veterinarian, {
            foreignKey: 'veterinarianId',
            as: 'veterinarian',
        });
        Appointments.belongsTo(models.Livestock, {
            foreignKey: 'livestockId',
            as: 'livestock',
        });

    };

    return Appointments;
};