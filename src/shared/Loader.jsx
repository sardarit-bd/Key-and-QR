"use client";

import React from "react";
import styled from "styled-components";

const Loader = ({ text = "Qkey", size = 50, fullScreen = true }) => {
  return (
    <StyledWrapper $size={size} $fullScreen={fullScreen}>
      <p className="loader">
        <span>{text}</span>
      </p>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  ${({ $fullScreen }) =>
    $fullScreen ? "min-height: 100vh;" : "height: 100%;"}

  .loader {
    max-width: fit-content;
    color: #000;
    font-size: ${({ $size }) => `${$size}px`};
    font-family: Mine, sans-serif;
    position: relative;
    font-style: italic;
    font-weight: 600;
  }

  .loader span {
    animation: cut 2s infinite;
    transition: 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .loader:hover {
    color: #fcffdf;
  }

  .loader::after {
    position: absolute;
    content: "";
    width: 100%;
    height: 6px;
    border-radius: 4px;
    background-color: #ff828291;
    top: 0px;
    filter: blur(10px);
    animation: scan 2s infinite;
    left: 0;
    z-index: 0;
    transition: 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .loader::before {
    position: absolute;
    content: "";
    width: 100%;
    height: 5px;
    border-radius: 4px;
    background-color: #ff8282;
    top: 0px;
    animation: scan 2s infinite;
    left: 0;
    z-index: 1;
    filter: opacity(0.9);
    transition: 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @keyframes scan {
    0% {
      top: 0px;
    }
    25% {
      top: ${({ $size }) => `${$size + 4}px`};
    }
    50% {
      top: 0px;
    }
    75% {
      top: ${({ $size }) => `${$size + 4}px`};
    }
    100% {
      top: 0px;
    }
  }

  @keyframes cut {
    0% {
      clip-path: inset(0 0 0 0);
    }
    25% {
      clip-path: inset(100% 0 0 0);
    }
    50% {
      clip-path: inset(0 0 100% 0);
    }
    75% {
      clip-path: inset(0 0 0 0);
    }
    100% {
      clip-path: inset(0 0 0 0);
    }
  }
`;

export default Loader;