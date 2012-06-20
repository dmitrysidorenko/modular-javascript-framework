/**
 * User: Dmytriy.Sidorenko
 * Date: 19.03.12
 * Time: 14:47
 * To change this template use File | Settings | File Templates | JS | CE Tool module.
 */
__VisualCampaignBuilder__.Core.createModule("VCB.TP.messagerModule", function (sandbox) {
	"use strict";//turn on a "strict" browser mode

	var $ = sandbox.jQuery,
		errorView,
		infoMsgView,
		errorDialog,
		infoMsgDialog,
		errorDialogContent,
		infogMsgDialogContent,
		scope = __VisualCampaignBuilder__;

	//public methods
	var pub = {
		//init this module
		init:function () {
			//bind Core events
			sandbox.bind([
				{ "VCB.DS.ShowErrorMessage":showErrorMessageHandler },
				{ "VCB.showInfoMessage":showInfoMessageHandler },
				{ "VCB.DS.stateUpdated":stateUpdatedHandler },
				{ "VCB.CE.isDOMRefreshed":isDOMRefreshedHandler }
			]);

			sandbox.trigger([
				sandbox.newTriggerData("VCB.Module.initStateUpdated", {}, "VCB.TP.messagerModule")
			]);
		},
		//destroy this module!
		destroy:function () {
			if (errorDialog)
				errorDialog.destroy();
			if (infoMsgDialog)
				infoMsgDialog.destroy();
			$ = errorView = errorDialog = infoMsgView = infoMsgDialog = null;

			sandbox.ignore([
				"VCB.DS.ShowErrorMessage",
				"VCB.showInfoMessage",
				"VCB.DS.stateUpdated",
				"VCB.CE.isDOMRefreshed"
			]);
		}
	};

	//Core's events
	function showErrorMessageHandler(event, data) {
		sandbox.log(2, ["messanger module < showErrorMessageHandler > (data.data, data.data.okCallback)", data.data, data.data.okCallback]);
		errorDialogContent = $("<div />");
		if (!errorView) {
			errorView = __VisualCampaignBuilder__.Views.createView("VCB.TP.errorMessageView");
			errorView.on("ok_btn", function () {
				closeErrorDialogViewHandler();
				if (data && data.data && sandbox.$.isFunction(data.data.okCallback))
					data.data.okCallback();
			});

			errorView.init(errorDialogContent, {message:data && data.data ? data.data["message"] : ""});
		} else {
			errorView.update(errorDialogContent, {message:data && data.data ? data.data["message"] : ""});
			errorView.on("ok_btn", function () {
				closeErrorDialogViewHandler();
				if (data && data.data && sandbox.$.isFunction(data.data.okCallback))
					data.data.okCallback();
			});
		}

		var closeFn = data && data.data && $.isFunction(data.data.closeCallback) ? data.data.closeCallback : $.noop;

		sandbox.log(1, ["open error message dialog", data]);

			errorDialog = $("<div />").html(errorDialogContent).vcbTopPanel_Dialog({
				title:"",
				draggable:false,
				resizable:false,
				modal:true,
				width:460,
				close:function () {
					closeFn();
				}
			});
	}

	function showInfoMessageHandler(event, data) {
		sandbox.log(2, ["messanger module < showErrorMessageHandler > (data.data)", data.data]);
		infogMsgDialogContent = $("<div />");
		if (!infoMsgView) {
			infoMsgView = scope.Views.createView("infoMsgView");
			infoMsgView.on("ok", function () {
				closeInfoDialogViewHandler();
				if (data && data.data && sandbox.$.isFunction(data.data.okCallback))
					data.data.okCallback();
			});
			infoMsgView.init(infogMsgDialogContent, {
				message:(data && data.data ? data.data["message"] : ""),
				title:(data && data.data ? data.data["title"] : "")
			});
		}
		else {
			infoMsgView.update(infogMsgDialogContent, {message:data && data.data ? data.data["message"] : ""});
		}

		infoMsgDialog = $("<div />").html(infogMsgDialogContent).vcbTopPanel_Dialog({
			title:"",
			draggable:false,
			resizable:false,
			modal:true,
			width:460
		});
	}

	function stateUpdatedHandler(e, data) {
		if (data.key !== "" && data.key !== "VCB.TP.messagerModule")
			return;
//		closeErrorDialogViewHandler();
	}

	function isDOMRefreshedHandler(e, data) {
		closeErrorDialogViewHandler();
	}

	//View's handlers
	function closeErrorDialogViewHandler() {
		var dialog = $(errorDialog).data("vcbTopPanel_Dialog");
		if (dialog) {
			dialog.close();
		}
	}

	function closeInfoDialogViewHandler() {
		var dialog = $(infoMsgDialog).data("vcbTopPanel_Dialog");
		if (dialog)
			dialog.close();
	}

	return pub;
});