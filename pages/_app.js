import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
import React from 'react';
import App from 'next/app';

import Router from 'next/router';
import NProgress from 'nprogress';
import { theme } from '../lib/theme';

import Header from '../components/Header';
import Notifier from '../components/Notifier';

Router.onRouteChangeStart = () => NProgress.start();
Router.onRouteChangeComplete = () => NProgress.done();
Router.onRouteChangeError = () => NProgress.done();

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    const pageProps = {};

    if (Component.getInitialProps) {
      Object.assign(pageProps, await Component.getInitialProps(ctx));
    }

    return { pageProps };
  }

  componentDidMount() {
    // Remove the server-side injected styles.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  render() {
    const { Component, pageProps } = this.props;

    // console.log(pageProps);

    return (
      <ThemeProvider theme={theme}>
        {/* ThemeProvider makes the theme available down the React tree thanks to React context. */}
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {pageProps.chapter ? null : <Header {...pageProps} />}
        <Component {...pageProps} />
        <Notifier />
      </ThemeProvider>
    );
  }
}

export default MyApp;
