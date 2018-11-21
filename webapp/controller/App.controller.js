sap.ui.define([
	"dxc/hr/employee/mngmt/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, MessageBox) {
	"use strict";

	return BaseController.extend("dxc.hr.employee.mngmt.controller.App", {

		onInit: function () {
			var oViewModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});
			this.setModel(oViewModel, "appView");

			fnSetAppNotBusy = function () {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			this.oModel = this.getAppModel();
			this.getView().addStyleClass("cozy");
			this.getOwnerComponent().getModel().metadataLoaded().then(jQuery.proxy(fnSetAppNotBusy, this), jQuery.proxy(fnSetAppNotBusy, this));
		}
	});
});