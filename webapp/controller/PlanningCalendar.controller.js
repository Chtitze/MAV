sap.ui.define([
	"dxc/hr/employee/mngmt/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("dxc.hr.employee.mngmt.controller.PlanningCalendar", {
		onInit: function () {
			this.oModel = this.getAppModel();
			this._oView = this.getView();

			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
			this.getRouter().getRoute("PlanningCalendar").attachPatternMatched(this._handleRouteMatched, this);
		},

		_handleRouteMatched: function () {
			
			
		},

		handleRowHeaderClick: function (oEvent) {
			var oRouter = this.getOwnerComponent().getRouter();
			
			var oRow = oEvent.getParameter("row");
			if (oRow) {
				var sBindingPath = oRow.getBindingContext().sPath;
				var n = sBindingPath.search("'");
				var sEmployeeID = sBindingPath.slice(n + 1, sBindingPath.length);
				var m = sEmployeeID.search("'");
				sEmployeeID = sEmployeeID.slice(0, m);
				oRouter.navTo("EmployeeOverview", {
					EmployeeID: sEmployeeID
				});
			}
		}
	});
});