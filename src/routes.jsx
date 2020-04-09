import { IndexRoute, IndexRedirect, Route } from "react-router";
import React from "react";

const App = React.lazy(() => import("./components/App"));
const AdminDashboard = React.lazy(() => import("./components/AdminDashboard"));
const AdminCampaignList = React.lazy(() =>
  import("./containers/AdminCampaignList")
);
const AdminCampaignStats = React.lazy(() =>
  import("./containers/AdminCampaignStats")
);
const AdminPersonList = React.lazy(() =>
  import("./containers/AdminPersonList")
);
const AdminOptOutList = React.lazy(() =>
  import("./containers/AdminOptOutList")
);
const AdminIncomingMessageList = React.lazy(() =>
  import("./containers/AdminIncomingMessageList")
);
const AdminCampaignEdit = React.lazy(() =>
  import("./containers/AdminCampaignEdit")
);
const AdminReplySender = React.lazy(() =>
  import("./containers/AdminReplySender")
);
const TexterDashboard = React.lazy(() =>
  import("./components/TexterDashboard")
);
const TopNav = React.lazy(() => import("./components/TopNav"));
const DashboardLoader = React.lazy(() =>
  import("./containers/DashboardLoader")
);
const TexterTodoList = React.lazy(() => import("./containers/TexterTodoList"));
const TexterTodo = React.lazy(() => import("./containers/TexterTodo"));
const Login = React.lazy(() => import("./components/Login"));
const Terms = React.lazy(() => import("./containers/Terms"));
const CreateOrganization = React.lazy(() =>
  import("./containers/CreateOrganization")
);
const JoinTeam = React.lazy(() => import("./containers/JoinTeam"));
const Home = React.lazy(() => import("./containers/Home"));
const Settings = React.lazy(() => import("./containers/Settings"));
const UserEdit = React.lazy(() => import("./containers/UserEdit"));
const TexterFaqs = React.lazy(() =>
  import("./components/TexterFrequentlyAskedQuestions")
);
const FAQs = React.lazy(() => import("./lib/faqs"));

const DemoTexterNeedsMessage = React.lazy(
  () => import("./components/DemoTexterAssignment").DemoTexterNeedsMessage
);
const DemoTexterNeedsResponse = React.lazy(
  () => import("./components/DemoTexterAssignment").DemoTexterNeedsResponse
);
const DemoTexterNeedsResponse2ndQuestion = React.lazy(
  () =>
    import("./components/DemoTexterAssignment")
      .DemoTexterNeedsResponse2ndQuestion
);

export default function makeRoutes(requireAuth = () => {}) {
  return (
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="admin" component={AdminDashboard} onEnter={requireAuth}>
        <IndexRoute component={() => <DashboardLoader path="/admin" />} />
        <Route path=":organizationId">
          <IndexRedirect to="campaigns" />
          <Route path="campaigns">
            <IndexRoute component={AdminCampaignList} />
            <Route path=":campaignId">
              <IndexRoute component={AdminCampaignStats} />
              <Route path="edit" component={AdminCampaignEdit} />
              <Route path="send-replies" component={AdminReplySender} />
            </Route>
          </Route>
          <Route path="people" component={AdminPersonList} />
          <Route path="optouts" component={AdminOptOutList} />
          <Route path="incoming" component={AdminIncomingMessageList} />
          <Route path="settings" component={Settings} />
        </Route>
      </Route>
      <Route path="app" component={TexterDashboard} onEnter={requireAuth}>
        <IndexRoute
          components={{
            main: () => <DashboardLoader path="/app" />,
            topNav: p => (
              <TopNav title="Spoke Texting" orgId={p.params.organizationId} />
            )
          }}
        />
        <Route path=":organizationId">
          <IndexRedirect to="todos" />
          <Route
            path="faqs"
            components={{
              main: () => <TexterFaqs faqs={FAQs} />,
              topNav: p => (
                <TopNav title="Account" orgId={p.params.organizationId} />
              )
            }}
          />
          <Route
            path="account/:userId"
            components={{
              main: p => (
                <UserEdit
                  userId={p.params.userId}
                  organizationId={p.params.organizationId}
                />
              ),
              topNav: p => (
                <TopNav title="Account" orgId={p.params.organizationId} />
              )
            }}
          />
          <Route path="todos">
            <IndexRoute
              components={{
                main: TexterTodoList,
                topNav: p => (
                  <TopNav
                    title="Spoke Texting"
                    orgId={p.params.organizationId}
                  />
                )
              }}
            />
            <Route path=":assignmentId">
              <Route
                path="text"
                components={{
                  fullScreen: props => (
                    <TexterTodo {...props} messageStatus="needsMessage" />
                  )
                }}
              />
              <Route
                path="reply"
                components={{
                  fullScreen: props => (
                    <TexterTodo {...props} messageStatus="needsResponse" />
                  ),
                  topNav: null
                }}
              />
              <Route
                path="stale"
                components={{
                  fullScreen: props => (
                    <TexterTodo {...props} messageStatus="convo" />
                  ),
                  topNav: null
                }}
              />
              <Route
                path="skipped"
                components={{
                  fullScreen: props => (
                    <TexterTodo {...props} messageStatus="closed" />
                  ),
                  topNav: null
                }}
              />
              <Route
                path="all"
                components={{
                  fullScreen: props => (
                    <TexterTodo
                      {...props}
                      messageStatus="needsMessageOrResponse"
                    />
                  ),
                  topNav: null
                }}
              />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="login" component={Login} />
      <Route path="terms" component={Terms} />
      <Route path="reset/:resetHash" component={Home} onEnter={requireAuth} />
      <Route
        path="invite/:inviteId"
        component={CreateOrganization}
        onEnter={requireAuth}
      />
      <Route
        path=":organizationUuid/join/:campaignId"
        component={JoinTeam}
        onEnter={requireAuth}
      />
      <Route
        path=":organizationUuid/join"
        component={JoinTeam}
        onEnter={requireAuth}
      />
      <Route path="demo" component={TexterDashboard}>
        <Route
          path="text"
          components={{
            main: props => <DemoTexterNeedsMessage {...props} />,
            topNav: null
          }}
        />
        <Route
          path="reply"
          components={{
            main: props => <DemoTexterNeedsResponse {...props} />,
            topNav: null
          }}
        />
        <Route
          path="reply2"
          components={{
            main: props => <DemoTexterNeedsResponse2ndQuestion {...props} />,
            topNav: null
          }}
        />
      </Route>
    </Route>
  );
}
