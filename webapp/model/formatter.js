sap.ui.define([
	"sap/ui/core/format/DateFormat"
	], function (DateFormat) {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		 convertimg: function (sImage) {
			if (sImage !== "") {
				var sBase64Anno = "data:image/bmp;base64,";
				var res = sBase64Anno.concat(sImage);
				return res;
			} else {
				var uri = "sap-icon://employee";
				return uri;
			}
		},

		date: function (sDate) {
			//console.log(sDate);
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