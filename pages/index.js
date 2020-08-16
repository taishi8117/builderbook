import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import Button from '@material-ui/core/Button';
import notify from '../lib/notifier';

import withAuth from '../lib/withAuth';

class Index extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      displayName: PropTypes.string,
      email: PropTypes.string.isRequired,
    }),
  };

  static defaultProps = {
    user: null,
  };

  render() {
    const { user } = this.props;
    return (
      <div style={{ padding: '10px 45px' }}>
        <Head>
          <title>Dashboard</title>
          <meta name="description" content="This is the description of the Index page" />
        </Head>
        <p>Dashboard</p>
        <p>
          Email:
          {user.email}
        </p>
        <Button variant="contained" onClick={() => notify('success message')}>
          Click me to test notify()
        </Button>
      </div>
    );
  }
}

export default withAuth(Index);
