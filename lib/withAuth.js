import React from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';

let globalUser = null;

export default (
  Page,
  { loginRequired = true, logoutRequired = false, adminRequired = false } = {},
) =>
  class BaseComponent extends React.Component {
    static propTypes = {
      user: PropTypes.shape({
        id: PropTypes.string,
        isAdmin: PropTypes.bool,
      }),
      isFromServer: PropTypes.bool.isRequired,
    };

    static defaultProps = {
      user: null,
    };

    componentDidMount() {
      const { user, isFromServer } = this.props;

      if (isFromServer) {
        globalUser = user;
      }

      // If login is required and not logged in, redirect to "/login"
      if (loginRequired && !logoutRequired && !user) {
        Router.push('/public/login', '/login');
        return;
      }

      // If logout is required and user logged in, redirect to "/" page
      if (logoutRequired && user) {
        Router.push('/');
      }

      if (adminRequired && (!user || !user.isAdmin)) {
        Router.push('/customer/my-books', '/my-books');
      }
    }

    static async getInitialProps(ctx) {
      const isFromServer = !!ctx.req;
      const user = ctx.req ? ctx.req.user && ctx.req.user.toObject() : globalUser;

      if (isFromServer && user) {
        // console.log('before', typeof user._id, user._id);
        // Convert "_id" (ObjectID from MongoDB) object to string
        user._id = user._id.toString();
        // console.log('after', typeof user._id, user._id);
      }

      const props = { user, isFromServer };

      // Call child component's "getInitialProps", if it is defined
      if (Page.getInitialProps) {
        Object.assign(props, (await Page.getInitialProps(ctx)) || {});
      }

      return props;
    }

    render() {
      const { user } = this.props;

      if (loginRequired && !logoutRequired && !user) {
        return null;
      }

      if (logoutRequired && user) {
        return null;
      }

      if (adminRequired && (!user || !user.isAdmin)) {
        return null;
      }

      return <Page {...this.props} />;
    }
  };
