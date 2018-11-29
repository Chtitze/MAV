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
	"sap/ui/model/json/JSONModel"
], function (BaseController, Device, History, Button, formatter, Sorter, Filter, MessageToast, FileUploaderParameter, JSONModel) {
	"use strict";

	return BaseController.extend("dxc.hr.employee.mngmt.controller.EmployeeOverview", {

		formatter: formatter,

		onInit: function () {
			this.oModel = this.getAppModel();
			this._oView = this.getView();
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
			// Init employee model
			this._oModelEmployee = new JSONModel();
			this.getView().setModel(this._oModelEmployee, "employee");

			this.getRouter().getRoute("EmployeeOverview").attachPatternMatched(this._handleRouteMatched, this);
		},

		/**
		 *  Private Method which is called everytime the route gets matched
		 * @private
		 */
		_handleRouteMatched: function (oEvent) {
			var oModel = this.getView().getModel();

			var iEmployeeId = oEvent.getParameter("arguments").EmployeeID;
			this.setEmployeeID(iEmployeeId);

			var oEmpObjHdr = this.getView().byId("employeeObjectHeader");
			this.getView().byId("btnSaveEmployee").setEnabled(false);
			// Get list 
			var oList = this.byId("employeeAssignmentHistory");

			this.employeeBindingPath = "/Z_C_EMPLOYEE('" + this.getEmployeeID() + "')";

			var sEmployeeProperty = oModel.getProperty(this.employeeBindingPath);
			if (sEmployeeProperty.FileName !== "") {
				var sURL = "/sap/opu/odata/sap/Z_DXC_EMPLOYEE_MGMT_SRV/EmployeeImageSet(EmployeeID='" + this.getEmployeeID() +
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
			this.employeeUtilizationBindingPath = "/EmployeeUtilizations('" + this.getEmployeeID() + "')";
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
			var mParametersFuntionImport = {
				EmployeeID: this.getEmployeeID()
			};
			// Read Utilization Set for line chart
			oModel.callFunction("/getUtilizationMonthSet", {
				urlParameters: mParametersFuntionImport,
				success: jQuery.proxy(this.onUtilizationMonthSetSuccess, this),
				error: jQuery.proxy(this.onUtilizationMonthSetError, this)
			});
			console.log(oModel);
			console.log(oModel.getProperty("/EmployeeUtilizations('35705')"));
		},

		setEmployeeID: function (sValue) {
			this.getView().getModel("employee").setProperty("/EmployeeID", sValue);
		},

		getEmployeeID: function () {
			return this.getView().getModel("employee").getProperty("/EmployeeID");
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
				var sURL = "/sap/opu/odata/SAP/Z_DXC_EMPLOYEE_MGMT_SRV/EmployeeImageSet(EmployeeID='" + this.getEmployeeID() +
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
					value: this.getEmployeeID()
				}));
				// Upload file
				oFileUploader.upload();
				oFileUploader.destroyHeaderParameters();
				oFileUploader.clear();
			}
			// Set File Uploader enabled false
			//oFileUploader.setEnabled(false);
		},

		onUtilizationMonthSetSuccess: function (oData, response) {
			var oLineChart = this.getView().byId("employeeUtilizationLineChart");

			if (response.statusCode === "200" && response.statusText === "OK") {
				var oModel = new JSONModel({
					MAUtilization: oData.results
				});
				// Sets the data to the chart
				oLineChart.setModel(oModel);
				// build sorter
				var oSorter = new Sorter("Mnr", false);
				// Clone points template for aggregation bindin
				if(!this.oLineChartPointTemplate){
					this.oLineChartPointTemplate = this.getView().byId("lineChartpointTemplate").clone();
				}
				oLineChart.bindPoints({ 
					path: "/MAUtilization",
					template: this.oLineChartPointTemplate, 
					sorter: oSorter
				});
				// Set Labels (Right)
				var oFirstProperty = oModel.getProperty("/MAUtilization/5");
				oLineChart.setLeftTopLabel(oFirstProperty.Yaxis);
				oLineChart.setLeftBottomLabel(oFirstProperty.Ltx);
				// Set Labels (Left)
				var oLastProperty = oModel.getProperty("/MAUtilization/0");
				oLineChart.setRightTopLabel(oLastProperty.Yaxis);
				oLineChart.setRightBottomLabel(oLastProperty.Ltx);
			}
		},

		onUtilizationMonthSetError: function (oError) {
			console.log(oError);
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