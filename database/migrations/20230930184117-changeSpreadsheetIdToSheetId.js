'use strict';

/** @type {import('sequelize-cli').Migration} */
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('users', 'spreedsheetId', 'spreadsheetId');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('users', 'spreadsheetId', 'spreedsheetId');
  },
};

