/*
 * Copyright (C) 2017 DXC technology. All rights reserved.
 */
jQuery.sap.require("sap.ca.ui.message.message");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
	// "dxc/time/mngtTimeManagement/model/GoogleMapsHelper"
], function (Controller, History, JSONModel, MessageBox) {
	"use strict";
	return Controller.extend("dxc.hr.employee.mngmt.controller.BaseController", {

		/*	dataManager: DataManager,
			entityConstants: DataManager.EntityConstants,
			formatter: formatter,*/

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
			console.log("Test");
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Navigates back in the browser history, if the entry was created by this app.
		 * If not, it navigates to a route passed to this function.
		 *
		 * @public
		 * @param {string} sRoute the name of the route if there is no history entry
		 * @param {object} mData the parameters of the route, if the route does not need parameters, it may be omitted.
		 */
		onNavBack: function (sRoute, mData) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				if (sRoute !== undefined) {
					sRoute = '';
				}
				// Otherwise we go backwards with a forward history
				var bReplace = true;
				this.getRouter().navTo(sRoute, mData, bReplace);
			}

		},

		/**
		 * Setter method to set the currently logged in User Id
		 * @public
		 * @param{userId} User logged in the application
		 */
		setUserID: function (userId) {
			this.userId = userId;
		},
		/**
		 * Getter method to get the currently logged in User Id
		 * @public
		 * @return User Id
		 */
		getUserID: function () {
			return this.userId;
		},

		/**
		 * Returns an object which will be passed to the DataManager with properties
		 * oParentObject - Parent Controller,
		 * successHandler - OData service success handler
		 * errorHandler - OData service error handler
		 *
		 * @param{successHandler} : Success Handler function callback, this is called after the service call returns SUCCESS(Status Code : 200, 201)
		 * @param{errorHandler} : Error handler function callback, called when service fails(Status Codes : 400, 500, 401)
		 */
		getServiceCallParameter: function (successHandler, errorHandler) {
			return {
				oParentObject: this,
				successHandler: successHandler,
				errorHandler: errorHandler
			};

		},

		/**
		 * Getter method which will return the model details
		 * @public
		 * return oData model
		 */
		getAppModel: function () {
			var oModel = this.getOwnerComponent().getModel();
			oModel.setDefaultBindingMode("TwoWay");
			return oModel;
		},

		serviceFail: function (oError) {
			this.getView().setBusy(false);
		},

		createFragment: function (fragmentPath, ContentId) {
			this.catalog = this.getView().byId(ContentId);
			this.catalog.removeAllContent();
			var oFragment = sap.ui.xmlfragment(fragmentPath, this);
			this.getView().addDependent(oFragment);
			this.catalog.addContent(oFragment);
		},

		destroyContent: function (ContentId) {
			var ContainerId = this.getView().byId(ContentId).getContent();
			if (ContainerId.length) {
				this.getView().byId(ContentId).destroyContent();
			}
		},

		_MessagePopoverInitialise: function () {
			var oMessagePopover = new sap.m.MessagePopover({
				items: {
					path: "message>/",
					template: new sap.m.MessagePopoverItem({
						description: "{message>description}",
						type: "{message>type}",
						title: "{message>message}"
					})
				}
			});

		},

		getIcon: function (docType) {
			switch (docType) {
			case "0":
				return "sap-icon://sales-document";

			case "1":
				return "sap-icon://receipt";
			case "2":
				return "sap-icon://sales-order";
			case "*":
				return "sap-icon://sales-order-item";
			case "+":
				return "sap-icon://order-status";
			case "-":
				return "sap-icon://sales-quote";
			default:
				return "sap-icon://documents";
			}
		},
		getLabel: function (docType, moveType) {
			switch (docType) {
			case "0":
				return this.getResourceBundle().getText("appTitle");
				// return this.getResourceBundle().getText("PurchaseOrder");
			case "1":
				switch (moveType) {
				case "122":
					return this.getResourceBundle().getText("ReturnDelivery");
				default:
					return this.getResourceBundle().getText("GoodsReceipt");
				}
				//	return this.getResourceBundle().getText("GoodsReceipt"); Error: Unreachable Code if uncommented(?)
			case "2":
				return this.getResourceBundle().getText("Invoice");
			case "*":
				return this.getResourceBundle().getText("PurchaseOrder");
			case "+":
				return this.getResourceBundle().getText("Reservation");
			case "-":
				return this.getResourceBundle().getText("GoodsIssue");
			default:
				return this.getResourceBundle().getText("FollowOn");
			}
		}
	});
});