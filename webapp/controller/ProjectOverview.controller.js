sap.ui.define([
		"dxc/hr/employee/mngmt/controller/BaseController"
	],
	function (BaseController) {
		"use strict";

		return BaseController.extend("dxc.hr.employee.mngmt.controller.ProjectOverview", {
			onInit: function () {
				this.oModel = this.getAppModel();
				this._oView = this.getView();
				this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
				this.getRouter().getRoute("ProjectOverview").attachPatternMatched(this._handleRouteMatched, this);
			},

			/**
			 *  Private Method which is called everytime the route gets matched
			 * @private
			 */
			_handleRouteMatched: function (oEvent) {
				var sProjectId = oEvent.getParameter("arguments").ProjectID;
				var oEmpObjHdr = this.getView().byId("projectObjectHeader");

				this.projectBindingPath = "/Z_C_PROJECT('" + sProjectId + "')";
				var sProjectProperty = this.getView().getModel().getProperty(this.projectBindingPath);
				this.getView().byId("projectObjectHeader").bindElement(this.projectBindingPath);
				this.getView().byId("projectSmartForm").bindElement(this.projectBindingPath);
			}
		});
	}
);