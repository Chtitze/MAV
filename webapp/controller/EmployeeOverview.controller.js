sap.ui.define([
	"dxc/hr/employee/mngmt/controller/BaseController",
	"sap/ui/Device",
	"sap/ui/core/routing/History",
	"sap/m/Button",
	"dxc/hr/employee/mngmt/model/formatter",
	"sap/ui/model/Sorter"
], function (BaseController, Device, History, Button, formatter, Sorter) {
	"use strict";

	return BaseController.extend("dxc.hr.employee.mngmt.controller.EmployeeOverview", {

		formatter: formatter,

		onInit: function () {
			this.oModel = this.getAppModel();
			this._oView = this.getView();
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
			this.getRouter().getRoute("EmployeeOverview").attachPatternMatched(this._handleRouteMatched, this);
		},

		onEditEmployee: function () {
			var oButton = this.getView().byId("employeeEditBtn");
			var oSmartForm = this.getView().byId("employeeSmartForm");
			var oFileUploader = this.getView().byId("fileUploaderEmployee");
			var oModel = this.getView().getModel();

			if (oButton.getIcon() === "sap-icon://edit") {
				oButton.setIcon("sap-icon://save");
				// Set Editable true
				oSmartForm.setEditable(true);
				this.getView().byId("employeeEditEmployeeID").setEditable(false);
				oFileUploader.setEnabled(true);

			} else {
				oButton.setIcon("sap-icon://edit");
				// Set Editable false
				oSmartForm.setEditable(false);
				// Build Update Object
				var sPath = oSmartForm.getBindingContext().sPath;
				this.oUpdateEmployee = oModel.getProperty(sPath);
				this.getView().setBusy(true);

				oModel.update(sPath, this.oUpdateEmployee, {
					method: "PUT",
					success: jQuery.proxy(this.onUpdateEmployeeSuccess, this),
					error: this.serviceFail
				});

			}
		},

		/**
		 *  Private Method which is called everytime the route gets matched
		 * @private
		 */
		_handleRouteMatched: function (oEvent) {
			var iEmployeeId = oEvent.getParameter("arguments").EmployeeID;
			var oEmpObjHdr = this.getView().byId("employeeObjectHeader");

			this.employeeBindingPath = "/Z_C_EMPLOYEE('" + iEmployeeId + "')";
			var sEmployeeProperty = this.getView().getModel().getProperty(this.employeeBindingPath);
			this.getView().byId("employeeObjectHeader").bindElement(this.employeeBindingPath);
			this.getView().byId("employeeSmartForm").bindElement(this.employeeBindingPath);
			if (!this._oItemTemplate) {
				this._oItemTemplate = this.getView().byId("employeeAppointmentListItem").clone();
			}
			var mParameters = {
				path: this.employeeBindingPath + "/to_Assignment",
				expand: 'to_Assignment/to_Project'
			};
			this.getView().byId("employeeAssignmentHistory").bindItems({
				path: mParameters.path,
				expand: mParameters.expand,
				template: this._oItemTemplate
			});
		},

		onSortHistoryAssignments: function (oEvent) {
			// add filter for sorting
			var aSorter = [];
			var oList = this.getView().byId("employeeAssignmentHistory");
			var oItems = oList.getBinding("items");
			aSorter = oItems.aSorters[0];
			var oDescending = aSorter.bDescending;
			var oSorter = new Sorter("assignstart", !oDescending);
			oItems.sort(oSorter);
		},

		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			//The history contains a previous entry
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				// There is no history!
				// replace the current hash with page 1 (will not add an history entry)
				this.getOwnerComponent().getRouter().navTo("PlanningCalendar", {}, true);
			}
		},

		onExit: function () {
			if (this._oQuickView) {
				this._oQuickView.destroy();
			}
		}

	});
});