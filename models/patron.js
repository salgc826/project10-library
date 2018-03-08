'use strict';

module.exports = (sequelize, DataTypes) => {
  var Patron = sequelize.define('Patron', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    first_name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'First Name field cannot be empt.'
        }
      }
    },
    last_name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'Last Name field cannot be empty.'
        }
      }
    },
    address: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'Address field cannot be empty.'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'Email field cannot be empty.'
        }
      }
    },
    library_id: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'Library Id  field cannot be empty.'
        }
      }
    },
    zip_code: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'Zip Code field cannot be empty.'
        }
      }
    }
  }, {
    timestamps: false,
    underscored: true
  });
  Patron.associate = function(models) {
    Patron.hasMany(models.Loan, { foreignKey: 'patron_id' });
  };
  return Patron;
};
