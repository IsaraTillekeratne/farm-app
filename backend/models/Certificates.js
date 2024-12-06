module.exports = (sequelize, DataTypes) => {
    const Certificates = sequelize.define("Certificates", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        certificateStatus: {
            type: DataTypes.ENUM(["Approved", "Pending", "Unpaid", "Canceled"]),
            allowNull: false,
        },

        issuedDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },

        details: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        sentToPAAF: {
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

        paafEmpId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'PAAFEmp',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
    }, {
        timestamps: false
    });

    Certificates.associate = (models) => {
        Certificates.belongsTo(models.CattleOwner, {
            foreignKey: 'cattleOwnerId',
            as: 'cattleOwner',
        });
        Certificates.belongsTo(models.Veterinarian, {
            foreignKey: 'veterinarianId',
            as: 'veterinarian',
        });
        Certificates.belongsTo(models.Appointments, {
            foreignKey: 'appointmentId',
            as: 'appointment',
        });

        Certificates.belongsTo(models.Livestock, {
            foreignKey: 'livestockId',
            as: 'livestock',
        });

        Certificates.belongsTo(models.PAAFEmp, {
            foreignKey: 'paafEmpId',
            as: 'paafEmp',
        });

    };

    return Certificates;
};
