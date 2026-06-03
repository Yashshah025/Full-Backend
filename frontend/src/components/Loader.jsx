import React from 'react';

export default function Loader({ fullPage = false }) {
  const loaderElement = (
    <div style={styles.loaderContainer}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={styles.spinner}></div>
      <p style={styles.text}>Brewing your experience...</p>
    </div>
  );

  if (fullPage) {
    return <div style={styles.fullPageContainer}>{loaderElement}</div>;
  }

  return loaderElement;
}

const styles = {
  fullPageContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'hsl(220, 20%, 6%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.25rem',
    padding: '2rem',
  },
  spinner: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: '3px solid hsla(250, 84%, 67%, 0.1)',
    borderTopColor: 'hsl(250, 84%, 67%)',
    animation: 'spin 1s linear infinite',
  },
  text: {
    color: 'hsl(220, 10%, 70%)',
    fontSize: '0.95rem',
    fontWeight: '600',
    letterSpacing: '0.05em',
    fontFamily: 'inherit',
  },
};
