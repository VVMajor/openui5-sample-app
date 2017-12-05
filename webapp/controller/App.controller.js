sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"redux/ReduxModel"
], function(Controller, JSONModel, Filter, FilterOperator, ReduxModel) {
	'use strict';

	return Controller.extend('sap.ui.demo.todo.controller.App', {

		onInit: function() {
			this.initRedux();
			this.aSearchFilters = [];
			this.aTabFilters = [];
		},

		oStore: null,

		initRedux: function () {
			// debugger;
			// https://blogs.sap.com/2017/02/02/building-a-sapui5-application-with-predictable-state-container/

			this.oStore = Redux.createStore(
				this.fnReducer,
				Redux.applyMiddleware(
					reduxLogger.createLogger()
				)
			);

			var oModel = new ReduxModel(this.oStore, {
				selectorCompletedCount: function (state, context) {
					return state.completedCount;
				}
			});
			// sap.ui.getCore().setModel(oModel);
			this.getView().setModel(oModel);

			this.oStore.dispatch({
				type: 'MY_ACTION',
				meta: {},
				payload: {}
			});
			this.oStore.dispatch({
				type: 'INCREMENT',
				meta: {},
				payload: {}
			});
			this.oStore.dispatch({
				type: 'MY_ACTION',
				meta: {},
				payload: {}
			});
			// var oM = sap.ui.getCore().getModel();
			// var oM = this.getView().getModel();
			// var property = oM.getProperty("/completedCount");
			//  var s = this.oStore.getState();
			//  debugger;
		},

		fnReducer: function (state, action) {
			// debugger;
			if (typeof state === "undefined") {
				state = {
					"newTodo": "",
					"todos": [{
						"title": "Start this app",
						"completed": true
					},
						{
							"title": "Learn OpenUI5",
							"completed": false
						},
						{
							"title": "Learn redux",
							"completed": false
						},
						{
							"title": "Make Presentation",
							"completed": false
						}
					],
					"itemsRemovable": true,
					"completedCount": 1,
					"itemsLeftCount": 3
				};
			}
			switch (action.type) {
				case 'updateItemsLeftCount':
					var aTodos = state.todos || [];

					var iItemsLeft = aTodos.filter(function(oTodo) {
						return oTodo.completed !== true;
					}).length;
					 // state.itemsLeftCount = iItemsLeft;
					return Object.assign({}, state, {
						itemsLeftCount : iItemsLeft
					});
				case 'DECREMENT':
					return Object.assign({}, state, {
						completedCount : state.completedCount - 1
					});
				case 'MY_ACTION':
					return Object.assign({}, state, {
						completedCount : state.completedCount + 100500
					});
				default:
					return state;
			}
		},

		/**
		 * Adds a new todo item to the bottom of the list.
		 */
		addTodo: function() {
			var oModel = this.getView().getModel();
			var aTodos = jQuery.extend(true, [], oModel.getProperty('/todos'));

			aTodos.push({
				title: oModel.getProperty('/newTodo'),
				completed: false
			});

			oModel.setProperty('/todos', aTodos);
			oModel.setProperty('/newTodo', '');
		},

		/**
		 * Removes all completed items from the todo list.
		 */
		clearCompleted: function() {
			var oModel = this.getView().getModel();
			var aTodos = jQuery.extend(true, [], oModel.getProperty('/todos'));

			var i = aTodos.length;
			while (i--) {
				var oTodo = aTodos[i];
				if (oTodo.completed) {
					aTodos.splice(i, 1);
				}
			}

			oModel.setProperty('/todos', aTodos);
		},

		/**
		 * Updates the number of items not yet completed
		 */
		updateItemsLeftCount: function() {
			// var oModel = this.getView().getModel();
			// var aTodos = oModel.getProperty('/todos') || [];
      //
			// var iItemsLeft = aTodos.filter(function(oTodo) {
			// 	return oTodo.completed !== true;
			// }).length;
      //
			// oModel.setProperty('/itemsLeftCount', iItemsLeft);

			this.oStore.dispatch({
				type: 'updateItemsLeftCount',
				meta: {},
				payload: {}
			});
		},

		/**
		 * Trigger search for specific items. The removal of items is disable as long as the search is used.
		 * @param {sap.ui.base.Event} oEvent Input changed event
		 */
		onSearch: function(oEvent) {
			var oModel = this.getView().getModel();

			// First reset current filters
			this.aSearchFilters = [];

			// add filter for search
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				oModel.setProperty('/itemsRemovable', false);
				var filter = new Filter("title", FilterOperator.Contains, sQuery);
				this.aSearchFilters.push(filter);
			} else {
				oModel.setProperty('/itemsRemovable', true);
			}

			this._applyListFilters();
		},

		onFilter: function(oEvent) {

			// First reset current filters
			this.aTabFilters = [];

			// add filter for search
			var sFilterKey = oEvent.getParameter("key");

			// eslint-disable-line default-case
			switch (sFilterKey) {
				case "active":
					this.aTabFilters.push(new Filter("completed", FilterOperator.EQ, false));
					break;
				case "completed":
					this.aTabFilters.push(new Filter("completed", FilterOperator.EQ, true));
					break;
				case "all":
				default:
					// Don't use any filter
			}

			this._applyListFilters();
		},

		_applyListFilters: function() {
			var oList = this.byId("todoList");
			var oBinding = oList.getBinding("items");

			oBinding.filter(this.aSearchFilters.concat(this.aTabFilters), "todos");
		}

	});

});
