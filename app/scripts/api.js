/* Messages types for communication between background service and popup/option */
const Types = {
  GET_DATA: "get_data",
  UPDATE_DATA: "update_data",
  ADD_CHANGE: "add_change",
  REMOVE_CHANGES: "remove_changes",
  TEST_ENDPOINT: "test_endpoint",
  RESTART_SERVICE: "restart_service",
};

export const Notifications = {
  CHANGE_UPDATE: "notif_update",
};

export default Types;
