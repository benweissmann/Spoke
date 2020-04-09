import "../lib/backcompat";

import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { Router, browserHistory } from "react-router";
import { syncHistoryWithStore } from "react-router-redux";
import { StyleSheet } from "aphrodite";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import errorCatcher from "./error-catcher";
import makeRoutes from "../routes";
import Store from "../store";
import { ApolloProvider } from "react-apollo";
import ApolloClientSingleton from "../network/apollo-client-singleton";
import { login, logout } from "./auth-service";
import LoadingIndicator from "../components/LoadingIndicator";

window.onerror = (msg, file, line, col, error) => {
  errorCatcher(error);
};
window.addEventListener("unhandledrejection", event => {
  errorCatcher(event.reason);
});
window.AuthService = {
  login,
  logout
};

const store = new Store(browserHistory, window.INITIAL_STATE);
const history = syncHistoryWithStore(browserHistory, store.data);

StyleSheet.rehydrate(window.RENDERED_CLASS_NAMES);

ReactDOM.render(
  <ApolloProvider store={store.data} client={ApolloClientSingleton}>
    <div>
      <Suspense
        fallback={
          <MuiThemeProvider>
            <LoadingIndicator />
          </MuiThemeProvider>
        }
      >
        <Router history={history} routes={makeRoutes()} />
      </Suspense>
    </div>
  </ApolloProvider>,
  document.getElementById("mount")
);
