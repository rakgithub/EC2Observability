// components/ErrorPage.js or pages/_error.js
import React from 'react';
import Head from 'next/head';

const ErrorPage = ({ statusCode }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <Head>
        <title>{statusCode ? `Error ${statusCode}` : 'Error'}</title>
      </Head>
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl">
        <h1 className="text-6xl font-bold text-red-500 mb-4">
          {statusCode ? `${statusCode}` : 'Oops!'}
        </h1>
        <p className="text-xl text-gray-400 mb-2">
          {statusCode
            ? `An error ${statusCode} occurred on the server.`
            : 'Something went wrong.'}
        </p>
        <p className="text-md text-gray-500 mb-6">
          We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.
        </p>
    </div>
    </div>
  );
};

export default ErrorPage;