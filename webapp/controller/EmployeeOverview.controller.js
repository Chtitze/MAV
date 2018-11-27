sap.ui.define([
	"dxc/hr/employee/mngmt/controller/BaseController",
	"sap/ui/Device",
	"sap/ui/core/routing/History",
	"sap/m/Button",
	"dxc/hr/employee/mngmt/model/formatter",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	"sap/ui/unified/FileUploaderParameter",
], function (BaseController, Device, History, Button, formatter, Sorter, Filter, MessageToast, FileUploaderParameter) {
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
			this.iEmployeeId = oEvent.getParameter("arguments").EmployeeID;
			var oEmpObjHdr = this.getView().byId("employeeObjectHeader");
			this.getView().byId("btnSaveEmployee").setEnabled(false);
			// Get list 
			var oList = this.byId("employeeAssignmentHistory");

			this.employeeBindingPath = "/Z_C_EMPLOYEE('" + this.iEmployeeId + "')";

			var sEmployeeProperty = this.getView().getModel().getProperty(this.employeeBindingPath);
			if (sEmployeeProperty.FileName !== "") {
				var sURL = "/sap/opu/odata/sap/Z_DXC_EMPLOYEE_MGMT_SRV/EmployeeImageSet(EmployeeID='" + sEmployeeProperty.EmployeeID +
					"',FileName='" +
					sEmployeeProperty.FileName + "')/$value";
				oEmpObjHdr.setIcon(sURL);
			} else {
				oEmpObjHdr.setIcon("sap-icon://employee");
			}

			this.getView().byId("employeeObjectHeader").bindElement(this.employeeBindingPath);
			this.getView().byId("employeeSmartForm").bindElement(this.employeeBindingPath);
			if (!this._oItemTemplate) {
				this._oItemTemplate = this.getView().byId("employeeAppointmentListItem").clone();
			}

			// bind quota quart
			this.employeeUtilizationBindingPath = "/EmployeeUtilizations('" + this.iEmployeeId + "')";
			this.getView().byId("quotaChart").bindElement(this.employeeUtilizationBindingPath);
			this.getView().byId("utilizationChart").bindElement(this.employeeUtilizationBindingPath);

			var mParameters = {
				path: this.employeeBindingPath + "/to_Assignment",
				expand: 'to_Assignment/to_Project'
			};

			var oSorter = new Sorter("assignstart", true);

			oList.bindItems({
				path: mParameters.path,
				expand: mParameters.expand,
				template: this._oItemTemplate,
				sorter: oSorter
			});

			oList.attachUpdateFinished(this.onListUpdateFinished, this);

		},

		onListUpdateFinished: function (oEvent) {
			// Get list 
			var oList = this.byId("employeeAssignmentHistory");
			// Get list count
			this.iLength = oList.getItems().length;
			// Get Resource Bundle 
			var sTableTitle = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("ProjekgPositions");
			// Replace pattern with count
			var sTableTitleWithCount = sTableTitle.replace("&&", this.iLength);
			// set the title
			this.getView().byId("EmployeePositionsTitle").setText(sTableTitleWithCount);
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

		onSearch: function (oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filterNumber = new Filter("to_Project/ProjectTitle", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filterNumber);
			}

			// update list binding
			var oList = this.byId("employeeAssignmentHistory");
			var binding = oList.getBinding("items");
			binding.filter(aFilters, "Application");
		},

		onSortProjectsTable: function (oEvent) {
			// add filter for sorting
			var aSorter = [];
			var oList = this.getView().byId("employeeAssignmentHistory");
			var oItems = oList.getBinding("items");
			aSorter = oItems.aSorters[0];
			var oDescending = aSorter.bDescending;
			var oSorter = new Sorter("assignstart", !oDescending);
			oItems.sort(oSorter);
		},

		handleUploadComplete: function (oEvent) {
			this.getView().getModel().refresh();
			var response = oEvent.getParameter("response");
			var oEmpObjHdr = this.getView().byId("employeeObjectHeader");

			if (response) {
				var sURL = "/sap/opu/odata/SAP/Z_DXC_EMPLOYEE_MGMT_SRV/EmployeeImageSet(EmployeeID='" + this.iEmployeeId +
					"',FileName='" +
					this.sFileName + "')/$value";
				oEmpObjHdr.setIcon("");
				oEmpObjHdr.setIcon(sURL);
			} else {
				oEmpObjHdr.setIcon("sap-icon://employee");
			}

		},

		onChange: function (oEvent) {
			var oFileUploader = this.getView().byId("fileUploaderEmployee");
			var oSaveButton = this.getView().byId("btnSaveEmployee");
			this.sFileName = oFileUploader.getValue();

			if (this.sFileName !== "") {
				oSaveButton.setEnabled(true);
			} else {
				oSaveButton.setEnabled(false);
			}
		},

		onSaveEmployee: function (oEvent) {
			var oModel = this.getView().getModel();
			var oFileUploader = this.getView().byId("fileUploaderEmployee");

			this.getView().setBusy(false);

			// Refresh Security Token
			oModel.refreshSecurityToken();
			// Success message 
			var successMsg = this.getResourceBundle().getText("updateEmployeeSuccess");
			var oEmployee = oModel.getProperty(this.employeeBindingPath);

			var sSuccessName = oEmployee.Lastname;
			var sSuccessFirstname = oEmployee.Firstname;
			successMsg = successMsg.replace("&&", sSuccessFirstname.concat(" " + sSuccessName));
			MessageToast.show(successMsg);

			// Check if the user has select an employee image
			this.sFileName = oFileUploader.getValue();
			if (this.sFileName) {
				//var sEmployeeID = this.oUpdateEmployee.EmployeeID;
				// Prepare the file uploader object
				var sURL = "/sap/opu/odata/SAP/Z_DXC_EMPLOYEE_MGMT_SRV/EmployeeImageSet";
				oFileUploader.setUploadUrl(sURL);

				oFileUploader.addHeaderParameter(new FileUploaderParameter({
					name: "x-csrf-token",
					value: oModel.getSecurityToken()
				}));

				oFileUploader.addHeaderParameter(new FileUploaderParameter({
					name: "content-type",
					value: "image/jpeg"
				}));

				oFileUploader.addHeaderParameter(new FileUploaderParameter({
					name: "slug",
					value: this.sFileName
				}));

				oFileUploader.addHeaderParameter(new FileUploaderParameter({
					name: "slug",
					value: this.iEmployeeId
				}));
				// Upload file
				oFileUploader.upload();
				oFileUploader.destroyHeaderParameters();
				oFileUploader.clear();
			}
			// Set File Uploader enabled false
			//oFileUploader.setEnabled(false);
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