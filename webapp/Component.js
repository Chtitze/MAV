sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"dxc/hr/employee/mngmt/model/models",
	"dxc/hr/employee/mngmt/controller/BaseController"
], function (UIComponent, Device, models, BaseController) {
	"use strict";

	return UIComponent.extend("dxc.hr.employee.mngmt.Component", {
		// Z_DXC_EMPLOYEE_MANAGEMENT.
		metadata: {
			manifest: "json",
			config: {
				fullWidth: true
			}
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// create the views based on the url/hash
			this.getRouter().initialize();

			jQuery.sap.registerResourcePath('controls', '../controls');
		},

		/**
		 * In this function, the rootView is initialized and stored.
		 * @public
		 * @override
		 * @returns {sap.ui.mvc.View} the root view of the component
		 */
		createContent: function () {
			// call the base component's createContent function
			var oRootView = UIComponent.prototype.createContent.apply(this, arguments);
			oRootView.addStyleClass(this.getContentDensityClass());
			return oRootView;
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy'
		 */
		getContentDensityClass: function () {
			if (!this._sContentDensityClass) {
				if (Device.system.desktop) { // apply compact mode if touch is not supported; this could me made configurable for the user on "combi" devices with touch AND mouse
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy"; //sapUiSizeCompact needed for desktop-first controls like sap.ui.table.Table
				}
			}
			return this._sContentDensityClass;
		},

		destroy: function () {
			this.getModel().destroy();
			this.getModel("i18n").destroy();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		}
	});
});