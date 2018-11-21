sap.ui.define([], function () {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */

		date: function (sDate) {
			console.log(sDate);
			if (sDate) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					format: "yyyyMMdd",
					pattern: "dd.MM.yyyy"
				});
				return oDateFormat.format(new Date(sDate));
			} else {
				return sDate;
			}
		}
	};

});